import crypto from 'crypto';
import mongoose from 'mongoose';
import connectToDatabase from '@/server/database/connection';
import { stakeholderRepository } from '@/server/repositories/stakeholder.repository';
import { programRepository } from '@/server/repositories/program.repository';
import { projectRepository } from '@/server/repositories/project.repository';
import { userRepository } from '@/server/repositories/user.repository';
import { organizationRepository } from '@/server/repositories/organization.repository';
import {
  IVolunteerApplicationDocument,
  VolunteerApplicationStatus,
} from '@/server/database/models/VolunteerApplication';
import {
  IVolunteerProfileDocument,
  VolunteerProfile,
} from '@/server/database/models/VolunteerProfile';
import {
  VolunteerAssignment,
  VolunteerAssignmentStatus,
} from '@/server/database/models/VolunteerAssignment';
import {
  IVolunteerAttendanceDocument,
  VolunteerAttendance,
} from '@/server/database/models/VolunteerAttendance';
import { IVolunteerCertificateDocument } from '@/server/database/models/VolunteerCertificate';
import { adminService, AdminActor } from '@/server/services/admin.service';
import { checkRolePermission } from '@/server/authorization/permissions';
import { emailProvider } from '@/integrations/email/nodemailer.provider';
import {
  renderAttendanceCorrectionEmail,
  renderVolunteerApplicationReceivedEmail,
  renderVolunteerAssignmentEmail,
  renderVolunteerCertificateIssuedEmail,
  renderVolunteerDecisionEmail,
  renderVolunteerInterviewScheduledEmail,
} from '@/integrations/email/templates';
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '@/lib/error-handler';
import {
  ApproveVolunteerAttendanceInput,
  CreateVolunteerApplicationInput,
  CreateVolunteerAssignmentInput,
  CreateVolunteerAttendanceInput,
  IssueVolunteerCertificateInput,
  ReviewVolunteerApplicationInput,
  UpdateVolunteerAssignmentInput,
  UpdateVolunteerProfileInput,
} from '@/features/volunteers/schemas/volunteer.schema';

// ======================== PURE DOMAIN HELPERS ========================

export const VOLUNTEER_APPLICATION_TRANSITIONS: Record<
  VolunteerApplicationStatus,
  VolunteerApplicationStatus[]
> = {
  DRAFT: ['SUBMITTED', 'WITHDRAWN'],
  SUBMITTED: ['UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'APPROVED', 'REJECTED', 'WITHDRAWN'],
  UNDER_REVIEW: ['INTERVIEW_SCHEDULED', 'APPROVED', 'REJECTED', 'WITHDRAWN'],
  INTERVIEW_SCHEDULED: ['APPROVED', 'REJECTED', 'WITHDRAWN'],
  APPROVED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

export const VOLUNTEER_ASSIGNMENT_TRANSITIONS: Record<
  VolunteerAssignmentStatus,
  VolunteerAssignmentStatus[]
> = {
  INVITED: ['ACCEPTED', 'ACTIVE', 'WITHDRAWN'],
  ACCEPTED: ['ACTIVE', 'PAUSED', 'WITHDRAWN'],
  ACTIVE: ['PAUSED', 'COMPLETED', 'WITHDRAWN'],
  PAUSED: ['ACTIVE', 'COMPLETED', 'WITHDRAWN'],
  COMPLETED: [],
  WITHDRAWN: [],
};

/**
 * Pure attendance duration validation & calculation in integer minutes.
 * Rejects invalid check-out times (<= check-in) or impossible shifts (> 24 hours).
 */
export function computeAttendanceMinutes(checkInAt?: Date, checkOutAt?: Date): number {
  if (!checkInAt || !checkOutAt) return 0;
  const diffMs = checkOutAt.getTime() - checkInAt.getTime();
  if (diffMs <= 0) {
    throw new ValidationError('Check-out time must be strictly later than check-in time');
  }
  const minutes = Math.round(diffMs / 60000);
  if (minutes > 1440) {
    throw new ValidationError('Single attendance entry cannot exceed 24 hours (1440 minutes)');
  }
  return minutes;
}

/**
 * Computes verified volunteer hours STRICTLY from approved PRESENT/HALF_DAY attendance records.
 * Unverified, pending, absent, excused, or rejected records are NEVER counted.
 */
export function computeVerifiedHoursSummary(
  records: Array<
    Pick<
      IVolunteerAttendanceDocument,
      'approvalStatus' | 'status' | 'minutesLogged' | 'attendanceDate' | 'projectId'
    >
  >
) {
  let approvedMinutes = 0;
  let pendingMinutes = 0;
  let approvedSessions = 0;
  let pendingSessions = 0;
  const monthlyMap = new Map<string, number>();

  for (const r of records) {
    const mins = Math.max(0, Math.trunc(r.minutesLogged || 0));
    const countableStatus = r.status === 'PRESENT' || r.status === 'HALF_DAY';
    if (r.approvalStatus === 'APPROVED' && countableStatus) {
      approvedMinutes += mins;
      approvedSessions += 1;
      const monthKey = String(r.attendanceDate || '').slice(0, 7) || 'unknown';
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + mins);
    } else if (r.approvalStatus === 'PENDING') {
      pendingMinutes += mins;
      pendingSessions += 1;
    }
  }

  return {
    verifiedMinutes: approvedMinutes,
    verifiedHours: Math.round((approvedMinutes / 60) * 100) / 100,
    pendingMinutes,
    pendingHours: Math.round((pendingMinutes / 60) * 100) / 100,
    approvedSessions,
    pendingSessions,
    monthlyBreakdown: Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, minutes]) => ({
        month,
        minutes,
        hours: Math.round((minutes / 60) * 100) / 100,
      })),
  };
}

