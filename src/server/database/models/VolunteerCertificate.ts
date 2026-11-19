import mongoose, { Schema, Document, Model } from 'mongoose';

export type VolunteerCertificateType = 'PARTICIPATION' | 'EXPERIENCE';
export type VolunteerCertificateStatus = 'ISSUED' | 'CANCELLED';

export interface IVolunteerCertificateDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  volunteerId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  certificateNumber: string;
  verificationCode: string;
  certificateType: VolunteerCertificateType;
  title: string;
  volunteerNameSnapshot: string;
  organizationNameSnapshot: string;
  projectNameSnapshot?: string;
  participationStartDate: Date;
  participationEndDate: Date;
  /** Strictly computed from approved VolunteerAttendance minutes — never fabricated */
  verifiedMinutes: number;
  verifiedHours: number;
  signatoryName: string;
  signatoryRole: string;
  issueDate: Date;
  status: VolunteerCertificateStatus;
  issuedBy: mongoose.Types.ObjectId;
  cancelledReason?: string;
  cancelledBy?: mongoose.Types.ObjectId;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VolunteerCertificateSchema = new Schema<IVolunteerCertificateDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    volunteerId: {
      type: Schema.Types.ObjectId,
      ref: 'VolunteerProfile',
      required: true,
      index: true,
    },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    certificateNumber: { type: String, required: true, uppercase: true, trim: true },
    verificationCode: { type: String, required: true, uppercase: true, trim: true, unique: true },
    certificateType: {
      type: String,
      enum: ['PARTICIPATION', 'EXPERIENCE'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    volunteerNameSnapshot: { type: String, required: true, trim: true },
    organizationNameSnapshot: { type: String, required: true, trim: true },
    projectNameSnapshot: { type: String, trim: true },
    participationStartDate: { type: Date, required: true },
    participationEndDate: { type: Date, required: true },
    verifiedMinutes: { type: Number, required: true, min: 0 },
    verifiedHours: { type: Number, required: true, min: 0 },
    signatoryName: { type: String, required: true, trim: true },
    signatoryRole: { type: String, required: true, trim: true },
    issueDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['ISSUED', 'CANCELLED'],
      default: 'ISSUED',
      index: true,
    },
    issuedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    cancelledReason: { type: String, trim: true },
    cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

VolunteerCertificateSchema.index({ organizationId: 1, certificateNumber: 1 }, { unique: true });
VolunteerCertificateSchema.index({ organizationId: 1, volunteerId: 1, issueDate: -1 });

export const VolunteerCertificate: Model<IVolunteerCertificateDocument> =
  mongoose.models.VolunteerCertificate ||
  mongoose.model<IVolunteerCertificateDocument>('VolunteerCertificate', VolunteerCertificateSchema);

export default VolunteerCertificate;
