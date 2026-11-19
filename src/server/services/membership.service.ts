import crypto from 'crypto';
import mongoose from 'mongoose';
import connectToDatabase from '@/server/database/connection';
import { stakeholderRepository } from '@/server/repositories/stakeholder.repository';
import { organizationRepository } from '@/server/repositories/organization.repository';
import { IMembershipDocument, Membership, MembershipStatus } from '@/server/database/models/Membership';
import { MembershipApplication } from '@/server/database/models/MembershipApplication';
import { MembershipRenewal } from '@/server/database/models/MembershipRenewal';
import { adminService, AdminActor } from '@/server/services/admin.service';
import { checkRolePermission } from '@/server/authorization/permissions';
import { emailProvider } from '@/integrations/email/nodemailer.provider';
import {
  renderMembershipApplicationReceivedEmail,
  renderMembershipStatusEmail,
} from '@/integrations/email/templates';
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '@/lib/error-handler';
import {
  CreateMembershipApplicationInput,
  CreateMembershipPlanInput,
  CreateMembershipRenewalInput,
  ReviewMembershipApplicationInput,
  UpdateMembershipStatusInput,
} from '@/features/membership/schemas/membership.schema';

// ======================== PURE DOMAIN HELPERS ========================

export function calculateMembershipExpiry(
  startDate: Date,
  validityDays: number,
  isLifetime: boolean,
  gracePeriodDays = 30
): { expiryDate: Date | null; graceUntilDate: Date | null } {
  if (isLifetime || validityDays <= 0) {
    return { expiryDate: null, graceUntilDate: null };
  }
  const expiryDate = new Date(startDate.getTime() + validityDays * 86400000);
  const graceUntilDate = new Date(expiryDate.getTime() + Math.max(0, gracePeriodDays) * 86400000);
  return { expiryDate, graceUntilDate };
}

export function isRenewalEligible(
  membership: Pick<IMembershipDocument, 'isLifetime' | 'status' | 'expiryDate'>,
  now: Date = new Date()
): { eligible: boolean; reason?: string } {
  if (membership.isLifetime) {
    return { eligible: false, reason: 'Lifetime memberships do not require renewal' };
  }
  if (membership.status === 'CANCELLED' || membership.status === 'SUSPENDED') {
    return {
      eligible: false,
      reason: `Cannot renew a ${membership.status} membership without reinstatement`,
    };
  }
  if (membership.status === 'EXPIRED') {
    return { eligible: true };
  }
  if (membership.status === 'ACTIVE' && membership.expiryDate) {
    const daysRemaining = (new Date(membership.expiryDate).getTime() - now.getTime()) / 86400000;
    if (daysRemaining > 90) {
      return {
        eligible: false,
        reason: `Renewal opens within 90 days of expiry (${Math.ceil(daysRemaining)} days remaining)`,
      };
    }
    return { eligible: true };
  }
  return { eligible: true };
}

