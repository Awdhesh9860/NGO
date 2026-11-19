import mongoose, { Schema, Document, Model } from 'mongoose';

export type JournalEntryStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'POSTED'
  | 'REVERSED';

export type JournalReferenceType =
  | 'MANUAL'
  | 'DONATION'
  | 'REFUND'
  | 'EXPENSE'
  | 'VENDOR_BILL'
  | 'GRANT_RECEIPT'
  | 'MEMBERSHIP_FEE'
  | 'BANK_TRANSFER'
  | 'REVERSAL';

export interface IJournalEntryDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  journalNumber: string;
  periodId: mongoose.Types.ObjectId;
  transactionDate: Date;
  description: string;
  referenceType: JournalReferenceType;
  referenceId?: string;
  /** Idempotency key preventing duplicate accounting entries for automated events (donations, refunds, expenses, grants). */
  idempotencyKey?: string;
  status: JournalEntryStatus;
  /** Integer minor currency units — MUST satisfy totalDebitMinor === totalCreditMinor for all posted entries. */
  totalDebitMinor: number;
  totalCreditMinor: number;
  currency: string;
  isReversed: boolean;
  reversedByJournalId?: mongoose.Types.ObjectId;
  reversalOfJournalId?: mongoose.Types.ObjectId;
  reversalReason?: string;
  createdBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  postedBy?: mongoose.Types.ObjectId;
  postedAt?: Date;
  transactionalPost?: boolean;
  transactionNote?: string;
  auditNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JournalEntrySchema = new Schema<IJournalEntryDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    journalNumber: { type: String, required: true, uppercase: true, trim: true },
    periodId: { type: Schema.Types.ObjectId, ref: 'AccountingPeriod', required: true, index: true },
    transactionDate: { type: Date, required: true, index: true },
    description: { type: String, required: true, trim: true },
    referenceType: {
      type: String,
      enum: [
        'MANUAL',
        'DONATION',
        'REFUND',
        'EXPENSE',
        'VENDOR_BILL',
        'GRANT_RECEIPT',
        'MEMBERSHIP_FEE',
        'BANK_TRANSFER',
        'REVERSAL',
      ],
      default: 'MANUAL',
      index: true,
    },
    referenceId: { type: String, trim: true, index: true },
    idempotencyKey: { type: String, trim: true },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'POSTED', 'REVERSED'],
      default: 'DRAFT',
      index: true,
    },
    totalDebitMinor: { type: Number, required: true, min: 0 },
    totalCreditMinor: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR', uppercase: true, trim: true },
    isReversed: { type: Boolean, default: false },
    reversedByJournalId: { type: Schema.Types.ObjectId, ref: 'JournalEntry' },
    reversalOfJournalId: { type: Schema.Types.ObjectId, ref: 'JournalEntry' },
    reversalReason: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    postedAt: { type: Date },
    transactionalPost: { type: Boolean, default: false },
    transactionNote: { type: String, trim: true },
    auditNotes: { type: String, trim: true },
  },
  { timestamps: true }
);

JournalEntrySchema.index({ organizationId: 1, journalNumber: 1 }, { unique: true });
JournalEntrySchema.index(
  { organizationId: 1, idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $exists: true, $type: 'string' } } }
);
JournalEntrySchema.index({ organizationId: 1, status: 1, transactionDate: -1 });
JournalEntrySchema.index({ organizationId: 1, referenceType: 1, referenceId: 1 });

/**
 * IMMUTABILITY GUARD: Posted journal entries cannot be deleted through ordinary application queries.
 */
JournalEntrySchema.pre('deleteOne', function () {
  throw new Error('Posted or historical journal entries cannot be deleted; use traceable reversal entries.');
});
JournalEntrySchema.pre('findOneAndDelete', function () {
  throw new Error('Posted or historical journal entries cannot be deleted; use traceable reversal entries.');
});

export const JournalEntry: Model<IJournalEntryDocument> =
  mongoose.models.JournalEntry ||
  mongoose.model<IJournalEntryDocument>('JournalEntry', JournalEntrySchema);

export default JournalEntry;
