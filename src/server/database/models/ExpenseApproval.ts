import mongoose, { Schema, Document, Model } from 'mongoose';

export type ExpenseApprovalDecision = 'REVIEWED' | 'APPROVED' | 'REJECTED' | 'ESCALATED';

export interface IExpenseApprovalDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  expenseId: mongoose.Types.ObjectId;
  stage: 'DEPARTMENT_REVIEW' | 'FINANCE_VERIFICATION' | 'FINAL_APPROVAL';
  approverId: mongoose.Types.ObjectId;
  approverName: string;
  approverRole: string;
  /** Maximum monetary threshold (in integer minor units) authorized for this approver role at decision time. */
  roleThresholdMinor: number;
  expenseAmountMinor: number;
  decision: ExpenseApprovalDecision;
  comment?: string;
  escalatedToRole?: string;
  decidedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseApprovalSchema = new Schema<IExpenseApprovalDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    expenseId: { type: Schema.Types.ObjectId, ref: 'Expense', required: true, index: true },
    stage: {
      type: String,
      enum: ['DEPARTMENT_REVIEW', 'FINANCE_VERIFICATION', 'FINAL_APPROVAL'],
      required: true,
    },
    approverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approverName: { type: String, required: true, trim: true },
    approverRole: { type: String, required: true, trim: true },
    roleThresholdMinor: { type: Number, required: true, min: 0 },
    expenseAmountMinor: { type: Number, required: true, min: 1 },
    decision: {
      type: String,
      enum: ['REVIEWED', 'APPROVED', 'REJECTED', 'ESCALATED'],
      required: true,
    },
    comment: { type: String, trim: true },
    escalatedToRole: { type: String, trim: true },
    decidedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ExpenseApprovalSchema.index({ organizationId: 1, expenseId: 1, decidedAt: -1 });

export const ExpenseApproval: Model<IExpenseApprovalDocument> =
  mongoose.models.ExpenseApproval ||
  mongoose.model<IExpenseApprovalDocument>('ExpenseApproval', ExpenseApprovalSchema);

export default ExpenseApproval;
