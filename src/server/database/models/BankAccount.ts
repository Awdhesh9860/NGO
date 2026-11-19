import mongoose, { Schema, Document, Model } from 'mongoose';

export type BankAccountType =
  | 'SAVINGS'
  | 'CURRENT'
  | 'FCRA_DESIGNATED'
  | 'PROJECT_DESIGNATED'
  | 'PETTY_CASH';

export type BankAccountStatus = 'ACTIVE' | 'INACTIVE' | 'CLOSED';

export interface IBankAccountDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  accountName: string;
  bankName: string;
  branchName?: string;
  accountType: BankAccountType;
  /** Masked display account number (e.g., ••••••8901). Full number NEVER exposed in list endpoints. */
  accountNumberMasked: string;
  /** AES-256-GCM encrypted bank account number; select: false by default. */
  accountNumberEncrypted: string;
  ifscCode?: string;
  swiftCode?: string;
  currency: string;
  /** Integer minor currency units */
  openingBalanceMinor: number;
  ledgerAccountId?: mongoose.Types.ObjectId;
  lastReconciledBalanceMinor?: number;
  lastReconciledAt?: Date;
  status: BankAccountStatus;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BankAccountSchema = new Schema<IBankAccountDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    accountName: { type: String, required: true, trim: true },
    bankName: { type: String, required: true, trim: true },
    branchName: { type: String, trim: true },
    accountType: {
      type: String,
      enum: ['SAVINGS', 'CURRENT', 'FCRA_DESIGNATED', 'PROJECT_DESIGNATED', 'PETTY_CASH'],
      default: 'CURRENT',
    },
    accountNumberMasked: { type: String, required: true, trim: true },
    accountNumberEncrypted: { type: String, required: true, select: false },
    ifscCode: { type: String, uppercase: true, trim: true },
    swiftCode: { type: String, uppercase: true, trim: true },
    currency: { type: String, default: 'INR', uppercase: true, trim: true },
    openingBalanceMinor: { type: Number, default: 0 },
    ledgerAccountId: { type: Schema.Types.ObjectId, ref: 'ChartOfAccount', index: true },
    lastReconciledBalanceMinor: { type: Number },
    lastReconciledAt: { type: Date },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'CLOSED'],
      default: 'ACTIVE',
      index: true,
    },
    notes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

BankAccountSchema.index({ organizationId: 1, accountName: 1 }, { unique: true });

export const BankAccount: Model<IBankAccountDocument> =
  mongoose.models.BankAccount || mongoose.model<IBankAccountDocument>('BankAccount', BankAccountSchema);

export default BankAccount;