/**
 * Strips restricted verification documents unless the caller holds `volunteers.verify`.
 */
export function toSafeVolunteerProfileDTO(
  profile: IVolunteerProfileDocument,
  canViewVerificationDocs: boolean
) {
  return {
    id: profile._id.toString(),
    volunteerCode: profile.volunteerCode,
    fullName: profile.fullName,
    email: profile.email,
    mobileNumber: profile.mobileNumber,
    city: profile.city,
    district: profile.district,
    state: profile.state,
    country: profile.country,
    education: profile.education,
    occupation: profile.occupation,
    skills: profile.skills || [],
    areasOfInterest: profile.areasOfInterest || [],
    preferredActivities: profile.preferredActivities || [],
    availability: profile.availability,
    preferredWorkingDays: profile.preferredWorkingDays || [],
    preferredWorkingHours: profile.preferredWorkingHours,
    languagesKnown: profile.languagesKnown || [],
    status: profile.status,
    verificationStatus: profile.verificationStatus,
    verificationChecks: profile.verificationChecks,
    verificationDocuments: canViewVerificationDocs ? profile.verificationDocuments || [] : [],
    verificationNotes: canViewVerificationDocs ? profile.verificationNotes : undefined,
    verifiedAt: profile.verifiedAt,
    verifiedMinutesTotal: Math.trunc(profile.verifiedMinutesTotal || 0),
    verifiedHoursTotal: Math.round((Math.trunc(profile.verifiedMinutesTotal || 0) / 60) * 100) / 100,
    completedAssignmentsCount: Math.trunc(profile.completedAssignmentsCount || 0),
    createdAt: profile.createdAt,
  };
}

/**
 * Public-safe certificate verification DTO — exposes zero private volunteer contact data.
 */
export function toPublicCertificateDTO(cert: IVolunteerCertificateDocument) {
  return {
    certificateNumber: cert.certificateNumber,
    verificationCode: cert.verificationCode,
    certificateType: cert.certificateType,
    title: cert.title,
    recipientName: cert.volunteerNameSnapshot,
    organizationName: cert.organizationNameSnapshot,
    projectName: cert.projectNameSnapshot,
    participationStartDate: cert.participationStartDate,
    participationEndDate: cert.participationEndDate,
    verifiedHours: cert.verifiedHours,
    signatoryName: cert.signatoryName,
    signatoryRole: cert.signatoryRole,
    issueDate: cert.issueDate,
    status: cert.status,
  };
}

