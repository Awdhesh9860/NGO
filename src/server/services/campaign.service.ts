import mongoose from 'mongoose';
import {
  fundraisingRepository,
  CampaignFilterOptions,
} from '@/server/repositories/fundraising.repository';
import { programRepository } from '@/server/repositories/program.repository';
import { projectRepository } from '@/server/repositories/project.repository';
import { userRepository } from '@/server/repositories/user.repository';
import { organizationRepository } from '@/server/repositories/organization.repository';
import { ICampaignDocument, CampaignStatus } from '@/server/database/models/Campaign';
import { Donation } from '@/server/database/models/Donation';
import { adminService, AdminActor } from '@/server/services/admin.service';
import { checkRolePermission } from '@/server/authorization/permissions';
import { emailProvider } from '@/integrations/email/nodemailer.provider';
import {
  renderCampaignApprovedEmail,
  renderCampaignPublishedEmail,
} from '@/integrations/email/templates';
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '@/lib/error-handler';
import { calculateMinorPercentage } from '@/lib/money';
import {
  CampaignApprovalActionInput,
  CreateCampaignInput,
  CreateCampaignUpdateInput,
  UpdateCampaignInput,
} from '@/features/campaigns/schemas/campaign.schema';
import connectToDatabase from '@/server/database/connection';

export const CAMPAIGN_STATUS_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  DRAFT: ['PENDING_APPROVAL', 'CANCELLED', 'ARCHIVED'],
  PENDING_APPROVAL: ['APPROVED', 'DRAFT', 'CANCELLED'],
  APPROVED: ['ACTIVE', 'PAUSED', 'CANCELLED', 'ARCHIVED'],
  ACTIVE: ['PAUSED', 'GOAL_REACHED', 'COMPLETED', 'CANCELLED', 'ARCHIVED'],
  PAUSED: ['ACTIVE', 'COMPLETED', 'CANCELLED', 'ARCHIVED'],
  GOAL_REACHED: ['ACTIVE', 'COMPLETED', 'ARCHIVED'],
  COMPLETED: ['ARCHIVED'],
  CANCELLED: ['DRAFT', 'ARCHIVED'],
  ARCHIVED: [],
};

export const PUBLIC_ELIGIBLE_CAMPAIGN_STATUSES: CampaignStatus[] = [
  'APPROVED',
  'ACTIVE',
  'GOAL_REACHED',
  'COMPLETED',
];

export function assertValidCampaignTransition(
  current: CampaignStatus,
  next: CampaignStatus,
  actor: AdminActor
): void {
  if (current === next) return;
  const allowed = CAMPAIGN_STATUS_TRANSITIONS[current] || [];
  if (!allowed.includes(next)) {
    throw new ValidationError(
      `Invalid campaign status transition from "${current}" to "${next}". Allowed: ${
        allowed.length > 0 ? allowed.join(', ') : 'none'
      }`
    );
  }

  if (
    next === 'APPROVED' &&
    actor.role !== 'SUPER_ADMIN' &&
    !checkRolePermission(actor.role, 'campaigns.approve')
  ) {
    throw new AuthorizationError('Missing campaigns.approve permission');
  }

  if (
    next === 'ARCHIVED' &&
    actor.role !== 'SUPER_ADMIN' &&
    !checkRolePermission(actor.role, 'campaigns.archive')
  ) {
    throw new AuthorizationError('Missing campaigns.archive permission');
  }
}

/**
 * Public-safe Campaign DTO: strips internal manager emails, approval notes, and unpublished data.
 */
