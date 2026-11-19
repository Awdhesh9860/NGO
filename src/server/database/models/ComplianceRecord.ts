import mongoose, { Schema, Document, Model } from 'mongoose';

export type ComplianceRecordType =
  | '12A'
  | '80G'
  | 'PAN'
  | 'TAN'
  | 'NGO_DARPAN'
  | 'CSR_1'
  | 'FCRA'
  | 'ANNUAL_AUDIT'
  | 'FINANCIAL_STATEMENTS'
  | 'BOARD_RESOLUTION'
  | 'ANNUAL_RETURN'
  | 'STATUTORY_FILING'
  | 'CUSTOM';

/**
 * STRICT DISTINCTION:
 * - DOCUMENT_RECORDED means the organization uploaded or recorded details internally (NOT verified compliance).
 * - INDEPENDENTLY_VERIFIED requires privileged `compliance.verify` confirmation after external/CA verification.
 */
export type ComplianceValidityStatus =
  | 'DRAFT'
  | 'DOCUMENT_RECORDED'
  | 'INDEPENDENTLY_VERIFIED'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'NOT_APPLICABLE';

export interface IComplianceRecordDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  complianceType: ComplianceRecordType;
  customTypeName?: string;
  title: string;
  jurisdiction: string; // Configurable per org, e.g., "India", "United States", "United Kingdom"
  isRequiredForOrg: boolean;
  /** Recorded registration/reference number — never fabricated by the system. */
  registrationNumber?: string;
  issuingAuthority?: string;
  issueDate?: Date;
  expiryDate?: Date;
  filingDeadline?: Date;
  reviewDate?: Date;
  validityStatus: ComplianceValidityStatus;
  documentRef?: {
    documentId?: mongoose.Types.ObjectId;
    label: string;
    storageKey: string;
    mimeType: string;
  };
  responsibleUserId?: mongoose.Types.ObjectId;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  verificationNotes?: string;
  renewalHistory: Array<{
    action: string;
    previousExpiryDate?: Date;
    newExpiryDate?: Date;
    actorId: mongoose.Types.ObjectId;
    actorName: string;
    note?: string;
    timestamp: Date;
  }>;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ComplianceRecordSchema = new Schema<IComplianceRecordDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    complianceType: {
      type: String,
      enum: [
        '12A',
        '80G',
        'PAN',
        'TAN',
        'NGO_DARPAN',
        'CSR_1',
        'FCRA',
        'ANNUAL_AUDIT',
        'FINANCIAL_STATEMENTS',
        'BOARD_RESOLUTION',
        'ANNUAL_RETURN',
        'STATUTORY_FILING',
        'CUSTOM',
      ],
      required: true,
      index: true,
    },
    customTypeName: { type: String, trim: true },
    title: { type: String, required: true, trim: true },
    jurisdiction: { type: String, required: true, trim: true, default: 'India' },
    isRequiredForOrg: { type: Boolean, default: true },
    registrationNumber: { type: String, uppercase: true, trim: true },
    issuingAuthority: { type: String, trim: true },
    issueDate: { type: Date },
    expiryDate: { type: Date, index: true },
    filingDeadline: { type: Date, index: true },
    reviewDate: { type: Date },
    validityStatus: {
      type: String,
      enum: [
        'DRAFT',
        'DOCUMENT_RECORDED',
        'INDEPENDENTLY_VERIFIED',
        'EXPIRING_SOON',
        'EXPIRED',
        'NOT_APPLICABLE',
      ],
      default: 'DOCUMENT_RECORDED',
      index: true,
    },
    documentRef: {
      documentId: { type: Schema.Types.ObjectId, ref: 'FinancialDocument' },
      label: { type: String, trim: true },
      storageKey: { type: String, trim: true },
      mimeType: { type: String, trim: true },
    },
    responsibleUserId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    verificationNotes: { type: String, trim: true },
    renewalHistory: {
      type: [
        {
          action: { type: String, required: true, trim: true },
          previousExpiryDate: { type: Date },
          newExpiryDate: { type: Date },
          actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          actorName: { type: String, required: true, trim: true },
          note: { type: String, trim: true },
          timestamp: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    notes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

ComplianceRecordSchema.index({ organizationId: 1, complianceType: 1, title: 1 });
ComplianceRecordSchema.index({ organizationId: 1, validityStatus: 1, expiryDate: 1 });

export const ComplianceRecord: Model<IComplianceRecordDocument> =
  mongoose.models.ComplianceRecord ||
  mongoose.model<IComplianceRecordDocument>('ComplianceRecord', ComplianceRecordSchema);

export default ComplianceRecord;
