import mongoose, { Schema, Document, Model } from 'mongoose';

export type BudgetLevel = 'ORGANIZATION' | 'DEPARTMENT' | 'PROGRAM' | 'PROJECT';
export type BudgetApprovalStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REVISED' | 'REJECTED';

export interface IBudgetRevision {
  previousPlannedMinor: number;
  newPlannedMinor: number;
  reason: string;
  actorId: mongoose.Types.ObjectId;
  actorName: string;
  timestamp: Date;
}

export interface IBudgetDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  budgetCode: string;
  name: string;
  level: BudgetLevel;
  financialYear: string; // e.g., "FY 2026-27"
  budgetPeriod: string; // e.g., "Annual" or "Q1 FY 2026-27"
  category: string;
  /** Integer minor currency units */
  plannedAmountMinor: number;
  approvedAmountMinor: number;
  currency: string;
  alertThresholdPercent: number; // e.g., 85
  departmentId?: mongoose.Types.ObjectId;
  programId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  /** Authoritative link to Phase 07 ProjectBudgetEntry when bridging existing project budgets without duplication. */
  linkedProjectBudgetEntryId?: mongoose.Types.ObjectId;
  approvalStatus: BudgetApprovalStatus;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
  revisionHistory: IBudgetRevision[];
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetRevisionSchema = new Schema<IBudgetRevision>(
  {
    previousPlannedMinor: { type: Number, required: true, min: 0 },
    newPlannedMinor: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true, trim: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorName: { type: String, required: true, trim: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const BudgetSchema = new Schema<IBudgetDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    budgetCode: { type: String, required: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    level: {
      type: String,
      enum: ['ORGANIZATION', 'DEPARTMENT', 'PROGRAM', 'PROJECT'],
      required: true,
      index: true,
    },
    financialYear: { type: String, required: true, trim: true, index: true },
    budgetPeriod: { type: String, required: true, trim: true, default: 'Annual' },
    category: { type: String, required: true, trim: true, index: true },
    plannedAmountMinor: { type: Number, required: true, min: 1 },
    approvedAmountMinor: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'INR', uppercase: true, trim: true },
    alertThresholdPercent: { type: Number, default: 85, min: 1, max: 100 },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
    programId: { type: Schema.Types.ObjectId, ref: 'Program', index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
    linkedProjectBudgetEntryId: { type: Schema.Types.ObjectId, ref: 'ProjectBudgetEntry' },
    approvalStatus: {
      type: String,
      enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REVISED', 'REJECTED'],
      default: 'DRAFT',
      index: true,
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectionReason: { type: String, trim: true },
    revisionHistory: { type: [BudgetRevisionSchema], default: [] },
    notes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

BudgetSchema.index({ organizationId: 1, budgetCode: 1 }, { unique: true });
BudgetSchema.index({ organizationId: 1, financialYear: 1, level: 1 });

export const Budget: Model<IBudgetDocument> =
  mongoose.models.Budget || mongoose.model<IBudgetDocument>('Budget', BudgetSchema);

export default Budget;
