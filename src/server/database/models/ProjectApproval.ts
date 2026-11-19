import mongoose, { Schema, Document, Model } from 'mongoose';

export type ApprovalEntityType = 'PROGRAM' | 'PROJECT';
export type ApprovalStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
export type ApprovalStage = 'DEPARTMENT_HEAD_REVIEW' | 'MANAGER_EXECUTIVE_APPROVAL';

export interface IApprovalHistoryEntry {
  action: 'SUBMITTED' | 'REVIEWED' | 'APPROVED' | 'REJECTED' | 'RESUBMITTED';
  actorId: mongoose.Types.ObjectId;
  actorName: string;
  actorRole: string;
  comments?: string;
  timestamp: Date;
}

export interface IProjectApprovalDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  entityType: ApprovalEntityType;
  entityId: mongoose.Types.ObjectId;
  entityTitle: string;
  submittedBy: mongoose.Types.ObjectId;
  assignedApproverId?: mongoose.Types.ObjectId;
  stage: ApprovalStage;
  status: ApprovalStatus;
  submissionNotes?: string;
  decisionComments?: string;
  rejectionReason?: string;
  decidedBy?: mongoose.Types.ObjectId;
  decidedAt?: Date | null;
  revisionCount: number;
  history: IApprovalHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const ApprovalHistorySchema = new Schema<IApprovalHistoryEntry>(
  {
    action: {
      type: String,
      enum: ['SUBMITTED', 'REVIEWED', 'APPROVED', 'REJECTED', 'RESUBMITTED'],
      required: true,
    },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorName: { type: String, required: true },
    actorRole: { type: String, required: true },
    comments: { type: String, trim: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ProjectApprovalSchema = new Schema<IProjectApprovalDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: ['PROGRAM', 'PROJECT'],
      required: true,
      index: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    entityTitle: { type: String, required: true, trim: true },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedApproverId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    stage: {
      type: String,
      enum: ['DEPARTMENT_HEAD_REVIEW', 'MANAGER_EXECUTIVE_APPROVAL'],
      default: 'DEPARTMENT_HEAD_REVIEW',
    },
    status: {
      type: String,
      enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    submissionNotes: { type: String, trim: true },
    decisionComments: { type: String, trim: true },
    rejectionReason: { type: String, trim: true },
    decidedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    decidedAt: { type: Date, default: null },
    revisionCount: { type: Number, default: 1, min: 1 },
    history: [ApprovalHistorySchema],
  },
  { timestamps: true }
);

ProjectApprovalSchema.index({ organizationId: 1, entityType: 1, entityId: 1, createdAt: -1 });
ProjectApprovalSchema.index({ organizationId: 1, status: 1 });

export const ProjectApproval: Model<IProjectApprovalDocument> =
  mongoose.models.ProjectApproval ||
  mongoose.model<IProjectApprovalDocument>('ProjectApproval', ProjectApprovalSchema);

export default ProjectApproval;
