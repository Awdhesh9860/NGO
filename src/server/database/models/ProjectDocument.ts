import mongoose, { Schema, Document, Model } from 'mongoose';

export type ProjectDocumentCategory =
  | 'PROPOSAL'
  | 'APPROVAL'
  | 'AGREEMENT'
  | 'REPORT'
  | 'PROGRESS_PHOTO'
  | 'COMPLETION_REPORT'
  | 'SUPPORTING';

export type DocumentVisibility = 'INTERNAL' | 'RESTRICTED' | 'PUBLIC_APPROVED';

export interface IProjectDocumentRecord extends Document {
  organizationId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  title: string;
  category: ProjectDocumentCategory;
  fileName: string;
  storageKey: string;
  fileUrl: string;
  mimeType: string;
  fileSizeBytes: number;
  visibility: DocumentVisibility;
  description?: string;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectDocumentSchema = new Schema<IProjectDocumentRecord>(
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
    category: {
      type: String,
      enum: [
        'PROPOSAL',
        'APPROVAL',
        'AGREEMENT',
        'REPORT',
        'PROGRESS_PHOTO',
        'COMPLETION_REPORT',
        'SUPPORTING',
      ],
      required: true,
      index: true,
    },
    fileName: { type: String, required: true, trim: true },
    storageKey: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true, trim: true },
    fileSizeBytes: { type: Number, required: true, min: 1 },
    visibility: {
      type: String,
      enum: ['INTERNAL', 'RESTRICTED', 'PUBLIC_APPROVED'],
      default: 'INTERNAL',
      index: true,
    },
    description: { type: String, trim: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

ProjectDocumentSchema.index({ organizationId: 1, projectId: 1, category: 1 });

export const ProjectDocument: Model<IProjectDocumentRecord> =
  mongoose.models.ProjectDocument ||
  mongoose.model<IProjectDocumentRecord>('ProjectDocument', ProjectDocumentSchema);

export default ProjectDocument;
