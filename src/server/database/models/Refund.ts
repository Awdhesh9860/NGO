import mongoose, { Schema, Document, Model } from 'mongoose';
import { PaymentProviderType } from './Donation';

export type RefundStatus =
  | 'REQUESTED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'PROCESSING'
  | 'SUCCESSFUL'
  | 'FAILED'
  | 'REJECTED';

export interface IRefundHistoryEntry {
  status: RefundStatus;
  actorId: mongoose.Types.ObjectId;
  actorName: string;
  actorRole: string;
  notes?: string;
  timestamp: Date;
}

export interface IRefundDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  donationId: mongoose.Types.ObjectId;
  paymentTransactionId?: mongoose.Types.ObjectId;
  idempotencyKey: string;
  requestedBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  processedBy?: mongoose.Types.ObjectId;
  /** Refund amount strictly stored in integer minor currency units. */
  amountMinor: number;
  currency: string;
  isPartial: boolean;
  reason: string;
  provider: PaymentProviderType;
  providerRefundId?: string;
  status: RefundStatus;
  rejectionReason?: string;
  failureReason?: string;
  approvedAt?: Date;
  processedAt?: Date;
  history: IRefundHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const RefundHistorySchema = new Schema<IRefundHistoryEntry>(
  {
    status: {
      type: String,
      enum: [
        'REQUESTED',
        'PENDING_APPROVAL',
        'APPROVED',
        'PROCESSING',
        'SUCCESSFUL',
        'FAILED',
        'REJECTED',
      ],
      required: true,
    },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorName: { type: String, required: true, trim: true },
    actorRole: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const RefundSchema = new Schema<IRefundDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    donationId: {
      type: Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
      index: true,
    },
    paymentTransactionId: { type: Schema.Types.ObjectId, ref: 'PaymentTransaction' },
    idempotencyKey: { type: String, required: true, trim: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    amountMinor: { type: Number, required: true, min: 1 },
    currency: { type: String, default: 'INR', uppercase: true, trim: true },
    isPartial: { type: Boolean, default: false },
    reason: { type: String, required: true, trim: true },
    provider: {
      type: String,
      enum: ['RAZORPAY', 'STRIPE', 'UPI', 'BANK_TRANSFER'],
      required: true,
    },
    providerRefundId: { type: String, trim: true },
    status: {
      type: String,
      enum: [
        'REQUESTED',
        'PENDING_APPROVAL',
        'APPROVED',
        'PROCESSING',
        'SUCCESSFUL',
        'FAILED',
        'REJECTED',
      ],
      default: 'PENDING_APPROVAL',
      index: true,
    },
    rejectionReason: { type: String, trim: true },
    failureReason: { type: String, trim: true },
    approvedAt: { type: Date },
    processedAt: { type: Date },
    history: [RefundHistorySchema],
  },
  { timestamps: true }
);

RefundSchema.index({ organizationId: 1, idempotencyKey: 1 }, { unique: true });
RefundSchema.index({ organizationId: 1, donationId: 1, createdAt: -1 });
RefundSchema.index({ organizationId: 1, status: 1, createdAt: -1 });

export const Refund: Model<IRefundDocument> =
  mongoose.models.Refund || mongoose.model<IRefundDocument>('Refund', RefundSchema);

export default Refund;
