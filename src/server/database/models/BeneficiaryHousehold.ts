import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBeneficiaryHouseholdDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  householdCode: string;
  headOfHouseholdName: string;
  contactPhone?: string;
  memberCount: number;
  district: string;
  village?: string;
  state?: string;
  addressSummary?: string;
  primaryProgramId?: mongoose.Types.ObjectId;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BeneficiaryHouseholdSchema = new Schema<IBeneficiaryHouseholdDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    householdCode: { type: String, required: true, uppercase: true, trim: true },
    headOfHouseholdName: { type: String, required: true, trim: true },
    contactPhone: { type: String, trim: true },
    memberCount: { type: Number, default: 1, min: 1, max: 50 },
    district: { type: String, required: true, trim: true, index: true },
    village: { type: String, trim: true },
    state: { type: String, trim: true },
    addressSummary: { type: String, trim: true },
    primaryProgramId: { type: Schema.Types.ObjectId, ref: 'Program' },
    notes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

BeneficiaryHouseholdSchema.index({ organizationId: 1, householdCode: 1 }, { unique: true });

export const BeneficiaryHousehold: Model<IBeneficiaryHouseholdDocument> =
  mongoose.models.BeneficiaryHousehold ||
  mongoose.model<IBeneficiaryHouseholdDocument>('BeneficiaryHousehold', BeneficiaryHouseholdSchema);

export default BeneficiaryHousehold;
