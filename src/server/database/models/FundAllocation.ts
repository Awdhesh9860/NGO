import mongoose, { Schema, Document, Model } from 'mongoose';

export type FundSourceType = 'DONATION' | 'GRANT' | 'CAMPAIGN' | 'GENERAL_RESERVE';
export type FundRestrictionType = 'UNRESTRICTED' | 'RESTRICTED';
export type FundAllocationStatus = 'ACTIVE' | 'EXHAUSTED' | 'CLOSED';

export interface IFundAllocationHistory {
  action: 'CREATED' | 'UTILIZED' | 'ADJUSTED' | 'CLOSED';
  amountMinor: number;
  note: string;
  actorId: mongoose.Types.ObjectId;
  actorName: string;
  timestamp: Date;
}

export interface IFundAllocationDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  allocationCode: string;
  fundSource: FundSourceType;
  sourceReferenceId: string; // e.g., Donation ID, Grant ID, or Campaign ID
  sourceLabel: string;
  restrictionType: FundRestrictionType;
  /** For RESTRICTED funds, explicit donor/grant permitted purposes (keywords/categories). */
  permittedPurposes: string[];
  permittedProgramId?: mongoose.Types.ObjectId;
  permittedProjectId?: mongoose.Types.ObjectId;
  allocatedProgramId?: mongoose.Types.ObjectId;
  allocatedProjectId?: mongoose.Types.ObjectId;
  allocatedDepartmentId?: mongoose.Types.ObjectId;
  purpose: string;
  /** Integer minor currency units */
  allocatedAmountMinor: number;
  utilizedAmountMinor: number;
  currency: string;
  allocatedDate: Date;
  status: FundAllocationStatus;
  history: IFundAllocationHistory[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FundAllocationHistorySchema = new Schema<IFundAllocationHistory>(
  {
    action: { type: String, enum: ['CREATED', 'UTILIZED', 'ADJUSTED', 'CLOSED'], required: true },
    amountMinor: { type: Number, required: true, min: 0 },
    note: { type: String, required: true, trim: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorName: { type: String, required: true, trim: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const FundAllocationSchema = new Schema<IFundAllocationDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    allocationCode: { type: String, required: true, uppercase: true, trim: true },
    fundSource: {
      type: String,
      enum: ['DONATION', 'GRANT', 'CAMPAIGN', 'GENERAL_RESERVE'],
      required: true,
      index: true,
    },
    sourceReferenceId: { type: String, required: true, trim: true, index: true },
    sourceLabel: { type: String, required: true, trim: true },
    restrictionType: {
      type: String,
      enum: ['UNRESTRICTED', 'RESTRICTED'],
      default: 'UNRESTRICTED',
      index: true,
    },
    permittedPurposes: { type: [String], default: [] },
    permittedProgramId: { type: Schema.Types.ObjectId, ref: 'Program' },
    permittedProjectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    allocatedProgramId: { type: Schema.Types.ObjectId, ref: 'Program', index: true },
    allocatedProjectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
    allocatedDepartmentId: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
    purpose: { type: String, required: true, trim: true },
    allocatedAmountMinor: { type: Number, required: true, min: 1 },
    utilizedAmountMinor: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'INR', uppercase: true, trim: true },
    allocatedDate: { type: Date, default: Date.now, index: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'EXHAUSTED', 'CLOSED'],
      default: 'ACTIVE',
      index: true,
    },
    history: { type: [FundAllocationHistorySchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

FundAllocationSchema.index({ organizationId: 1, allocationCode: 1 }, { unique: true });
FundAllocationSchema.index(
  { organizationId: 1, fundSource: 1, sourceReferenceId: 1, allocatedProjectId: 1, allocatedProgramId: 1, purpose: 1 },
  { unique: true }
);

export const FundAllocation: Model<IFundAllocationDocument> =
  mongoose.models.FundAllocation ||
  mongoose.model<IFundAllocationDocument>('FundAllocation', FundAllocationSchema);

export default FundAllocation;
