import crypto from 'crypto';
import mongoose from 'mongoose';
import connectToDatabase from '@/server/database/connection';
import { stakeholderRepository } from '@/server/repositories/stakeholder.repository';
import { programRepository } from '@/server/repositories/program.repository';
import { projectRepository } from '@/server/repositories/project.repository';
import { userRepository } from '@/server/repositories/user.repository';
import { organizationRepository } from '@/server/repositories/organization.repository';
import {
  Beneficiary,
  BeneficiaryStatus,
  IBeneficiaryDocument,
} from '@/server/database/models/Beneficiary';
import { BeneficiaryEnrollment } from '@/server/database/models/BeneficiaryEnrollment';
import { AssistanceRecord } from '@/server/database/models/AssistanceRecord';
import {
  BeneficiaryCase,
  BeneficiaryCaseStatus,
} from '@/server/database/models/BeneficiaryCase';
import { ConsentPurpose, ConsentRecord } from '@/server/database/models/ConsentRecord';
import { adminService, AdminActor } from '@/server/services/admin.service';
import { checkRolePermission } from '@/server/authorization/permissions';
import { emailProvider } from '@/integrations/email/nodemailer.provider';
import { renderBeneficiaryOperationalEmail } from '@/integrations/email/templates';
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '@/lib/error-handler';
import {
  CreateBeneficiaryCaseInput,
  CreateBeneficiaryInput,
  CreateHouseholdInput,
  EnrollBeneficiaryInput,
  RecordAssistanceInput,
  RecordConsentInput,
  UpdateBeneficiaryCaseInput,
  UpdateBeneficiaryStatusInput,
  VerifyBeneficiaryInput,
} from '@/features/beneficiaries/schemas/beneficiary.schema';

// ======================== STATE MACHINES & PRIVACY CONTROLS ========================

export const BENEFICIARY_STATUS_TRANSITIONS: Record<BeneficiaryStatus, BeneficiaryStatus[]> = {
  DRAFT: ['SUBMITTED', 'WITHDRAWN'],
  SUBMITTED: ['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED', 'WITHDRAWN', 'ON_HOLD'],
  APPROVED: ['ACTIVE', 'ON_HOLD', 'WITHDRAWN'],
  ACTIVE: ['ON_HOLD', 'COMPLETED', 'WITHDRAWN'],
  ON_HOLD: ['ACTIVE', 'COMPLETED', 'WITHDRAWN'],
  COMPLETED: [],
  REJECTED: ['UNDER_REVIEW'], // allows reassessment
  WITHDRAWN: [],
};

export const BENEFICIARY_CASE_TRANSITIONS: Record<BeneficiaryCaseStatus, BeneficiaryCaseStatus[]> = {
  OPEN: ['IN_PROGRESS', 'WAITING_FOR_INFORMATION', 'REFERRED', 'RESOLVED', 'CLOSED'],
  IN_PROGRESS: ['WAITING_FOR_INFORMATION', 'REFERRED', 'RESOLVED', 'CLOSED'],
  WAITING_FOR_INFORMATION: ['IN_PROGRESS', 'REFERRED', 'RESOLVED', 'CLOSED'],
  REFERRED: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: ['OPEN'], // authorized reopen
};

/**
 * Optional consents that MUST be kept separate from essential NGO service delivery.
 * Withdrawing any of these NEVER cancels active assistance or beneficiary eligibility.
 */
export const OPTIONAL_CONSENT_PURPOSES: ConsentPurpose[] = [
  'COMMUNICATION',
  'PHOTOGRAPHY_MEDIA',
  'PUBLIC_STORYTELLING',
  'RESEARCH_EVALUATION',
];

export interface BeneficiaryAccessClearance {
  canViewSensitive: boolean;
  canViewDocuments: boolean;
  canViewSafeguarding: boolean;
  canManageSafeguarding: boolean;
  canManageCases: boolean;
}

export function resolveBeneficiaryClearance(actor: AdminActor): BeneficiaryAccessClearance {
  const isSuper = actor.role === 'SUPER_ADMIN';
  return {
    canViewSensitive: isSuper || checkRolePermission(actor.role, 'beneficiaries.sensitive.view'),
    canViewDocuments: isSuper || checkRolePermission(actor.role, 'beneficiaries.documents.view'),
    canViewSafeguarding: isSuper || checkRolePermission(actor.role, 'safeguarding.view'),
    canManageSafeguarding: isSuper || checkRolePermission(actor.role, 'safeguarding.manage'),
    canManageCases: isSuper || checkRolePermission(actor.role, 'beneficiaries.case.manage'),
  };
}

/**
 * STRICT NON-SENSITIVE LISTING DTO
 * Never exposes sensitiveProfile, guardianDetails, documentRefs, phone/email, or full address
 * in general listings. For minor/vulnerable safeguarding records, masks personal name unless authorized.
 */
export function toListBeneficiaryDTO(
  doc: IBeneficiaryDocument,
  clearance: BeneficiaryAccessClearance
) {
  const protectMinorIdentity =
    (doc.isMinorOrVulnerable || doc.requiresSafeguarding) &&
    !(clearance.canViewSensitive && (clearance.canViewSafeguarding || clearance.canManageSafeguarding));

  return {
    id: doc._id.toString(),
    beneficiaryCode: doc.beneficiaryCode,
    displayName: doc.isAnonymized
      ? `Anonymized (${doc.beneficiaryCode})`
      : protectMinorIdentity
      ? `Protected Record (${doc.beneficiaryCode})`
      : doc.fullName,
    district: doc.district,
    village: doc.village,
    state: doc.state,
    assistanceCategory: doc.assistanceCategory,
    status: doc.status,
    eligibilityStatus: doc.eligibilityStatus,
    verificationStatus: doc.verificationStatus,
    program: doc.programId,
    project: doc.projectId,
    assignedCaseWorker: doc.assignedCaseWorkerId,
    requiresSafeguarding: Boolean(doc.requiresSafeguarding || doc.isMinorOrVulnerable),
    isAnonymized: Boolean(doc.isAnonymized),
    registrationDate: doc.registrationDate,
    createdAt: doc.createdAt,
  };
}

