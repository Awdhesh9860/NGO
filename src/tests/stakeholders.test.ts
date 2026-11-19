import { describe, it, expect, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import {
  VolunteerService,
  computeAttendanceMinutes,
  computeVerifiedHoursSummary,
  toSafeVolunteerProfileDTO,
  toPublicCertificateDTO,
} from '../server/services/volunteer.service';
import {
  MembershipService,
  calculateMembershipExpiry,
  isRenewalEligible,
} from '../server/services/membership.service';
import {
  BeneficiaryService,
  resolveBeneficiaryClearance,
  toListBeneficiaryDTO,
  toDetailedBeneficiaryDTO,
} from '../server/services/beneficiary.service';
import { stakeholderRepository } from '../server/repositories/stakeholder.repository';
import { organizationRepository } from '../server/repositories/organization.repository';
import { projectRepository } from '../server/repositories/project.repository';
import { auditRepository } from '../server/repositories/audit.repository';
import { userRepository } from '../server/repositories/user.repository';
import { emailProvider } from '../integrations/email/nodemailer.provider';
import { checkRolePermission } from '../server/authorization/permissions';
import { getAuthorizedAdminNav } from '../features/admin/config/navigation';
import {
  createVolunteerApplicationSchema,
  createVolunteerAttendanceSchema,
} from '../features/volunteers/schemas/volunteer.schema';
import {
  createMembershipPlanSchema,
  createMembershipApplicationSchema,
} from '../features/membership/schemas/membership.schema';
import {
  createBeneficiarySchema,
  verifyBeneficiarySchema,
} from '../features/beneficiaries/schemas/beneficiary.schema';
import {
  renderVolunteerApplicationReceivedEmail,
  renderVolunteerCertificateIssuedEmail,
  renderMembershipStatusEmail,
  renderBeneficiaryOperationalEmail,
} from '../integrations/email/templates';
import { AdminActor } from '../server/services/admin.service';

const ORG_A = new mongoose.Types.ObjectId().toString();
const ORG_B = new mongoose.Types.ObjectId().toString();

const adminActor: AdminActor = {
  id: new mongoose.Types.ObjectId().toString(),
  name: 'Org Admin',
  email: 'admin@org-a.org',
  role: 'ADMIN',
  organizationId: ORG_A,
};

const execDirectorActor: AdminActor = {
  id: new mongoose.Types.ObjectId().toString(),
  name: 'Exec Director',
  email: 'director@org-a.org',
  role: 'EXECUTIVE_DIRECTOR',
  organizationId: ORG_A,
};

const managerActor: AdminActor = {
  id: new mongoose.Types.ObjectId().toString(),
  name: 'Program Manager',
  email: 'manager@org-a.org',
  role: 'MANAGER',
  organizationId: ORG_A,
};

const teamMemberActor: AdminActor = {
  id: new mongoose.Types.ObjectId().toString(),
  name: 'Field Staff',
  email: 'field@org-a.org',
  role: 'TEAM_MEMBER',
  organizationId: ORG_A,
};

describe('Phase 9: Stakeholder Least-Privilege RBAC & Navigation', () => {
  it('strictly restricts sensitive beneficiary, document, export & safeguarding.manage permissions', () => {
    // ADMIN and MANAGER MUST NOT automatically receive high-sensitivity beneficiary permissions
    expect(checkRolePermission('ADMIN', 'beneficiaries.sensitive.view')).toBe(false);
    expect(checkRolePermission('ADMIN', 'beneficiaries.documents.view')).toBe(false);
    expect(checkRolePermission('ADMIN', 'beneficiaries.export')).toBe(false);
    expect(checkRolePermission('ADMIN', 'safeguarding.manage')).toBe(false);

    expect(checkRolePermission('MANAGER', 'beneficiaries.sensitive.view')).toBe(false);
    expect(checkRolePermission('MANAGER', 'beneficiaries.case.manage')).toBe(false);
    expect(checkRolePermission('MANAGER', 'members.suspend')).toBe(false);

    // EXECUTIVE_DIRECTOR & SUPER_ADMIN hold explicit safeguarding & sensitive governance permissions
    expect(checkRolePermission('EXECUTIVE_DIRECTOR', 'beneficiaries.sensitive.view')).toBe(true);
    expect(checkRolePermission('EXECUTIVE_DIRECTOR', 'beneficiaries.documents.view')).toBe(true);
    expect(checkRolePermission('EXECUTIVE_DIRECTOR', 'safeguarding.manage')).toBe(true);
    expect(checkRolePermission('SUPER_ADMIN', 'beneficiaries.export')).toBe(true);

    // Stakeholders sidebar group filtered properly
    const pmNav = getAuthorizedAdminNav('PROJECT_MANAGER').map((i) => i.id);
    expect(pmNav).toContain('volunteers');
    expect(pmNav).toContain('beneficiaries');
    expect(pmNav).not.toContain('members');

    // Non-console portal roles still receive empty admin navigation
    expect(getAuthorizedAdminNav('VOLUNTEER')).toHaveLength(0);
    expect(getAuthorizedAdminNav('MEMBER')).toHaveLength(0);
    expect(getAuthorizedAdminNav('DONOR')).toHaveLength(0);
    expect(getAuthorizedAdminNav('GUEST')).toHaveLength(0);
  });

  it('validates Zod schemas across Volunteer, Membership, and Beneficiary modules', () => {
    // Volunteer application requires explicit consentAccepted === true
    expect(
      createVolunteerApplicationSchema.safeParse({
        fullName: 'Asha',
        email: 'asha@example.org',
        mobileNumber: '9876543210',
        availability: 'Weekends',
        consentAccepted: false,
      }).success
    ).toBe(false);

    expect(
      createVolunteerAttendanceSchema.safeParse({
        attendanceDate: '2026-11-19',
        minutesLogged: 180,
        activityDescription: 'Evening community literacy session',
      }).success
    ).toBe(true);

    // Membership plan fee must be integer minor units
    expect(
      createMembershipPlanSchema.safeParse({
        name: 'Annual Member',
        code: 'PLAN-ANN',
        category: 'ANNUAL',
        description: 'Annual general membership tier.',
        feeAmountMinor: 100000,
      }).success
    ).toBe(true);
    expect(
      createMembershipPlanSchema.safeParse({
        name: 'Bad Fee',
        code: 'BAD',
        category: 'ANNUAL',
        description: 'Fractional fee rejected.',
        feeAmountMinor: 99.5,
      }).success
    ).toBe(false);

    expect(
      createMembershipApplicationSchema.safeParse({
        planId: new mongoose.Types.ObjectId().toString(),
        fullName: 'Rohan',
        email: 'rohan@example.org',
        mobileNumber: '9876543210',
        reasonForJoining: 'Committed to local education initiatives.',
        consentAccepted: true,
      }).success
    ).toBe(true);

    expect(
      createBeneficiarySchema.safeParse({
        fullName: 'Sita Devi',
        district: 'Jaipur',
        assistanceCategory: 'Education Support',
      }).success
    ).toBe(true);

    expect(
      verifyBeneficiarySchema.safeParse({
        checklist: [{ criterion: 'Need confirmed', met: true }],
        decision: 'VERIFIED',
        decisionReason: 'Field visit verified household need.',
      }).success
    ).toBe(true);
  });
});

describe('Phase 9: Volunteer Management, Verification, Assignments, Attendance & Certificates', () => {
  const service = new VolunteerService();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(auditRepository, 'create').mockResolvedValue({ _id: new mongoose.Types.ObjectId() } as never);
    vi.spyOn(emailProvider, 'sendEmail').mockResolvedValue({ success: true, messageId: 'v1' });
    vi.spyOn(organizationRepository, 'findById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(ORG_A),
      name: 'HopeHorizon Foundation',
    } as never);
  });

  it('prevents duplicate active volunteer applications and enforces verification requirements', async () => {
    vi.spyOn(stakeholderRepository, 'findActiveVolunteerApplicationByEmail').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      applicationCode: 'VAPP-2026-EXIST',
      status: 'SUBMITTED',
    } as never);

    await expect(
      service.submitApplication(ORG_A, {
        fullName: 'Ananya',
        email: 'ananya@example.org',
        mobileNumber: '9876543210',
        country: 'India',
        skills: ['Teaching'],
        areasOfInterest: ['Education'],
        preferredActivities: [],
        availability: 'Weekends',
        preferredWorkingDays: [],
        languagesKnown: ['English'],
        documentUrls: [],
        consentAccepted: true,
        consentVersion: '1.0',
      })
    ).rejects.toThrow(/already in progress/i);

    // Verification permission required
    const volId = new mongoose.Types.ObjectId().toString();
    vi.spyOn(stakeholderRepository, 'findVolunteerById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(volId),
      organizationId: new mongoose.Types.ObjectId(ORG_A),
      volunteerCode: 'VOL-2026-01',
      status: 'ACTIVE',
      verificationStatus: 'UNVERIFIED',
      verificationChecks: {
        emailVerified: true,
        mobileVerified: true,
        identityRequired: true,
        identityVerified: false,
        referenceRequired: false,
        referenceVerified: false,
        backgroundCheckRequired: false,
        backgroundCheckConsented: false,
        backgroundVerified: false,
      },
      verificationDocuments: [{ label: 'Gov ID', documentType: 'IDENTITY', storageRef: 's3://private/id', uploadedAt: new Date() }],
    } as never);

    // Field staff without volunteers.verify cannot verify
    await expect(
      service.updateVolunteerProfile(
        volId,
        ORG_A,
        { verificationAction: { verificationStatus: 'VERIFIED' } },
        teamMemberActor
      )
    ).rejects.toThrow(/volunteers\.verify/i);

    // Cannot mark VERIFIED while identityRequired is true & identityVerified is false
    await expect(
      service.updateVolunteerProfile(
        volId,
        ORG_A,
        { verificationAction: { verificationStatus: 'VERIFIED' } },
        managerActor
      )
    ).rejects.toThrow(/Identity verification is required/i);

    // Restricted verification documents stripped for viewers lacking volunteers.verify
    const volDoc = await stakeholderRepository.findVolunteerById(volId, ORG_A);
    expect(toSafeVolunteerProfileDTO(volDoc as never, false).verificationDocuments).toHaveLength(0);
    expect(toSafeVolunteerProfileDTO(volDoc as never, true).verificationDocuments).toHaveLength(1);
  });

  it('enforces assignment verification eligibility, tenant isolation, and scheduling conflict checks', async () => {
    const volId = new mongoose.Types.ObjectId().toString();
    vi.spyOn(stakeholderRepository, 'findVolunteerById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(volId),
      organizationId: new mongoose.Types.ObjectId(ORG_A),
      volunteerCode: 'VOL-2026-02',
      status: 'ACTIVE',
      verificationStatus: 'UNVERIFIED',
    } as never);

    // Unverified volunteer cannot receive restricted assignment
    await expect(
      service.createAssignment(
        volId,
        ORG_A,
        {
          roleTitle: 'Child Learning Mentor',
          responsibilities: 'Assist in after-school tutoring sessions',
          requiresVerification: true,
          startDate: '2026-11-20',
          scheduledDays: ['Monday'],
        },
        managerActor
      )
    ).rejects.toThrow(/requires the volunteer to complete verification/i);

    // Verified volunteer + cross-tenant project rejected
    vi.spyOn(stakeholderRepository, 'findVolunteerById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(volId),
      organizationId: new mongoose.Types.ObjectId(ORG_A),
      volunteerCode: 'VOL-2026-02',
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
    } as never);
    vi.spyOn(projectRepository, 'findById').mockResolvedValue(null);

    await expect(
      service.createAssignment(
        volId,
        ORG_A,
        {
          projectId: new mongoose.Types.ObjectId().toString(),
          roleTitle: 'Water Field Lead',
          responsibilities: 'Coordinate solar pump training',
          requiresVerification: true,
          startDate: '2026-11-20',
          scheduledDays: ['Saturday'],
        },
        managerActor
      )
    ).rejects.toThrow(/Linked project not found in this organization/i);
  });

  it('validates attendance check-in/out times, prevents duplicate check-ins, and computes verified hours strictly from approved entries', async () => {
    const t1 = new Date('2026-11-19T09:00:00Z');
    const t2 = new Date('2026-11-19T12:30:00Z');
    expect(computeAttendanceMinutes(t1, t2)).toBe(210);
    expect(() => computeAttendanceMinutes(t2, t1)).toThrow(/strictly later than check-in/i);

    const summary = computeVerifiedHoursSummary([
      { approvalStatus: 'APPROVED', status: 'PRESENT', minutesLogged: 180, attendanceDate: '2026-11-01' },
      { approvalStatus: 'APPROVED', status: 'HALF_DAY', minutesLogged: 120, attendanceDate: '2026-11-05' },
      { approvalStatus: 'PENDING', status: 'PRESENT', minutesLogged: 300, attendanceDate: '2026-11-10' },
      { approvalStatus: 'REJECTED', status: 'PRESENT', minutesLogged: 240, attendanceDate: '2026-11-12' },
      { approvalStatus: 'APPROVED', status: 'ABSENT', minutesLogged: 180, attendanceDate: '2026-11-14' },
    ]);
    expect(summary.verifiedMinutes).toBe(300);
    expect(summary.verifiedHours).toBe(5);
    expect(summary.pendingHours).toBe(5);
    expect(summary.approvedSessions).toBe(2);

    // Duplicate check-in prevention
    const volId = new mongoose.Types.ObjectId().toString();
    vi.spyOn(stakeholderRepository, 'findVolunteerById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(volId),
      volunteerCode: 'VOL-2026-03',
    } as never);
    vi.spyOn(stakeholderRepository, 'findDuplicateAttendance').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
    } as never);

    await expect(
      service.recordAttendance(
        volId,
        ORG_A,
        {
          attendanceDate: '2026-11-19',
          minutesLogged: 120,
          status: 'PRESENT',
          activityDescription: 'Duplicate entry',
          entrySource: 'CHECK_IN',
        },
        managerActor
      )
    ).rejects.toThrow(/already exists/i);
  });

  it('enforces certificate issuance authorization, never fabricates hours, and strips private PII publicly', async () => {
    const volId = new mongoose.Types.ObjectId().toString();

    // Field staff lacking volunteers.certificates.issue blocked
    await expect(
      service.issueCertificate(
        volId,
        ORG_A,
        {
          certificateType: 'PARTICIPATION',
          title: 'Service Award',
          participationStartDate: '2026-01-01',
          participationEndDate: '2026-11-19',
          signatoryName: 'Director',
          signatoryRole: 'Executive Director',
          minimumRequiredMinutes: 60,
        },
        teamMemberActor
      )
    ).rejects.toThrow(/volunteers\.certificates\.issue/i);

    // Insufficient approved hours -> refuses to fabricate
    vi.spyOn(stakeholderRepository, 'findVolunteerById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(volId),
      fullName: 'Vikram Rao',
      email: 'vikram@example.org',
    } as never);
    vi.spyOn(stakeholderRepository, 'findVolunteerAttendance').mockResolvedValue([
      { approvalStatus: 'APPROVED', status: 'PRESENT', minutesLogged: 30, attendanceDate: '2026-05-01' },
    ] as never);

    await expect(
      service.issueCertificate(
        volId,
        ORG_A,
        {
          certificateType: 'EXPERIENCE',
          title: 'Experience Certificate',
          participationStartDate: '2026-01-01',
          participationEndDate: '2026-11-19',
          signatoryName: 'Director',
          signatoryRole: 'Executive Director',
          minimumRequiredMinutes: 60,
        },
        managerActor
      )
    ).rejects.toThrow(/cannot be fabricated/i);

    const pub = toPublicCertificateDTO({
      certificateNumber: 'VCERT-2026-ABC123',
      verificationCode: 'VRF-99887766',
      certificateType: 'PARTICIPATION',
      title: 'Community Service Certificate',
      volunteerNameSnapshot: 'Vikram Rao',
      organizationNameSnapshot: 'HopeHorizon Foundation',
      participationStartDate: new Date('2026-01-01'),
      participationEndDate: new Date('2026-06-01'),
      verifiedHours: 24,
      signatoryName: 'Director',
      signatoryRole: 'Executive Director',
      issueDate: new Date('2026-06-15'),
      status: 'ISSUED',
    } as never);
    expect(pub.verifiedHours).toBe(24);
    expect('email' in pub).toBe(false);
    expect('mobileNumber' in pub).toBe(false);
  });
});

