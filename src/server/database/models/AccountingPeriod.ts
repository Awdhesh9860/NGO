import mongoose, { Schema, Document, Model } from 'mongoose';

export type AccountingPeriodStatus = 'OPEN' | 'CLOSED' | 'LOCKED';

export interface IPeriodAuditAction {
  action: 'OPENED' | 'CLOSED' | 'LOCKED' | 'REOPENED';
  actorId: mongoose.Types.ObjectId;
  actorName: string;
  reason?: string;
  timestamp: Date;
}

export interface IAccountingPeriodDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  financialYearLabel: string; // e.g., "FY 2026-27" or "2026"
  periodName: string; // e.g., "Q1 FY 2026-27" or "Apr 2026 - Mar 2027"
  startDate: Date;
  endDate: Date;
  status: AccountingPeriodStatus;
  closedBy?: mongoose.Types.ObjectId;
  closedAt?: Date;
  lockedBy?: mongoose.Types.ObjectId;
  lockedAt?: Date;
  history: IPeriodAuditAction[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PeriodAuditActionSchema = new Schema<IPeriodAuditAction>(
  {
    action: { type: String, enum: ['OPENED', 'CLOSED', 'LOCKED', 'REOPENED'], required: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorName: { type: String, required: true, trim: true },
    reason: { type: String, trim: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const AccountingPeriodSchema = new Schema<IAccountingPeriodDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    financialYearLabel: { type: String, required: true, trim: true, index: true },
    periodName: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED', 'LOCKED'],
      default: 'OPEN',
      index: true,
    },
    closedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    closedAt: { type: Date },
    lockedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lockedAt: { type: Date },
    history: { type: [PeriodAuditActionSchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

AccountingPeriodSchema.index({ organizationId: 1, financialYearLabel: 1, periodName: 1 }, { unique: true });
AccountingPeriodSchema.index({ organizationId: 1, startDate: 1, endDate: 1 });

export const AccountingPeriod: Model<IAccountingPeriodDocument> =
  mongoose.models.AccountingPeriod ||
  mongoose.model<IAccountingPeriodDocument>('AccountingPeriod', AccountingPeriodSchema);

export default AccountingPeriod;
