import mongoose, { Schema, Document, Model } from 'mongoose';
import { MembershipCategory } from './MembershipPlan';

export type MembershipStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'SUSPENDED'
  | 'CANCELLED';

export interface IMembershipDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  membershipNumber: string;
  userId?: mongoose.Types.ObjectId;
  applicationId?: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  category: MembershipCategory;
  fullName: string;
  email: string;
  mobileNumber?: string;
  address?: string;
  occupation?: string;
  organizationName?: string;
  status: MembershipStatus;
  startDate: Date;
  expiryDate?: Date | null;
  graceUntilDate?: Date | null;
  isLifetime: boolean;
  /** Tracked separately from charitable donations */
  feeAmountMinor: number;
  currency: string;
  feePaymentStatus: 'NOT_REQUIRED' | 'PENDING' | 'PAID' | 'WAIVED';
  paymentReference?: string;
  documentUrls: string[];
  internalNotes?: string;
  communicationPreferences: {
    emailNotices: boolean;
    renewalReminders: boolean;
    directoryOptIn: boolean;
  };
  /** Deduplication tracking for renewal reminder days already dispatched */
  remindersSentForPeriod: string[];
  statusHistory: Array<{
    status: MembershipStatus;
    actorId?: mongoose.Types.ObjectId;
    actorName: string;
    reason?: string;
    timestamp: Date;
  }>;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipSchema = new Schema<IMembershipDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    membershipNumber: { type: String, required: true, uppercase: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    applicationId: { type: Schema.Types.ObjectId, ref: 'MembershipApplication' },
    planId: { type: Schema.Types.ObjectId, ref: 'MembershipPlan', required: true, index: true },
    category: {
      type: String,
      enum: ['GENERAL', 'ANNUAL', 'LIFETIME', 'SUPPORTING', 'INSTITUTIONAL'],
      required: true,
      index: true,
    },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    mobileNumber: { type: String, trim: true },
    address: { type: String, trim: true },
    occupation: { type: String, trim: true },
    organizationName: { type: String, trim: true },
    status: {
      type: String,
      enum: [
        'DRAFT',
        'SUBMITTED',
        'UNDER_REVIEW',
        'APPROVED',
        'REJECTED',
        'ACTIVE',
        'EXPIRED',
        'SUSPENDED',
        'CANCELLED',
      ],
      default: 'APPROVED',
      index: true,
    },
    startDate: { type: Date, required: true },
    expiryDate: { type: Date, default: null, index: true },
    graceUntilDate: { type: Date, default: null },
    isLifetime: { type: Boolean, default: false },
    feeAmountMinor: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'INR', uppercase: true, trim: true },
    feePaymentStatus: {
      type: String,
      enum: ['NOT_REQUIRED', 'PENDING', 'PAID', 'WAIVED'],
      default: 'NOT_REQUIRED',
    },
    paymentReference: { type: String, trim: true },
    documentUrls: [{ type: String, trim: true }],
    internalNotes: { type: String, trim: true },
    communicationPreferences: {
      emailNotices: { type: Boolean, default: true },
      renewalReminders: { type: Boolean, default: true },
      directoryOptIn: { type: Boolean, default: false },
    },
    remindersSentForPeriod: [{ type: String }],
    statusHistory: [
      {
        status: {
          type: String,
          enum: [
            'DRAFT',
            'SUBMITTED',
            'UNDER_REVIEW',
            'APPROVED',
            'REJECTED',
            'ACTIVE',
            'EXPIRED',
            'SUSPENDED',
            'CANCELLED',
          ],
          required: true,
        },
        actorId: { type: Schema.Types.ObjectId, ref: 'User' },
        actorName: { type: String, required: true, trim: true },
        reason: { type: String, trim: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

MembershipSchema.index({ organizationId: 1, membershipNumber: 1 }, { unique: true });
MembershipSchema.index({ organizationId: 1, email: 1 });
MembershipSchema.index({ organizationId: 1, status: 1, expiryDate: 1 });

export const Membership: Model<IMembershipDocument> =
  mongoose.models.Membership || mongoose.model<IMembershipDocument>('Membership', MembershipSchema);

export default Membership;
