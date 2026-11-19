import mongoose, { Schema, Document, Model } from 'mongoose';

export type FinancialDocumentType =
  | 'EXPENSE_INVOICE'
  | 'VENDOR_BILL'
  | 'PAYMENT_PROOF'
  | 'BANK_STATEMENT'
  | 'GRANT_AGREEMENT'
  | 'AUDIT_REPORT'
  | 'FINANCIAL_STATEMENT'
  | 'COMPLIANCE_CERTIFICATE'
  | 'VOUCHER';

export interface IFinancialDocumentRecord extends Document {
  organizationId: mongoose.Types.ObjectId;
  documentType: FinancialDocumentType;
  title: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  /** Storage object key managed by IStorageProvider — no binary payloads persisted inside MongoDB. */
  storageKey: string;
  linkedEntityType:
    | 'EXPENSE'
    | 'VENDOR'
    | 'VENDOR_BILL'
    | 'BANK_ACCOUNT'
    | 'GRANT'
    | 'COMPLIANCE_RECORD'
    | 'JOURNAL_ENTRY';
  linkedEntityId: string;
  isPrivate: boolean;
  version: number;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FinancialDocumentSchema = new Schema<IFinancialDocumentRecord>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      enum: [
        'EXPENSE_INVOICE',
        'VENDOR_BILL',
        'PAYMENT_PROOF',
        'BANK_STATEMENT',
        'GRANT_AGREEMENT',
        'AUDIT_REPORT',
        'FINANCIAL_STATEMENT',
        'COMPLIANCE_CERTIFICATE',
        'VOUCHER',
      ],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    fileName: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true, trim: true },
    sizeBytes: { type: Number, required: true, min: 1 },
    storageKey: { type: String, required: true, trim: true },
    linkedEntityType: {
      type: String,
      enum: [
        'EXPENSE',
        'VENDOR',
        'VENDOR_BILL',
        'BANK_ACCOUNT',
        'GRANT',
        'COMPLIANCE_RECORD',
        'JOURNAL_ENTRY',
      ],
      required: true,
      index: true,
    },
    linkedEntityId: { type: String, required: true, trim: true, index: true },
    isPrivate: { type: Boolean, default: true },
    version: { type: Number, default: 1, min: 1 },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

FinancialDocumentSchema.index({ organizationId: 1, linkedEntityType: 1, linkedEntityId: 1 });

export const FinancialDocument: Model<IFinancialDocumentRecord> =
  mongoose.models.FinancialDocument ||
  mongoose.model<IFinancialDocumentRecord>('FinancialDocument', FinancialDocumentSchema);

export default FinancialDocument;