export function toPublicCampaignDTO(
  campaign: ICampaignDocument,
  stats?: { netRaisedMinor: number; donorCount: number; donationCount: number }
) {
  const raisedAmountMinor = stats?.netRaisedMinor ?? 0;
  const targetAmountMinor = Math.trunc(campaign.targetAmountMinor || 0);
  const progressPercentage = Math.min(100, calculateMinorPercentage(raisedAmountMinor, targetAmountMinor));

  return {
    id: campaign._id.toString(),
    title: campaign.title,
    slug: campaign.slug,
    code: campaign.code,
    shortSummary: campaign.shortSummary,
    story: campaign.story,
    category: campaign.category,
    coverImage: campaign.coverImage,
    gallery: campaign.gallery || [],
    videoUrl: campaign.videoUrl,
    targetAmountMinor,
    raisedAmountMinor,
    progressPercentage,
    donorCount: stats?.donorCount ?? 0,
    donationCount: stats?.donationCount ?? 0,
    minimumDonationMinor: campaign.minimumDonationMinor,
    suggestedAmountsMinor: campaign.suggestedAmountsMinor || [],
    currency: campaign.currency,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    status: campaign.status,
    isFeatured: campaign.isFeatured,
    seoTitle: campaign.seoTitle,
    seoDescription: campaign.seoDescription,
  };
}

export class CampaignService {
  async listCampaigns(
    organizationId: string,
    filter: CampaignFilterOptions = {},
    pagination: { page?: number; limit?: number } = {}
  ) {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(100, Math.max(1, pagination.limit || 20));
    const [campaigns, total] = await Promise.all([
      fundraisingRepository.findCampaigns(organizationId, filter, { page, limit }),
      fundraisingRepository.countCampaigns(organizationId, filter),
    ]);

    const totalsMap = await fundraisingRepository.getCampaignVerifiedTotals(
      organizationId,
      campaigns.map((c) => c._id.toString())
    );

    return {
      campaigns: campaigns.map((c) => {
        const totals = totalsMap.get(c._id.toString()) || {
          grossMinor: 0,
          refundedMinor: 0,
          netRaisedMinor: 0,
          donorCount: 0,
          donationCount: 0,
        };
        return {
          campaign: c,
          raisedAmountMinor: totals.netRaisedMinor,
          grossAmountMinor: totals.grossMinor,
          refundedAmountMinor: totals.refundedMinor,
          donorCount: totals.donorCount,
          donationCount: totals.donationCount,
          progressPercentage: Math.min(
            100,
            calculateMinorPercentage(totals.netRaisedMinor, c.targetAmountMinor)
          ),
        };
      }),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getCampaignDetail(id: string, organizationId: string) {
    const campaign = await fundraisingRepository.findCampaignById(id, organizationId);
    if (!campaign) {
      throw new NotFoundError('Campaign not found in this organization');
    }

    const [totalsMap, updates, recentDonations] = await Promise.all([
      fundraisingRepository.getCampaignVerifiedTotals(organizationId, [id]),
      fundraisingRepository.findCampaignUpdates(organizationId, id, false),
      fundraisingRepository.findDonations(organizationId, { campaignId: id }, { page: 1, limit: 25 }),
    ]);

    const totals = totalsMap.get(id) || {
      grossMinor: 0,
      refundedMinor: 0,
      netRaisedMinor: 0,
      donorCount: 0,
      donationCount: 0,
    };

    return {
      campaign,
      metrics: {
        ...totals,
        targetAmountMinor: campaign.targetAmountMinor,
        progressPercentage: Math.min(
          100,
          calculateMinorPercentage(totals.netRaisedMinor, campaign.targetAmountMinor)
        ),
      },
      updates,
      recentDonations,
    };
  }

  async createCampaign(
    organizationId: string,
    input: CreateCampaignInput,
    actor: AdminActor
  ): Promise<ICampaignDocument> {
    const slug = input.slug.toLowerCase().trim();
    const code = input.code.toUpperCase().trim();

    const existing = await fundraisingRepository.findCampaignBySlugOrCode(organizationId, slug, code);
    if (existing) {
      throw new ConflictError(
        `A campaign with slug "${slug}" or code "${code}" already exists in this organization`
      );
    }

    if (input.startDate && input.endDate && new Date(input.endDate) < new Date(input.startDate)) {
      throw new ValidationError('Campaign end date cannot be earlier than start date');
    }

    let programId: mongoose.Types.ObjectId | undefined;
    if (input.programId) {
      const prog = await programRepository.findById(input.programId, organizationId);
      if (!prog) throw new ValidationError('Linked program not found in this organization');
      programId = new mongoose.Types.ObjectId(input.programId);
    }

    let projectId: mongoose.Types.ObjectId | undefined;
    if (input.projectId) {
      const proj = await projectRepository.findById(input.projectId, organizationId);
      if (!proj) throw new ValidationError('Linked project not found in this organization');
      projectId = new mongoose.Types.ObjectId(input.projectId);
    }

    let campaignManagerId: mongoose.Types.ObjectId | undefined;
    if (input.campaignManagerId) {
      const mgr = await userRepository.findById(input.campaignManagerId);
      if (!mgr || mgr.organizationId.toString() !== organizationId || mgr.status !== 'active') {
        throw new ValidationError('Assigned campaign manager must be an active user in this organization');
      }
      campaignManagerId = new mongoose.Types.ObjectId(input.campaignManagerId);
    }

    // New campaigns ALWAYS start as DRAFT and not publicly visible until approved & published.
    const created = await fundraisingRepository.createCampaign({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      title: input.title,
      slug,
      code,
      shortSummary: input.shortSummary,
      story: input.story,
      category: input.category,
      coverImage: input.coverImage || undefined,
      gallery: input.gallery || [],
      videoUrl: input.videoUrl || undefined,
      targetAmountMinor: input.targetAmountMinor,
      minimumDonationMinor: input.minimumDonationMinor ?? 10000,
      suggestedAmountsMinor: input.suggestedAmountsMinor ?? [50000, 150000, 300000, 500000],
      currency: input.currency || 'INR',
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      programId,
      projectId,
      campaignManagerId,
      teamMemberIds: (input.teamMemberIds || [])
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id)),
      status: 'DRAFT',
      isPublicVisible: false,
      isFeatured: input.isFeatured ?? false,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      createdBy: new mongoose.Types.ObjectId(actor.id),
    });

    await adminService.logAudit(
      actor,
      'CAMPAIGN_CREATE',
      'Campaign',
      created._id.toString(),
      `Created fundraising campaign "${created.title}" (${created.code})`,
      { code: created.code, targetAmountMinor: created.targetAmountMinor, currency: created.currency }
    );

    return created;
  }