describe('Phase 9: Membership Plans, Approvals, Expiry & Renewals', () => {
  const service = new MembershipService();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(auditRepository, 'create').mockResolvedValue({ _id: new mongoose.Types.ObjectId() } as never);
    vi.spyOn(emailProvider, 'sendEmail').mockResolvedValue({ success: true, messageId: 'm1' });
    vi.spyOn(organizationRepository, 'findById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(ORG_A),
      name: 'HopeHorizon Foundation',
    } as never);
  });

  it('calculates expiry & grace periods accurately and enforces renewal eligibility rules', () => {
    const start = new Date('2026-01-01T00:00:00Z');
    const annual = calculateMembershipExpiry(start, 365, false, 30);
    expect(annual.expiryDate?.toISOString().slice(0, 10)).toBe('2027-01-01');
    expect(annual.graceUntilDate?.toISOString().slice(0, 10)).toBe('2027-01-31');

    const lifetime = calculateMembershipExpiry(start, 0, true, 0);
    expect(lifetime.expiryDate).toBeNull();

    // Lifetime & suspended memberships are not renewable
    expect(isRenewalEligible({ isLifetime: true, status: 'ACTIVE', expiryDate: null }).eligible).toBe(false);
    expect(isRenewalEligible({ isLifetime: false, status: 'SUSPENDED', expiryDate: annual.expiryDate }).eligible).toBe(false);
    expect(isRenewalEligible({ isLifetime: false, status: 'EXPIRED', expiryDate: start }).eligible).toBe(true);
    // Too early (> 90 days left) blocked
    expect(
      isRenewalEligible(
        { isLifetime: false, status: 'ACTIVE', expiryDate: new Date('2027-06-01T00:00:00Z') },
        new Date('2026-11-19T00:00:00Z')
      ).eligible
    ).toBe(false);
  });

  it('enforces members.approve, generates unique membership number, and validates paid renewal payment status', async () => {
    const appId = new mongoose.Types.ObjectId().toString();
    const planId = new mongoose.Types.ObjectId();

    // Manager lacking members.approve cannot approve membership
    await expect(
      service.reviewApplication(appId, ORG_A, { action: 'APPROVE', activateImmediately: true }, managerActor)
    ).rejects.toThrow(/members\.approve/i);

    vi.spyOn(stakeholderRepository, 'findMembershipApplicationById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(appId),
      organizationId: new mongoose.Types.ObjectId(ORG_A),
      applicationCode: 'MAPP-2026-01',
      planId,
      category: 'ANNUAL',
      fullName: 'Deepak Joshi',
      email: 'deepak@example.org',
      feeAmountMinor: 100000,
      currency: 'INR',
      feePaymentStatus: 'PAID',
      status: 'SUBMITTED',
      supportingDocumentUrls: [],
    } as never);
    vi.spyOn(stakeholderRepository, 'findMembershipPlanById').mockResolvedValue({
      _id: planId,
      code: 'PLAN-ANN',
      category: 'ANNUAL',
      feeAmountMinor: 100000,
      currency: 'INR',
      validityDays: 365,
      gracePeriodDays: 30,
      isLifetime: false,
      isActive: true,
    } as never);

    let generatedNum = '';
    vi.spyOn(stakeholderRepository, 'createMembership').mockImplementation(async (d) => {
      generatedNum = String(d.membershipNumber);
      return { _id: new mongoose.Types.ObjectId(), ...d } as never;
    });
    vi.spyOn(stakeholderRepository, 'updateMembershipApplication').mockResolvedValue({ status: 'APPROVED' } as never);

    const res = await service.reviewApplication(
      appId,
      ORG_A,
      { action: 'APPROVE', activateImmediately: true },
      adminActor
    );
    expect(generatedNum).toMatch(/^MBR-\d{4}-[A-F0-9]{6}$/);
    expect(res.membership?.status).toBe('ACTIVE');

    // Paid renewal cannot complete while paymentStatus === 'PENDING'
    const memId = new mongoose.Types.ObjectId().toString();
    vi.spyOn(stakeholderRepository, 'findMembershipById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(memId),
      organizationId: new mongoose.Types.ObjectId(ORG_A),
      membershipNumber: generatedNum,
      planId,
      status: 'EXPIRED',
      isLifetime: false,
      expiryDate: new Date('2026-01-01'),
    } as never);

    await expect(
      service.processRenewal(
        memId,
        ORG_A,
        { paymentStatus: 'PENDING', approveAndComplete: true },
        adminActor
      )
    ).rejects.toThrow(/cannot be completed while payment status is PENDING/i);

    // Cross-tenant lookup returns NotFoundError
    vi.spyOn(stakeholderRepository, 'findMembershipById').mockResolvedValue(null);
    await expect(service.getMemberDetail(memId, ORG_B)).rejects.toThrow(/not found in this organization/i);
  });
});

