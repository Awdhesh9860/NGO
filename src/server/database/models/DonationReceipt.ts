import mongoose, { Schema, Document, Model } from 'mongoose';
import { PaymentProviderType } from './Donation';

export type DonationReceiptStatus = 'ISSUED' | 'CANCELLED';

export interface IVerifiedStatutorySnapshot {
  section80GNumber?: string;
  section80GValidFrom?: string;
  section80GValidTo?: string;
  section12ANumber?: string;
  section12AValidFrom?: string;
  section12AValidTo?: string;
  taxExemptionPercentage?: number;
}

export interface IDonationReceiptDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  donationId: mongoose.Types.ObjectId;
  receiptNumber: string;
  organizationSnapshot: {
    name: string;
    legalName?: string;
    address?: string;
    panNumber?: string;
    registrationNumber?: string;
    contactEmail?: string;
  };
  donorSnapshot: {
    name: string;
    email: string;
    address?: string;
    panNumber?: string;
  };
  /** Receipt amount strictly stored in integer minor currency units. */
  amountMinor: number;
  currency: string;
  donationDate: Date;
  paymentProvider: PaymentProviderType;
  paymentReference: string;
  purpose: string;
  /** Strictly true ONLY when organization verification & statutory 80G/12A validity dates are verified. */
  taxBenefitEligible: boolean;
  taxEligibilityReason: string;
  verifiedStatutorySnapshot?: IVerifiedStatutorySnapshot;
  status: DonationReceiptStatus;
  issuedBy?: mongoose.Types.ObjectId;
  issuedAt: Date;
  cancelledReason?: string;
  cancelledBy?: mongoose.Types.ObjectId;
  cancelledAt?: Date;
  supersededByReceiptId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DonationReceiptSchema = new Schema<IDonationReceiptDocument>(
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
    receiptNumber: { type: String, required: true, uppercase: true, trim: true },
    organizationSnapshot: {
      name: { type: String, required: true, trim: true },
      legalName: { type: String, trim: true },
      address: { type: String, trim: true },
      panNumber: { type: String, uppercase: true, trim: true },
      registrationNumber: { type: String, trim: true },
      contactEmail: { type: String, trim: true },
    },
    donorSnapshot: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      address: { type: String, trim: true },
      panNumber: { type: String, uppercase: true, trim: true },
    },
    amountMinor: { type: Number, required: true, min: 100 },
    currency: { type: String, default: 'INR', uppercase: true, trim: true },
    donationDate: { type: Date, required: true },
    paymentProvider: {
      type: String,
      enum: ['RAZORPAY', 'STRIPE', 'UPI', 'BANK_TRANSFER'],
      required: true,
    },
    paymentReference: { type: String, required: true, trim: true },
    purpose: { type: String, required: true, trim: true },
    taxBenefitEligible: { type: Boolean, required: true, default: false },
    taxEligibilityReason: { type: String, required: true, trim: true },
    verifiedStatutorySnapshot: {
      section80GNumber: { type: String, trim: true },
      section80GValidFrom: { type: String, trim: true },
      section80GValidTo: { type: String, trim: true },
      section12ANumber: { type: String, trim: true },
      section12AValidFrom: { type: String, trim: true },
      section12AValidTo: { type: String, trim: true },
      taxExemptionPercentage: { type: Number },
    },
    status: {
      type: String,
      enum: ['ISSUED', 'CANCELLED'],
      default: 'ISSUED',
      index: true,
    },
    issuedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    issuedAt: { type: Date, default: Date.now },
    cancelledReason: { type: String, trim: true },
    cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
    cancelledAt: { type: Date },
    supersededByReceiptId: { type: Schema.Types.ObjectId, ref: 'DonationReceipt' },
  },
  { timestamps: true }
);

DonationReceiptSchema.index({ organizationId: 1, receiptNumber: 1 }, { unique: true });
DonationReceiptSchema.index(
  { organizationId: 1, donationId: 1 },
  { unique: true, partialFilterExpression: { status: 'ISSUED' } }
);

export const DonationReceipt: Model<IDonationReceiptDocument> =
  mongoose.models.DonationReceipt ||
  mongoose.model<IDonationReceiptDocument>('DonationReceipt', DonationReceiptSchema);

export default DonationReceipt;
