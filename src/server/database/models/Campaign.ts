import mongoose, { Schema, Document, Model } from 'mongoose';

export type CampaignStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'GOAL_REACHED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ARCHIVED';

export interface ICampaignApprovalHistoryEntry {
  action: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'STATUS_CHANGED' | 'PUBLISHED' | 'UNPUBLISHED';
  actorId: mongoose.Types.ObjectId;
  actorName: string;
  actorRole: string;
  comments?: string;
  timestamp: Date;
}

export interface ICampaignDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  code: string;
  shortSummary: string;
  story?: string;
  category: string;
  coverImage?: string;
  gallery: string[];
  videoUrl?: string;
  /** Target fundraising amount stored strictly as integer minor currency units (e.g. INR paise). */
  targetAmountMinor: number;
  /** Minimum donation allowed in integer minor units. */
  minimumDonationMinor: number;
  /** Suggested preset donation amounts in integer minor units. */
  suggestedAmountsMinor: number[];
  currency: string;
  startDate?: Date;
  endDate?: Date;
  programId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  campaignManagerId?: mongoose.Types.ObjectId;
  teamMemberIds: mongoose.Types.ObjectId[];
  status: CampaignStatus;
  isPublicVisible: boolean;
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  submittedBy?: mongoose.Types.ObjectId;
  submittedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
  approvalHistory: ICampaignApprovalHistoryEntry[];
  goalReachedEmailSentAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignApprovalHistorySchema = new Schema<ICampaignApprovalHistoryEntry>(
  {
    action: {
      type: String,
      enum: ['SUBMITTED', 'APPROVED', 'REJECTED', 'STATUS_CHANGED', 'PUBLISHED', 'UNPUBLISHED'],
      required: true,
    },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorName: { type: String, required: true, trim: true },
    actorRole: { type: String, required: true, trim: true },
    comments: { type: String, trim: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const CampaignSchema = new Schema<ICampaignDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    shortSummary: { type: String, required: true, trim: true },
    story: { type: String, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    coverImage: { type: String, trim: true },
    gallery: [{ type: String, trim: true }],
    videoUrl: { type: String, trim: true },
    targetAmountMinor: { type: Number, required: true, min: 100 },
    minimumDonationMinor: { type: Number, default: 10000, min: 100 },
    suggestedAmountsMinor: {
      type: [Number],
      default: [50000, 150000, 300000, 500000],
    },
    currency: { type: String, default: 'INR', uppercase: true, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    programId: { type: Schema.Types.ObjectId, ref: 'Program', index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
    campaignManagerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    teamMemberIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: {
      type: String,
      enum: [
        'DRAFT',
        'PENDING_APPROVAL',
        'APPROVED',
        'ACTIVE',
        'PAUSED',
        'GOAL_REACHED',
        'COMPLETED',
        'CANCELLED',
        'ARCHIVED',
      ],
      default: 'DRAFT',
      index: true,
    },
    isPublicVisible: { type: Boolean, default: false, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    seoTitle: { type: String, trim: true },
    seoDescription: { type: String, trim: true },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    submittedAt: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectionReason: { type: String, trim: true },
    approvalHistory: [CampaignApprovalHistorySchema],
    goalReachedEmailSentAt: { type: Date },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

CampaignSchema.index({ organizationId: 1, slug: 1 }, { unique: true });
CampaignSchema.index({ organizationId: 1, code: 1 }, { unique: true });
CampaignSchema.index({ organizationId: 1, status: 1, isPublicVisible: 1, createdAt: -1 });

export const Campaign: Model<ICampaignDocument> =
  mongoose.models.Campaign || mongoose.model<ICampaignDocument>('Campaign', CampaignSchema);

export default Campaign;
