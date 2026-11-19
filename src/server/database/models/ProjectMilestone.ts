import mongoose, { Schema, Document, Model } from 'mongoose';

export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'CANCELLED';

export interface IProjectMilestoneDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  targetDate: Date;
  completionDate?: Date | null;
  status: MilestoneStatus;
  responsibleUserId?: mongoose.Types.ObjectId;
  deliverables: string[];
  completionPercentage: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectMilestoneSchema = new Schema<IProjectMilestoneDocument>(
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
    targetDate: { type: Date, required: true, index: true },
    completionDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    responsibleUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    deliverables: [{ type: String, trim: true }],
    completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

ProjectMilestoneSchema.index({ organizationId: 1, projectId: 1, targetDate: 1 });

export const ProjectMilestone: Model<IProjectMilestoneDocument> =
  mongoose.models.ProjectMilestone ||
  mongoose.model<IProjectMilestoneDocument>('ProjectMilestone', ProjectMilestoneSchema);

export default ProjectMilestone;
