import mongoose, { Schema, Document, Model } from 'mongoose';

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
export type NormalBalance = 'DEBIT' | 'CREDIT';

export interface IChartOfAccountDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  code: string;
  name: string;
  accountType: AccountType;
  category: string;
  normalBalance: NormalBalance;
  parentAccountId?: mongoose.Types.ObjectId;
  description?: string;
  isSystemAccount: boolean;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export function getNormalBalanceForAccountType(type: AccountType): NormalBalance {
  return type === 'ASSET' || type === 'EXPENSE' ? 'DEBIT' : 'CREDIT';
}

const ChartOfAccountSchema = new Schema<IChartOfAccountDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    code: { type: String, required: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    accountType: {
      type: String,
      enum: ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'],
      required: true,
      index: true,
    },
    category: { type: String, required: true, trim: true },
    normalBalance: {
      type: String,
      enum: ['DEBIT', 'CREDIT'],
      required: true,
    },
    parentAccountId: { type: Schema.Types.ObjectId, ref: 'ChartOfAccount', index: true },
    description: { type: String, trim: true },
    isSystemAccount: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

ChartOfAccountSchema.index({ organizationId: 1, code: 1 }, { unique: true });
ChartOfAccountSchema.index({ organizationId: 1, accountType: 1, isActive: 1 });

export const ChartOfAccount: Model<IChartOfAccountDocument> =
  mongoose.models.ChartOfAccount ||
  mongoose.model<IChartOfAccountDocument>('ChartOfAccount', ChartOfAccountSchema);

export default ChartOfAccount;
