import mongoose, { Schema, Document, Model } from 'mongoose';

export type TaskStatus =
  | 'TODO'
  | 'IN_PROGRESS'
  | 'REVIEW'
  | 'BLOCKED'
  | 'COMPLETED'
  | 'CANCELLED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ITaskComment {
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  body: string;
  createdAt: Date;
}

export interface ITaskAttachment {
  fileName: string;
  fileUrl: string;
  mimeType?: string;
}

export interface ITaskDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  programId?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  assignedUserId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  priority: TaskPriority;
  startDate?: Date;
  dueDate?: Date;
  estimatedEffortHours?: number;
  actualEffortHours?: number;
  status: TaskStatus;
  completionPercentage: number;
  attachments: ITaskAttachment[];
  comments: ITaskComment[];
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITaskDocument>(
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
    programId: {
      type: Schema.Types.ObjectId,
      ref: 'Program',
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    assignedUserId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
      index: true,
    },
    startDate: { type: Date },
    dueDate: { type: Date, index: true },
    estimatedEffortHours: { type: Number, min: 0 },
    actualEffortHours: { type: Number, min: 0, default: 0 },
    status: {
      type: String,
      enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'BLOCKED', 'COMPLETED', 'CANCELLED'],
      default: 'TODO',
      index: true,
    },
    completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
    attachments: [
      {
        fileName: { type: String, required: true, trim: true },
        fileUrl: { type: String, required: true, trim: true },
        mimeType: { type: String, trim: true },
      },
    ],
    comments: [
      {
        authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        authorName: { type: String, required: true },
        body: { type: String, required: true, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

TaskSchema.index({ organizationId: 1, projectId: 1, status: 1 });
TaskSchema.index({ organizationId: 1, assignedUserId: 1, status: 1 });
TaskSchema.index({ organizationId: 1, dueDate: 1 });

export const Task: Model<ITaskDocument> =
  mongoose.models.Task || mongoose.model<ITaskDocument>('Task', TaskSchema);

export default Task;
