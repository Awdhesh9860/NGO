import mongoose, { Schema, Document, Model } from 'mongoose';

export type VerificationDecision =
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED'
  | 'REASSESSMENT_REQUIRED';

export interface IEligibilityCriterionCheck {
  criterion: string;
  met: boolean;
  notes?: string;
}

export interface IBeneficiaryVerificationDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  beneficiaryId: mongoose.Types.ObjectId;
  programId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  checklist: IEligibilityCriterionCheck[];
  supportingDocumentRefsReviewed: string[];
  decision: VerificationDecision;
  /** Mandatory documented rationale for human eligibility review */
  decisionReason: string;
  humanReviewed: boolean;
  reviewedBy: mongoose.Types.ObjectId;
  reviewedAt: Date;
  reassessmentDueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BeneficiaryVerificationSchema = new Schema<IBeneficiaryVerificationDocument>(
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
    programId: { type: Schema.Types.ObjectId, ref: 'Program' },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    checklist: [
      {
        criterion: { type: String, required: true, trim: true },
        met: { type: Boolean, required: true },
        notes: { type: String, trim: true },
      },
    ],
    supportingDocumentRefsReviewed: [{ type: String, trim: true }],
    decision: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED', 'REASSESSMENT_REQUIRED'],
      required: true,
      index: true,
    },
    decisionReason: { type: String, required: true, trim: true },
    humanReviewed: { type: Boolean, required: true, default: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reviewedAt: { type: Date, default: Date.now },
    reassessmentDueDate: { type: Date },
  },
  { timestamps: true }
);

BeneficiaryVerificationSchema.index({ organizationId: 1, beneficiaryId: 1, createdAt: -1 });

export const BeneficiaryVerification: Model<IBeneficiaryVerificationDocument> =
  mongoose.models.BeneficiaryVerification ||
  mongoose.model<IBeneficiaryVerificationDocument>(
    'BeneficiaryVerification',
    BeneficiaryVerificationSchema
  );

export default BeneficiaryVerification;
