import mongoose, { Schema, Document, Model } from 'mongoose';

export type MembershipCategory =
  | 'GENERAL'
  | 'ANNUAL'
  | 'LIFETIME'
  | 'SUPPORTING'
  | 'INSTITUTIONAL';

export interface IMembershipPlanDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  category: MembershipCategory;
  description: string;
  /** Configurable fee strictly stored in integer minor currency units (0 allowed for free plans). */
  feeAmountMinor: number;
  currency: string;
  /** Validity period in days (null or 0 when isLifetime === true). */
  validityDays: number;
  isLifetime: boolean;
  gracePeriodDays: number;
  renewalReminderDaysBefore: number[];
  eligibilityCriteria?: string;
  benefits: string[];
  votingRights: boolean;
  requiresApproval: boolean;
  isPublicVisible: boolean;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipPlanSchema = new Schema<IMembershipPlanDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    category: {
      type: String,
      enum: ['GENERAL', 'ANNUAL', 'LIFETIME', 'SUPPORTING', 'INSTITUTIONAL'],
      required: true,
      index: true,
    },
    description: { type: String, required: true, trim: true },
    feeAmountMinor: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR', uppercase: true, trim: true },
    validityDays: { type: Number, default: 365, min: 0 },
    isLifetime: { type: Boolean, default: false },
    gracePeriodDays: { type: Number, default: 30, min: 0, max: 180 },
    renewalReminderDaysBefore: { type: [Number], default: [30, 7, 1] },
    eligibilityCriteria: { type: String, trim: true },
    benefits: [{ type: String, trim: true }],
    votingRights: { type: Boolean, default: false },
    requiresApproval: { type: Boolean, default: true },
    isPublicVisible: { type: Boolean, default: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

MembershipPlanSchema.index({ organizationId: 1, code: 1 }, { unique: true });
MembershipPlanSchema.index({ organizationId: 1, isActive: 1, isPublicVisible: 1 });

export const MembershipPlan: Model<IMembershipPlanDocument> =
  mongoose.models.MembershipPlan ||
  mongoose.model<IMembershipPlanDocument>('MembershipPlan', MembershipPlanSchema);

export default MembershipPlan;
