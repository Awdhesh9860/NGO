import mongoose, { Schema, Document, Model } from 'mongoose';

export type BankReconciliationStatus = 'UNMATCHED' | 'MATCHED' | 'DISCREPANCY';
export type MatchedEntityType = 'DONATION' | 'EXPENSE' | 'VENDOR_BILL' | 'JOURNAL_ENTRY' | 'GRANT';

export interface IBankTransactionDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  bankAccountId: mongoose.Types.ObjectId;
  importBatchId: string;
  transactionDate: Date;
  description: string;
  reference?: string;
  /** Integer minor currency units */
  debitMinor: number;
  creditMinor: number;
  runningBalanceMinor?: number;
  currency: string;
  /** SHA-256 fingerprint preventing duplicate CSV statement imports for the same bank account. */
  rowFingerprint: string;
  importSource: 'CSV_IMPORT' | 'MANUAL';
  /** Immutable snapshot of the raw imported statement line. */
  rawRowSnapshot: string;
  reconciliationStatus: BankReconciliationStatus;
  matchedEntityType?: MatchedEntityType;
  matchedEntityId?: string;
  matchedNote?: string;
  matchedBy?: mongoose.Types.ObjectId;
  matchedAt?: Date;
  importedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BankTransactionSchema = new Schema<IBankTransactionDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    bankAccountId: { type: Schema.Types.ObjectId, ref: 'BankAccount', required: true, index: true },
    importBatchId: { type: String, required: true, trim: true, index: true },
    transactionDate: { type: Date, required: true, index: true },
    description: { type: String, required: true, trim: true },
    reference: { type: String, trim: true, index: true },
    debitMinor: { type: Number, default: 0, min: 0 },
    creditMinor: { type: Number, default: 0, min: 0 },
    runningBalanceMinor: { type: Number },
    currency: { type: String, default: 'INR', uppercase: true, trim: true },
    rowFingerprint: { type: String, required: true, trim: true },
    importSource: {
      type: String,
      enum: ['CSV_IMPORT', 'MANUAL'],
      default: 'CSV_IMPORT',
    },
    rawRowSnapshot: { type: String, required: true },
    reconciliationStatus: {
      type: String,
      enum: ['UNMATCHED', 'MATCHED', 'DISCREPANCY'],
      default: 'UNMATCHED',
      index: true,
    },
    matchedEntityType: {
      type: String,
      enum: ['DONATION', 'EXPENSE', 'VENDOR_BILL', 'JOURNAL_ENTRY', 'GRANT'],
    },
    matchedEntityId: { type: String, trim: true },
    matchedNote: { type: String, trim: true },
    matchedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    matchedAt: { type: Date },
    importedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

BankTransactionSchema.index(
  { organizationId: 1, bankAccountId: 1, rowFingerprint: 1 },
  { unique: true }
);
BankTransactionSchema.index({ organizationId: 1, bankAccountId: 1, reconciliationStatus: 1, transactionDate: -1 });

export const BankTransaction: Model<IBankTransactionDocument> =
  mongoose.models.BankTransaction ||
  mongoose.model<IBankTransactionDocument>('BankTransaction', BankTransactionSchema);

export default BankTransaction;
