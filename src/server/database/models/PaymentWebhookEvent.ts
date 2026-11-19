import mongoose, { Schema, Document, Model } from 'mongoose';

export type WebhookProvider = 'RAZORPAY' | 'STRIPE';
export type WebhookProcessingStatus =
  | 'RECEIVED'
  | 'PROCESSED'
  | 'IGNORED_DUPLICATE'
  | 'IGNORED_OUT_OF_ORDER'
  | 'FAILED';

export interface IPaymentWebhookEventDocument extends Document {
  provider: WebhookProvider;
  providerEventId: string;
  organizationId?: mongoose.Types.ObjectId;
  eventType: string;
  signatureValid: boolean;
  processingStatus: WebhookProcessingStatus;
  outOfOrder: boolean;
  donationId?: mongoose.Types.ObjectId;
  payloadHash: string;
  processedAt?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentWebhookEventSchema = new Schema<IPaymentWebhookEventDocument>(
  {
    provider: {
      type: String,
      enum: ['RAZORPAY', 'STRIPE'],
      required: true,
    },
    providerEventId: { type: String, required: true, trim: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    eventType: { type: String, required: true, trim: true, index: true },
    signatureValid: { type: Boolean, required: true, default: false },
    processingStatus: {
      type: String,
      enum: ['RECEIVED', 'PROCESSED', 'IGNORED_DUPLICATE', 'IGNORED_OUT_OF_ORDER', 'FAILED'],
      default: 'RECEIVED',
      index: true,
    },
    outOfOrder: { type: Boolean, default: false },
    donationId: { type: Schema.Types.ObjectId, ref: 'Donation', index: true },
    payloadHash: { type: String, required: true, trim: true },
    processedAt: { type: Date },
    errorMessage: { type: String, trim: true },
  },
  { timestamps: true }
);

PaymentWebhookEventSchema.index({ provider: 1, providerEventId: 1 }, { unique: true });

export const PaymentWebhookEvent: Model<IPaymentWebhookEventDocument> =
  mongoose.models.PaymentWebhookEvent ||
  mongoose.model<IPaymentWebhookEventDocument>('PaymentWebhookEvent', PaymentWebhookEventSchema);

export default PaymentWebhookEvent;
