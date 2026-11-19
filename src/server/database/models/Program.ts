import mongoose, { Schema, Document, Model } from 'mongoose';

export type ProgramStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ACTIVE'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'ARCHIVED'
  | 'REJECTED';

export interface IProgramKPI {
  name: string;
  targetValue: number;
  currentValue: number;
  unit: string;
}

export interface IProgramDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  code: string;
  shortDescription: string;
  detailedDescription?: string;
  objectives: string[];
  targetAudience?: string;
  focusArea?: string;
  category: string;
  coverImage?: string;
  gallery: string[];
  startDate?: Date;
  endDate?: Date;
  programManagerId?: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  budget: number;
  targetBeneficiaries: number;
  actualBeneficiaries: number;
  geographicCoverage: string[];
  expectedOutcomes: string[];
  kpis: IProgramKPI[];
  status: ProgramStatus;
  isPublicVisible: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProgramKPISchema = new Schema<IProgramKPI>(
  {
    name: { type: String, required: true, trim: true },
    targetValue: { type: Number, required: true, min: 0 },
    currentValue: { type: Number, default: 0, min: 0 },
    unit: { type: String, default: 'units', trim: true },
  },
  { _id: false }
);

const ProgramSchema = new Schema<IProgramDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    shortDescription: { type: String, required: true, trim: true },
    detailedDescription: { type: String, trim: true },
    objectives: [{ type: String, trim: true }],
    targetAudience: { type: String, trim: true },
    focusArea: { type: String, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    coverImage: { type: String, trim: true },
    gallery: [{ type: String, trim: true }],
    startDate: { type: Date },
    endDate: { type: Date },
    programManagerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
    budget: { type: Number, default: 0, min: 0 },
    targetBeneficiaries: { type: Number, default: 0, min: 0 },
    actualBeneficiaries: { type: Number, default: 0, min: 0 },
    geographicCoverage: [{ type: String, trim: true }],
    expectedOutcomes: [{ type: String, trim: true }],
    kpis: [ProgramKPISchema],
    status: {
      type: String,
      enum: [
        'DRAFT',
        'PENDING_APPROVAL',
        'APPROVED',
        'ACTIVE',
        'ON_HOLD',
        'COMPLETED',
        'ARCHIVED',
        'REJECTED',
      ],
      default: 'DRAFT',
      index: true,
    },
    isPublicVisible: { type: Boolean, default: false, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

ProgramSchema.index({ organizationId: 1, slug: 1 }, { unique: true });
ProgramSchema.index({ organizationId: 1, code: 1 }, { unique: true });
ProgramSchema.index({ organizationId: 1, status: 1, createdAt: -1 });

export const Program: Model<IProgramDocument> =
  mongoose.models.Program || mongoose.model<IProgramDocument>('Program', ProgramSchema);

export default Program;
