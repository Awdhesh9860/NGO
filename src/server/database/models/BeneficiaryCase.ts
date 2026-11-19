import mongoose, { Schema, Document, Model } from 'mongoose';

export type BeneficiaryCaseStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_INFORMATION'
  | 'REFERRED'
  | 'RESOLVED'
  | 'CLOSED';

export interface ICaseReferralEntry {
  referredTo: string;
  reason: string;
  referredBy: mongoose.Types.ObjectId;
  referredAt: Date;
}

export interface IBeneficiaryCaseDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  caseNumber: string;
  beneficiaryId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  assignedCaseWorkerId: mongoose.Types.ObjectId;
  title: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: BeneficiaryCaseStatus;
  /** Marks child-protection or vulnerable-person escalation cases requiring safeguarding clearance */
  isSafeguardingCase: boolean;
  escalationReference?: string;
  nextFollowUpDate?: Date;
  referralHistory: ICaseReferralEntry[];
  closureSummary?: string;
  closedBy?: mongoose.Types.ObjectId;
  closedAt?: Date;
  reopenedCount: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BeneficiaryCaseSchema = new Schema<IBeneficiaryCaseDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    caseNumber: { type: String, required: true, uppercase: true, trim: true },
    beneficiaryId: {
      type: Schema.Types.ObjectId,
      ref: 'Beneficiary',
      required: true,
      index: true,
    },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
    assignedCaseWorkerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_INFORMATION', 'REFERRED', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
      index: true,
    },
    isSafeguardingCase: { type: Boolean, default: false, index: true },
    escalationReference: { type: String, trim: true },
    nextFollowUpDate: { type: Date, index: true },
    referralHistory: [
      {
        referredTo: { type: String, required: true, trim: true },
        reason: { type: String, required: true, trim: true },
        referredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        referredAt: { type: Date, default: Date.now },
      },
    ],
    closureSummary: { type: String, trim: true },
    closedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    closedAt: { type: Date },
    reopenedCount: { type: Number, default: 0, min: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

BeneficiaryCaseSchema.index({ organizationId: 1, caseNumber: 1 }, { unique: true });
BeneficiaryCaseSchema.index({ organizationId: 1, status: 1, nextFollowUpDate: 1 });

export const BeneficiaryCase: Model<IBeneficiaryCaseDocument> =
  mongoose.models.BeneficiaryCase ||
  mongoose.model<IBeneficiaryCaseDocument>('BeneficiaryCase', BeneficiaryCaseSchema);

export default BeneficiaryCase;