function generateMembershipCode(prefix: string): string {
  const year = new Date().getUTCFullYear();
  return `${prefix}-${year}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

export class MembershipService {
  // ======================== PLANS ========================

  async listPlans(organizationId: string, onlyPublicActive = false) {
    return stakeholderRepository.findMembershipPlans(organizationId, onlyPublicActive);
  }

  async createPlan(
    organizationId: string,
    input: CreateMembershipPlanInput,
    actor: AdminActor
  ) {
    if (
      actor.role !== 'SUPER_ADMIN' &&
      !checkRolePermission(actor.role, 'members.create') &&
      !checkRolePermission(actor.role, 'members.manage')
    ) {
      throw new AuthorizationError('Missing members.create permission');
    }

    const code = input.code.toUpperCase().trim();
    const dup = await stakeholderRepository.findMembershipPlanByCode(organizationId, code);
    if (dup) {
      throw new ConflictError(`Membership plan code "${code}" already exists in this organization`);
    }

    const isLifetime = input.isLifetime || input.category === 'LIFETIME';
    const created = await stakeholderRepository.createMembershipPlan({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      name: input.name,
      code,
      category: input.category,
      description: input.description,
      feeAmountMinor: input.feeAmountMinor,
      currency: input.currency || 'INR',
      validityDays: isLifetime ? 0 : input.validityDays || 365,
      isLifetime,
      gracePeriodDays: input.gracePeriodDays ?? 30,
      renewalReminderDaysBefore: input.renewalReminderDaysBefore || [30, 7, 1],
      eligibilityCriteria: input.eligibilityCriteria,
      benefits: input.benefits || [],
      votingRights: input.votingRights ?? false,
      requiresApproval: input.requiresApproval ?? true,
      isPublicVisible: input.isPublicVisible ?? true,
      isActive: true,
      createdBy: new mongoose.Types.ObjectId(actor.id),
    });

    await adminService.logAudit(
      actor,
      'MEMBERSHIP_PLAN_CREATE',
      'MembershipPlan',
      created._id.toString(),
      `Created membership plan "${created.name}" (${created.code})`
    );

    return created;
  }

  // ======================== APPLICATIONS ========================

  async submitApplication(organizationId: string, input: CreateMembershipApplicationInput) {
    const plan = await stakeholderRepository.findMembershipPlanById(input.planId, organizationId);
    if (!plan || !plan.isActive) {
      throw new NotFoundError('Selected membership plan is not available in this organization');
    }

    const email = input.email.toLowerCase().trim();
    const existingApp = await stakeholderRepository.findActiveMembershipApplicationByEmail(
      organizationId,
      email
    );
    if (existingApp) {
      throw new ConflictError(
        `A membership application (${existingApp.applicationCode}) is already pending review for this email`
      );
    }

    const existingMember = await stakeholderRepository.findActiveMembershipByEmail(
      organizationId,
      email
    );
    if (existingMember) {
      throw new ConflictError(
        `An active membership (${existingMember.membershipNumber}) already exists for this email`
      );
    }

    const applicationCode = generateMembershipCode('MAPP');
    const feeRequired = plan.feeAmountMinor > 0;

    // Applications NEVER auto-approve; always enter SUBMITTED for governance review.
    const created = await stakeholderRepository.createMembershipApplication({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      applicationCode,
      planId: plan._id as mongoose.Types.ObjectId,
      category: plan.category,
      fullName: input.fullName,
      email,
      mobileNumber: input.mobileNumber,
      address: input.address,
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
      occupation: input.occupation,
      organizationName: input.organizationName,
      reasonForJoining: input.reasonForJoining,
      relevantExperience: input.relevantExperience,
      supportingDocumentUrls: input.supportingDocumentUrls || [],
      consentAccepted: true,
      consentVersion: input.consentVersion || '1.0',
      feeAmountMinor: plan.feeAmountMinor,
      currency: plan.currency,
      feePaymentStatus: feeRequired ? 'PENDING' : 'NOT_REQUIRED',
      paymentReference: input.paymentReference,
      status: 'SUBMITTED',
      history: [
        {
          status: 'SUBMITTED',
          actorName: input.fullName,
          notes: `Submitted application for ${plan.name} (Fee category: MEMBERSHIP_FEE)`,
          timestamp: new Date(),
        },
      ],
    });

    const org = await organizationRepository.findById(organizationId);
    const tpl = renderMembershipApplicationReceivedEmail({
      applicantName: created.fullName,
      applicationCode: created.applicationCode,
      category: plan.name,
      organizationName: org?.name,
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
    input: ReviewMembershipApplicationInput,
    actor: AdminActor
  ) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'members.approve')) {
      throw new AuthorizationError('Missing members.approve permission');
    }

    const app = await stakeholderRepository.findMembershipApplicationById(
      applicationId,
      organizationId
    );
    if (!app) throw new NotFoundError('Membership application not found in this organization');

    if (!['SUBMITTED', 'UNDER_REVIEW'].includes(app.status)) {
      throw new ValidationError(`Application has already been finalized (${app.status})`);
    }

    if (input.action === 'UNDER_REVIEW') {
      const updated = await stakeholderRepository.updateMembershipApplication(
        applicationId,
        organizationId,
        {
          $set: { status: 'UNDER_REVIEW', internalNotes: input.internalNotes },
          $push: {
            history: {
              status: 'UNDER_REVIEW',
              actorId: new mongoose.Types.ObjectId(actor.id),
              actorName: actor.name,
              notes: input.internalNotes,
              timestamp: new Date(),
            },
          },
        }
      );
      return { application: updated, membership: null };
    }

    if (input.action === 'REJECT') {
      if (!input.rejectionReason?.trim()) {
        throw new ValidationError('Rejection reason is required when rejecting a membership application');
      }
      const rejected = await stakeholderRepository.updateMembershipApplication(
        applicationId,
        organizationId,
        {
          $set: {
            status: 'REJECTED',
            rejectionReason: input.rejectionReason.trim(),
            reviewedBy: new mongoose.Types.ObjectId(actor.id),
            reviewedAt: new Date(),
          },
          $push: {
            history: {
              status: 'REJECTED',
              actorId: new mongoose.Types.ObjectId(actor.id),
              actorName: actor.name,
              notes: input.rejectionReason.trim(),
              timestamp: new Date(),
            },
          },
        }
      );

      await adminService.logAudit(
        actor,
        'MEMBERSHIP_APPLICATION_REJECTED',
        'MembershipApplication',
        applicationId,
        `Rejected membership application ${app.applicationCode}`
      );

      const org = await organizationRepository.findById(organizationId);
      const tpl = renderMembershipStatusEmail({
        memberName: app.fullName,
        status: 'REJECTED',
        reason: input.rejectionReason.trim(),
        organizationName: org?.name,
      });
      await emailProvider.sendEmail({
        to: app.email,
        subject: tpl.subject,
        htmlContent: tpl.html,
        textContent: tpl.text,
      });

      return { application: rejected, membership: null };
    }

    // APPROVE: generate unique org-scoped membershipNumber and create Membership
    const plan = await stakeholderRepository.findMembershipPlanById(
      app.planId.toString(),
      organizationId
    );
    if (!plan) throw new NotFoundError('Associated membership plan no longer exists');

    const effectivePaymentStatus = input.feePaymentStatus || app.feePaymentStatus;
    const feeCleared =
      plan.feeAmountMinor === 0 ||
      effectivePaymentStatus === 'PAID' ||
      effectivePaymentStatus === 'WAIVED' ||
      effectivePaymentStatus === 'NOT_REQUIRED';

    const startDate = new Date();
    const { expiryDate, graceUntilDate } = calculateMembershipExpiry(
      startDate,
      plan.validityDays,
      plan.isLifetime,
      plan.gracePeriodDays
    );

    const initialMemberStatus: MembershipStatus =
      input.activateImmediately && feeCleared ? 'ACTIVE' : 'APPROVED';
    const membershipNumber = generateMembershipCode('MBR');

    const membership = await stakeholderRepository.createMembership({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      membershipNumber,
      applicationId: app._id as mongoose.Types.ObjectId,
      planId: plan._id as mongoose.Types.ObjectId,
      category: plan.category,
      fullName: app.fullName,
      email: app.email,
      mobileNumber: app.mobileNumber,
      address: app.address,
      occupation: app.occupation,
      organizationName: app.organizationName,
      status: initialMemberStatus,
      startDate,
      expiryDate,
      graceUntilDate,
      isLifetime: plan.isLifetime,
      feeAmountMinor: plan.feeAmountMinor,
      currency: plan.currency,
      feePaymentStatus: effectivePaymentStatus,
      paymentReference: input.paymentReference || app.paymentReference,
      documentUrls: app.supportingDocumentUrls,
      internalNotes: input.internalNotes,
      approvedBy: new mongoose.Types.ObjectId(actor.id),
      approvedAt: new Date(),
      statusHistory: [
        {
          status: initialMemberStatus,
          actorId: new mongoose.Types.ObjectId(actor.id),
          actorName: actor.name,
          reason:
            initialMemberStatus === 'ACTIVE'
              ? 'Approved and activated'
              : 'Approved awaiting membership fee confirmation',
          timestamp: new Date(),
        },
      ],
    });

    const updatedApp = await stakeholderRepository.updateMembershipApplication(
      applicationId,
      organizationId,
      {
        $set: {
          status: 'APPROVED',
          feePaymentStatus: effectivePaymentStatus,
          paymentReference: input.paymentReference || app.paymentReference,
          membershipId: membership._id,
          reviewedBy: new mongoose.Types.ObjectId(actor.id),
          reviewedAt: new Date(),
        },
        $push: {
          history: {
            status: 'APPROVED',
            actorId: new mongoose.Types.ObjectId(actor.id),
            actorName: actor.name,
            notes: `Approved -> ${membershipNumber}`,
            timestamp: new Date(),
          },
        },
      }
    );

    await adminService.logAudit(
      actor,
      'MEMBERSHIP_APPROVED',
      'Membership',
      membership._id.toString(),
      `Approved membership ${membershipNumber} (${initialMemberStatus})`
    );

    const org = await organizationRepository.findById(organizationId);
    const tpl = renderMembershipStatusEmail({
      memberName: membership.fullName,
      membershipNumber: membership.membershipNumber,
      status: initialMemberStatus === 'ACTIVE' ? 'ACTIVE' : 'APPROVED',
      expiryDate: expiryDate ? expiryDate.toISOString().slice(0, 10) : 'Lifetime',
      organizationName: org?.name,
    });
    await emailProvider.sendEmail({
      to: membership.email,
      subject: tpl.subject,
      htmlContent: tpl.html,
      textContent: tpl.text,
    });

    return { application: updatedApp, membership };
  }

  // ======================== MEMBER MANAGEMENT & RENEWALS ========================

  async listMembers(
    organizationId: string,
    filter: { status?: MembershipStatus; category?: string; search?: string } = {},
    pagination: { page?: number; limit?: number } = {}
  ) {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(100, Math.max(1, pagination.limit || 25));
    const [members, total] = await Promise.all([
      stakeholderRepository.findMemberships(organizationId, filter, { page, limit }),
      stakeholderRepository.countMemberships(organizationId, filter),
    ]);
    return {
      members,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getMemberDetail(id: string, organizationId: string) {
    const member = await stakeholderRepository.findMembershipById(id, organizationId);
    if (!member) throw new NotFoundError('Membership record not found in this organization');
    const renewals = await stakeholderRepository.findRenewalsByMembership(organizationId, id);
    return { member, renewals };
  }

  async updateMembershipStatus(
    id: string,
    organizationId: string,
    input: UpdateMembershipStatusInput,
    actor: AdminActor
  ) {
    const member = await stakeholderRepository.findMembershipById(id, organizationId);
    if (!member) throw new NotFoundError('Membership record not found in this organization');

    if (
      (input.action === 'SUSPEND' || input.action === 'CANCEL') &&
      actor.role !== 'SUPER_ADMIN' &&
      !checkRolePermission(actor.role, 'members.suspend')
    ) {
      throw new AuthorizationError('Missing members.suspend permission');
    }

    if (input.action === 'UPDATE_NOTES') {
      return stakeholderRepository.updateMembership(id, organizationId, {
        $set: { internalNotes: input.internalNotes },
      });
    }

    const nextStatusMap: Record<
      Exclude<UpdateMembershipStatusInput['action'], 'UPDATE_NOTES'>,
      MembershipStatus
    > = {
      ACTIVATE: 'ACTIVE',
      SUSPEND: 'SUSPENDED',
      CANCEL: 'CANCELLED',
      MARK_EXPIRED: 'EXPIRED',
    };
    const nextStatus = nextStatusMap[input.action];

    if (input.action === 'ACTIVATE') {
      const paymentStatus = input.feePaymentStatus || member.feePaymentStatus;
      if (member.feeAmountMinor > 0 && !['PAID', 'WAIVED', 'NOT_REQUIRED'].includes(paymentStatus)) {
        throw new ValidationError(
          'Cannot activate paid membership until membership fee payment is confirmed (PAID or WAIVED)'
        );
      }
    }

    const updated = await stakeholderRepository.updateMembership(id, organizationId, {
      $set: {
        status: nextStatus,
        ...(input.feePaymentStatus ? { feePaymentStatus: input.feePaymentStatus } : {}),
        ...(input.paymentReference ? { paymentReference: input.paymentReference } : {}),
      },
      $push: {
        statusHistory: {
          status: nextStatus,
          actorId: new mongoose.Types.ObjectId(actor.id),
          actorName: actor.name,
          reason: input.reason,
          timestamp: new Date(),
        },
      },
    });

    await adminService.logAudit(
      actor,
      `MEMBERSHIP_${nextStatus}`,
      'Membership',
      id,
      `Updated membership ${member.membershipNumber} -> ${nextStatus}`,
      { reason: input.reason }
    );

    if (
      updated &&
      updated.communicationPreferences?.emailNotices !== false &&
      ['ACTIVE', 'EXPIRED', 'SUSPENDED', 'CANCELLED'].includes(nextStatus)
    ) {
      const org = await organizationRepository.findById(organizationId);
      const tpl = renderMembershipStatusEmail({
        memberName: updated.fullName,
        membershipNumber: updated.membershipNumber,
        status: nextStatus as 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED',
        reason: input.reason,
        expiryDate: updated.expiryDate ? updated.expiryDate.toISOString().slice(0, 10) : 'Lifetime',
        organizationName: org?.name,
      });
      await emailProvider.sendEmail({
        to: updated.email,
        subject: tpl.subject,
        htmlContent: tpl.html,
        textContent: tpl.text,
      });
    }

    return updated;
  }

  async processRenewal(
    membershipId: string,
    organizationId: string,
    input: CreateMembershipRenewalInput,
    actor: AdminActor
  ) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'members.renew')) {
      throw new AuthorizationError('Missing members.renew permission');
    }

    const member = await stakeholderRepository.findMembershipById(membershipId, organizationId);
    if (!member) throw new NotFoundError('Membership record not found in this organization');

    const eligibility = isRenewalEligible(member);
    if (!eligibility.eligible) {
      throw new ValidationError(eligibility.reason || 'Membership is not eligible for renewal');
    }

    const targetPlanId =
      input.planId ||
      (typeof member.planId === 'object' && '_id' in member.planId
        ? (member.planId as { _id: mongoose.Types.ObjectId })._id.toString()
        : (member.planId as mongoose.Types.ObjectId).toString());

    const plan = await stakeholderRepository.findMembershipPlanById(targetPlanId, organizationId);
    if (!plan || !plan.isActive) {
      throw new NotFoundError('Selected renewal plan not found or inactive in this organization');
    }

    const feePaidOrFree =
      plan.feeAmountMinor === 0 ||
      input.paymentStatus === 'PAID' ||
      input.paymentStatus === 'WAIVED' ||
      input.paymentStatus === 'NOT_REQUIRED';

    if (input.approveAndComplete && !feePaidOrFree) {
      throw new ValidationError(
        'Paid membership renewal cannot be completed while payment status is PENDING'
      );
    }

    const now = new Date();
    const baseStart =
      member.expiryDate && new Date(member.expiryDate) > now ? new Date(member.expiryDate) : now;
    const { expiryDate: newExpiryDate, graceUntilDate: newGrace } = calculateMembershipExpiry(
      baseStart,
      plan.validityDays,
      plan.isLifetime,
      plan.gracePeriodDays
    );

    const status = input.approveAndComplete ? 'COMPLETED' : 'REQUESTED';
    const renewal = await stakeholderRepository.createMembershipRenewal({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      membershipId: member._id as mongoose.Types.ObjectId,
      planId: plan._id as mongoose.Types.ObjectId,
      previousExpiryDate: member.expiryDate,
      newStartDate: baseStart,
      newExpiryDate,
      feeAmountMinor: plan.feeAmountMinor,
      currency: plan.currency,
      paymentStatus: plan.feeAmountMinor === 0 ? 'NOT_REQUIRED' : input.paymentStatus,
      paymentProvider: input.paymentProvider,
      paymentReference: input.paymentReference,
      status,
      notes: input.notes,
      requestedBy: new mongoose.Types.ObjectId(actor.id),
      ...(input.approveAndComplete
        ? { approvedBy: new mongoose.Types.ObjectId(actor.id), approvedAt: now }
        : {}),
    });

    if (input.approveAndComplete) {
      await stakeholderRepository.updateMembership(membershipId, organizationId, {
        $set: {
          planId: plan._id,
          category: plan.category,
          status: 'ACTIVE',
          expiryDate: newExpiryDate,
          graceUntilDate: newGrace,
          isLifetime: plan.isLifetime,
          feePaymentStatus: plan.feeAmountMinor === 0 ? 'NOT_REQUIRED' : input.paymentStatus,
          paymentReference: input.paymentReference || member.paymentReference,
          remindersSentForPeriod: [],
        },
        $push: {
          statusHistory: {
            status: 'ACTIVE',
            actorId: new mongoose.Types.ObjectId(actor.id),
            actorName: actor.name,
            reason: `Renewed under plan ${plan.code}`,
            timestamp: now,
          },
        },
      });
    }

    await adminService.logAudit(
      actor,
      input.approveAndComplete ? 'MEMBERSHIP_RENEWAL_COMPLETED' : 'MEMBERSHIP_RENEWAL_REQUESTED',
      'MembershipRenewal',
      renewal._id.toString(),
      `Membership renewal (${status}) for ${member.membershipNumber}`
    );

    return renewal;
  }

  // ======================== MEMBERSHIP ANALYTICS ========================

  async getMembershipAnalytics(organizationId: string) {
    await connectToDatabase();
    const orgObjId = new mongoose.Types.ObjectId(organizationId);
    const soon = new Date(Date.now() + 30 * 86400000);

    const [
      totalMembers,
      activeMembers,
      expiredMembers,
      suspendedMembers,
      expiringSoon,
      pendingApplications,
      completedRenewals,
      categoryBreakdown,
    ] = await Promise.all([
      Membership.countDocuments({ organizationId: orgObjId }),
      Membership.countDocuments({ organizationId: orgObjId, status: 'ACTIVE' }),
      Membership.countDocuments({ organizationId: orgObjId, status: 'EXPIRED' }),
      Membership.countDocuments({ organizationId: orgObjId, status: 'SUSPENDED' }),
      Membership.countDocuments({
        organizationId: orgObjId,
        status: 'ACTIVE',
        isLifetime: false,
        expiryDate: { $gte: new Date(), $lte: soon },
      }),
      MembershipApplication.countDocuments({
        organizationId: orgObjId,
        status: { $in: ['SUBMITTED', 'UNDER_REVIEW'] },
      }),
      MembershipRenewal.countDocuments({ organizationId: orgObjId, status: 'COMPLETED' }),
      Membership.aggregate([
        { $match: { organizationId: orgObjId } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    return {
      totalMembers,
      activeMembers,
      expiredMembers,
      suspendedMembers,
      expiringSoon,
      pendingApplications,
      completedRenewals,
      categoryDistribution: categoryBreakdown.map((c) => ({
        category: String(c._id),
        count: Math.trunc(c.count || 0),
      })),
    };
  }
}

export const membershipService = new MembershipService();
