import mongoose, { Schema, Document, Model } from 'mongoose';

export type RecurringProvider = 'RAZORPAY' | 'STRIPE';
export type RecurringPlanInterval = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type RecurringDonationStatus =
  | 'CREATED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'CANCELLED'
  | 'FAILED'
  | 'COMPLETED';

export interface IRecurringDonationDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  donorId: mongoose.Types.ObjectId;
  campaignId?: mongoose.Types.ObjectId;
  provider: RecurringProvider;
  providerSubscriptionId?: string;
  providerMandateId?: string;
  planInterval: RecurringPlanInterval;
  /** Recurring installment amount strictly in integer minor currency units. */
  amountMinor: number;
  currency: string;
  status: RecurringDonationStatus;
  nextPaymentAt?: Date | null;
  lastPaymentAt?: Date | null;
  completedCycles: number;
  failedCycles: number;
  pausedAt?: Date | null;
  cancelledAt?: Date | null;
  cancellationReason?: string;
  isAnonymous: boolean;
  purpose: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RecurringDonationSchema = new Schema<IRecurringDonationDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    donorId: { type: Schema.Types.ObjectId, ref: 'Donor', required: true, index: true },
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', index: true },
    provider: {
      type: String,
      enum: ['RAZORPAY', 'STRIPE'],
      required: true,
      index: true,
    },
    providerSubscriptionId: { type: String, trim: true },
    providerMandateId: { type: String, trim: true },
    planInterval: {
      type: String,
      enum: ['MONTHLY', 'QUARTERLY', 'YEARLY'],
      required: true,
    },
    amountMinor: { type: Number, required: true, min: 100 },
    currency: { type: String, default: 'INR', uppercase: true, trim: true },
    status: {
      type: String,
      enum: ['CREATED', 'ACTIVE', 'PAUSED', 'CANCELLED', 'FAILED', 'COMPLETED'],
      default: 'CREATED',
      index: true,
    },
    nextPaymentAt: { type: Date, default: null },
    lastPaymentAt: { type: Date, default: null },
    completedCycles: { type: Number, default: 0, min: 0 },
    failedCycles: { type: Number, default: 0, min: 0 },
    pausedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    cancellationReason: { type: String, trim: true },
    isAnonymous: { type: Boolean, default: false },
    purpose: { type: String, default: 'Recurring Charitable Contribution', trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

RecurringDonationSchema.index({ organizationId: 1, donorId: 1, createdAt: -1 });
RecurringDonationSchema.index(
  { provider: 1, providerSubscriptionId: 1 },
  { unique: true, partialFilterExpression: { providerSubscriptionId: { $type: 'string' } } }
);

export const RecurringDonation: Model<IRecurringDonationDocument> =
  mongoose.models.RecurringDonation ||
  mongoose.model<IRecurringDonationDocument>('RecurringDonation', RecurringDonationSchema);

export default RecurringDonation;
