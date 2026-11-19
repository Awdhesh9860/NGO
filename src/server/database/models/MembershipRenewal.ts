import mongoose, { Schema, Document, Model } from 'mongoose';

export type MembershipRenewalStatus = 'REQUESTED' | 'APPROVED' | 'COMPLETED' | 'REJECTED';

export interface IMembershipRenewalDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  membershipId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  previousExpiryDate?: Date | null;
  newStartDate: Date;
  newExpiryDate?: Date | null;
  feeAmountMinor: number;
  currency: string;
  /** Strictly flagged as membership fee — never counted as charitable donation */
  paymentStatus: 'NOT_REQUIRED' | 'PENDING' | 'PAID' | 'WAIVED';
  paymentProvider?: 'RAZORPAY' | 'STRIPE' | 'UPI' | 'BANK_TRANSFER';
  paymentReference?: string;
  status: MembershipRenewalStatus;
  notes?: string;
  requestedBy?: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipRenewalSchema = new Schema<IMembershipRenewalDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    membershipId: {
      type: Schema.Types.ObjectId,
      ref: 'Membership',
      required: true,
      index: true,
    },
    planId: { type: Schema.Types.ObjectId, ref: 'MembershipPlan', required: true },
    previousExpiryDate: { type: Date, default: null },
    newStartDate: { type: Date, required: true },
    newExpiryDate: { type: Date, default: null },
    feeAmountMinor: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'INR', uppercase: true, trim: true },
    paymentStatus: {
      type: String,
      enum: ['NOT_REQUIRED', 'PENDING', 'PAID', 'WAIVED'],
      default: 'NOT_REQUIRED',
    },
    paymentProvider: {
      type: String,
      enum: ['RAZORPAY', 'STRIPE', 'UPI', 'BANK_TRANSFER'],
    },
    paymentReference: { type: String, trim: true },
    status: {
      type: String,
      enum: ['REQUESTED', 'APPROVED', 'COMPLETED', 'REJECTED'],
      default: 'REQUESTED',
      index: true,
    },
    notes: { type: String, trim: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectionReason: { type: String, trim: true },
  },
  { timestamps: true }
);

MembershipRenewalSchema.index({ organizationId: 1, membershipId: 1, createdAt: -1 });

export const MembershipRenewal: Model<IMembershipRenewalDocument> =
  mongoose.models.MembershipRenewal ||
  mongoose.model<IMembershipRenewalDocument>('MembershipRenewal', MembershipRenewalSchema);

export default MembershipRenewal;
