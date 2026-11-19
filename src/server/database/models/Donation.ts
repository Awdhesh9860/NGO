import mongoose, { Schema, Document, Model } from 'mongoose';

export type DonationStatus =
  | 'INITIATED'
  | 'PENDING'
  | 'SUCCESSFUL'
  | 'FAILED'
  | 'CANCELLED'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED';

export type DonationType = 'ONE_TIME' | 'RECURRING';
export type PaymentProviderType = 'RAZORPAY' | 'STRIPE' | 'UPI' | 'BANK_TRANSFER';
export type ReceiptStatus = 'NOT_ISSUED' | 'ISSUED' | 'CANCELLED';
export type RefundSummaryStatus = 'NONE' | 'REQUESTED' | 'PARTIALLY_REFUNDED' | 'REFUNDED';

export interface IDonationDonorSnapshot {
  name: string;
  email: string;
  phone?: string;
  panNumber?: string;
  address?: string;
}

export interface IDonationDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  donationCode: string;
  idempotencyKey: string;
  donorId: mongoose.Types.ObjectId;
  campaignId?: mongoose.Types.ObjectId;
  programId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  recurringDonationId?: mongoose.Types.ObjectId;
  /** Donation principal strictly stored as integer minor currency units. */
  amountMinor: number;
  /** Cumulative refunded integer minor currency units (always <= amountMinor). */
  refundedAmountMinor: number;
  currency: string;
  donationType: DonationType;
  paymentProvider: PaymentProviderType;
  providerOrderId?: string;
  paymentReference?: string;
  manualProofUrl?: string;
  paymentStatus: string;
  status: DonationStatus;
  isAnonymous: boolean;
  donorSnapshot: IDonationDonorSnapshot;
  purpose: string;
  receiptStatus: ReceiptStatus;
  refundStatus: RefundSummaryStatus;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  rejectionReason?: string;
  confirmationEmailSentAt?: Date;
  receiptEmailSentAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema = new Schema<IDonationDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    donationCode: { type: String, required: true, uppercase: true, trim: true },
    idempotencyKey: { type: String, required: true, trim: true },
    donorId: { type: Schema.Types.ObjectId, ref: 'Donor', required: true, index: true },
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', index: true },
    programId: { type: Schema.Types.ObjectId, ref: 'Program', index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
    recurringDonationId: { type: Schema.Types.ObjectId, ref: 'RecurringDonation', index: true },
    amountMinor: { type: Number, required: true, min: 100 },
    refundedAmountMinor: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'INR', uppercase: true, trim: true },
    donationType: {
      type: String,
      enum: ['ONE_TIME', 'RECURRING'],
      default: 'ONE_TIME',
      index: true,
    },
    paymentProvider: {
      type: String,
      enum: ['RAZORPAY', 'STRIPE', 'UPI', 'BANK_TRANSFER'],
      required: true,
      index: true,
    },
    providerOrderId: { type: String, trim: true, index: true },
    paymentReference: { type: String, trim: true, index: true },
    manualProofUrl: { type: String, trim: true },
    paymentStatus: { type: String, default: 'INITIATED', trim: true },
    status: {
      type: String,
      enum: [
        'INITIATED',
        'PENDING',
        'SUCCESSFUL',
        'FAILED',
        'CANCELLED',
        'PARTIALLY_REFUNDED',
        'REFUNDED',
      ],
      default: 'INITIATED',
      index: true,
    },
    isAnonymous: { type: Boolean, default: false },
    donorSnapshot: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, trim: true },
      panNumber: { type: String, uppercase: true, trim: true },
      address: { type: String, trim: true },
    },
    purpose: { type: String, default: 'General Charitable Fund', trim: true },
    receiptStatus: {
      type: String,
      enum: ['NOT_ISSUED', 'ISSUED', 'CANCELLED'],
      default: 'NOT_ISSUED',
      index: true,
    },
    refundStatus: {
      type: String,
      enum: ['NONE', 'REQUESTED', 'PARTIALLY_REFUNDED', 'REFUNDED'],
      default: 'NONE',
      index: true,
    },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    rejectionReason: { type: String, trim: true },
    confirmationEmailSentAt: { type: Date },
    receiptEmailSentAt: { type: Date },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

DonationSchema.index({ organizationId: 1, donationCode: 1 }, { unique: true });
DonationSchema.index({ organizationId: 1, idempotencyKey: 1 }, { unique: true });
DonationSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
DonationSchema.index({ organizationId: 1, campaignId: 1, status: 1 });
DonationSchema.index({ organizationId: 1, donorId: 1, createdAt: -1 });

export const Donation: Model<IDonationDocument> =
  mongoose.models.Donation || mongoose.model<IDonationDocument>('Donation', DonationSchema);

export default Donation;
