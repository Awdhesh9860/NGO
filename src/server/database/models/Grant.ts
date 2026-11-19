import mongoose, { Schema, Document, Model } from 'mongoose';

export type GrantStatus =
  | 'DRAFT'
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export interface IGrantReportingDeadline {
  title: string;
  dueDate: Date;
  status: 'PENDING' | 'SUBMITTED' | 'OVERDUE';
  submittedAt?: Date;
  notes?: string;
}

export interface IGrantDisbursementTranche {
  trancheLabel: string;
  expectedDate: Date;
  expectedAmountMinor: number;
  receivedAmountMinor: number;
  receivedDate?: Date;
  status: 'SCHEDULED' | 'RECEIVED' | 'DELAYED';
  journalEntryId?: mongoose.Types.ObjectId;
}

export interface IGrantDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  grantReferenceNumber: string;
  grantName: string;
  providerName: string;
  providerType: 'FOUNDATION' | 'CORPORATE_CSR' | 'GOVERNMENT' | 'MULTILATERAL' | 'OTHER';
  awardDate?: Date;
  startDate: Date;
  endDate: Date;
  /** Integer minor currency units */
  awardAmountMinor: number;
  receivedAmountMinor: number;
  currency: string;
  isRestricted: boolean;
  restrictions?: string;
  permittedPurposes: string[];
  linkedProgramId?: mongoose.Types.ObjectId;
  linkedProjectId?: mongoose.Types.ObjectId;
  reportingDeadlines: IGrantReportingDeadline[];
  disbursementSchedule: IGrantDisbursementTranche[];
  status: GrantStatus;
  documentRefs: Array<{
    documentId?: mongoose.Types.ObjectId;
    label: string;
    storageKey: string;
    mimeType: string;
  }>;
  statusHistory: Array<{
    status: GrantStatus;
    actorId: mongoose.Types.ObjectId;
    actorName: string;
    note?: string;
    timestamp: Date;
  }>;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const GrantSchema = new Schema<IGrantDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    grantReferenceNumber: { type: String, required: true, uppercase: true, trim: true },
    grantName: { type: String, required: true, trim: true },
    providerName: { type: String, required: true, trim: true },
    providerType: {
      type: String,
      enum: ['FOUNDATION', 'CORPORATE_CSR', 'GOVERNMENT', 'MULTILATERAL', 'OTHER'],
      default: 'FOUNDATION',
    },
    awardDate: { type: Date },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    awardAmountMinor: { type: Number, required: true, min: 1 },
    receivedAmountMinor: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'INR', uppercase: true, trim: true },
    isRestricted: { type: Boolean, default: true },
    restrictions: { type: String, trim: true },
    permittedPurposes: { type: [String], default: [] },
    linkedProgramId: { type: Schema.Types.ObjectId, ref: 'Program', index: true },
    linkedProjectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
    reportingDeadlines: {
      type: [
        {
          title: { type: String, required: true, trim: true },
          dueDate: { type: Date, required: true },
          status: { type: String, enum: ['PENDING', 'SUBMITTED', 'OVERDUE'], default: 'PENDING' },
          submittedAt: { type: Date },
          notes: { type: String, trim: true },
        },
      ],
      default: [],
    },
    disbursementSchedule: {
      type: [
        {
          trancheLabel: { type: String, required: true, trim: true },
          expectedDate: { type: Date, required: true },
          expectedAmountMinor: { type: Number, required: true, min: 1 },
          receivedAmountMinor: { type: Number, default: 0, min: 0 },
          receivedDate: { type: Date },
          status: { type: String, enum: ['SCHEDULED', 'RECEIVED', 'DELAYED'], default: 'SCHEDULED' },
          journalEntryId: { type: Schema.Types.ObjectId, ref: 'JournalEntry' },
        },
      ],
      default: [],
    },
    status: {
      type: String,
      enum: ['DRAFT', 'APPLIED', 'UNDER_REVIEW', 'APPROVED', 'ACTIVE', 'COMPLETED', 'REJECTED', 'CANCELLED'],
      default: 'DRAFT',
      index: true,
    },
    documentRefs: {
      type: [
        {
          documentId: { type: Schema.Types.ObjectId, ref: 'FinancialDocument' },
          label: { type: String, required: true, trim: true },
          storageKey: { type: String, required: true, trim: true },
          mimeType: { type: String, required: true, trim: true },
        },
      ],
      default: [],
    },
    statusHistory: {
      type: [
        {
          status: { type: String, required: true },
          actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          actorName: { type: String, required: true, trim: true },
          note: { type: String, trim: true },
          timestamp: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

GrantSchema.index({ organizationId: 1, grantReferenceNumber: 1 }, { unique: true });
GrantSchema.index({ organizationId: 1, status: 1, endDate: 1 });

export const Grant: Model<IGrantDocument> =
  mongoose.models.Grant || mongoose.model<IGrantDocument>('Grant', GrantSchema);

export default Grant;
