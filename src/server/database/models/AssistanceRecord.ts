import mongoose, { Schema, Document, Model } from 'mongoose';

export type AssistanceDeliveryStatus =
  | 'APPROVED'
  | 'SCHEDULED'
  | 'DELIVERED'
  | 'FOLLOW_UP_DUE'
  | 'COMPLETED'
  | 'CANCELLED';

/**
 * AssistanceRecord tracks actual NGO service/material assistance delivery.
 * STRICT GOVERNANCE INVARIANT:
 * - Recorded independently from fundraising Donations and ProjectBudgetEntry records.
 * - A donation is NEVER treated as proof that a beneficiary received assistance.
 */
export interface IAssistanceRecordDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  beneficiaryId: mongoose.Types.ObjectId;
  enrollmentId?: mongoose.Types.ObjectId;
  programId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  assistanceCategory: string;
  description: string;
  quantityOrUnit?: string;
  deliveryStatus: AssistanceDeliveryStatus;
  scheduledDate?: Date;
  deliveryDate?: Date;
  followUpDate?: Date;
  outcomeNotes?: string;
  approvedBy?: mongoose.Types.ObjectId;
  deliveredBy?: mongoose.Types.ObjectId;
  recordedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AssistanceRecordSchema = new Schema<IAssistanceRecordDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    beneficiaryId: {
      type: Schema.Types.ObjectId,
      ref: 'Beneficiary',
      required: true,
      index: true,
    },
    enrollmentId: { type: Schema.Types.ObjectId, ref: 'BeneficiaryEnrollment', index: true },
    programId: { type: Schema.Types.ObjectId, ref: 'Program', index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
    assistanceCategory: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true, trim: true },
    quantityOrUnit: { type: String, trim: true },
    deliveryStatus: {
      type: String,
      enum: ['APPROVED', 'SCHEDULED', 'DELIVERED', 'FOLLOW_UP_DUE', 'COMPLETED', 'CANCELLED'],
      default: 'APPROVED',
      index: true,
    },
    scheduledDate: { type: Date },
    deliveryDate: { type: Date },
    followUpDate: { type: Date, index: true },
    outcomeNotes: { type: String, trim: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deliveredBy: { type: Schema.Types.ObjectId, ref: 'User' },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

AssistanceRecordSchema.index({ organizationId: 1, beneficiaryId: 1, createdAt: -1 });
AssistanceRecordSchema.index({ organizationId: 1, deliveryStatus: 1, followUpDate: 1 });

export const AssistanceRecord: Model<IAssistanceRecordDocument> =
  mongoose.models.AssistanceRecord ||
  mongoose.model<IAssistanceRecordDocument>('AssistanceRecord', AssistanceRecordSchema);

export default AssistanceRecord;
