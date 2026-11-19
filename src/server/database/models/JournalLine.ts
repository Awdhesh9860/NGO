import mongoose, { Schema, Document, Model } from 'mongoose';
import { AccountType } from './ChartOfAccount';

export interface IJournalLineDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  journalEntryId: mongoose.Types.ObjectId;
  periodId: mongoose.Types.ObjectId;
  transactionDate: Date;
  accountId: mongoose.Types.ObjectId;
  accountCodeSnapshot: string;
  accountNameSnapshot: string;
  accountTypeSnapshot: AccountType;
  /** Integer minor currency units — each line has either debitMinor > 0 OR creditMinor > 0, never both. */
  debitMinor: number;
  creditMinor: number;
  currency: string;
  description?: string;
  isPosted: boolean;
  programId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  campaignId?: mongoose.Types.ObjectId;
  grantId?: mongoose.Types.ObjectId;
  fundAllocationId?: mongoose.Types.ObjectId;
  vendorId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const JournalLineSchema = new Schema<IJournalLineDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    journalEntryId: {
      type: Schema.Types.ObjectId,
      ref: 'JournalEntry',
      required: true,
      index: true,
    },
    periodId: {
      type: Schema.Types.ObjectId,
      ref: 'AccountingPeriod',
      required: true,
      index: true,
    },
    transactionDate: { type: Date, required: true, index: true },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'ChartOfAccount',
      required: true,
      index: true,
    },
    accountCodeSnapshot: { type: String, required: true, uppercase: true, trim: true },
    accountNameSnapshot: { type: String, required: true, trim: true },
    accountTypeSnapshot: {
      type: String,
      enum: ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'],
      required: true,
      index: true,
    },
    debitMinor: { type: Number, required: true, min: 0, default: 0 },
    creditMinor: { type: Number, required: true, min: 0, default: 0 },
    currency: { type: String, default: 'INR', uppercase: true, trim: true },
    description: { type: String, trim: true },
    isPosted: { type: Boolean, default: false, index: true },
    programId: { type: Schema.Types.ObjectId, ref: 'Program', index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', index: true },
    grantId: { type: Schema.Types.ObjectId, ref: 'Grant', index: true },
    fundAllocationId: { type: Schema.Types.ObjectId, ref: 'FundAllocation', index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', index: true },
  },
  { timestamps: true }
);

JournalLineSchema.index({ organizationId: 1, isPosted: 1, accountId: 1, transactionDate: -1 });
JournalLineSchema.index({ organizationId: 1, isPosted: 1, accountTypeSnapshot: 1, transactionDate: -1 });
JournalLineSchema.index({ organizationId: 1, isPosted: 1, projectId: 1, programId: 1, departmentId: 1 });
JournalLineSchema.index({ organizationId: 1, isPosted: 1, grantId: 1, fundAllocationId: 1 });

export const JournalLine: Model<IJournalLineDocument> =
  mongoose.models.JournalLine ||
  mongoose.model<IJournalLineDocument>('JournalLine', JournalLineSchema);

export default JournalLine;