/**
 * GATED DETAILED BENEFICIARY DTO
 * Enforces field-level separation for sensitive demographic notes, child/guardian info,
 * and supporting verification document references.
 */
export function toDetailedBeneficiaryDTO(
  doc: IBeneficiaryDocument,
  clearance: BeneficiaryAccessClearance
) {
  const isChildOrProtected = Boolean(doc.isMinorOrVulnerable || doc.requiresSafeguarding);
  const canRevealProtected =
    !isChildOrProtected ||
    (clearance.canViewSensitive && (clearance.canViewSafeguarding || clearance.canManageSafeguarding));

  return {
    id: doc._id.toString(),
    beneficiaryCode: doc.beneficiaryCode,
    fullName: doc.isAnonymized
      ? `Anonymized (${doc.beneficiaryCode})`
      : canRevealProtected
      ? doc.fullName
      : `Protected Record (${doc.beneficiaryCode})`,
    contactPhone:
      clearance.canViewSensitive && canRevealProtected && !doc.isAnonymized
        ? doc.contactPhone
        : undefined,
    contactEmail:
      clearance.canViewSensitive && canRevealProtected && !doc.isAnonymized
        ? doc.contactEmail
        : undefined,
    ageOrRange: doc.ageOrRange,
    gender: clearance.canViewSensitive ? doc.gender : undefined,
    address:
      clearance.canViewSensitive && canRevealProtected && !doc.isAnonymized
        ? doc.address
        : undefined,
    district: doc.district,
    village: doc.village,
    state: doc.state,
    household: doc.householdId,
    program: doc.programId,
    project: doc.projectId,
    assistanceCategory: doc.assistanceCategory,
    registrationSource: doc.registrationSource,
    referralSource: doc.referralSource,
    registrationDate: doc.registrationDate,
    status: doc.status,
    eligibilityStatus: doc.eligibilityStatus,
    verificationStatus: doc.verificationStatus,
    assignedCaseWorker: doc.assignedCaseWorkerId,
    isMinorOrVulnerable: Boolean(doc.isMinorOrVulnerable),
    requiresSafeguarding: Boolean(doc.requiresSafeguarding),
    safeguardingEscalationRef:
      clearance.canViewSafeguarding || clearance.canManageSafeguarding
        ? doc.safeguardingEscalationRef
        : undefined,
    guardianDetails:
      clearance.canViewSensitive &&
      (clearance.canViewSafeguarding || clearance.canManageSafeguarding) &&
      !doc.isAnonymized
        ? doc.guardianDetails
        : undefined,
    sensitiveProfile:
      clearance.canViewSensitive && canRevealProtected && !doc.isAnonymized
        ? doc.sensitiveProfile
        : undefined,
    documentRefs: clearance.canViewDocuments ? doc.documentRefs || [] : [],
    documentCount: (doc.documentRefs || []).length,
    sensitiveFieldsRedacted: !clearance.canViewSensitive || !canRevealProtected,
    documentsRestricted: !clearance.canViewDocuments,
    isAnonymized: Boolean(doc.isAnonymized),
    anonymizedAt: doc.anonymizedAt,
    statusHistory: doc.statusHistory || [],
    createdAt: doc.createdAt,
  };
}

