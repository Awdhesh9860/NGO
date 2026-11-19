import mongoose, { Schema, Document, Model } from 'mongoose';

export type BeneficiaryEnrollmentStatus =
  | 'ENROLLED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'WITHDRAWN';

export interface IBeneficiaryEnrollmentDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  beneficiaryId: mongoose.Types.ObjectId;
  programId?: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  assistanceCategory: string;
  caseWorkerId?: mongoose.Types.ObjectId;
  enrollmentDate: Date;
  expectedCompletionDate?: Date;
  completionDate?: Date;
  status: BeneficiaryEnrollmentStatus;
  outcomeSummary?: string;
  enrolledBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BeneficiaryEnrollmentSchema = new Schema<IBeneficiaryEnrollmentDocument>(
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
    programId: { type: Schema.Types.ObjectId, ref: 'Program', index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    assistanceCategory: { type: String, required: true, trim: true },
    caseWorkerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    enrollmentDate: { type: Date, default: Date.now },
    expectedCompletionDate: { type: Date },
    completionDate: { type: Date },
    status: {
      type: String,
      enum: ['ENROLLED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'WITHDRAWN'],
      default: 'ENROLLED',
      index: true,
    },
    outcomeSummary: { type: String, trim: true },
    enrolledBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

BeneficiaryEnrollmentSchema.index(
  { organizationId: 1, beneficiaryId: 1, projectId: 1, assistanceCategory: 1 },
  { unique: true }
);

export const BeneficiaryEnrollment: Model<IBeneficiaryEnrollmentDocument> =
  mongoose.models.BeneficiaryEnrollment ||
  mongoose.model<IBeneficiaryEnrollmentDocument>(
    'BeneficiaryEnrollment',
    BeneficiaryEnrollmentSchema
  );

export default BeneficiaryEnrollment;
