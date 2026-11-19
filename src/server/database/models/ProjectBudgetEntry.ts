import mongoose, { Schema, Document, Model } from 'mongoose';

export type BudgetCategory =
  | 'PERSONNEL'
  | 'EQUIPMENT'
  | 'TRAINING'
  | 'TRAVEL'
  | 'INFRASTRUCTURE'
  | 'HEALTHCARE_SUPPLIES'
  | 'EDUCATIONAL_MATERIALS'
  | 'ADMINISTRATION'
  | 'OTHER_OPERATIONAL';

export interface IProjectBudgetEntryDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  budgetPeriod: string; // e.g. 'FY 2026-27' or 'Q1 2026'
  category: BudgetCategory;
  description: string;
  plannedAmount: number;
  actualAmount: number;
  recordedBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectBudgetEntrySchema = new Schema<IProjectBudgetEntryDocument>(
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
    budgetPeriod: { type: String, required: true, trim: true, default: 'FY 2026-27' },
    category: {
      type: String,
      enum: [
        'PERSONNEL',
        'EQUIPMENT',
        'TRAINING',
        'TRAVEL',
        'INFRASTRUCTURE',
        'HEALTHCARE_SUPPLIES',
        'EDUCATIONAL_MATERIALS',
        'ADMINISTRATION',
        'OTHER_OPERATIONAL',
      ],
      required: true,
      index: true,
    },
    description: { type: String, required: true, trim: true },
    plannedAmount: { type: Number, required: true, min: 0 },
    actualAmount: { type: Number, default: 0, min: 0 },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

ProjectBudgetEntrySchema.index({ organizationId: 1, projectId: 1, category: 1 });

export const ProjectBudgetEntry: Model<IProjectBudgetEntryDocument> =
  mongoose.models.ProjectBudgetEntry ||
  mongoose.model<IProjectBudgetEntryDocument>('ProjectBudgetEntry', ProjectBudgetEntrySchema);

export default ProjectBudgetEntry;
