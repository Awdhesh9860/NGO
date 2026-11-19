import mongoose, { Schema, Document, Model } from 'mongoose';
import { PaymentProviderType } from './Donation';

export type PaymentTransactionStatus =
  | 'CREATED'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'FAILED'
  | 'REFUNDED'
  | 'PENDING_MANUAL'
  | 'REJECTED_MANUAL';

export type PaymentEventSource =
  | 'CHECKOUT_CREATE'
  | 'CHECKOUT_VERIFY'
  | 'WEBHOOK'
  | 'MANUAL_VERIFICATION'
  | 'RECONCILIATION'
  | 'REFUND';

export interface IPaymentTransactionDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  donationId: mongoose.Types.ObjectId;
  provider: PaymentProviderType;
  providerOrderId?: string;
  providerPaymentId?: string;
  /** Transaction amount in integer minor currency units. */
  amountMinor: number;
  currency: string;
  status: PaymentTransactionStatus;
  signatureVerified: boolean;
  eventSource: PaymentEventSource;
  failureReason?: string;
  recordedBy?: mongoose.Types.ObjectId;
  sanitizedMetadata?: Record<string, unknown>;
  createdAt: Date;
}

const PaymentTransactionSchema = new Schema<IPaymentTransactionDocument>(
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
    provider: {
      type: String,
      enum: ['RAZORPAY', 'STRIPE', 'UPI', 'BANK_TRANSFER'],
      required: true,
      index: true,
    },
    providerOrderId: { type: String, trim: true, index: true },
    providerPaymentId: { type: String, trim: true },
    amountMinor: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR', uppercase: true, trim: true },
    status: {
      type: String,
      enum: [
        'CREATED',
        'AUTHORIZED',
        'CAPTURED',
        'FAILED',
        'REFUNDED',
        'PENDING_MANUAL',
        'REJECTED_MANUAL',
      ],
      required: true,
      index: true,
    },
    signatureVerified: { type: Boolean, default: false },
    eventSource: {
      type: String,
      enum: [
        'CHECKOUT_CREATE',
        'CHECKOUT_VERIFY',
        'WEBHOOK',
        'MANUAL_VERIFICATION',
        'RECONCILIATION',
        'REFUND',
      ],
      required: true,
    },
    failureReason: { type: String, trim: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    sanitizedMetadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

PaymentTransactionSchema.index({ organizationId: 1, donationId: 1, createdAt: -1 });
PaymentTransactionSchema.index(
  { organizationId: 1, provider: 1, providerPaymentId: 1, status: 1 },
  { unique: true, partialFilterExpression: { providerPaymentId: { $type: 'string' } } }
);

export const PaymentTransaction: Model<IPaymentTransactionDocument> =
  mongoose.models.PaymentTransaction ||
  mongoose.model<IPaymentTransactionDocument>('PaymentTransaction', PaymentTransactionSchema);

export default PaymentTransaction;