function generateCode(prefix: string): string {
  const year = new Date().getUTCFullYear();
  return `${prefix}-${year}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

export class VolunteerService {
  // ======================== APPLICATIONS ========================

  async submitApplication(
    organizationId: string,
    input: CreateVolunteerApplicationInput
  ): Promise<IVolunteerApplicationDocument> {
    const normalizedEmail = input.email.toLowerCase().trim();

    // Prevent duplicate active applications
    const existingActive = await stakeholderRepository.findActiveVolunteerApplicationByEmail(
      organizationId,
      normalizedEmail
    );
    if (existingActive) {
      throw new ConflictError(
        `An active volunteer application (${existingActive.applicationCode}) is already in progress for this email`
      );
    }

    // Check if an already-active volunteer profile exists for this email
    const existingVol = await stakeholderRepository.findVolunteerByEmail(
      normalizedEmail,
      organizationId
    );
    if (existingVol && existingVol.status === 'ACTIVE') {
      throw new ConflictError('An active volunteer profile already exists for this email address');
    }

    // Check if previous rejection disallowed resubmission
    const latestApp = await stakeholderRepository.findLatestVolunteerApplicationByEmail(
      organizationId,
      normalizedEmail
    );
    if (latestApp && latestApp.status === 'REJECTED' && !latestApp.allowResubmission) {
      throw new AuthorizationError(
        'A previous application for this email was closed without resubmission eligibility'
      );
    }

    const applicationCode = generateCode('VAPP');
    const created = await stakeholderRepository.createVolunteerApplication({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      applicationCode,
      fullName: input.fullName,
      email: normalizedEmail,
      mobileNumber: input.mobileNumber,
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
      gender: input.gender,
      address: input.address,
      country: input.country || 'India',
      state: input.state,
      district: input.district,
      city: input.city,
      education: input.education,
      occupation: input.occupation,
      skills: input.skills || [],
      areasOfInterest: input.areasOfInterest || [],
      preferredActivities: input.preferredActivities || [],
      availability: input.availability,
      preferredWorkingDays: input.preferredWorkingDays || [],
      preferredWorkingHours: input.preferredWorkingHours,
      languagesKnown: input.languagesKnown || [],
      previousExperience: input.previousExperience,
      emergencyContact: input.emergencyContact,
      profilePhotoUrl: input.profilePhotoUrl || undefined,
      documentUrls: input.documentUrls || [],
      consentAccepted: true,
      consentVersion: input.consentVersion || '1.0',
      consentAcceptedAt: new Date(),
      status: 'SUBMITTED',
      history: [
        {
          status: 'SUBMITTED',
          actorName: input.fullName,
          actorRole: 'APPLICANT',
          notes: 'Volunteer application submitted',
          timestamp: new Date(),
        },
      ],
    });

    const org = await organizationRepository.findById(organizationId);
    const tpl = renderVolunteerApplicationReceivedEmail({
      applicantName: created.fullName,
      applicationCode: created.applicationCode,
      organizationName: org?.name || 'HopeHorizon Foundation',
    });
    await emailProvider.sendEmail({
      to: created.email,
      subject: tpl.subject,
      htmlContent: tpl.html,
      textContent: tpl.text,
    });

    return created;
  }

  async reviewApplication(
    applicationId: string,
    organizationId: string,
    input: ReviewVolunteerApplicationInput,
    actor: AdminActor
  ) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'volunteers.manage')) {
      throw new AuthorizationError('Missing volunteers.manage permission to review applications');
    }

    const app = await stakeholderRepository.findVolunteerApplicationById(
      applicationId,
      organizationId
    );
    if (!app) throw new NotFoundError('Volunteer application not found in this organization');

    const targetStatusMap: Record<
      ReviewVolunteerApplicationInput['action'],
      VolunteerApplicationStatus
    > = {
      UNDER_REVIEW: 'UNDER_REVIEW',
      SCHEDULE_INTERVIEW: 'INTERVIEW_SCHEDULED',
      APPROVE: 'APPROVED',
      REJECT: 'REJECTED',
      WITHDRAW: 'WITHDRAWN',
    };
    const nextStatus = targetStatusMap[input.action];
    const allowed = VOLUNTEER_APPLICATION_TRANSITIONS[app.status] || [];
    if (!allowed.includes(nextStatus)) {
      throw new ValidationError(
        `Cannot transition volunteer application from "${app.status}" to "${nextStatus}"`
      );
    }

    if (input.action === 'REJECT' && !input.rejectionReason?.trim()) {
      throw new ValidationError('Rejection reason is required when rejecting a volunteer application');
    }

    if (input.action === 'SCHEDULE_INTERVIEW' && !input.interviewScheduledAt) {
      throw new ValidationError('Interview date/time is required when scheduling an interview');
    }

    const $set: Record<string, unknown> = {
      status: nextStatus,
      reviewedBy: new mongoose.Types.ObjectId(actor.id),
      reviewedAt: new Date(),
    };
    if (input.internalNotes !== undefined) $set.internalNotes = input.internalNotes;
    if (input.action === 'REJECT') {
      $set.rejectionReason = input.rejectionReason?.trim();
      $set.allowResubmission = input.allowResubmission ?? true;
    }
    if (input.action === 'SCHEDULE_INTERVIEW') {
      $set.interviewScheduledAt = new Date(input.interviewScheduledAt as string);
      $set.interviewMode = input.interviewMode || 'VIDEO';
      $set.interviewLocationOrLink = input.interviewLocationOrLink;
    }

    let createdProfile: IVolunteerProfileDocument | null = null;
    if (input.action === 'APPROVE') {
      // Create volunteer profile starting UNVERIFIED — never auto-mark verified!
      const existingProfile = await stakeholderRepository.findVolunteerByEmail(
        app.email,
        organizationId
      );
      if (existingProfile) {
        createdProfile = existingProfile;
      } else {
        createdProfile = await stakeholderRepository.createVolunteerProfile({
          organizationId: new mongoose.Types.ObjectId(organizationId),
          volunteerCode: generateCode('VOL'),
          applicationId: app._id as mongoose.Types.ObjectId,
          fullName: app.fullName,
          email: app.email,
          mobileNumber: app.mobileNumber,
          dateOfBirth: app.dateOfBirth,
          gender: app.gender,
          address: app.address,
          country: app.country,
          state: app.state,
          district: app.district,
          city: app.city,
          education: app.education,
          occupation: app.occupation,
          skills: app.skills,
          areasOfInterest: app.areasOfInterest,
          preferredActivities: app.preferredActivities,
          availability: app.availability,
          preferredWorkingDays: app.preferredWorkingDays,
          preferredWorkingHours: app.preferredWorkingHours,
          languagesKnown: app.languagesKnown,
          previousExperience: app.previousExperience,
          emergencyContact: app.emergencyContact,
          profilePhotoUrl: app.profilePhotoUrl,
          status: 'ACTIVE',
          verificationStatus: 'UNVERIFIED',
          createdBy: new mongoose.Types.ObjectId(actor.id),
        });
      }
      $set.volunteerProfileId = createdProfile._id;
    }

    const updated = await stakeholderRepository.updateVolunteerApplication(
      applicationId,
      organizationId,
      {
        $set,
        $push: {
          history: {
            status: nextStatus,
            actorId: new mongoose.Types.ObjectId(actor.id),
            actorName: actor.name,
            actorRole: actor.role,
            notes: input.rejectionReason || input.internalNotes,
            timestamp: new Date(),
          },
        },
      }
    );

    await adminService.logAudit(
      actor,
      `VOLUNTEER_APPLICATION_${nextStatus}`,
      'VolunteerApplication',
      applicationId,
      `Updated volunteer application ${app.applicationCode} -> ${nextStatus}`
    );

    const org = await organizationRepository.findById(organizationId);
    if (input.action === 'SCHEDULE_INTERVIEW') {
      const tpl = renderVolunteerInterviewScheduledEmail({
        applicantName: app.fullName,
        applicationCode: app.applicationCode,
        scheduledAt: new Date(input.interviewScheduledAt as string).toLocaleString('en-IN'),
        mode: input.interviewMode || 'VIDEO',
        locationOrLink: input.interviewLocationOrLink,
        organizationName: org?.name,
      });
      await emailProvider.sendEmail({
        to: app.email,
        subject: tpl.subject,
        htmlContent: tpl.html,
        textContent: tpl.text,
      });
    } else if (input.action === 'APPROVE' || input.action === 'REJECT') {
      const tpl = renderVolunteerDecisionEmail({
        applicantName: app.fullName,
        applicationCode: app.applicationCode,
        decision: input.action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        reason: input.rejectionReason,
        volunteerCode: createdProfile?.volunteerCode,
        organizationName: org?.name,
      });
      await emailProvider.sendEmail({
        to: app.email,
        subject: tpl.subject,
        htmlContent: tpl.html,
        textContent: tpl.text,
      });
    }

    return { application: updated, volunteerProfile: createdProfile };
  }

  // ======================== VOLUNTEER PROFILES & VERIFICATION ========================

  async listVolunteers(
    organizationId: string,
    filter: {
      status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED';
      verificationStatus?: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
      skill?: string;
      search?: string;
    },
    pagination: { page?: number; limit?: number },
    actor: AdminActor
  ) {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(100, Math.max(1, pagination.limit || 25));
    const canViewDocs =
      actor.role === 'SUPER_ADMIN' || checkRolePermission(actor.role, 'volunteers.verify');

    const [volunteers, total] = await Promise.all([
      stakeholderRepository.findVolunteers(organizationId, filter, { page, limit }),
      stakeholderRepository.countVolunteers(organizationId, filter),
    ]);

    return {
      volunteers: volunteers.map((v) => toSafeVolunteerProfileDTO(v, canViewDocs)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getVolunteerDetail(id: string, organizationId: string, actor: AdminActor) {
    const profile = await stakeholderRepository.findVolunteerById(id, organizationId);
    if (!profile) throw new NotFoundError('Volunteer profile not found in this organization');

    const canViewDocs =
      actor.role === 'SUPER_ADMIN' || checkRolePermission(actor.role, 'volunteers.verify');

    const [assignments, attendance, certificates] = await Promise.all([
      stakeholderRepository.findVolunteerAssignments(organizationId, id),
      stakeholderRepository.findVolunteerAttendance(organizationId, id),
      stakeholderRepository.findVolunteerCertificates(organizationId, id),
    ]);

    return {
      volunteer: toSafeVolunteerProfileDTO(profile, canViewDocs),
      assignments,
      attendance,
      hoursSummary: computeVerifiedHoursSummary(attendance),
      certificates,
    };
  }

  async updateVolunteerProfile(
    id: string,
    organizationId: string,
    input: UpdateVolunteerProfileInput,
    actor: AdminActor
  ) {
    const existing = await stakeholderRepository.findVolunteerById(id, organizationId);
    if (!existing) throw new NotFoundError('Volunteer profile not found in this organization');

    const $set: Record<string, unknown> = {
      updatedBy: new mongoose.Types.ObjectId(actor.id),
    };

    if (input.verificationAction) {
      if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'volunteers.verify')) {
        throw new AuthorizationError('Missing volunteers.verify permission to verify volunteers');
      }
      const mergedChecks = {
        ...existing.verificationChecks,
        ...(input.verificationAction.checks || {}),
      };

      // Enforce configured verification requirements before marking VERIFIED
      if (input.verificationAction.verificationStatus === 'VERIFIED') {
        if (mergedChecks.identityRequired && !mergedChecks.identityVerified) {
          throw new ValidationError('Identity verification is required before marking volunteer VERIFIED');
        }
        if (mergedChecks.referenceRequired && !mergedChecks.referenceVerified) {
          throw new ValidationError('Reference verification is required before marking volunteer VERIFIED');
        }
        if (
          mergedChecks.backgroundCheckRequired &&
          (!mergedChecks.backgroundCheckConsented || !mergedChecks.backgroundVerified)
        ) {
          throw new ValidationError(
            'Consented background verification must be completed before marking volunteer VERIFIED'
          );
        }
        $set.verifiedBy = new mongoose.Types.ObjectId(actor.id);
        $set.verifiedAt = new Date();
      }
      $set.verificationStatus = input.verificationAction.verificationStatus;
      $set.verificationChecks = mergedChecks;
      if (input.verificationAction.notes !== undefined) {
        $set.verificationNotes = input.verificationAction.notes;
      }
    }

    const editable = [
      'fullName',
      'mobileNumber',
      'city',
      'district',
      'state',
      'skills',
      'areasOfInterest',
      'availability',
      'preferredWorkingDays',
      'languagesKnown',
      'status',
    ] as const;
    for (const k of editable) {
      if (input[k] !== undefined) $set[k] = input[k];
    }

    const updated = await stakeholderRepository.updateVolunteerProfile(id, organizationId, { $set });
    if (!updated) throw new NotFoundError('Volunteer not found');

    await adminService.logAudit(
      actor,
      input.verificationAction ? 'VOLUNTEER_VERIFICATION_UPDATE' : 'VOLUNTEER_PROFILE_UPDATE',
      'VolunteerProfile',
      id,
      `Updated volunteer ${updated.volunteerCode} (${updated.verificationStatus})`
    );

    const canViewDocs =
      actor.role === 'SUPER_ADMIN' || checkRolePermission(actor.role, 'volunteers.verify');
    return toSafeVolunteerProfileDTO(updated, canViewDocs);
  }

  // ======================== ASSIGNMENTS ========================

  async createAssignment(
    volunteerId: string,
    organizationId: string,
    input: CreateVolunteerAssignmentInput,
    actor: AdminActor
  ) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'volunteers.assign')) {
      throw new AuthorizationError('Missing volunteers.assign permission');
    }

    const volunteer = await stakeholderRepository.findVolunteerById(volunteerId, organizationId);
    if (!volunteer) throw new NotFoundError('Volunteer not found in this organization');

    if (volunteer.status !== 'ACTIVE') {
      throw new ValidationError(
        `Only ACTIVE volunteers can receive new assignments (current status: ${volunteer.status})`
      );
    }

    if (input.requiresVerification && volunteer.verificationStatus !== 'VERIFIED') {
      throw new ValidationError(
        'Restricted assignment requires the volunteer to complete verification (status: VERIFIED)'
      );
    }

    let projectName: string | undefined;
    if (input.programId) {
      const prog = await programRepository.findById(input.programId, organizationId);
      if (!prog) throw new ValidationError('Linked program not found in this organization');
    }
    if (input.projectId) {
      const proj = await projectRepository.findById(input.projectId, organizationId);
      if (!proj) throw new ValidationError('Linked project not found in this organization');
      projectName = proj.name;
    }
    if (input.supervisorId) {
      const sup = await userRepository.findById(input.supervisorId);
      if (!sup || sup.organizationId.toString() !== organizationId || sup.status !== 'active') {
        throw new ValidationError('Assigned supervisor must be an active user in the same organization');
      }
    }

    const startDate = new Date(input.startDate);
    const endDate = input.endDate ? new Date(input.endDate) : undefined;
    if (endDate && endDate < startDate) {
      throw new ValidationError('Assignment end date cannot precede start date');
    }

    // Check scheduling conflicts on overlapping active assignments with identical scheduledDays
    if (input.scheduledDays && input.scheduledDays.length > 0) {
      const existingAssignments = await stakeholderRepository.findVolunteerAssignments(
        organizationId,
        volunteerId
      );
      const conflict = existingAssignments.find((a) => {
        if (!['INVITED', 'ACCEPTED', 'ACTIVE'].includes(a.status)) return false;
        const aEnd = a.endDate ? new Date(a.endDate) : new Date('2099-12-31');
        const newEnd = endDate || new Date('2099-12-31');
        const datesOverlap = startDate <= aEnd && new Date(a.startDate) <= newEnd;
        const daysOverlap = (a.scheduledDays || []).some((d) => input.scheduledDays.includes(d));
        return datesOverlap && daysOverlap;
      });
      if (conflict) {
        throw new ConflictError(
          `Scheduling conflict with existing assignment "${conflict.roleTitle}" on overlapping days`
        );
      }
    }

    const created = await stakeholderRepository.createVolunteerAssignment({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      volunteerId: volunteer._id as mongoose.Types.ObjectId,
      programId: input.programId ? new mongoose.Types.ObjectId(input.programId) : undefined,
      projectId: input.projectId ? new mongoose.Types.ObjectId(input.projectId) : undefined,
      supervisorId: input.supervisorId ? new mongoose.Types.ObjectId(input.supervisorId) : undefined,
      roleTitle: input.roleTitle,
      responsibilities: input.responsibilities,
      requiresVerification: input.requiresVerification ?? false,
      startDate,
      endDate,
      scheduledDays: input.scheduledDays || [],
      status: 'INVITED',
      history: [
        {
          status: 'INVITED',
          actorId: new mongoose.Types.ObjectId(actor.id),
          actorName: actor.name,
          notes: 'Volunteer assigned',
          timestamp: new Date(),
        },
      ],
      createdBy: new mongoose.Types.ObjectId(actor.id),
    });

    await adminService.logAudit(
      actor,
      'VOLUNTEER_ASSIGNMENT_CREATE',
      'VolunteerAssignment',
      created._id.toString(),
      `Assigned volunteer ${volunteer.volunteerCode} to "${input.roleTitle}"`
    );

    if (volunteer.communicationPreferences?.assignmentAlerts !== false) {
      const tpl = renderVolunteerAssignmentEmail({
        volunteerName: volunteer.fullName,
        roleTitle: created.roleTitle,
        status: created.status,
        startDate: startDate.toISOString().slice(0, 10),
        projectName,
      });
      await emailProvider.sendEmail({
        to: volunteer.email,
        subject: tpl.subject,
        htmlContent: tpl.html,
        textContent: tpl.text,
      });
    }

    return created;
  }

  async updateAssignmentStatus(
    volunteerId: string,
    organizationId: string,
    input: UpdateVolunteerAssignmentInput,
    actor: AdminActor
  ) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'volunteers.assign')) {
      throw new AuthorizationError('Missing volunteers.assign permission');
    }

    const assignment = await stakeholderRepository.findVolunteerAssignmentById(
      input.assignmentId,
      organizationId
    );
    if (!assignment || assignment.volunteerId.toString() !== volunteerId) {
      throw new NotFoundError('Volunteer assignment not found in this organization');
    }

    const allowed = VOLUNTEER_ASSIGNMENT_TRANSITIONS[assignment.status] || [];
    if (assignment.status !== input.status && !allowed.includes(input.status)) {
      throw new ValidationError(
        `Invalid assignment transition from "${assignment.status}" to "${input.status}"`
      );
    }

    const updated = await stakeholderRepository.updateVolunteerAssignment(
      input.assignmentId,
      organizationId,
      {
        $set: {
          status: input.status,
          completedActivitiesSummary: input.completedActivitiesSummary,
          updatedBy: new mongoose.Types.ObjectId(actor.id),
        },
        $push: {
          history: {
            status: input.status,
            actorId: new mongoose.Types.ObjectId(actor.id),
            actorName: actor.name,
            notes: input.notes,
            timestamp: new Date(),
          },
        },
      }
    );

    if (input.status === 'COMPLETED' && assignment.status !== 'COMPLETED') {
      await stakeholderRepository.updateVolunteerProfile(volunteerId, organizationId, {
        $inc: { completedAssignmentsCount: 1 },
      });
    }

    await adminService.logAudit(
      actor,
      'VOLUNTEER_ASSIGNMENT_STATUS',
      'VolunteerAssignment',
      input.assignmentId,
      `Assignment "${assignment.roleTitle}" -> ${input.status}`
    );

    return updated;
  }

  // ======================== ATTENDANCE & HOURS ========================

  async recordAttendance(
    volunteerId: string,
    organizationId: string,
    input: CreateVolunteerAttendanceInput,
    actor: AdminActor
  ) {
    if (
      actor.role !== 'SUPER_ADMIN' &&
      !checkRolePermission(actor.role, 'volunteers.attendance.manage')
    ) {
      throw new AuthorizationError('Missing volunteers.attendance.manage permission');
    }

    const volunteer = await stakeholderRepository.findVolunteerById(volunteerId, organizationId);
    if (!volunteer) throw new NotFoundError('Volunteer not found in this organization');

    // Prevent duplicate check-ins for the same date & assignment
    const dup = await stakeholderRepository.findDuplicateAttendance(
      organizationId,
      volunteerId,
      input.attendanceDate,
      input.assignmentId
    );
    if (dup) {
      throw new ConflictError(
        `Attendance entry already exists for ${input.attendanceDate} on this assignment`
      );
    }

    const checkInAt = input.checkInAt ? new Date(input.checkInAt) : undefined;
    const checkOutAt = input.checkOutAt ? new Date(input.checkOutAt) : undefined;
    let minutesLogged = input.minutesLogged ?? 0;

    if (checkInAt && checkOutAt) {
      minutesLogged = computeAttendanceMinutes(checkInAt, checkOutAt);
    } else if (checkOutAt && !checkInAt) {
      throw new ValidationError('Check-out time requires a valid check-in time');
    }

    const created = await stakeholderRepository.createVolunteerAttendance({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      volunteerId: volunteer._id as mongoose.Types.ObjectId,
      assignmentId:
        input.assignmentId && mongoose.Types.ObjectId.isValid(input.assignmentId)
          ? new mongoose.Types.ObjectId(input.assignmentId)
          : undefined,
      projectId:
        input.projectId && mongoose.Types.ObjectId.isValid(input.projectId)
          ? new mongoose.Types.ObjectId(input.projectId)
          : undefined,
      attendanceDate: input.attendanceDate,
      checkInAt,
      checkOutAt,
      minutesLogged,
      status: input.status || 'PENDING_VERIFICATION',
      approvalStatus: 'PENDING',
      activityDescription: input.activityDescription,
      entrySource: input.entrySource || 'CHECK_IN',
      correctionRequested: input.entrySource === 'CORRECTION',
      correctionReason: input.correctionReason,
      createdBy: new mongoose.Types.ObjectId(actor.id),
    });

    await adminService.logAudit(
      actor,
      'VOLUNTEER_ATTENDANCE_RECORD',
      'VolunteerAttendance',
      created._id.toString(),
      `Recorded attendance (${input.attendanceDate}, ${minutesLogged} mins) for ${volunteer.volunteerCode}`
    );

    if (input.entrySource === 'CORRECTION' && input.correctionReason) {
      const org = await organizationRepository.findById(organizationId);
      if (org?.contactEmail) {
        const tpl = renderAttendanceCorrectionEmail({
          recipientName: org.name,
          volunteerName: volunteer.fullName,
          attendanceDate: input.attendanceDate,
          reason: input.correctionReason,
        });
        await emailProvider.sendEmail({
          to: org.contactEmail,
          subject: tpl.subject,
          htmlContent: tpl.html,
          textContent: tpl.text,
        });
      }
    }

    return created;
  }

  async reviewAttendance(
    volunteerId: string,
    organizationId: string,
    input: ApproveVolunteerAttendanceInput,
    actor: AdminActor
  ) {
    if (
      actor.role !== 'SUPER_ADMIN' &&
      !checkRolePermission(actor.role, 'volunteers.attendance.manage')
    ) {
      throw new AuthorizationError('Missing volunteers.attendance.manage permission');
    }

    const record = await stakeholderRepository.findAttendanceById(input.attendanceId, organizationId);
    if (!record || record.volunteerId.toString() !== volunteerId) {
      throw new NotFoundError('Attendance record not found for this volunteer in this organization');
    }

    if (input.decision === 'REJECT' && !input.reason?.trim()) {
      throw new ValidationError('Rejection reason is required when rejecting attendance');
    }

    const $set: Record<string, unknown> = {};
    if (input.decision === 'APPROVE') {
      $set.approvalStatus = 'APPROVED';
      $set.status = input.status || (record.status === 'PENDING_VERIFICATION' ? 'PRESENT' : record.status);
      $set.approvedBy = new mongoose.Types.ObjectId(actor.id);
      $set.approvedAt = new Date();
      if (input.minutesLogged !== undefined) $set.minutesLogged = input.minutesLogged;
    } else if (input.decision === 'REJECT') {
      $set.approvalStatus = 'REJECTED';
      $set.rejectionReason = input.reason?.trim();
      $set.approvedBy = new mongoose.Types.ObjectId(actor.id);
      $set.approvedAt = new Date();
    } else if (input.decision === 'CORRECT') {
      if (!input.reason?.trim()) {
        throw new ValidationError('Correction reason is required for manual attendance corrections');
      }
      $set.correctedBy = new mongoose.Types.ObjectId(actor.id);
      $set.correctionReason = input.reason.trim();
      $set.entrySource = 'CORRECTION';
      if (input.status) $set.status = input.status;
      if (input.minutesLogged !== undefined) $set.minutesLogged = input.minutesLogged;
    }

    const updated = await stakeholderRepository.updateVolunteerAttendance(
      input.attendanceId,
      organizationId,
      { $set }
    );

    // Recalculate verified hours strictly from approved records
    await this.recalculateVolunteerVerifiedHours(organizationId, volunteerId);

    await adminService.logAudit(
      actor,
      `VOLUNTEER_ATTENDANCE_${input.decision}`,
      'VolunteerAttendance',
      input.attendanceId,
      `${input.decision} attendance (${record.attendanceDate}) for volunteer ${volunteerId}`
    );

    return updated;
  }

  async recalculateVolunteerVerifiedHours(organizationId: string, volunteerId: string) {
    const records = await stakeholderRepository.findVolunteerAttendance(organizationId, volunteerId);
    const summary = computeVerifiedHoursSummary(records);
    await stakeholderRepository.updateVolunteerProfile(volunteerId, organizationId, {
      $set: { verifiedMinutesTotal: summary.verifiedMinutes },
    });
    return summary;
  }

  // ======================== CERTIFICATES ========================

  async issueCertificate(
    volunteerId: string,
    organizationId: string,
    input: IssueVolunteerCertificateInput,
    actor: AdminActor
  ): Promise<IVolunteerCertificateDocument> {
    if (
      actor.role !== 'SUPER_ADMIN' &&
      !checkRolePermission(actor.role, 'volunteers.certificates.issue') &&
      !checkRolePermission(actor.role, 'certificates.issue')
    ) {
      throw new AuthorizationError('Missing volunteers.certificates.issue permission');
    }

    const volunteer = await stakeholderRepository.findVolunteerById(volunteerId, organizationId);
    if (!volunteer) throw new NotFoundError('Volunteer not found in this organization');

    const startDate = new Date(input.participationStartDate);
    const endDate = new Date(input.participationEndDate);
    if (endDate < startDate) {
      throw new ValidationError('Participation end date cannot precede start date');
    }

    // Derive verified hours STRICTLY from approved attendance records in range
    const attendance = await stakeholderRepository.findVolunteerAttendance(
      organizationId,
      volunteerId,
      { projectId: input.projectId, approvalStatus: 'APPROVED' }
    );

    const startStr = startDate.toISOString().slice(0, 10);
    const endStr = endDate.toISOString().slice(0, 10);
    const eligibleRecords = attendance.filter(
      (a) =>
        a.approvalStatus === 'APPROVED' &&
        (a.status === 'PRESENT' || a.status === 'HALF_DAY') &&
        a.attendanceDate >= startStr &&
        a.attendanceDate <= endStr
    );

    const verifiedMinutes = eligibleRecords.reduce(
      (sum, a) => sum + Math.max(0, Math.trunc(a.minutesLogged || 0)),
      0
    );
    const minRequired = input.minimumRequiredMinutes ?? 60;
    if (verifiedMinutes < minRequired) {
      throw new ValidationError(
        `Cannot issue certificate: volunteer has ${verifiedMinutes} verified minutes in period (minimum required: ${minRequired} minutes). Hours are derived strictly from approved attendance and cannot be fabricated.`
      );
    }

    let projectName: string | undefined;
    if (input.projectId) {
      const proj = await projectRepository.findById(input.projectId, organizationId);
      if (!proj) throw new ValidationError('Linked project not found in this organization');
      projectName = proj.name;
    }

    const org = await organizationRepository.findById(organizationId);
    const certificateNumber = generateCode('VCERT');
    const verificationCode = `VRF-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
    const verifiedHours = Math.round((verifiedMinutes / 60) * 100) / 100;

    const cert = await stakeholderRepository.createVolunteerCertificate({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      volunteerId: volunteer._id as mongoose.Types.ObjectId,
      projectId: input.projectId ? new mongoose.Types.ObjectId(input.projectId) : undefined,
      certificateNumber,
      verificationCode,
      certificateType: input.certificateType,
      title: input.title,
      volunteerNameSnapshot: volunteer.fullName,
      organizationNameSnapshot: org?.name || 'HopeHorizon Foundation',
      projectNameSnapshot: projectName,
      participationStartDate: startDate,
      participationEndDate: endDate,
      verifiedMinutes,
      verifiedHours,
      signatoryName: input.signatoryName,
      signatoryRole: input.signatoryRole,
      issueDate: new Date(),
      status: 'ISSUED',
      issuedBy: new mongoose.Types.ObjectId(actor.id),
    });

    await adminService.logAudit(
      actor,
      'VOLUNTEER_CERTIFICATE_ISSUED',
      'VolunteerCertificate',
      cert._id.toString(),
      `Issued ${cert.certificateType} certificate ${cert.certificateNumber} (${verifiedHours} verified hrs)`
    );

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
    const tpl = renderVolunteerCertificateIssuedEmail({
      volunteerName: volunteer.fullName,
      certificateNumber: cert.certificateNumber,
      certificateType: cert.certificateType,
      verifiedHours,
      verifyUrl: `${appUrl}/verify-certificate?code=${cert.certificateNumber}`,
      organizationName: org?.name,
    });
    await emailProvider.sendEmail({
      to: volunteer.email,
      subject: tpl.subject,
      htmlContent: tpl.html,
      textContent: tpl.text,
    });

    return cert;
  }

  async verifyCertificatePublic(code: string) {
    const cert = await stakeholderRepository.findCertificateByCodePublic(code);
    if (!cert) return null;
    return toPublicCertificateDTO(cert);
  }

  // ======================== VOLUNTEER DASHBOARD ANALYTICS ========================

  async getVolunteerAnalytics(organizationId: string) {
    await connectToDatabase();
    const orgObjId = new mongoose.Types.ObjectId(organizationId);
    const [
      totalVolunteers,
      activeVolunteers,
      verifiedVolunteers,
      pendingApplications,
      activeAssignments,
      hoursAgg,
    ] = await Promise.all([
      VolunteerProfile.countDocuments({ organizationId: orgObjId, isDeleted: { $ne: true } }),
      VolunteerProfile.countDocuments({
        organizationId: orgObjId,
        status: 'ACTIVE',
        isDeleted: { $ne: true },
      }),
      VolunteerProfile.countDocuments({
        organizationId: orgObjId,
        verificationStatus: 'VERIFIED',
        isDeleted: { $ne: true },
      }),
      stakeholderRepository.countVolunteerApplications(organizationId, { status: 'SUBMITTED' }),
      VolunteerAssignment.countDocuments({
        organizationId: orgObjId,
        status: { $in: ['ACCEPTED', 'ACTIVE'] },
      }),
      VolunteerAttendance.aggregate([
        {
          $match: {
            organizationId: orgObjId,
            approvalStatus: 'APPROVED',
            status: { $in: ['PRESENT', 'HALF_DAY'] },
          },
        },
        {
          $group: {
            _id: null,
            totalMinutes: { $sum: '$minutesLogged' },
            approvedCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    const totalMinutes = Math.trunc(hoursAgg[0]?.totalMinutes || 0);
    return {
      totalVolunteers,
      activeVolunteers,
      verifiedVolunteers,
      pendingApplications,
      activeAssignments,
      verifiedMinutesTotal: totalMinutes,
      verifiedHoursTotal: Math.round((totalMinutes / 60) * 100) / 100,
      approvedAttendanceSessions: Math.trunc(hoursAgg[0]?.approvedCount || 0),
    };
  }
}

export const volunteerService = new VolunteerService();
