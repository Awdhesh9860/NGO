import mongoose from 'mongoose';
import connectToDatabase from '@/server/database/connection';
import {
  Campaign,
  ICampaignDocument,
  CampaignStatus,
  CampaignUpdate,
  ICampaignUpdateDocument,
  Donor,
  IDonorDocument,
  DonorType,
  DonorStatus,
  Donation,
  IDonationDocument,
  DonationStatus,
  PaymentProviderType,
  PaymentTransaction,
  IPaymentTransactionDocument,
  PaymentAttempt,
  IPaymentAttemptDocument,
  PaymentWebhookEvent,
  IPaymentWebhookEventDocument,
  WebhookProvider,
  RecurringDonation,
  IRecurringDonationDocument,
  RecurringDonationStatus,
  DonationReceipt,
  IDonationReceiptDocument,
  Refund,
  IRefundDocument,
  RefundStatus,
} from '@/server/database/models';

export interface CampaignFilterOptions {
  status?: CampaignStatus;
  category?: string;
  programId?: string;
  projectId?: string;
  search?: string;
  isPublicVisible?: boolean;
  includeArchived?: boolean;
}

export interface DonorFilterOptions {
  donorType?: DonorType;
  status?: DonorStatus;
  search?: string;
  hasActiveRecurring?: boolean;
}

export interface DonationFilterOptions {
  status?: DonationStatus;
  paymentProvider?: PaymentProviderType;
  campaignId?: string;
  donorId?: string;
  search?: string;
  fromDate?: Date;
  toDate?: Date;
}

export class FundraisingRepository {
  // ======================== CAMPAIGNS ========================

  async findCampaigns(
    organizationId: string,
    filter: CampaignFilterOptions = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<ICampaignDocument[]> {
    await connectToDatabase();
    const query = this.buildCampaignQuery(organizationId, filter);
    return Campaign.find(query)
      .populate('programId', 'title slug code')
      .populate('projectId', 'name slug code')
      .populate('campaignManagerId', 'name email role')
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit);
  }

  async countCampaigns(organizationId: string, filter: CampaignFilterOptions = {}): Promise<number> {
    await connectToDatabase();
    return Campaign.countDocuments(this.buildCampaignQuery(organizationId, filter));
  }

