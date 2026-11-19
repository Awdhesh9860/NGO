import mongoose, { Schema, Document, Model } from 'mongoose';

export type CaseNoteType = 'PROGRESS' | 'FOLLOW_UP' | 'REFERRAL' | 'SAFEGUARDING' | 'CLOSURE';

/**
 * Restricted Case Notes collection.
 * NEVER included in general listings, public endpoints, analytics, or ordinary email notifications.
 * Access strictly gated by `beneficiaries.case.manage` (and `safeguarding.manage` for safeguarding notes).
 */
export interface ICaseNoteDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  caseId: mongoose.Types.ObjectId;
  beneficiaryId: mongoose.Types.ObjectId;
  noteType: CaseNoteType;
  content: string;
  isRestrictedSafeguardingNote: boolean;
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  authorRole: string;
  createdAt: Date;
}

const CaseNoteSchema = new Schema<ICaseNoteDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    caseId: { type: Schema.Types.ObjectId, ref: 'BeneficiaryCase', required: true, index: true },
    beneficiaryId: {
      type: Schema.Types.ObjectId,
      ref: 'Beneficiary',
      required: true,
      index: true,
    },
    noteType: {
      type: String,
      enum: ['PROGRESS', 'FOLLOW_UP', 'REFERRAL', 'SAFEGUARDING', 'CLOSURE'],
      default: 'PROGRESS',
    },
    content: { type: String, required: true, trim: true },
    isRestrictedSafeguardingNote: { type: Boolean, default: false, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true, trim: true },
    authorRole: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

CaseNoteSchema.index({ organizationId: 1, caseId: 1, createdAt: -1 });

export const CaseNote: Model<ICaseNoteDocument> =
  mongoose.models.CaseNote || mongoose.model<ICaseNoteDocument>('CaseNote', CaseNoteSchema);

export default CaseNote;
