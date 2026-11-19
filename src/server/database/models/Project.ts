import mongoose, { Schema, Document, Model } from 'mongoose';

export type ProjectStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'PLANNED'
  | 'ACTIVE'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ARCHIVED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ProjectAccessLevel = 'LEAD' | 'CONTRIBUTOR' | 'VIEWER';

export interface IProjectTeamAssignment {
  userId: mongoose.Types.ObjectId;
  responsibility: string;
  accessLevel: ProjectAccessLevel;
  assignedAt: Date;
  assignedBy?: mongoose.Types.ObjectId;
}

export interface IBeneficiaryDemographicSummary {
  groupLabel: string; // e.g. 'Women (18-45)', 'Rural Youth', 'Senior Citizens' — strictly aggregated, zero PII
  count: number;
}

export interface IProjectBeneficiarySummary {
  targetCount: number;
  actualCount: number;
  categories: string[];
  geographicCoverage: string[];
  includesMinorBeneficiaries: boolean;
  safeguardingVerified: boolean;
  demographics: IBeneficiaryDemographicSummary[];
  participationNotes?: string;
  outcomeSummary?: string;
}

export interface IProjectDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  programId?: mongoose.Types.ObjectId;
  name: string;
  code: string;
  slug: string;
  shortDescription: string;
  detailedDescription?: string;
  category: string;
  projectManagerId?: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  teamMembers: IProjectTeamAssignment[];
  startDate?: Date;
  endDate?: Date;
  location?: string;
  state?: string;
  district?: string;
  block?: string;
  village?: string;
  coordinates?: {
    lat?: number;
    lng?: number;
  };
  approvedBudget: number;
  targetBeneficiaries: number;
  actualBeneficiaries: number;
  beneficiarySummary: IProjectBeneficiarySummary;
  expectedOutcomes: string[];
  keyDeliverables: string[];
  riskLevel: RiskLevel;
  priority: PriorityLevel;
  progressPercentage: number;
  images: string[];
  status: ProjectStatus;
  isPublicVisible: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectTeamSchema = new Schema<IProjectTeamAssignment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    responsibility: { type: String, required: true, trim: true, default: 'Field Execution' },
    accessLevel: {
      type: String,
      enum: ['LEAD', 'CONTRIBUTOR', 'VIEWER'],
      default: 'CONTRIBUTOR',
    },
    assignedAt: { type: Date, default: Date.now },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const BeneficiaryDemographicSchema = new Schema<IBeneficiaryDemographicSummary>(
  {
    groupLabel: { type: String, required: true, trim: true },
    count: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProjectDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    programId: {
      type: Schema.Types.ObjectId,
      ref: 'Program',
      index: true,
    },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    shortDescription: { type: String, required: true, trim: true },
    detailedDescription: { type: String, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    projectManagerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
    teamMembers: [ProjectTeamSchema],
    startDate: { type: Date },
    endDate: { type: Date },
    location: { type: String, trim: true },
    state: { type: String, trim: true, index: true },
    district: { type: String, trim: true, index: true },
    block: { type: String, trim: true },
    village: { type: String, trim: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    approvedBudget: { type: Number, default: 0, min: 0 },
    targetBeneficiaries: { type: Number, default: 0, min: 0 },
    actualBeneficiaries: { type: Number, default: 0, min: 0 },
    beneficiarySummary: {
      targetCount: { type: Number, default: 0, min: 0 },
      actualCount: { type: Number, default: 0, min: 0 },
      categories: [{ type: String, trim: true }],
      geographicCoverage: [{ type: String, trim: true }],
      includesMinorBeneficiaries: { type: Boolean, default: false },
      safeguardingVerified: { type: Boolean, default: false },
      demographics: [BeneficiaryDemographicSchema],
      participationNotes: { type: String, trim: true },
      outcomeSummary: { type: String, trim: true },
    },
    expectedOutcomes: [{ type: String, trim: true }],
    keyDeliverables: [{ type: String, trim: true }],
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    images: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: [
        'DRAFT',
        'PENDING_APPROVAL',
        'APPROVED',
        'PLANNED',
        'ACTIVE',
        'ON_HOLD',
        'COMPLETED',
        'CANCELLED',
        'ARCHIVED',
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

ProjectSchema.index({ organizationId: 1, slug: 1 }, { unique: true });
ProjectSchema.index({ organizationId: 1, code: 1 }, { unique: true });
ProjectSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
ProjectSchema.index({ organizationId: 1, programId: 1 });
ProjectSchema.index({ organizationId: 1, 'teamMembers.userId': 1 });

export const Project: Model<IProjectDocument> =
  mongoose.models.Project || mongoose.model<IProjectDocument>('Project', ProjectSchema);

export default Project;