  private buildCampaignQuery(organizationId: string, filter: CampaignFilterOptions) {
    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
      isDeleted: { $ne: true },
    };
    if (filter.status) {
      query.status = filter.status;
    } else if (!filter.includeArchived) {
      query.status = { $ne: 'ARCHIVED' };
    }
    if (filter.category) query.category = filter.category;
    if (filter.programId && mongoose.Types.ObjectId.isValid(filter.programId)) {
      query.programId = new mongoose.Types.ObjectId(filter.programId);
    }
    if (filter.projectId && mongoose.Types.ObjectId.isValid(filter.projectId)) {
      query.projectId = new mongoose.Types.ObjectId(filter.projectId);
    }
    if (typeof filter.isPublicVisible === 'boolean') {
      query.isPublicVisible = filter.isPublicVisible;
    }
    if (filter.search) {
      const rx = new RegExp(filter.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ title: rx }, { code: rx }, { shortSummary: rx }, { category: rx }];
    }
    return query;
  }

  async findCampaignById(id: string, organizationId: string): Promise<ICampaignDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return Campaign.findOne({
      _id: new mongoose.Types.ObjectId(id),
      organizationId: new mongoose.Types.ObjectId(organizationId),
      isDeleted: { $ne: true },
    })
      .populate('programId', 'title slug code')
      .populate('projectId', 'name slug code')
      .populate('campaignManagerId', 'name email role');
  }

  async findCampaignBySlugOrCode(
    organizationId: string,
    slug?: string,
    code?: string
  ): Promise<ICampaignDocument | null> {
    await connectToDatabase();
    const orClauses: Record<string, unknown>[] = [];
    if (slug) orClauses.push({ slug: slug.toLowerCase().trim() });
    if (code) orClauses.push({ code: code.toUpperCase().trim() });
    if (orClauses.length === 0) return null;
    return Campaign.findOne({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      isDeleted: { $ne: true },
      $or: orClauses,
    });
  }

  async createCampaign(data: Partial<ICampaignDocument>): Promise<ICampaignDocument> {
    await connectToDatabase();
    return Campaign.create(data);
  }

  async updateCampaign(
    id: string,
    organizationId: string,
    update: Record<string, unknown>
  ): Promise<ICampaignDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return Campaign.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        organizationId: new mongoose.Types.ObjectId(organizationId),
        isDeleted: { $ne: true },
      },
      update,
      { new: true }
    );
  }

  async findPublicCampaigns(
    organizationId?: string,
    filter: { category?: string; status?: string; search?: string } = {}
  ): Promise<ICampaignDocument[]> {
    await connectToDatabase();
    const query: Record<string, unknown> = {
      isPublicVisible: true,
      isDeleted: { $ne: true },
      status: { $in: ['APPROVED', 'ACTIVE', 'GOAL_REACHED', 'COMPLETED'] },
    };
    if (organizationId && mongoose.Types.ObjectId.isValid(organizationId)) {
      query.organizationId = new mongoose.Types.ObjectId(organizationId);
    }
    if (filter.category) query.category = filter.category;
    if (
      filter.status &&
      ['APPROVED', 'ACTIVE', 'GOAL_REACHED', 'COMPLETED'].includes(filter.status)
    ) {
      query.status = filter.status;
    }
    if (filter.search) {
      const rx = new RegExp(filter.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ title: rx }, { shortSummary: rx }, { category: rx }];
    }
    return Campaign.find(query).sort({ isFeatured: -1, createdAt: -1 }).limit(100);
  }

  async findPublicCampaignBySlugOrId(
    slugOrId: string,
    organizationId?: string
  ): Promise<ICampaignDocument | null> {
    await connectToDatabase();
    const or: Record<string, unknown>[] = [{ slug: slugOrId.toLowerCase().trim() }];
    if (mongoose.Types.ObjectId.isValid(slugOrId)) {
      or.push({ _id: new mongoose.Types.ObjectId(slugOrId) });
    }
    const query: Record<string, unknown> = {
      $or: or,
      isPublicVisible: true,
      isDeleted: { $ne: true },
      status: { $in: ['APPROVED', 'ACTIVE', 'GOAL_REACHED', 'COMPLETED'] },
    };
    if (organizationId && mongoose.Types.ObjectId.isValid(organizationId)) {
      query.organizationId = new mongoose.Types.ObjectId(organizationId);
    }
    return Campaign.findOne(query)
      .populate('programId', 'title slug')
      .populate('projectId', 'name slug');
  }

  async createCampaignUpdate(data: Partial<ICampaignUpdateDocument>): Promise<ICampaignUpdateDocument> {
    await connectToDatabase();
    return CampaignUpdate.create(data);
  }

  async findCampaignUpdates(
    organizationId: string,
    campaignId: string,
    publicOnly = false
  ): Promise<ICampaignUpdateDocument[]> {
    if (!mongoose.Types.ObjectId.isValid(campaignId)) return [];
    await connectToDatabase();
    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
      campaignId: new mongoose.Types.ObjectId(campaignId),
    };
    if (publicOnly) query.isPublicVisible = true;
    return CampaignUpdate.find(query).sort({ createdAt: -1 }).limit(50);
  }

  /**
   * Computes real verified integer minor-unit fundraising totals for one or more campaigns.
   * Strictly excludes INITIATED, PENDING, FAILED, CANCELLED, and fully REFUNDED donations.
   */
  async getCampaignVerifiedTotals(
    organizationId: string,
    campaignIds?: string[]
  ): Promise<Map<string, { grossMinor: number; refundedMinor: number; netRaisedMinor: number; donorCount: number; donationCount: number }>> {
    await connectToDatabase();
    const match: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
      status: { $in: ['SUCCESSFUL', 'PARTIALLY_REFUNDED'] },
      campaignId: { $exists: true, $ne: null },
    };
    if (campaignIds && campaignIds.length > 0) {
      match.campaignId = {
        $in: campaignIds
          .filter((id) => mongoose.Types.ObjectId.isValid(id))
          .map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    const rows = await Donation.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$campaignId',
          grossMinor: { $sum: '$amountMinor' },
          refundedMinor: { $sum: '$refundedAmountMinor' },
          donationCount: { $sum: 1 },
          uniqueDonors: { $addToSet: '$donorId' },
        },
      },
    ]);

    const map = new Map<
      string,
      { grossMinor: number; refundedMinor: number; netRaisedMinor: number; donorCount: number; donationCount: number }
    >();
    for (const row of rows) {
      const grossMinor = Math.trunc(row.grossMinor || 0);
      const refundedMinor = Math.trunc(row.refundedMinor || 0);
      map.set(String(row._id), {
        grossMinor,
        refundedMinor,
        netRaisedMinor: Math.max(0, grossMinor - refundedMinor),
        donorCount: Array.isArray(row.uniqueDonors) ? row.uniqueDonors.length : 0,
        donationCount: Math.trunc(row.donationCount || 0),
      });
    }
    return map;
  }

  // ======================== DONORS ========================

  async findDonors(
    organizationId: string,
    filter: DonorFilterOptions = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<IDonorDocument[]> {
    await connectToDatabase();
    const query = this.buildDonorQuery(organizationId, filter);
    return Donor.find(query)
      .sort({ lifetimeAmountMinor: -1, createdAt: -1 })
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit);
  }

  async countDonors(organizationId: string, filter: DonorFilterOptions = {}): Promise<number> {
    await connectToDatabase();
    return Donor.countDocuments(this.buildDonorQuery(organizationId, filter));
  }

  private buildDonorQuery(organizationId: string, filter: DonorFilterOptions) {
    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
    };
    if (filter.donorType) query.donorType = filter.donorType;
    if (filter.status) query.status = filter.status;
    if (typeof filter.hasActiveRecurring === 'boolean') {
      query.hasActiveRecurring = filter.hasActiveRecurring;
    }
    if (filter.search) {
      const rx = new RegExp(filter.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ name: rx }, { email: rx }, { phone: rx }, { organizationName: rx }];
    }
    return query;
  }

  async findDonorById(id: string, organizationId: string): Promise<IDonorDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return Donor.findOne({
      _id: new mongoose.Types.ObjectId(id),
      organizationId: new mongoose.Types.ObjectId(organizationId),
    });
  }

  async findDonorByEmail(email: string, organizationId: string): Promise<IDonorDocument | null> {
    await connectToDatabase();
    return Donor.findOne({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      email: email.toLowerCase().trim(),
    });
  }

  async createDonor(data: Partial<IDonorDocument>): Promise<IDonorDocument> {
    await connectToDatabase();
    return Donor.create(data);
  }

  async updateDonor(
    id: string,
    organizationId: string,
    update: Record<string, unknown>
  ): Promise<IDonorDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return Donor.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        organizationId: new mongoose.Types.ObjectId(organizationId),
      },
      update,
      { new: true }
    );
  }

  // ======================== DONATIONS ========================

  async findDonations(
    organizationId: string,
    filter: DonationFilterOptions = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<IDonationDocument[]> {
    await connectToDatabase();
    const query = this.buildDonationQuery(organizationId, filter);
    return Donation.find(query)
      .populate('donorId', 'name email donorType')
      .populate('campaignId', 'title slug code')
      .sort({ createdAt: -1 })
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit);
  }

  async countDonations(organizationId: string, filter: DonationFilterOptions = {}): Promise<number> {
    await connectToDatabase();
    return Donation.countDocuments(this.buildDonationQuery(organizationId, filter));
  }

  private buildDonationQuery(organizationId: string, filter: DonationFilterOptions) {
    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
    };
    if (filter.status) query.status = filter.status;
    if (filter.paymentProvider) query.paymentProvider = filter.paymentProvider;
    if (filter.campaignId && mongoose.Types.ObjectId.isValid(filter.campaignId)) {
      query.campaignId = new mongoose.Types.ObjectId(filter.campaignId);
    }
    if (filter.donorId && mongoose.Types.ObjectId.isValid(filter.donorId)) {
      query.donorId = new mongoose.Types.ObjectId(filter.donorId);
    }
    if (filter.fromDate || filter.toDate) {
      const range: Record<string, Date> = {};
      if (filter.fromDate) range.$gte = filter.fromDate;
      if (filter.toDate) range.$lte = filter.toDate;
      query.createdAt = range;
    }
    if (filter.search) {
      const rx = new RegExp(filter.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { donationCode: rx },
        { paymentReference: rx },
        { providerOrderId: rx },
        { 'donorSnapshot.name': rx },
        { 'donorSnapshot.email': rx },
      ];
    }
    return query;
  }

  async findDonationById(id: string, organizationId: string): Promise<IDonationDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return Donation.findOne({
      _id: new mongoose.Types.ObjectId(id),
      organizationId: new mongoose.Types.ObjectId(organizationId),
    })
      .populate('donorId', 'name email phone donorType communicationPreferences')
      .populate('campaignId', 'title slug code targetAmountMinor');
  }

  async findDonationByIdempotencyKey(
    organizationId: string,
    idempotencyKey: string
  ): Promise<IDonationDocument | null> {
    await connectToDatabase();
    return Donation.findOne({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      idempotencyKey: idempotencyKey.trim(),
    });
  }

  async findDonationByProviderOrderId(providerOrderId: string): Promise<IDonationDocument | null> {
    await connectToDatabase();
    return Donation.findOne({ providerOrderId: providerOrderId.trim() });
  }

  async findDonationByPaymentReference(paymentReference: string): Promise<IDonationDocument | null> {
    await connectToDatabase();
    return Donation.findOne({ paymentReference: paymentReference.trim() });
  }

  async createDonation(data: Partial<IDonationDocument>): Promise<IDonationDocument> {
    await connectToDatabase();
    return Donation.create(data);
  }

  async updateDonation(
    id: string,
    organizationId: string,
    update: Record<string, unknown>
  ): Promise<IDonationDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return Donation.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        organizationId: new mongoose.Types.ObjectId(organizationId),
      },
      update,
      { new: true }
    );
  }

  // ======================== PAYMENT TRANSACTIONS, ATTEMPTS & WEBHOOKS ========================

  async createPaymentTransaction(
    data: Partial<IPaymentTransactionDocument>
  ): Promise<IPaymentTransactionDocument> {
    await connectToDatabase();
    return PaymentTransaction.create(data);
  }

  async findTransactionsByDonation(
    organizationId: string,
    donationId: string
  ): Promise<IPaymentTransactionDocument[]> {
    if (!mongoose.Types.ObjectId.isValid(donationId)) return [];
    await connectToDatabase();
    return PaymentTransaction.find({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      donationId: new mongoose.Types.ObjectId(donationId),
    }).sort({ createdAt: -1 });
  }

  async findRecentTransactions(
    organizationId: string,
    limit = 50
  ): Promise<IPaymentTransactionDocument[]> {
    await connectToDatabase();
    return PaymentTransaction.find({
      organizationId: new mongoose.Types.ObjectId(organizationId),
    })
      .populate('donationId', 'donationCode status amountMinor currency paymentProvider')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async createPaymentAttempt(data: Partial<IPaymentAttemptDocument>): Promise<IPaymentAttemptDocument> {
    await connectToDatabase();
    return PaymentAttempt.create(data);
  }

  async findAttemptsByDonation(
    organizationId: string,
    donationId: string
  ): Promise<IPaymentAttemptDocument[]> {
    if (!mongoose.Types.ObjectId.isValid(donationId)) return [];
    await connectToDatabase();
    return PaymentAttempt.find({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      donationId: new mongoose.Types.ObjectId(donationId),
    }).sort({ attemptNumber: -1 });
  }

  async findWebhookEvent(
    provider: WebhookProvider,
    providerEventId: string
  ): Promise<IPaymentWebhookEventDocument | null> {
    await connectToDatabase();
    return PaymentWebhookEvent.findOne({ provider, providerEventId });
  }

  async createWebhookEvent(
    data: Partial<IPaymentWebhookEventDocument>
  ): Promise<IPaymentWebhookEventDocument> {
    await connectToDatabase();
    return PaymentWebhookEvent.create(data);
  }

  async updateWebhookEvent(
    id: string,
    update: Record<string, unknown>
  ): Promise<IPaymentWebhookEventDocument | null> {
    await connectToDatabase();
    return PaymentWebhookEvent.findByIdAndUpdate(id, update, { new: true });
  }

  async findRecentWebhookEvents(
    organizationId: string,
    limit = 30
  ): Promise<IPaymentWebhookEventDocument[]> {
    await connectToDatabase();
    return PaymentWebhookEvent.find({
      $or: [
        { organizationId: new mongoose.Types.ObjectId(organizationId) },
        { organizationId: { $exists: false } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  // ======================== RECEIPTS ========================

  async findReceipts(
    organizationId: string,
    filter: { status?: 'ISSUED' | 'CANCELLED'; donationId?: string } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 25 }
  ): Promise<IDonationReceiptDocument[]> {
    await connectToDatabase();
    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
    };
    if (filter.status) query.status = filter.status;
    if (filter.donationId && mongoose.Types.ObjectId.isValid(filter.donationId)) {
      query.donationId = new mongoose.Types.ObjectId(filter.donationId);
    }
    return DonationReceipt.find(query)
      .sort({ issuedAt: -1 })
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit);
  }

  async countReceipts(
    organizationId: string,
    filter: { status?: 'ISSUED' | 'CANCELLED' } = {}
  ): Promise<number> {
    await connectToDatabase();
    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
    };
    if (filter.status) query.status = filter.status;
    return DonationReceipt.countDocuments(query);
  }

  async findActiveReceiptByDonation(
    organizationId: string,
    donationId: string
  ): Promise<IDonationReceiptDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(donationId)) return null;
    await connectToDatabase();
    return DonationReceipt.findOne({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      donationId: new mongoose.Types.ObjectId(donationId),
      status: 'ISSUED',
    });
  }

  async findReceiptById(id: string, organizationId: string): Promise<IDonationReceiptDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return DonationReceipt.findOne({
      _id: new mongoose.Types.ObjectId(id),
      organizationId: new mongoose.Types.ObjectId(organizationId),
    });
  }

  async createReceipt(data: Partial<IDonationReceiptDocument>): Promise<IDonationReceiptDocument> {
    await connectToDatabase();
    return DonationReceipt.create(data);
  }

  async updateReceipt(
    id: string,
    organizationId: string,
    update: Record<string, unknown>
  ): Promise<IDonationReceiptDocument | null> {
    await connectToDatabase();
    return DonationReceipt.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        organizationId: new mongoose.Types.ObjectId(organizationId),
      },
      update,
      { new: true }
    );
  }

  // ======================== REFUNDS ========================

  async findRefunds(
    organizationId: string,
    filter: { status?: RefundStatus; donationId?: string } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 25 }
  ): Promise<IRefundDocument[]> {
    await connectToDatabase();
    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
    };
    if (filter.status) query.status = filter.status;
    if (filter.donationId && mongoose.Types.ObjectId.isValid(filter.donationId)) {
      query.donationId = new mongoose.Types.ObjectId(filter.donationId);
    }
    return Refund.find(query)
      .populate('donationId', 'donationCode amountMinor refundedAmountMinor currency paymentProvider status')
      .populate('requestedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit);
  }

  async countRefunds(organizationId: string, filter: { status?: RefundStatus } = {}): Promise<number> {
    await connectToDatabase();
    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
    };
    if (filter.status) query.status = filter.status;
    return Refund.countDocuments(query);
  }

  async findRefundById(id: string, organizationId: string): Promise<IRefundDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return Refund.findOne({
      _id: new mongoose.Types.ObjectId(id),
      organizationId: new mongoose.Types.ObjectId(organizationId),
    })
      .populate('donationId', 'donationCode amountMinor refundedAmountMinor currency paymentProvider paymentReference status donorSnapshot')
      .populate('requestedBy', 'name email role')
      .populate('approvedBy', 'name email role');
  }

  async findRefundByIdempotencyKey(
    organizationId: string,
    idempotencyKey: string
  ): Promise<IRefundDocument | null> {
    await connectToDatabase();
    return Refund.findOne({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      idempotencyKey: idempotencyKey.trim(),
    });
  }

  async findRefundsByDonation(organizationId: string, donationId: string): Promise<IRefundDocument[]> {
    if (!mongoose.Types.ObjectId.isValid(donationId)) return [];
    await connectToDatabase();
    return Refund.find({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      donationId: new mongoose.Types.ObjectId(donationId),
    }).sort({ createdAt: -1 });
  }

  async createRefund(data: Partial<IRefundDocument>): Promise<IRefundDocument> {
    await connectToDatabase();
    return Refund.create(data);
  }

  async updateRefund(
    id: string,
    organizationId: string,
    update: Record<string, unknown>
  ): Promise<IRefundDocument | null> {
    await connectToDatabase();
    return Refund.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        organizationId: new mongoose.Types.ObjectId(organizationId),
      },
      update,
      { new: true }
    );
  }

  // ======================== RECURRING DONATIONS ========================

  async findRecurringDonations(
    organizationId: string,
    filter: { status?: RecurringDonationStatus; donorId?: string } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 25 }
  ): Promise<IRecurringDonationDocument[]> {
    await connectToDatabase();
    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
    };
    if (filter.status) query.status = filter.status;
    if (filter.donorId && mongoose.Types.ObjectId.isValid(filter.donorId)) {
      query.donorId = new mongoose.Types.ObjectId(filter.donorId);
    }
    return RecurringDonation.find(query)
      .populate('donorId', 'name email')
      .populate('campaignId', 'title slug')
      .sort({ createdAt: -1 })
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit);
  }

  async countRecurringDonations(
    organizationId: string,
    filter: { status?: RecurringDonationStatus } = {}
  ): Promise<number> {
    await connectToDatabase();
    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
    };
    if (filter.status) query.status = filter.status;
    return RecurringDonation.countDocuments(query);
  }

  async findRecurringById(
    id: string,
    organizationId: string
  ): Promise<IRecurringDonationDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return RecurringDonation.findOne({
      _id: new mongoose.Types.ObjectId(id),
      organizationId: new mongoose.Types.ObjectId(organizationId),
    })
      .populate('donorId', 'name email')
      .populate('campaignId', 'title slug');
  }

  async createRecurringDonation(
    data: Partial<IRecurringDonationDocument>
  ): Promise<IRecurringDonationDocument> {
    await connectToDatabase();
    return RecurringDonation.create(data);
  }

  async updateRecurringDonation(
    id: string,
    organizationId: string,
    update: Record<string, unknown>
  ): Promise<IRecurringDonationDocument | null> {
    await connectToDatabase();
    return RecurringDonation.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        organizationId: new mongoose.Types.ObjectId(organizationId),
      },
      update,
      { new: true }
    );
  }
}

export const fundraisingRepository = new FundraisingRepository();