function generateBeneficiaryCode(prefix: string): string {
  const year = new Date().getUTCFullYear();
  return `${prefix}-${year}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

export class BeneficiaryService {
  // ======================== HOUSEHOLDS ========================

  async createHousehold(
    organizationId: string,
    input: CreateHouseholdInput,
    actor: AdminActor
  ) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'beneficiaries.create')) {
      throw new AuthorizationError('Missing beneficiaries.create permission');
    }

    if (input.primaryProgramId) {
      const prog = await programRepository.findById(input.primaryProgramId, organizationId);
      if (!prog) throw new ValidationError('Linked program not found in this organization');
    }

    const household = await stakeholderRepository.createHousehold({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      householdCode: generateBeneficiaryCode('HH'),
      headOfHouseholdName: input.headOfHouseholdName,
      contactPhone: input.contactPhone,
      memberCount: input.memberCount,
      district: input.district,
      village: input.village,
      state: input.state,
      addressSummary: input.addressSummary,
      primaryProgramId: input.primaryProgramId
        ? new mongoose.Types.ObjectId(input.primaryProgramId)
        : undefined,
      notes: input.notes,
      createdBy: new mongoose.Types.ObjectId(actor.id),
    });

    await adminService.logAudit(
      actor,
      'BENEFICIARY_HOUSEHOLD_CREATE',
      'BeneficiaryHousehold',
      household._id.toString(),
      `Registered household ${household.householdCode} in ${household.district}`
    );

    return household;
  }

  async listHouseholds(organizationId: string) {
    return stakeholderRepository.findHouseholds(organizationId);
  }

  // ======================== BENEFICIARY REGISTRATION & LISTING ========================

  async registerBeneficiary(
    organizationId: string,
    input: CreateBeneficiaryInput,
    actor: AdminActor
  ) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'beneficiaries.create')) {
      throw new AuthorizationError('Missing beneficiaries.create permission');
    }

    // Validate linked tenant entities
    if (input.householdId) {
      const hh = await stakeholderRepository.findHouseholdById(input.householdId, organizationId);
      if (!hh) throw new ValidationError('Linked household not found in this organization');
    }
    if (input.programId) {
      const prog = await programRepository.findById(input.programId, organizationId);
      if (!prog) throw new ValidationError('Linked program not found in this organization');
    }
    if (input.projectId) {
      const proj = await projectRepository.findById(input.projectId, organizationId);
      if (!proj) throw new ValidationError('Linked project not found in this organization');
    }
    if (input.assignedCaseWorkerId) {
      const cw = await userRepository.findById(input.assignedCaseWorkerId);
      if (!cw || cw.organizationId.toString() !== organizationId || cw.status !== 'active') {
        throw new ValidationError('Assigned case worker must be an active user in this organization');
      }
    }

    // Minor/vulnerable safeguarding check: require guardian details when flagged as minor/vulnerable
    if (input.isMinorOrVulnerable && !input.guardianDetails?.name) {
      throw new ValidationError(
        'Guardian name and relation are required when registering a child or legally represented vulnerable beneficiary'
      );
    }

    const beneficiaryCode = generateBeneficiaryCode('BEN');
    const created = await stakeholderRepository.createBeneficiary({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      beneficiaryCode,
      fullName: input.fullName,
      contactPhone: input.contactPhone,
      contactEmail: input.contactEmail || undefined,
      ageOrRange: input.ageOrRange,
      gender: input.gender,
      address: input.address,
      district: input.district,
      village: input.village,
      state: input.state,
      householdId: input.householdId ? new mongoose.Types.ObjectId(input.householdId) : undefined,
      programId: input.programId ? new mongoose.Types.ObjectId(input.programId) : undefined,
      projectId: input.projectId ? new mongoose.Types.ObjectId(input.projectId) : undefined,
      assistanceCategory: input.assistanceCategory,
      registrationSource: input.registrationSource || 'FIELD_STAFF',
      referralSource: input.referralSource,
      registrationDate: new Date(),
      status: 'SUBMITTED',
      eligibilityStatus: 'PENDING',
      verificationStatus: 'UNVERIFIED',
      assignedCaseWorkerId: input.assignedCaseWorkerId
        ? new mongoose.Types.ObjectId(input.assignedCaseWorkerId)
        : undefined,
      isMinorOrVulnerable: Boolean(input.isMinorOrVulnerable),
      requiresSafeguarding: Boolean(input.requiresSafeguarding || input.isMinorOrVulnerable),
      guardianDetails: input.guardianDetails,
      sensitiveProfile: input.sensitiveProfile,
      documentRefs: [],
      statusHistory: [
        {
          status: 'SUBMITTED',
          actorId: new mongoose.Types.ObjectId(actor.id),
          actorName: actor.name,
          reason: 'Initial beneficiary registration',
          timestamp: new Date(),
        },
      ],
      createdBy: new mongoose.Types.ObjectId(actor.id),
    });

    // If initial consent granted, record ONLY PROGRAM_PARTICIPATION and DATA_PROCESSING.
    // Photography and storytelling consents MUST ALWAYS be recorded separately.
    if (input.initialConsentGranted) {
      await Promise.all([
        stakeholderRepository.createConsentRecord({
          organizationId: new mongoose.Types.ObjectId(organizationId),
          subjectType: 'BENEFICIARY',
          subjectId: created._id as mongoose.Types.ObjectId,
          purpose: 'PROGRAM_PARTICIPATION',
          status: 'GRANTED',
          consentVersion: input.consentVersion || '1.0',
          grantedAt: new Date(),
          grantedByGuardian: Boolean(input.isMinorOrVulnerable),
          guardianName: input.guardianDetails?.name,
          guardianRelation: input.guardianDetails?.relation,
          recordedBy: new mongoose.Types.ObjectId(actor.id),
        }),
        stakeholderRepository.createConsentRecord({
          organizationId: new mongoose.Types.ObjectId(organizationId),
          subjectType: 'BENEFICIARY',
          subjectId: created._id as mongoose.Types.ObjectId,
          purpose: 'DATA_PROCESSING',
          status: 'GRANTED',
          consentVersion: input.consentVersion || '1.0',
          grantedAt: new Date(),
          grantedByGuardian: Boolean(input.isMinorOrVulnerable),
          guardianName: input.guardianDetails?.name,
          guardianRelation: input.guardianDetails?.relation,
          recordedBy: new mongoose.Types.ObjectId(actor.id),
        }),
      ]);
    }

    await adminService.logAudit(
      actor,
      'BENEFICIARY_REGISTERED',
      'Beneficiary',
      created._id.toString(),
      `Registered beneficiary ${beneficiaryCode} (${created.assistanceCategory})`,
      { requiresSafeguarding: created.requiresSafeguarding }
    );

    // Send privacy-safe operational notice ONLY if email exists & not minor without consent
    if (created.contactEmail && created.communicationPreferences?.allowOperationalSmsOrEmail) {
      const org = await organizationRepository.findById(organizationId);
      const tpl = renderBeneficiaryOperationalEmail({
        recipientName: created.isMinorOrVulnerable
          ? created.guardianDetails?.name || 'Parent / Guardian'
          : created.fullName,
        beneficiaryCode: created.beneficiaryCode,
        eventType: 'REGISTRATION_RECEIVED',
        organizationName: org?.name,
      });
      await emailProvider.sendEmail({
        to: created.contactEmail,
        subject: tpl.subject,
        htmlContent: tpl.html,
        textContent: tpl.text,
      });
    }

    const clearance = resolveBeneficiaryClearance(actor);
    return toDetailedBeneficiaryDTO(created, clearance);
  }

  async listBeneficiaries(
    organizationId: string,
    filter: {
      status?: BeneficiaryStatus;
      verificationStatus?: string;
      assistanceCategory?: string;
      projectId?: string;
      district?: string;
      requiresSafeguarding?: boolean;
      search?: string;
    },
    pagination: { page?: number; limit?: number },
    actor: AdminActor
  ) {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(100, Math.max(1, pagination.limit || 25));
    const clearance = resolveBeneficiaryClearance(actor);

    const [rows, total] = await Promise.all([
      stakeholderRepository.findBeneficiaries(organizationId, filter, { page, limit }),
      stakeholderRepository.countBeneficiaries(organizationId, filter),
    ]);

    return {
      beneficiaries: rows.map((b) => toListBeneficiaryDTO(b, clearance)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getBeneficiaryDetail(id: string, organizationId: string, actor: AdminActor) {
    const doc = await stakeholderRepository.findBeneficiaryById(id, organizationId);
    if (!doc) throw new NotFoundError('Beneficiary record not found in this organization');

    const clearance = resolveBeneficiaryClearance(actor);

    // Child / vulnerable safeguarding access audit trail
    if (
      (doc.isMinorOrVulnerable || doc.requiresSafeguarding || clearance.canViewSensitive) &&
      clearance.canViewSensitive
    ) {
      await adminService.logAudit(
        actor,
        'BENEFICIARY_SENSITIVE_ACCESS',
        'Beneficiary',
        id,
        `Accessed beneficiary profile ${doc.beneficiaryCode}`,
        {
          isMinorOrVulnerable: doc.isMinorOrVulnerable,
          documentsAccessed: clearance.canViewDocuments,
        }
      );
    }

    const [verifications, enrollments, assistance, cases, caseNotes, consents] = await Promise.all([
      stakeholderRepository.findBeneficiaryVerifications(organizationId, id),
      stakeholderRepository.findEnrollmentsByBeneficiary(organizationId, id),
      stakeholderRepository.findAssistanceByBeneficiary(organizationId, id),
      clearance.canManageCases
        ? stakeholderRepository.findCasesByBeneficiary(organizationId, id)
        : Promise.resolve([]),
      clearance.canManageCases
        ? stakeholderRepository.findCaseNotes(organizationId, id, clearance.canManageSafeguarding)
        : Promise.resolve([]),
      stakeholderRepository.findConsentsBySubject(organizationId, 'BENEFICIARY', id),
    ]);

    return {
      beneficiary: toDetailedBeneficiaryDTO(doc, clearance),
      verifications: verifications.map((v) => ({
        id: v._id.toString(),
        checklist: v.checklist,
        decision: v.decision,
        decisionReason: v.decisionReason,
        humanReviewed: v.humanReviewed,
        reviewedBy: v.reviewedBy,
        reviewedAt: v.reviewedAt,
        supportingDocumentRefsReviewed: clearance.canViewDocuments
          ? v.supportingDocumentRefsReviewed
          : [],
      })),
      enrollments,
      assistance,
      cases: cases.filter((c) => !c.isSafeguardingCase || clearance.canManageSafeguarding),
      caseNotes,
      consents,
      clearance,
    };
  }

  async updateBeneficiaryStatus(
    id: string,
    organizationId: string,
    input: UpdateBeneficiaryStatusInput,
    actor: AdminActor
  ) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'beneficiaries.manage')) {
      throw new AuthorizationError('Missing beneficiaries.manage permission');
    }

    const existing = await stakeholderRepository.findBeneficiaryById(id, organizationId);
    if (!existing) throw new NotFoundError('Beneficiary record not found in this organization');

    if (input.status !== existing.status) {
      const allowed = BENEFICIARY_STATUS_TRANSITIONS[existing.status] || [];
      if (!allowed.includes(input.status)) {
        throw new ValidationError(
          `Invalid beneficiary status transition from "${existing.status}" to "${input.status}"`
        );
      }
    }

    if (
      input.safeguardingEscalationRef &&
      actor.role !== 'SUPER_ADMIN' &&
      !checkRolePermission(actor.role, 'safeguarding.manage')
    ) {
      throw new AuthorizationError('Missing safeguarding.manage permission to log escalation reference');
    }

    const $set: Record<string, unknown> = {
      status: input.status,
      updatedBy: new mongoose.Types.ObjectId(actor.id),
    };
    if (input.assignedCaseWorkerId) {
      const cw = await userRepository.findById(input.assignedCaseWorkerId);
      if (!cw || cw.organizationId.toString() !== organizationId || cw.status !== 'active') {
        throw new ValidationError('Assigned case worker must be an active user in this organization');
      }
      $set.assignedCaseWorkerId = new mongoose.Types.ObjectId(input.assignedCaseWorkerId);
    }
    if (input.safeguardingEscalationRef) {
      $set.safeguardingEscalationRef = input.safeguardingEscalationRef;
      $set.requiresSafeguarding = true;
    }

    const updated = await stakeholderRepository.updateBeneficiary(id, organizationId, {
      $set,
      $push: {
        statusHistory: {
          status: input.status,
          actorId: new mongoose.Types.ObjectId(actor.id),
          actorName: actor.name,
          reason: input.reason,
          timestamp: new Date(),
        },
      },
    });

    await adminService.logAudit(
      actor,
      'BENEFICIARY_STATUS_UPDATE',
      'Beneficiary',
      id,
      `Beneficiary ${existing.beneficiaryCode} status ${existing.status} -> ${input.status}`
    );

    return updated;
  }

  // ======================== HUMAN VERIFICATION & ELIGIBILITY ========================

  async verifyBeneficiary(
    beneficiaryId: string,
    organizationId: string,
    input: VerifyBeneficiaryInput,
    actor: AdminActor
  ) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'beneficiaries.verify')) {
      throw new AuthorizationError('Missing beneficiaries.verify permission');
    }

    const beneficiary = await stakeholderRepository.findBeneficiaryById(
      beneficiaryId,
      organizationId
    );
    if (!beneficiary) throw new NotFoundError('Beneficiary record not found in this organization');

    const verification = await stakeholderRepository.createBeneficiaryVerification({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      beneficiaryId: beneficiary._id as mongoose.Types.ObjectId,
      programId: input.programId ? new mongoose.Types.ObjectId(input.programId) : beneficiary.programId,
      projectId: input.projectId ? new mongoose.Types.ObjectId(input.projectId) : beneficiary.projectId,
      checklist: input.checklist,
      supportingDocumentRefsReviewed: input.supportingDocumentRefsReviewed || [],
      decision: input.decision,
      decisionReason: input.decisionReason.trim(),
      humanReviewed: true,
      reviewedBy: new mongoose.Types.ObjectId(actor.id),
      reviewedAt: new Date(),
      reassessmentDueDate: input.reassessmentDueDate
        ? new Date(input.reassessmentDueDate)
        : undefined,
    });

    const nextVerificationStatus =
      input.decision === 'VERIFIED'
        ? 'VERIFIED'
        : input.decision === 'REJECTED'
        ? 'REJECTED'
        : 'IN_REVIEW';
    const nextEligibilityStatus =
      input.decision === 'VERIFIED'
        ? 'ELIGIBLE'
        : input.decision === 'REJECTED'
        ? 'INELIGIBLE'
        : 'REASSESSMENT_REQUIRED';
    const nextBeneficiaryStatus: BeneficiaryStatus =
      input.decision === 'VERIFIED'
        ? 'APPROVED'
        : input.decision === 'REJECTED'
        ? 'REJECTED'
        : 'UNDER_REVIEW';

    await stakeholderRepository.updateBeneficiary(beneficiaryId, organizationId, {
      $set: {
        verificationStatus: nextVerificationStatus,
        eligibilityStatus: nextEligibilityStatus,
        status: nextBeneficiaryStatus,
        updatedBy: new mongoose.Types.ObjectId(actor.id),
      },
      $push: {
        statusHistory: {
          status: nextBeneficiaryStatus,
          actorId: new mongoose.Types.ObjectId(actor.id),
          actorName: actor.name,
          reason: `Eligibility ${input.decision}: ${input.decisionReason.trim()}`,
          timestamp: new Date(),
        },
      },
    });

    await adminService.logAudit(
      actor,
      `BENEFICIARY_VERIFICATION_${input.decision}`,
      'BeneficiaryVerification',
      verification._id.toString(),
      `Human eligibility review for ${beneficiary.beneficiaryCode}: ${input.decision}`
    );

    return verification;
  }

  // ======================== PROJECT ENROLLMENT & ASSISTANCE ========================

  async enrollInProject(
    beneficiaryId: string,
    organizationId: string,
    input: EnrollBeneficiaryInput,
    actor: AdminActor
  ) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'beneficiaries.enroll')) {
      throw new AuthorizationError('Missing beneficiaries.enroll permission');
    }

    const beneficiary = await stakeholderRepository.findBeneficiaryById(
      beneficiaryId,
      organizationId
    );
    if (!beneficiary) throw new NotFoundError('Beneficiary not found in this organization');

    if (!['APPROVED', 'ACTIVE'].includes(beneficiary.status) && beneficiary.verificationStatus !== 'VERIFIED') {
      throw new ValidationError(
        'Beneficiary must be verified/approved before project enrollment'
      );
    }

    const project = await projectRepository.findById(input.projectId, organizationId);
    if (!project) throw new ValidationError('Target project not found in this organization');

    if (input.caseWorkerId) {
      const cw = await userRepository.findById(input.caseWorkerId);
      if (!cw || cw.organizationId.toString() !== organizationId || cw.status !== 'active') {
        throw new ValidationError('Case worker must be an active user in this organization');
      }
    }

    try {
      const enrollment = await stakeholderRepository.createEnrollment({
        organizationId: new mongoose.Types.ObjectId(organizationId),
        beneficiaryId: beneficiary._id as mongoose.Types.ObjectId,
        programId: input.programId
          ? new mongoose.Types.ObjectId(input.programId)
          : project.programId,
        projectId: project._id as mongoose.Types.ObjectId,
        assistanceCategory: input.assistanceCategory,
        caseWorkerId: input.caseWorkerId
          ? new mongoose.Types.ObjectId(input.caseWorkerId)
          : undefined,
        enrollmentDate: new Date(),
        expectedCompletionDate: input.expectedCompletionDate
          ? new Date(input.expectedCompletionDate)
          : undefined,
        status: 'ACTIVE',
        enrolledBy: new mongoose.Types.ObjectId(actor.id),
      });

      if (beneficiary.status === 'APPROVED') {
        await stakeholderRepository.updateBeneficiary(beneficiaryId, organizationId, {
          $set: { status: 'ACTIVE', projectId: project._id, programId: project.programId },
        });
      }

      await adminService.logAudit(
        actor,
        'BENEFICIARY_ENROLLED',
        'BeneficiaryEnrollment',
        enrollment._id.toString(),
        `Enrolled ${beneficiary.beneficiaryCode} into project "${project.name}" (${input.assistanceCategory})`
      );

      return enrollment;
    } catch (err: unknown) {
      if ((err as { code?: number })?.code === 11000) {
        throw new ConflictError(
          'Beneficiary is already enrolled in this project under the same assistance category'
        );
      }
      throw err;
    }
  }

  /**
   * Records actual NGO assistance delivery (strictly separate from Donations & Budgets).
   */
  async recordAssistance(
    beneficiaryId: string,
    organizationId: string,
    input: RecordAssistanceInput,
    actor: AdminActor
  ) {
    if (
      actor.role !== 'SUPER_ADMIN' &&
      !checkRolePermission(actor.role, 'beneficiaries.assistance.manage')
    ) {
      throw new AuthorizationError('Missing beneficiaries.assistance.manage permission');
    }

    const beneficiary = await stakeholderRepository.findBeneficiaryById(
      beneficiaryId,
      organizationId
    );
    if (!beneficiary) throw new NotFoundError('Beneficiary not found in this organization');

    if (input.projectId) {
      const proj = await projectRepository.findById(input.projectId, organizationId);
      if (!proj) throw new ValidationError('Linked project not found in this organization');
    }

    if (input.deliveryStatus === 'DELIVERED' && !input.deliveryDate) {
      throw new ValidationError('Actual delivery date is required when recording DELIVERED assistance');
    }

    const record = await stakeholderRepository.createAssistanceRecord({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      beneficiaryId: beneficiary._id as mongoose.Types.ObjectId,
      enrollmentId:
        input.enrollmentId && mongoose.Types.ObjectId.isValid(input.enrollmentId)
          ? new mongoose.Types.ObjectId(input.enrollmentId)
          : undefined,
      programId:
        input.programId && mongoose.Types.ObjectId.isValid(input.programId)
          ? new mongoose.Types.ObjectId(input.programId)
          : beneficiary.programId,
      projectId:
        input.projectId && mongoose.Types.ObjectId.isValid(input.projectId)
          ? new mongoose.Types.ObjectId(input.projectId)
          : beneficiary.projectId,
      assistanceCategory: input.assistanceCategory,
      description: input.description,
      quantityOrUnit: input.quantityOrUnit,
      deliveryStatus: input.deliveryStatus || 'APPROVED',
      scheduledDate: input.scheduledDate ? new Date(input.scheduledDate) : undefined,
      deliveryDate: input.deliveryDate ? new Date(input.deliveryDate) : undefined,
      followUpDate: input.followUpDate ? new Date(input.followUpDate) : undefined,
      outcomeNotes: input.outcomeNotes,
      approvedBy: new mongoose.Types.ObjectId(actor.id),
      deliveredBy:
        input.deliveryStatus === 'DELIVERED' || input.deliveryStatus === 'COMPLETED'
          ? new mongoose.Types.ObjectId(actor.id)
          : undefined,
      recordedBy: new mongoose.Types.ObjectId(actor.id),
    });

    await adminService.logAudit(
      actor,
      'BENEFICIARY_ASSISTANCE_RECORDED',
      'AssistanceRecord',
      record._id.toString(),
      `Recorded ${record.deliveryStatus} assistance (${record.assistanceCategory}) for ${beneficiary.beneficiaryCode}`
    );

    if (
      beneficiary.contactEmail &&
      beneficiary.communicationPreferences?.allowOperationalSmsOrEmail &&
      (input.deliveryStatus === 'SCHEDULED' || input.followUpDate)
    ) {
      const org = await organizationRepository.findById(organizationId);
      const tpl = renderBeneficiaryOperationalEmail({
        recipientName: beneficiary.isMinorOrVulnerable
          ? beneficiary.guardianDetails?.name || 'Parent / Guardian'
          : beneficiary.fullName,
        beneficiaryCode: beneficiary.beneficiaryCode,
        eventType: input.deliveryStatus === 'SCHEDULED' ? 'ASSISTANCE_SCHEDULED' : 'FOLLOW_UP_REMINDER',
        scheduledDate: (input.scheduledDate || input.followUpDate || '').slice(0, 10),
        organizationName: org?.name,
      });
      await emailProvider.sendEmail({
        to: beneficiary.contactEmail,
        subject: tpl.subject,
        htmlContent: tpl.html,
        textContent: tpl.text,
      });
    }

    return record;
  }

  // ======================== RESTRICTED CASE MANAGEMENT ========================

  async createCase(
    beneficiaryId: string,
    organizationId: string,
    input: CreateBeneficiaryCaseInput,
    actor: AdminActor
  ) {
    if (
      actor.role !== 'SUPER_ADMIN' &&
      !checkRolePermission(actor.role, 'beneficiaries.case.manage')
    ) {
      throw new AuthorizationError('Missing beneficiaries.case.manage permission');
    }

    if (
      input.isSafeguardingCase &&
      actor.role !== 'SUPER_ADMIN' &&
      !checkRolePermission(actor.role, 'safeguarding.manage')
    ) {
      throw new AuthorizationError(
        'Missing safeguarding.manage permission to open a safeguarding escalation case'
      );
    }

    const beneficiary = await stakeholderRepository.findBeneficiaryById(
      beneficiaryId,
      organizationId
    );
    if (!beneficiary) throw new NotFoundError('Beneficiary not found in this organization');

    const workerId = input.assignedCaseWorkerId || actor.id;
    const worker = await userRepository.findById(workerId);
    if (!worker || worker.organizationId.toString() !== organizationId || worker.status !== 'active') {
      throw new ValidationError('Assigned case worker must be an active user in this organization');
    }

    const createdCase = await stakeholderRepository.createCase({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      caseNumber: generateBeneficiaryCode('CASE'),
      beneficiaryId: beneficiary._id as mongoose.Types.ObjectId,
      projectId:
        input.projectId && mongoose.Types.ObjectId.isValid(input.projectId)
          ? new mongoose.Types.ObjectId(input.projectId)
          : beneficiary.projectId,
      assignedCaseWorkerId: new mongoose.Types.ObjectId(workerId),
      title: input.title,
      category: input.category,
      priority: input.priority || 'MEDIUM',
      status: 'OPEN',
      isSafeguardingCase: Boolean(input.isSafeguardingCase),
      escalationReference: input.escalationReference,
      nextFollowUpDate: input.nextFollowUpDate ? new Date(input.nextFollowUpDate) : undefined,
      createdBy: new mongoose.Types.ObjectId(actor.id),
    });

    if (input.initialNote?.trim()) {
      await stakeholderRepository.createCaseNote({
        organizationId: new mongoose.Types.ObjectId(organizationId),
        caseId: createdCase._id as mongoose.Types.ObjectId,
        beneficiaryId: beneficiary._id as mongoose.Types.ObjectId,
        noteType: input.isSafeguardingCase ? 'SAFEGUARDING' : 'PROGRESS',
        content: input.initialNote.trim(),
        isRestrictedSafeguardingNote: Boolean(input.isSafeguardingCase),
        authorId: new mongoose.Types.ObjectId(actor.id),
        authorName: actor.name,
        authorRole: actor.role,
      });
    }

    await adminService.logAudit(
      actor,
      'BENEFICIARY_CASE_CREATED',
      'BeneficiaryCase',
      createdCase._id.toString(),
      `Opened case ${createdCase.caseNumber} for ${beneficiary.beneficiaryCode}`
    );

    return createdCase;
  }

  async updateCase(
    beneficiaryId: string,
    organizationId: string,
    input: UpdateBeneficiaryCaseInput,
    actor: AdminActor
  ) {
    if (
      actor.role !== 'SUPER_ADMIN' &&
      !checkRolePermission(actor.role, 'beneficiaries.case.manage')
    ) {
      throw new AuthorizationError('Missing beneficiaries.case.manage permission');
    }

    const existingCase = await stakeholderRepository.findCaseById(input.caseId, organizationId);
    if (!existingCase || existingCase.beneficiaryId.toString() !== beneficiaryId) {
      throw new NotFoundError('Case not found for this beneficiary in this organization');
    }

    if (
      (existingCase.isSafeguardingCase || input.isRestrictedSafeguardingNote) &&
      actor.role !== 'SUPER_ADMIN' &&
      !checkRolePermission(actor.role, 'safeguarding.manage')
    ) {
      throw new AuthorizationError('Missing safeguarding.manage permission for safeguarding case operations');
    }

    if (input.action === 'ADD_NOTE') {
      if (!input.noteContent?.trim()) {
        throw new ValidationError('Note content is required');
      }
      const note = await stakeholderRepository.createCaseNote({
        organizationId: new mongoose.Types.ObjectId(organizationId),
        caseId: existingCase._id as mongoose.Types.ObjectId,
        beneficiaryId: existingCase.beneficiaryId,
        noteType: input.noteType || 'PROGRESS',
        content: input.noteContent.trim(),
        isRestrictedSafeguardingNote: Boolean(
          input.isRestrictedSafeguardingNote || existingCase.isSafeguardingCase
        ),
        authorId: new mongoose.Types.ObjectId(actor.id),
        authorName: actor.name,
        authorRole: actor.role,
      });
      return { caseRecord: existingCase, note };
    }

    let nextStatus: BeneficiaryCaseStatus = existingCase.status;
    if (input.action === 'CLOSE') nextStatus = 'CLOSED';
    else if (input.action === 'REOPEN') nextStatus = 'OPEN';
    else if (input.action === 'REFER') nextStatus = 'REFERRED';
    else if (input.status) nextStatus = input.status;

    if (nextStatus !== existingCase.status) {
      const allowed = BENEFICIARY_CASE_TRANSITIONS[existingCase.status] || [];
      if (!allowed.includes(nextStatus)) {
        throw new ValidationError(
          `Invalid case transition from "${existingCase.status}" to "${nextStatus}"`
        );
      }
    }

    const update: Record<string, unknown> = {
      $set: {
        status: nextStatus,
        ...(input.nextFollowUpDate ? { nextFollowUpDate: new Date(input.nextFollowUpDate) } : {}),
        ...(input.action === 'CLOSE'
          ? {
              closureSummary: input.closureSummary,
              closedBy: new mongoose.Types.ObjectId(actor.id),
              closedAt: new Date(),
            }
          : {}),
      },
    };

    if (input.action === 'REOPEN') {
      update.$inc = { reopenedCount: 1 };
    }
    if (input.action === 'REFER') {
      if (!input.referredTo?.trim() || !input.referralReason?.trim()) {
        throw new ValidationError('Referral target and reason are required');
      }
      update.$push = {
        referralHistory: {
          referredTo: input.referredTo.trim(),
          reason: input.referralReason.trim(),
          referredBy: new mongoose.Types.ObjectId(actor.id),
          referredAt: new Date(),
        },
      };
    }

    const updated = await stakeholderRepository.updateCase(input.caseId, organizationId, update);

    await adminService.logAudit(
      actor,
      `BENEFICIARY_CASE_${input.action}`,
      'BeneficiaryCase',
      input.caseId,
      `Case ${existingCase.caseNumber}: ${input.action} -> ${nextStatus}`
    );

    return { caseRecord: updated, note: null };
  }

  // ======================== CONSENT & PRIVACY RETENTION ========================

  async manageConsent(
    beneficiaryId: string,
    organizationId: string,
    input: RecordConsentInput,
    actor: AdminActor
  ) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'consent.manage')) {
      throw new AuthorizationError('Missing consent.manage permission');
    }

    const beneficiary = await stakeholderRepository.findBeneficiaryById(
      beneficiaryId,
      organizationId
    );
    if (!beneficiary) throw new NotFoundError('Beneficiary not found in this organization');

    if (input.action === 'ANONYMIZE_RECORD') {
      if (
        (beneficiary.isMinorOrVulnerable || beneficiary.requiresSafeguarding) &&
        actor.role !== 'SUPER_ADMIN' &&
        !checkRolePermission(actor.role, 'safeguarding.manage')
      ) {
        throw new AuthorizationError(
          'Missing safeguarding.manage permission to anonymize a safeguarded record'
        );
      }

      const anonymized = await stakeholderRepository.updateBeneficiary(
        beneficiaryId,
        organizationId,
        {
          $set: {
            fullName: `Anonymized (${beneficiary.beneficiaryCode})`,
            contactPhone: undefined,
            contactEmail: undefined,
            address: undefined,
            guardianDetails: undefined,
            sensitiveProfile: undefined,
            isAnonymized: true,
            anonymizedAt: new Date(),
            updatedBy: new mongoose.Types.ObjectId(actor.id),
          },
        }
      );

      await adminService.logAudit(
        actor,
        'BENEFICIARY_ANONYMIZED',
        'Beneficiary',
        beneficiaryId,
        `Anonymized personal identifiers on ${beneficiary.beneficiaryCode} under retention workflow`
      );
      return { anonymized: true, beneficiary: anonymized };
    }

    if (input.action === 'WITHDRAW') {
      if (!input.consentId) {
        throw new ValidationError('consentId is required to withdraw consent');
      }
      const withdrawn = await stakeholderRepository.updateConsentRecord(
        input.consentId,
        organizationId,
        {
          $set: {
            status: 'WITHDRAWN',
            withdrawnAt: new Date(),
            withdrawalReason: input.withdrawalReason || 'Withdrawn by beneficiary or guardian',
            withdrawnBy: new mongoose.Types.ObjectId(actor.id),
          },
        }
      );
      if (!withdrawn) throw new NotFoundError('Consent record not found');

      // INVARIANT: Withdrawing optional consent (e.g. PHOTOGRAPHY_MEDIA, PUBLIC_STORYTELLING,
      // COMMUNICATION, RESEARCH_EVALUATION) NEVER cancels or degrades active assistance!
      const isOptional = OPTIONAL_CONSENT_PURPOSES.includes(withdrawn.purpose);

      await adminService.logAudit(
        actor,
        'CONSENT_WITHDRAWN',
        'ConsentRecord',
        withdrawn._id.toString(),
        `Withdrew ${withdrawn.purpose} consent for ${beneficiary.beneficiaryCode} (essential assistance unaffected: ${isOptional})`
      );

      return {
        consent: withdrawn,
        essentialAssistanceUnaffected: true,
      };
    }

    // GRANT
    if (!input.purpose) {
      throw new ValidationError('Consent purpose is required when granting consent');
    }

    // For minor/vulnerable child photography or public storytelling, guardian documentation is required
    if (
      (beneficiary.isMinorOrVulnerable || beneficiary.requiresSafeguarding) &&
      (input.purpose === 'PHOTOGRAPHY_MEDIA' || input.purpose === 'PUBLIC_STORYTELLING') &&
      (!input.grantedByGuardian || !input.guardianName?.trim())
    ) {
      throw new ValidationError(
        'Documented guardian authorization (grantedByGuardian + guardianName) is mandatory for child or vulnerable-person media/storytelling consent'
      );
    }

    const granted = await stakeholderRepository.createConsentRecord({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      subjectType: 'BENEFICIARY',
      subjectId: beneficiary._id as mongoose.Types.ObjectId,
      purpose: input.purpose,
      status: 'GRANTED',
      consentVersion: input.consentVersion || '1.0',
      grantedAt: new Date(),
      grantedByGuardian: Boolean(input.grantedByGuardian),
      guardianName: input.guardianName,
      guardianRelation: input.guardianRelation,
      evidenceRef: input.evidenceRef,
      recordedBy: new mongoose.Types.ObjectId(actor.id),
    });

    await adminService.logAudit(
      actor,
      'CONSENT_GRANTED',
      'ConsentRecord',
      granted._id.toString(),
      `Recorded ${granted.purpose} consent (v${granted.consentVersion}) for ${beneficiary.beneficiaryCode}`
    );

    return { consent: granted, essentialAssistanceUnaffected: true };
  }

  // ======================== EXPORT (STRICTLY AUTHORIZED) ========================

  async exportBeneficiaries(organizationId: string, actor: AdminActor) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'beneficiaries.export')) {
      throw new AuthorizationError('Missing beneficiaries.export permission');
    }
    const clearance = resolveBeneficiaryClearance(actor);
    const rows = await stakeholderRepository.findBeneficiaries(
      organizationId,
      {},
      { page: 1, limit: 2000 }
    );

    await adminService.logAudit(
      actor,
      'BENEFICIARY_EXPORT',
      'Beneficiary',
      organizationId,
      `Exported ${rows.length} beneficiary records`,
      { count: rows.length, sensitiveIncluded: clearance.canViewSensitive }
    );

    return rows.map((b) => toListBeneficiaryDTO(b, clearance));
  }

  // ======================== AGGREGATED / ANONYMIZED ANALYTICS ========================

  async getBeneficiaryAnalytics(organizationId: string) {
    await connectToDatabase();
    const orgObjId = new mongoose.Types.ObjectId(organizationId);
    const now = new Date();

    const [
      totalBeneficiaries,
      activeBeneficiaries,
      pendingVerification,
      safeguardedCount,
      anonymizedCount,
      assistanceDeliveredCount,
      followUpsDueCount,
      projectEnrollments,
      casesByStatus,
      consentsByPurpose,
    ] = await Promise.all([
      Beneficiary.countDocuments({ organizationId: orgObjId }),
      Beneficiary.countDocuments({ organizationId: orgObjId, status: 'ACTIVE' }),
      Beneficiary.countDocuments({
        organizationId: orgObjId,
        verificationStatus: { $in: ['UNVERIFIED', 'IN_REVIEW'] },
      }),
      Beneficiary.countDocuments({ organizationId: orgObjId, requiresSafeguarding: true }),
      Beneficiary.countDocuments({ organizationId: orgObjId, isAnonymized: true }),
      AssistanceRecord.countDocuments({
        organizationId: orgObjId,
        deliveryStatus: { $in: ['DELIVERED', 'COMPLETED'] },
      }),
      AssistanceRecord.countDocuments({
        organizationId: orgObjId,
        deliveryStatus: { $in: ['SCHEDULED', 'DELIVERED', 'FOLLOW_UP_DUE'] },
        followUpDate: { $lte: now },
      }),
      BeneficiaryEnrollment.aggregate([
        { $match: { organizationId: orgObjId } },
        {
          $group: {
            _id: '$projectId',
            enrolledCount: { $sum: 1 },
          },
        },
        { $sort: { enrolledCount: -1 } },
        { $limit: 10 },
      ]),
      BeneficiaryCase.aggregate([
        { $match: { organizationId: orgObjId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      ConsentRecord.aggregate([
        { $match: { organizationId: orgObjId } },
        {
          $group: {
            _id: { purpose: '$purpose', status: '$status' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Strictly aggregated & anonymized metrics — zero individual beneficiary names or sensitive PII
    return {
      totalBeneficiaries,
      activeBeneficiaries,
      pendingVerification,
      safeguardedCount,
      anonymizedCount,
      assistanceDeliveredCount,
      followUpsDueCount,
      projectEnrollments: projectEnrollments.map((p) => ({
        projectId: String(p._id),
        enrolledCount: Math.trunc(p.enrolledCount || 0),
      })),
      casesByStatus: casesByStatus.map((c) => ({
        status: String(c._id),
        count: Math.trunc(c.count || 0),
      })),
      consentsSummary: consentsByPurpose.map((c) => ({
        purpose: String(c._id.purpose),
        status: String(c._id.status),
        count: Math.trunc(c.count || 0),
      })),
    };
  }
}

export const beneficiaryService = new BeneficiaryService();
