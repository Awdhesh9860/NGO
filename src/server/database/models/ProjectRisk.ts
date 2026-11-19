import mongoose, { Schema, Document, Model } from 'mongoose';

export type ProjectRiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ProjectRiskStatus = 'OPEN' | 'MITIGATING' | 'RESOLVED' | 'CLOSED';

export interface IProjectRiskDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  severity: ProjectRiskSeverity;
  likelihood: 'LOW' | 'MEDIUM' | 'HIGH';
  mitigationPlan?: string;
  ownerUserId?: mongoose.Types.ObjectId;
  status: ProjectRiskStatus;
  createdBy: mongoose.Types.ObjectId;
  resolvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectRiskSchema = new Schema<IProjectRiskDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      index: true,
    },
    likelihood: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
    },
    mitigationPlan: { type: String, trim: true },
    ownerUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['OPEN', 'MITIGATING', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
      index: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ProjectRiskSchema.index({ organizationId: 1, projectId: 1, status: 1 });

export const ProjectRisk: Model<IProjectRiskDocument> =
  mongoose.models.ProjectRisk || mongoose.model<IProjectRiskDocument>('ProjectRisk', ProjectRiskSchema);

export default ProjectRisk;
