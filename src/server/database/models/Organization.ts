import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrganizationDocument extends Document {
  name: string;
  slug: string;
  customDomain?: string;
  logo?: string;
  contactEmail: string;
  contactPhone?: string;
  headquartersAddress?: string;
  statutory: {
    panNumber?: string;
    section80GNumber?: string;
    section12ANumber?: string;
    fcraNumber?: string;
    darpanId?: string;
    taxExemptionPercentage: number;
  };
  settings: {
    currencyCode: string;
    currencySymbol: string;
    defaultLocale: string;
    autoSendReceipts: boolean;
    maintenanceMode: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganizationDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    customDomain: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    logo: { type: String },
    contactEmail: { type: String, required: true, lowercase: true, trim: true },
    contactPhone: { type: String, trim: true },
    headquartersAddress: { type: String },
    statutory: {
      panNumber: { type: String },
      section80GNumber: { type: String },
      section12ANumber: { type: String },
      fcraNumber: { type: String },
      darpanId: { type: String },
      taxExemptionPercentage: { type: Number, default: 50 },
    },
    settings: {
      currencyCode: { type: String, default: 'INR' },
      currencySymbol: { type: String, default: '₹' },
      defaultLocale: { type: String, default: 'en' },
      autoSendReceipts: { type: Boolean, default: true },
      maintenanceMode: { type: Boolean, default: false },
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const Organization: Model<IOrganizationDocument> =
  mongoose.models.Organization || mongoose.model<IOrganizationDocument>('Organization', OrganizationSchema);

export default Organization;
