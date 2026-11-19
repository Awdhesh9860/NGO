import mongoose, { Schema, Document, Model } from 'mongoose';
import { PaymentProviderType } from './Donation';

export type PaymentAttemptStatus =
  | 'STARTED'
  | 'REDIRECTED'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'ABANDONED';

export interface IPaymentAttemptDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  donationId: mongoose.Types.ObjectId;
  attemptNumber: number;
  provider: PaymentProviderType;
  providerOrderId?: string;
  status: PaymentAttemptStatus;
  errorCode?: string;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentAttemptSchema = new Schema<IPaymentAttemptDocument>(
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
    attemptNumber: { type: Number, required: true, min: 1 },
    provider: {
      type: String,
      enum: ['RAZORPAY', 'STRIPE', 'UPI', 'BANK_TRANSFER'],
      required: true,
    },
    providerOrderId: { type: String, trim: true },
    status: {
      type: String,
      enum: ['STARTED', 'REDIRECTED', 'SUCCEEDED', 'FAILED', 'ABANDONED'],
      default: 'STARTED',
      index: true,
    },
    errorCode: { type: String, trim: true },
    errorMessage: { type: String, trim: true },
    ipAddress: { type: String, trim: true },
    userAgent: { type: String, trim: true },
  },
  { timestamps: true }
);

PaymentAttemptSchema.index({ organizationId: 1, donationId: 1, attemptNumber: 1 });

export const PaymentAttempt: Model<IPaymentAttemptDocument> =
  mongoose.models.PaymentAttempt ||
  mongoose.model<IPaymentAttemptDocument>('PaymentAttempt', PaymentAttemptSchema);

export default PaymentAttempt;
