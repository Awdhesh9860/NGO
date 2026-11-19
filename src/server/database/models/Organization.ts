import mongoose, { Schema, Document, Model } from 'mongoose';

export type OrganizationStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
export type VerificationStatus = 'unverified' | 'pending' | 'verified';

export interface IOrganizationDocument extends Document {
  name: string;
  legalName?: string;
  slug: string;
  customDomain?: string;
  logo?: string;
  description?: string;
  website?: string;
  contactEmail: string;
  contactPhone?: string;
  headquartersAddress?: string;
  status: OrganizationStatus;
  verificationStatus: VerificationStatus;
  verifiedAt?: Date;
  identity: {
    registrationType?: string;
    registrationNumber?: string;
    registeredAddress?: string;
    establishmentDate?: string;
  };
  statutory: {
    panNumber?: string;
    section80GNumber?: string;
    section80GValidFrom?: string;
    section80GValidTo?: string;
    is80GVerified?: boolean;
    section12ANumber?: string;
    section12AValidFrom?: string;
    section12AValidTo?: string;
    is12AVerified?: boolean;
    fcraNumber?: string;
    darpanId?: string;
    taxExemptionPercentage: number;
  };
  regional: {
    country: string;
    state?: string;
    district?: string;
    timezone: string;
    currencyCode: string;
    currencySymbol: string;
    dateFormat: string;
    language: string;
  };
  securitySettings: {
    sessionTimeoutMinutes: number;
    minPasswordLength: number;
    requireStrongPassword: boolean;
    maxFailedLoginAttempts: number;
    invitationExpiryDays: number;
    twoFactorPolicy: 'optional' | 'recommended' | 'required_for_admins';
  };
  notificationSettings: {
    emailNotifications: boolean;
    adminAlerts: boolean;
    invitationNotifications: boolean;
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
    legalName: { type: String, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    customDomain: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    logo: { type: String },
    description: { type: String, trim: true },
    website: { type: String, trim: true },
    contactEmail: { type: String, required: true, lowercase: true, trim: true },
    contactPhone: { type: String, trim: true },
    headquartersAddress: { type: String },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'],
      default: 'ACTIVE',
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified'],
      default: 'unverified',
    },
    verifiedAt: { type: Date },
    identity: {
      registrationType: { type: String, trim: true },
      registrationNumber: { type: String, trim: true },
      registeredAddress: { type: String, trim: true },
      establishmentDate: { type: String, trim: true },
    },
    statutory: {
      panNumber: { type: String },
      section80GNumber: { type: String },
      section80GValidFrom: { type: String },
      section80GValidTo: { type: String },
      is80GVerified: { type: Boolean, default: false },
      section12ANumber: { type: String },
      section12AValidFrom: { type: String },
      section12AValidTo: { type: String },
      is12AVerified: { type: Boolean, default: false },
      fcraNumber: { type: String },
      darpanId: { type: String },
      taxExemptionPercentage: { type: Number, default: 50 },
    },
    regional: {
      country: { type: String, default: 'India' },
      state: { type: String, default: '' },
      district: { type: String, default: '' },
      timezone: { type: String, default: 'Asia/Kolkata' },
      currencyCode: { type: String, default: 'INR' },
      currencySymbol: { type: String, default: '₹' },
      dateFormat: { type: String, default: 'DD/MM/YYYY' },
      language: { type: String, default: 'en' },
    },
    securitySettings: {
      sessionTimeoutMinutes: { type: Number, default: 10080, min: 15 }, // 7 days default
      minPasswordLength: { type: Number, default: 8, min: 8, max: 64 },
      requireStrongPassword: { type: Boolean, default: true },
      maxFailedLoginAttempts: { type: Number, default: 5, min: 3, max: 20 },
      invitationExpiryDays: { type: Number, default: 7, min: 1, max: 30 },
      twoFactorPolicy: {
        type: String,
        enum: ['optional', 'recommended', 'required_for_admins'],
        default: 'recommended',
      },
    },
    notificationSettings: {
      emailNotifications: { type: Boolean, default: true },
      adminAlerts: { type: Boolean, default: true },
      invitationNotifications: { type: Boolean, default: true },
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
