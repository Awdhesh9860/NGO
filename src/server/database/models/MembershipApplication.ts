import mongoose, { Schema, Document, Model } from 'mongoose';
import { MembershipCategory } from './MembershipPlan';

export type MembershipApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

export interface IMembershipApplicationDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  applicationCode: string;
  planId: mongoose.Types.ObjectId;
  category: MembershipCategory;
  fullName: string;
  email: string;
  mobileNumber: string;
  address?: string;
  dateOfBirth?: Date;
  occupation?: string;
  organizationName?: string;
  reasonForJoining: string;
  relevantExperience?: string;
  supportingDocumentUrls: string[];
  consentAccepted: boolean;
  consentVersion: string;
  /** Membership fee obligation (strictly distinct from charitable donations) */
  feeAmountMinor: number;
  currency: string;
  feePaymentStatus: 'NOT_REQUIRED' | 'PENDING' | 'PAID' | 'WAIVED';
  paymentReference?: string;
  status: MembershipApplicationStatus;
  internalNotes?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;
  membershipId?: mongoose.Types.ObjectId;
  history: Array<{
    status: MembershipApplicationStatus;
    actorId?: mongoose.Types.ObjectId;
    actorName: string;
    notes?: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipApplicationSchema = new Schema<IMembershipApplicationDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    applicationCode: { type: String, required: true, uppercase: true, trim: true },
    planId: { type: Schema.Types.ObjectId, ref: 'MembershipPlan', required: true, index: true },
    category: {
      type: String,
      enum: ['GENERAL', 'ANNUAL', 'LIFETIME', 'SUPPORTING', 'INSTITUTIONAL'],
      required: true,
    },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    mobileNumber: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    dateOfBirth: { type: Date },
    occupation: { type: String, trim: true },
    organizationName: { type: String, trim: true },
    reasonForJoining: { type: String, required: true, trim: true },
    relevantExperience: { type: String, trim: true },
    supportingDocumentUrls: [{ type: String, trim: true }],
    consentAccepted: { type: Boolean, required: true, default: false },
    consentVersion: { type: String, default: '1.0', trim: true },
    feeAmountMinor: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'INR', uppercase: true, trim: true },
    feePaymentStatus: {
      type: String,
      enum: ['NOT_REQUIRED', 'PENDING', 'PAID', 'WAIVED'],
      default: 'NOT_REQUIRED',
    },
    paymentReference: { type: String, trim: true },
    status: {
      type: String,
      enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'],
      default: 'SUBMITTED',
      index: true,
    },
    internalNotes: { type: String, trim: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    rejectionReason: { type: String, trim: true },
    membershipId: { type: Schema.Types.ObjectId, ref: 'Membership' },
    history: [
      {
        status: {
          type: String,
          enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'],
          required: true,
        },
        actorId: { type: Schema.Types.ObjectId, ref: 'User' },
        actorName: { type: String, required: true, trim: true },
        notes: { type: String, trim: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

MembershipApplicationSchema.index({ organizationId: 1, applicationCode: 1 }, { unique: true });
MembershipApplicationSchema.index({ organizationId: 1, email: 1, status: 1 });

export const MembershipApplication: Model<IMembershipApplicationDocument> =
  mongoose.models.MembershipApplication ||
  mongoose.model<IMembershipApplicationDocument>(
    'MembershipApplication',
    MembershipApplicationSchema
  );

export default MembershipApplication;
