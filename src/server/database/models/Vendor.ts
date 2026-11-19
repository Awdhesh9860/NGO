import mongoose, { Schema, Document, Model } from 'mongoose';

export type VendorStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface IVendorDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  vendorCode: string;
  name: string;
  vendorType: string; // e.g., 'SUPPLIER', 'CONSULTANT', 'SERVICE_PROVIDER', 'LANDLORD', 'UTILITY', 'OTHER'
  contactPerson?: string;
  email?: string;
  mobileNumber?: string;
  address?: string;
  taxIdentifier?: string; // e.g., GSTIN / PAN / EIN when legally required
  bankName?: string;
  bankBranch?: string;
  ifscCode?: string;
  /** Masked display string (e.g., ••••••1234). Full number is ONLY stored encrypted below. */
  bankAccountMasked?: string;
  /** AES-256-GCM encrypted bank account number; never returned in general APIs. */
  bankAccountEncrypted?: string;
  beneficiaryAccountName?: string;
  status: VendorStatus;
  documentRefs: Array<{
    documentId?: mongoose.Types.ObjectId;
    label: string;
    storageKey: string;
    mimeType: string;
  }>;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema = new Schema<IVendorDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    vendorCode: { type: String, required: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    vendorType: { type: String, required: true, trim: true, default: 'SUPPLIER' },
    contactPerson: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    mobileNumber: { type: String, trim: true },
    address: { type: String, trim: true },
    taxIdentifier: { type: String, uppercase: true, trim: true },
    bankName: { type: String, trim: true },
    bankBranch: { type: String, trim: true },
    ifscCode: { type: String, uppercase: true, trim: true },
    bankAccountMasked: { type: String, trim: true },
    bankAccountEncrypted: { type: String, select: false },
    beneficiaryAccountName: { type: String, trim: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
      index: true,
    },
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
    notes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

VendorSchema.index({ organizationId: 1, vendorCode: 1 }, { unique: true });
VendorSchema.index({ organizationId: 1, name: 1 });

export const Vendor: Model<IVendorDocument> =
  mongoose.models.Vendor || mongoose.model<IVendorDocument>('Vendor', VendorSchema);

export default Vendor;
