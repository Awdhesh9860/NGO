import mongoose, { Schema, Document, Model } from 'mongoose';

export type ConsentSubjectType = 'BENEFICIARY' | 'VOLUNTEER' | 'MEMBER';

export type ConsentPurpose =
  | 'PROGRAM_PARTICIPATION'
  | 'DATA_PROCESSING'
  | 'COMMUNICATION'
  | 'PHOTOGRAPHY_MEDIA'
  | 'PUBLIC_STORYTELLING'
  | 'RESEARCH_EVALUATION';

export type ConsentStatus = 'GRANTED' | 'WITHDRAWN' | 'EXPIRED';

/**
 * Purpose-Specific Consent Record
 * INVARIANTS:
 * - Photography/media and public storytelling consents are ALWAYS separate from program participation consent.
 * - Withdrawing optional consent (PHOTOGRAPHY_MEDIA, PUBLIC_STORYTELLING, COMMUNICATION, RESEARCH_EVALUATION)
 *   NEVER cancels or degrades essential beneficiary assistance.
 */
export interface IConsentRecordDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  subjectType: ConsentSubjectType;
  subjectId: mongoose.Types.ObjectId;
  purpose: ConsentPurpose;
  status: ConsentStatus;
  consentVersion: string;
  grantedAt: Date;
  withdrawnAt?: Date | null;
  withdrawalReason?: string;
  expiresAt?: Date | null;
  grantedByGuardian: boolean;
  guardianName?: string;
  guardianRelation?: string;
  evidenceRef?: string;
  recordedBy: mongoose.Types.ObjectId;
  withdrawnBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ConsentRecordSchema = new Schema<IConsentRecordDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    subjectType: {
      type: String,
      enum: ['BENEFICIARY', 'VOLUNTEER', 'MEMBER'],
      required: true,
      index: true,
    },
    subjectId: { type: Schema.Types.ObjectId, required: true, index: true },
    purpose: {
      type: String,
      enum: [
        'PROGRAM_PARTICIPATION',
        'DATA_PROCESSING',
        'COMMUNICATION',
        'PHOTOGRAPHY_MEDIA',
        'PUBLIC_STORYTELLING',
        'RESEARCH_EVALUATION',
      ],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['GRANTED', 'WITHDRAWN', 'EXPIRED'],
      default: 'GRANTED',
      index: true,
    },
    consentVersion: { type: String, required: true, default: '1.0', trim: true },
    grantedAt: { type: Date, default: Date.now },
    withdrawnAt: { type: Date, default: null },
    withdrawalReason: { type: String, trim: true },
    expiresAt: { type: Date, default: null },
    grantedByGuardian: { type: Boolean, default: false },
    guardianName: { type: String, trim: true },
    guardianRelation: { type: String, trim: true },
    evidenceRef: { type: String, trim: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    withdrawnBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

ConsentRecordSchema.index({ organizationId: 1, subjectType: 1, subjectId: 1, purpose: 1, createdAt: -1 });

export const ConsentRecord: Model<IConsentRecordDocument> =
  mongoose.models.ConsentRecord ||
  mongoose.model<IConsentRecordDocument>('ConsentRecord', ConsentRecordSchema);

export default ConsentRecord;
