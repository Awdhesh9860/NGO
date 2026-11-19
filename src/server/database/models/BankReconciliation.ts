import mongoose, { Schema, Document, Model } from 'mongoose';

export type ReconciliationSessionStatus =
  | 'IN_PROGRESS'
  | 'COMPLETED_WITH_UNMATCHED'
  | 'RECONCILED';

export interface IBankReconciliationDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  bankAccountId: mongoose.Types.ObjectId;
  statementFromDate: Date;
  statementToDate: Date;
  /** Integer minor currency units */
  statementClosingBalanceMinor: number;
  ledgerBalanceMinor: number;
  differenceMinor: number;
  matchedCount: number;
  unmatchedCount: number;
  status: ReconciliationSessionStatus;
  reconciledBy: mongoose.Types.ObjectId;
  reconciledAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BankReconciliationSchema = new Schema<IBankReconciliationDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    bankAccountId: { type: Schema.Types.ObjectId, ref: 'BankAccount', required: true, index: true },
    statementFromDate: { type: Date, required: true },
    statementToDate: { type: Date, required: true },
    statementClosingBalanceMinor: { type: Number, required: true },
    ledgerBalanceMinor: { type: Number, required: true },
    differenceMinor: { type: Number, required: true },
    matchedCount: { type: Number, default: 0, min: 0 },
    unmatchedCount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['IN_PROGRESS', 'COMPLETED_WITH_UNMATCHED', 'RECONCILED'],
      default: 'IN_PROGRESS',
      index: true,
    },
    reconciledBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reconciledAt: { type: Date, default: Date.now },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

BankReconciliationSchema.index({ organizationId: 1, bankAccountId: 1, reconciledAt: -1 });

export const BankReconciliation: Model<IBankReconciliationDocument> =
  mongoose.models.BankReconciliation ||
  mongoose.model<IBankReconciliationDocument>('BankReconciliation', BankReconciliationSchema);

export default BankReconciliation;