  async updateCampaign(
    id: string,
    organizationId: string,
    input: UpdateCampaignInput,
    actor: AdminActor
  ): Promise<ICampaignDocument> {
    const existing = await fundraisingRepository.findCampaignById(id, organizationId);
    if (!existing) throw new NotFoundError('Campaign not found in this organization');

    if (input.status && input.status !== existing.status) {
      assertValidCampaignTransition(existing.status, input.status, actor);
    }

    const effectiveStatus = input.status || existing.status;

    if (input.isPublicVisible === true) {
      if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'campaigns.publish')) {
        throw new AuthorizationError('Missing campaigns.publish permission to publish campaigns');
      }
      if (!PUBLIC_ELIGIBLE_CAMPAIGN_STATUSES.includes(effectiveStatus)) {
        throw new ValidationError(
          `Only APPROVED, ACTIVE, GOAL_REACHED, or COMPLETED campaigns can be publicly published (current: ${effectiveStatus})`
        );
      }
    }

    if (input.slug || input.code) {
      const dup = await fundraisingRepository.findCampaignBySlugOrCode(
        organizationId,
        input.slug?.toLowerCase().trim(),
        input.code?.toUpperCase().trim()
      );
      if (dup && dup._id.toString() !== id) {
        throw new ConflictError('Another campaign already uses this slug or code in this organization');
      }
    }

    const $set: Record<string, unknown> = {
      updatedBy: new mongoose.Types.ObjectId(actor.id),
    };

    const copyFields = [
      'title',
      'shortSummary',
      'story',
      'category',
      'gallery',
      'targetAmountMinor',
      'minimumDonationMinor',
      'suggestedAmountsMinor',
      'currency',
      'status',
      'isPublicVisible',
      'isFeatured',
      'seoTitle',
      'seoDescription',
    ] as const;

    for (const key of copyFields) {
      if (input[key] !== undefined) $set[key] = input[key];
    }

    if (input.slug) $set.slug = input.slug.toLowerCase().trim();
    if (input.code) $set.code = input.code.toUpperCase().trim();
    if (input.coverImage !== undefined) $set.coverImage = input.coverImage || undefined;
    if (input.videoUrl !== undefined) $set.videoUrl = input.videoUrl || undefined;
    if (input.startDate !== undefined) $set.startDate = input.startDate ? new Date(input.startDate) : undefined;
    if (input.endDate !== undefined) $set.endDate = input.endDate ? new Date(input.endDate) : undefined;

    // Auto-unpublish when cancelled or archived
    if (effectiveStatus === 'CANCELLED' || effectiveStatus === 'ARCHIVED' || effectiveStatus === 'DRAFT') {
      $set.isPublicVisible = false;
    }

    const historyEntries: unknown[] = [];
    if (input.status && input.status !== existing.status) {
      historyEntries.push({
        action: 'STATUS_CHANGED',
        actorId: new mongoose.Types.ObjectId(actor.id),
        actorName: actor.name,
        actorRole: actor.role,
        comments: `${existing.status} -> ${input.status}`,
        timestamp: new Date(),
      });
    }
    if (input.isPublicVisible !== undefined && input.isPublicVisible !== existing.isPublicVisible) {
      historyEntries.push({
        action: input.isPublicVisible ? 'PUBLISHED' : 'UNPUBLISHED',
        actorId: new mongoose.Types.ObjectId(actor.id),
        actorName: actor.name,
        actorRole: actor.role,
        timestamp: new Date(),
      });
    }

    const updatePayload: Record<string, unknown> = { $set };
    if (historyEntries.length > 0) {
      updatePayload.$push = { approvalHistory: { $each: historyEntries } };
    }

    const updated = await fundraisingRepository.updateCampaign(id, organizationId, updatePayload);
    if (!updated) throw new NotFoundError('Campaign not found');

    await adminService.logAudit(
      actor,
      input.isPublicVisible && !existing.isPublicVisible ? 'CAMPAIGN_PUBLISHED' : 'CAMPAIGN_UPDATE',
      'Campaign',
      id,
      `Updated campaign "${updated.title}"`,
      { previousStatus: existing.status, newStatus: updated.status, isPublicVisible: updated.isPublicVisible }
    );

    if (input.isPublicVisible === true && !existing.isPublicVisible) {
      const org = await organizationRepository.findById(organizationId);
      if (org?.notificationSettings?.emailNotifications !== false) {
        const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
        const tpl = renderCampaignPublishedEmail({
          recipientName: actor.name,
          campaignTitle: updated.title,
          targetAmountMinor: updated.targetAmountMinor,
          currency: updated.currency,
          publicUrl: `${appUrl}/campaigns/${updated.slug}`,
        });
        await emailProvider.sendEmail({
          to: actor.email,
          subject: tpl.subject,
          htmlContent: tpl.html,
          textContent: tpl.text,
        });
      }
    }

    return updated;
  }

  async handleApprovalAction(
    id: string,
    organizationId: string,
    input: CampaignApprovalActionInput,
    actor: AdminActor
  ): Promise<ICampaignDocument> {
    const campaign = await fundraisingRepository.findCampaignById(id, organizationId);
    if (!campaign) throw new NotFoundError('Campaign not found in this organization');

    if (input.action === 'SUBMIT') {
      if (!['DRAFT', 'CANCELLED'].includes(campaign.status)) {
        throw new ValidationError(
          `Only DRAFT or CANCELLED campaigns can be submitted for approval (current: ${campaign.status})`
        );
      }

      const updated = await fundraisingRepository.updateCampaign(id, organizationId, {
        $set: {
          status: 'PENDING_APPROVAL',
          submittedBy: new mongoose.Types.ObjectId(actor.id),
          submittedAt: new Date(),
          rejectionReason: undefined,
          updatedBy: new mongoose.Types.ObjectId(actor.id),
        },
        $push: {
          approvalHistory: {
            action: 'SUBMITTED',
            actorId: new mongoose.Types.ObjectId(actor.id),
            actorName: actor.name,
            actorRole: actor.role,
            comments: input.comments,
            timestamp: new Date(),
          },
        },
      });
      if (!updated) throw new NotFoundError('Campaign not found');

      await adminService.logAudit(
        actor,
        'CAMPAIGN_SUBMITTED_FOR_APPROVAL',
        'Campaign',
        id,
        `Submitted campaign "${campaign.title}" for approval`
      );
      return updated;
    }

    // APPROVE or REJECT strictly requires campaigns.approve
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'campaigns.approve')) {
      throw new AuthorizationError('Missing campaigns.approve permission');
    }

    if (campaign.status !== 'PENDING_APPROVAL') {
      throw new ValidationError(
        `Campaign must be in PENDING_APPROVAL state to approve or reject (current: ${campaign.status})`
      );
    }

    const submitterId = campaign.submittedBy?.toString() || campaign.createdBy.toString();
    if (submitterId === actor.id) {
      throw new AuthorizationError('Campaign submitters cannot approve or reject their own submission');
    }

    if (input.action === 'REJECT') {
      if (!input.rejectionReason?.trim()) {
        throw new ValidationError('Rejection reason is required when rejecting a campaign');
      }
      const rejected = await fundraisingRepository.updateCampaign(id, organizationId, {
        $set: {
          status: 'DRAFT',
          isPublicVisible: false,
          rejectionReason: input.rejectionReason.trim(),
          updatedBy: new mongoose.Types.ObjectId(actor.id),
        },
        $push: {
          approvalHistory: {
            action: 'REJECTED',
            actorId: new mongoose.Types.ObjectId(actor.id),
            actorName: actor.name,
            actorRole: actor.role,
            comments: input.rejectionReason.trim(),
            timestamp: new Date(),
          },
        },
      });
      if (!rejected) throw new NotFoundError('Campaign not found');

      await adminService.logAudit(
        actor,
        'CAMPAIGN_REJECTED',
        'Campaign',
        id,
        `Rejected campaign "${campaign.title}"`,
        { reason: input.rejectionReason.trim() }
      );
      return rejected;
    }

    // APPROVE
    const approved = await fundraisingRepository.updateCampaign(id, organizationId, {
      $set: {
        status: 'APPROVED',
        approvedBy: new mongoose.Types.ObjectId(actor.id),
        approvedAt: new Date(),
        rejectionReason: undefined,
        updatedBy: new mongoose.Types.ObjectId(actor.id),
      },
      $push: {
        approvalHistory: {
          action: 'APPROVED',
          actorId: new mongoose.Types.ObjectId(actor.id),
          actorName: actor.name,
          actorRole: actor.role,
          comments: input.comments,
          timestamp: new Date(),
        },
      },
    });
    if (!approved) throw new NotFoundError('Campaign not found');

    await adminService.logAudit(
      actor,
      'CAMPAIGN_APPROVED',
      'Campaign',
      id,
      `Approved campaign "${campaign.title}"`
    );

    const submitter = await userRepository.findById(submitterId);
    if (submitter) {
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
      const tpl = renderCampaignApprovedEmail({
        recipientName: submitter.name,
        campaignTitle: approved.title,
        campaignCode: approved.code,
        approvedBy: actor.name,
        campaignUrl: `${appUrl}/dashboard/admin/campaigns/${id}`,
      });
      await emailProvider.sendEmail({
        to: submitter.email,
        subject: tpl.subject,
        htmlContent: tpl.html,
        textContent: tpl.text,
      });
    }

    return approved;
  }

  async addCampaignUpdate(
    campaignId: string,
    organizationId: string,
    input: CreateCampaignUpdateInput,
    actor: AdminActor
  ) {
    const campaign = await fundraisingRepository.findCampaignById(campaignId, organizationId);
    if (!campaign) throw new NotFoundError('Campaign not found in this organization');

    const created = await fundraisingRepository.createCampaignUpdate({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      campaignId: new mongoose.Types.ObjectId(campaignId),
      title: input.title,
      content: input.content,
      imageUrl: input.imageUrl || undefined,
      isPublicVisible: input.isPublicVisible ?? true,
      authorId: new mongoose.Types.ObjectId(actor.id),
      authorName: actor.name,
    });

    await adminService.logAudit(
      actor,
      'CAMPAIGN_UPDATE_POSTED',
      'Campaign',
      campaignId,
      `Posted update "${input.title}" on campaign "${campaign.title}"`
    );

    return created;
  }

  async listCampaignUpdates(campaignId: string, organizationId: string) {
    const campaign = await fundraisingRepository.findCampaignById(campaignId, organizationId);
    if (!campaign) throw new NotFoundError('Campaign not found in this organization');
    return fundraisingRepository.findCampaignUpdates(organizationId, campaignId, false);
  }

  async archiveCampaign(id: string, organizationId: string, actor: AdminActor) {
    return this.updateCampaign(id, organizationId, { status: 'ARCHIVED', isPublicVisible: false }, actor);
  }

  // ======================== PUBLIC WEBSITE INTEGRATION ========================

  async listPublicCampaigns(
    organizationId?: string,
    filter: { category?: string; status?: string; search?: string } = {}
  ) {
    const campaigns = await fundraisingRepository.findPublicCampaigns(organizationId, filter);
    if (campaigns.length === 0) return [];

    // Group campaigns by orgId to fetch tenant-isolated verified totals
    const byOrg = new Map<string, string[]>();
    for (const c of campaigns) {
      const oid = c.organizationId.toString();
      const list = byOrg.get(oid) || [];
      list.push(c._id.toString());
      byOrg.set(oid, list);
    }

    const totalsLookup = new Map<
      string,
      { netRaisedMinor: number; donorCount: number; donationCount: number }
    >();
    for (const [oid, ids] of byOrg.entries()) {
      const map = await fundraisingRepository.getCampaignVerifiedTotals(oid, ids);
      for (const [cid, stats] of map.entries()) {
        totalsLookup.set(cid, stats);
      }
    }

    return campaigns.map((c) => toPublicCampaignDTO(c, totalsLookup.get(c._id.toString())));
  }

  async getPublicCampaignBySlug(slugOrId: string, organizationId?: string) {
    const campaign = await fundraisingRepository.findPublicCampaignBySlugOrId(slugOrId, organizationId);
    if (!campaign) return null;

    const orgId = campaign.organizationId.toString();
    const cid = campaign._id.toString();
    await connectToDatabase();

    const [totalsMap, publicUpdates, recentVerifiedDonations] = await Promise.all([
      fundraisingRepository.getCampaignVerifiedTotals(orgId, [cid]),
      fundraisingRepository.findCampaignUpdates(orgId, cid, true),
      Donation.find({
        organizationId: campaign.organizationId,
        campaignId: campaign._id,
        status: { $in: ['SUCCESSFUL', 'PARTIALLY_REFUNDED'] },
      })
        .select('amountMinor refundedAmountMinor currency isAnonymous donorSnapshot.name createdAt')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    return {
      campaign: toPublicCampaignDTO(campaign, totalsMap.get(cid)),
      updates: publicUpdates.map((u) => ({
        id: u._id.toString(),
        title: u.title,
        content: u.content,
        imageUrl: u.imageUrl,
        createdAt: u.createdAt,
      })),
      recentSupporters: recentVerifiedDonations.map((d) => ({
        displayName: d.isAnonymous ? 'Anonymous Supporter' : d.donorSnapshot?.name || 'Supporter',
        amountMinor: Math.max(0, Math.trunc(d.amountMinor) - Math.trunc(d.refundedAmountMinor || 0)),
        currency: d.currency,
        donatedAt: d.createdAt,
      })),
    };
  }
}

export const campaignService = new CampaignService();