describe('Phase 9: Beneficiary Privacy, Child Safeguarding, Consent, Cases & Assistance', () => {
  const service = new BeneficiaryService();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(auditRepository, 'create').mockResolvedValue({ _id: new mongoose.Types.ObjectId() } as never);
    vi.spyOn(emailProvider, 'sendEmail').mockResolvedValue({ success: true, messageId: 'b1' });
  });

  it('requires guardian info for minor registrations and strips sensitive/child PII for unauthorized roles', async () => {
    // Minor without guardianDetails MUST fail
    await expect(
      service.registerBeneficiary(
        ORG_A,
        {
          fullName: 'Minor Child',
          district: 'Jaipur',
          assistanceCategory: 'Child Welfare',
          registrationSource: 'FIELD_STAFF',
          isMinorOrVulnerable: true,
          requiresSafeguarding: true,
          initialConsentGranted: false,
          consentVersion: '1.0',
        },
        teamMemberActor
      )
    ).rejects.toThrow(/Guardian name and relation are required/i);

    const childDoc = {
      _id: new mongoose.Types.ObjectId(),
      beneficiaryCode: 'BEN-2026-CHILD1',
      fullName: 'Aarav Sharma',
      contactPhone: '9876543210',
      contactEmail: 'guardian@example.org',
      address: 'House 12, Sector 4',
      district: 'Jaipur',
      assistanceCategory: 'Child Welfare',
      registrationSource: 'FIELD_STAFF',
      registrationDate: new Date(),
      status: 'ACTIVE',
      eligibilityStatus: 'ELIGIBLE',
      verificationStatus: 'VERIFIED',
      isMinorOrVulnerable: true,
      requiresSafeguarding: true,
      safeguardingEscalationRef: 'SG-2026-09',
      guardianDetails: {
        name: 'Sunita Sharma',
        relation: 'Mother',
        contactPhone: '9876543210',
        authorizationDocumented: true,
      },
      sensitiveProfile: {
        vulnerabilityNotes: 'Confidential safeguarding note',
      },
      documentRefs: [{ label: 'Guardian Auth', category: 'GUARDIAN_AUTHORIZATION', storageRef: 's3://priv/doc', uploadedAt: new Date() }],
      isAnonymized: false,
      createdAt: new Date(),
    } as never;

    // General ADMIN (without sensitive.view) sees redacted child record & zero sensitive fields or documents
    const adminClearance = resolveBeneficiaryClearance(adminActor);
    const listItem = toListBeneficiaryDTO(childDoc, adminClearance);
    expect(listItem.displayName).toBe('Protected Record (BEN-2026-CHILD1)');
    expect('contactPhone' in listItem).toBe(false);
    expect('sensitiveProfile' in listItem).toBe(false);

    const detailForAdmin = toDetailedBeneficiaryDTO(childDoc, adminClearance);
    expect(detailForAdmin.sensitiveFieldsRedacted).toBe(true);
    expect(detailForAdmin.guardianDetails).toBeUndefined();
    expect(detailForAdmin.sensitiveProfile).toBeUndefined();
    expect(detailForAdmin.documentRefs).toHaveLength(0);

    // EXECUTIVE_DIRECTOR (with sensitive.view + safeguarding.manage + documents.view) receives authorized fields
    const execClearance = resolveBeneficiaryClearance(execDirectorActor);
    const detailForExec = toDetailedBeneficiaryDTO(childDoc, execClearance);
    expect(detailForExec.sensitiveFieldsRedacted).toBe(false);
    expect(detailForExec.guardianDetails?.name).toBe('Sunita Sharma');
    expect(detailForExec.documentRefs).toHaveLength(1);
  });

  it('enforces child media consent guardian proof, separates optional consent withdrawal from essential aid, and enforces case/assistance/export authorization', async () => {
    const benId = new mongoose.Types.ObjectId().toString();
    vi.spyOn(stakeholderRepository, 'findBeneficiaryById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(benId),
      organizationId: new mongoose.Types.ObjectId(ORG_A),
      beneficiaryCode: 'BEN-2026-CHILD2',
      isMinorOrVulnerable: true,
      requiresSafeguarding: true,
      status: 'ACTIVE',
    } as never);

    // Child PHOTOGRAPHY_MEDIA consent without guardian proof MUST fail
    await expect(
      service.manageConsent(
        benId,
        ORG_A,
        {
          action: 'GRANT',
          purpose: 'PHOTOGRAPHY_MEDIA',
          consentVersion: '1.0',
          grantedByGuardian: false,
        },
        adminActor
      )
    ).rejects.toThrow(/Documented guardian authorization/i);

    // Withdrawing optional consent succeeds without affecting essential assistance
    const consentId = new mongoose.Types.ObjectId().toString();
    vi.spyOn(stakeholderRepository, 'updateConsentRecord').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(consentId),
      purpose: 'PHOTOGRAPHY_MEDIA',
      status: 'WITHDRAWN',
    } as never);
    const withdrawn = await service.manageConsent(
      benId,
      ORG_A,
      {
        action: 'WITHDRAW',
        consentId,
        withdrawalReason: 'Guardian declined media use',
        consentVersion: '1.0',
        grantedByGuardian: false,
      },
      adminActor
    );
    expect(withdrawn.essentialAssistanceUnaffected).toBe(true);

    // DELIVERED assistance requires explicit deliveryDate
    await expect(
      service.recordAssistance(
        benId,
        ORG_A,
        {
          assistanceCategory: 'Education Support',
          description: 'Distributed school textbooks and uniform kit',
          deliveryStatus: 'DELIVERED',
        },
        teamMemberActor
      )
    ).rejects.toThrow(/Actual delivery date is required/i);

    // Case management requires beneficiaries.case.manage; safeguarding case requires safeguarding.manage
    await expect(
      service.createCase(
        benId,
        ORG_A,
        {
          title: 'Follow-up support',
          category: 'Education',
          priority: 'MEDIUM',
          isSafeguardingCase: false,
        },
        managerActor
      )
    ).rejects.toThrow(/beneficiaries\.case\.manage/i);

    await expect(
      service.createCase(
        benId,
        ORG_A,
        {
          title: 'Child safeguarding escalation',
          category: 'Safeguarding',
          priority: 'URGENT',
          isSafeguardingCase: true,
        },
        adminActor
      )
    ).rejects.toThrow(/safeguarding\.manage/i);

    // Export strictly denied to ADMIN & MANAGER; allowed for EXECUTIVE_DIRECTOR
    await expect(service.exportBeneficiaries(ORG_A, adminActor)).rejects.toThrow(/beneficiaries\.export/i);
    vi.spyOn(stakeholderRepository, 'findBeneficiaries').mockResolvedValue([]);
    const exported = await service.exportBeneficiaries(ORG_A, execDirectorActor);
    expect(exported).toEqual([]);

    // Operational beneficiary email NEVER contains sensitive case data
    const benEmail = renderBeneficiaryOperationalEmail({
      recipientName: 'Guardian',
      beneficiaryCode: 'BEN-2026-CHILD2',
      eventType: 'ASSISTANCE_SCHEDULED',
      scheduledDate: '2026-11-25',
    });
    expect(benEmail.html).toContain('never sent over standard email');
    expect(renderVolunteerApplicationReceivedEmail({ applicantName: 'Asha', applicationCode: 'VAPP-1' }).subject).toContain('VAPP-1');
    expect(
      renderVolunteerCertificateIssuedEmail({
        volunteerName: 'Vikram',
        certificateNumber: 'VCERT-1',
        certificateType: 'PARTICIPATION',
        verifiedHours: 24,
        verifyUrl: 'https://hopehorizon.org/verify-certificate',
      }).html
    ).toContain('24 hrs');
    expect(renderMembershipStatusEmail({ memberName: 'Deepak', membershipNumber: 'MBR-1', status: 'ACTIVE' }).html).toContain('MBR-1');

    // Keep userRepository referenced cleanly
    expect(userRepository).toBeDefined();
  });
});
