import mongoose, { Schema, Document, Model } from 'mongoose';

export type DonorType = 'INDIVIDUAL' | 'CORPORATE' | 'INSTITUTIONAL' | 'FOUNDATION';
export type DonorStatus = 'ACTIVE' | 'INACTIVE' | 'DO_NOT_CONTACT';

export interface IDonorDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  donorType: DonorType;
  organizationName?: string;
  address: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  communicationPreferences: {
    emailReceipts: boolean;
    campaignUpdates: boolean;
    newsletters: boolean;
    smsAlerts: boolean;
  };
  anonymousDisplayDefault: boolean;
  taxDetails: {
    panNumber?: string;
  };
  firstDonationAt?: Date | null;
  lastDonationAt?: Date | null;
  /** Lifetime verified successful minus refunded integer minor currency units. */
  lifetimeAmountMinor: number;
  /** Count of verified successful donations. */
  donationCount: number;
  hasActiveRecurring: boolean;
  status: DonorStatus;
  /** Restricted internal donor notes visible only to users with donors.view_sensitive permission. */
  internalNotes?: string;
  tags: string[];
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DonorSchema = new Schema<IDonorDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    donorType: {
      type: String,
      enum: ['INDIVIDUAL', 'CORPORATE', 'INSTITUTIONAL', 'FOUNDATION'],
      default: 'INDIVIDUAL',
      index: true,
    },
    organizationName: { type: String, trim: true },
    address: {
      line1: { type: String, trim: true },
      line2: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, default: 'India', trim: true },
    },
    communicationPreferences: {
      emailReceipts: { type: Boolean, default: true },
      campaignUpdates: { type: Boolean, default: true },
      newsletters: { type: Boolean, default: false },
      smsAlerts: { type: Boolean, default: false },
    },
    anonymousDisplayDefault: { type: Boolean, default: false },
    taxDetails: {
      panNumber: { type: String, uppercase: true, trim: true },
    },
    firstDonationAt: { type: Date, default: null },
    lastDonationAt: { type: Date, default: null },
    lifetimeAmountMinor: { type: Number, default: 0, min: 0 },
    donationCount: { type: Number, default: 0, min: 0 },
    hasActiveRecurring: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'DO_NOT_CONTACT'],
      default: 'ACTIVE',
      index: true,
    },
    internalNotes: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

DonorSchema.index({ organizationId: 1, email: 1 }, { unique: true });
DonorSchema.index({ organizationId: 1, status: 1, lifetimeAmountMinor: -1 });

export const Donor: Model<IDonorDocument> =
  mongoose.models.Donor || mongoose.model<IDonorDocument>('Donor', DonorSchema);

export default Donor;
