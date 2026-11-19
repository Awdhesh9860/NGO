import mongoose, { Schema, Document, Model } from 'mongoose';

export type ExpenseStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'CANCELLED';

export type ExpensePaymentMethod =
  | 'BANK_TRANSFER'
  | 'UPI'
  | 'CHEQUE'
  | 'CASH'
  | 'CARD'
  | 'OTHER';

export interface IExpenseHistoryEntry {
  status: ExpenseStatus;
  actorId: mongoose.Types.ObjectId;
  actorName: string;
  actorRole: string;
  comment?: string;
  timestamp: Date;
}

export interface IExpenseDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  expenseNumber: string;
  title: string;
  description: string;
  category: string;
  /** Integer minor currency units */
  amountMinor: number;
  currency: string;
  expenseDate: Date;
  vendorId?: mongoose.Types.ObjectId;
  vendorBillId?: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  programId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  grantId?: mongoose.Types.ObjectId;
  fundAllocationId?: mongoose.Types.ObjectId;
  expenseAccountId?: mongoose.Types.ObjectId;
  paymentMethod: ExpensePaymentMethod;
  invoiceNumber?: string;
  referenceNumber?: string;
  documentRefs: Array<{
    documentId?: mongoose.Types.ObjectId;
    label: string;
    storageKey: string;
    mimeType: string;
  }>;
  status: ExpenseStatus;
  submittedBy: mongoose.Types.ObjectId;
  submittedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  paidBy?: mongoose.Types.ObjectId;
  paidAt?: Date;
  bankAccountId?: mongoose.Types.ObjectId;
  paymentReference?: string;
  journalEntryId?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  notes?: string;
  allowSelfApprovalPolicy?: boolean;
  history: IExpenseHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseHistorySchema = new Schema<IExpenseHistoryEntry>(
  {
    status: {
      type: String,
      enum: [
        'DRAFT',
        'SUBMITTED',
        'UNDER_REVIEW',
        'APPROVED',
        'REJECTED',
        'PAYMENT_PENDING',
        'PAID',
        'CANCELLED',
      ],
      required: true,
    },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorName: { type: String, required: true, trim: true },
    actorRole: { type: String, required: true, trim: true },
    comment: { type: String, trim: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ExpenseSchema = new Schema<IExpenseDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    expenseNumber: { type: String, required: true, uppercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    amountMinor: { type: Number, required: true, min: 1 },
    currency: { type: String, default: 'INR', uppercase: true, trim: true },
    expenseDate: { type: Date, required: true, index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', index: true },
    vendorBillId: { type: Schema.Types.ObjectId, ref: 'VendorBill' },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
    programId: { type: Schema.Types.ObjectId, ref: 'Program', index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
    grantId: { type: Schema.Types.ObjectId, ref: 'Grant', index: true },
    fundAllocationId: { type: Schema.Types.ObjectId, ref: 'FundAllocation', index: true },
    expenseAccountId: { type: Schema.Types.ObjectId, ref: 'ChartOfAccount' },
    paymentMethod: {
      type: String,
      enum: ['BANK_TRANSFER', 'UPI', 'CHEQUE', 'CASH', 'CARD', 'OTHER'],
      default: 'BANK_TRANSFER',
    },
    invoiceNumber: { type: String, trim: true },
    referenceNumber: { type: String, trim: true },
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
    status: {
      type: String,
      enum: [
        'DRAFT',
        'SUBMITTED',
        'UNDER_REVIEW',
        'APPROVED',
        'REJECTED',
        'PAYMENT_PENDING',
        'PAID',
        'CANCELLED',
      ],
      default: 'DRAFT',
      index: true,
    },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    submittedAt: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    paidBy: { type: Schema.Types.ObjectId, ref: 'User' },
    paidAt: { type: Date },
    bankAccountId: { type: Schema.Types.ObjectId, ref: 'BankAccount' },
    paymentReference: { type: String, trim: true },
    journalEntryId: { type: Schema.Types.ObjectId, ref: 'JournalEntry' },
    rejectionReason: { type: String, trim: true },
    notes: { type: String, trim: true },
    allowSelfApprovalPolicy: { type: Boolean, default: false },
    history: { type: [ExpenseHistorySchema], default: [] },
  },
  { timestamps: true }
);

ExpenseSchema.index({ organizationId: 1, expenseNumber: 1 }, { unique: true });
ExpenseSchema.index({ organizationId: 1, status: 1, expenseDate: -1 });
ExpenseSchema.index({ organizationId: 1, projectId: 1, status: 1 });
ExpenseSchema.index({ organizationId: 1, departmentId: 1, status: 1 });

export const Expense: Model<IExpenseDocument> =
  mongoose.models.Expense || mongoose.model<IExpenseDocument>('Expense', ExpenseSchema);

export default Expense;
