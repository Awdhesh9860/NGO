import mongoose, { Schema, Document, Model } from 'mongoose';

export type VendorBillApprovalStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
export type VendorBillPaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';

export interface IVendorBillDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  billNumber: string;
  billDate: Date;
  dueDate: Date;
  /** Integer minor currency units */
  subtotalMinor: number;
  taxAmountMinor: number;
  totalAmountMinor: number;
  paidAmountMinor: number;
  currency: string;
  taxSummary?: string;
  description: string;
  approvalStatus: VendorBillApprovalStatus;
  paymentStatus: VendorBillPaymentStatus;
  linkedExpenseId?: mongoose.Types.ObjectId;
  journalEntryId?: mongoose.Types.ObjectId;
  attachments: Array<{
    documentId?: mongoose.Types.ObjectId;
    label: string;
    storageKey: string;
    mimeType: string;
  }>;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const VendorBillSchema = new Schema<IVendorBillDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    billNumber: { type: String, required: true, uppercase: true, trim: true },
    billDate: { type: Date, required: true, index: true },
    dueDate: { type: Date, required: true, index: true },
    subtotalMinor: { type: Number, required: true, min: 1 },
    taxAmountMinor: { type: Number, default: 0, min: 0 },
    totalAmountMinor: { type: Number, required: true, min: 1 },
    paidAmountMinor: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'INR', uppercase: true, trim: true },
    taxSummary: { type: String, trim: true },
    description: { type: String, required: true, trim: true },
    approvalStatus: {
      type: String,
      enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'],
      default: 'PENDING_APPROVAL',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PARTIALLY_PAID', 'PAID', 'CANCELLED'],
      default: 'UNPAID',
      index: true,
    },
    linkedExpenseId: { type: Schema.Types.ObjectId, ref: 'Expense' },
    journalEntryId: { type: Schema.Types.ObjectId, ref: 'JournalEntry' },
    attachments: {
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
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

/** Prevents duplicate bill numbers for the same vendor within an organization. */
VendorBillSchema.index({ organizationId: 1, vendorId: 1, billNumber: 1 }, { unique: true });
VendorBillSchema.index({ organizationId: 1, paymentStatus: 1, dueDate: 1 });

export const VendorBill: Model<IVendorBillDocument> =
  mongoose.models.VendorBill || mongoose.model<IVendorBillDocument>('VendorBill', VendorBillSchema);

export default VendorBill;
