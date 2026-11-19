import mongoose, { Schema, Document, Model } from 'mongoose';

export type VolunteerApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'INTERVIEW_SCHEDULED'
  | 'APPROVED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface IVolunteerApplicationHistoryEntry {
  status: VolunteerApplicationStatus;
  actorId?: mongoose.Types.ObjectId;
  actorName: string;
  actorRole: string;
  notes?: string;
  timestamp: Date;
}

export interface IVolunteerApplicationDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  applicationCode: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  dateOfBirth?: Date;
  gender?: string;
  address?: string;
  country: string;
  state?: string;
  district?: string;
  city?: string;
  education?: string;
  occupation?: string;
  skills: string[];
  areasOfInterest: string[];
  preferredActivities: string[];
  availability: string;
  preferredWorkingDays: string[];
  preferredWorkingHours?: string;
  languagesKnown: string[];
  previousExperience?: string;
  emergencyContact?: {
    name?: string;
    relation?: string;
    phone?: string;
  };
  profilePhotoUrl?: string;
  documentUrls: string[];
  consentAccepted: boolean;
  consentVersion: string;
  consentAcceptedAt: Date;
  status: VolunteerApplicationStatus;
  internalNotes?: string;
  interviewScheduledAt?: Date;
  interviewMode?: 'IN_PERSON' | 'VIDEO' | 'PHONE';
  interviewLocationOrLink?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;
  allowResubmission: boolean;
  volunteerProfileId?: mongoose.Types.ObjectId;
  history: IVolunteerApplicationHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const HistorySchema = new Schema<IVolunteerApplicationHistoryEntry>(
  {
    status: {
      type: String,
      enum: [
        'DRAFT',
        'SUBMITTED',
        'UNDER_REVIEW',
        'INTERVIEW_SCHEDULED',
        'APPROVED',
        'REJECTED',
        'WITHDRAWN',
      ],
      required: true,
    },
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    actorName: { type: String, required: true, trim: true },
    actorRole: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const VolunteerApplicationSchema = new Schema<IVolunteerApplicationDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    applicationCode: { type: String, required: true, uppercase: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    mobileNumber: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, trim: true },
    address: { type: String, trim: true },
    country: { type: String, default: 'India', trim: true },
    state: { type: String, trim: true },
    district: { type: String, trim: true },
    city: { type: String, trim: true },
    education: { type: String, trim: true },
    occupation: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    areasOfInterest: [{ type: String, trim: true }],
    preferredActivities: [{ type: String, trim: true }],
    availability: { type: String, required: true, trim: true },
    preferredWorkingDays: [{ type: String, trim: true }],
    preferredWorkingHours: { type: String, trim: true },
    languagesKnown: [{ type: String, trim: true }],
    previousExperience: { type: String, trim: true },
    emergencyContact: {
      name: { type: String, trim: true },
      relation: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
    profilePhotoUrl: { type: String, trim: true },
    documentUrls: [{ type: String, trim: true }],
    consentAccepted: { type: Boolean, required: true, default: false },
    consentVersion: { type: String, default: '1.0', trim: true },
    consentAcceptedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: [
        'DRAFT',
        'SUBMITTED',
        'UNDER_REVIEW',
        'INTERVIEW_SCHEDULED',
        'APPROVED',
        'REJECTED',
        'WITHDRAWN',
      ],
      default: 'SUBMITTED',
      index: true,
    },
    internalNotes: { type: String, trim: true },
    interviewScheduledAt: { type: Date },
    interviewMode: { type: String, enum: ['IN_PERSON', 'VIDEO', 'PHONE'] },
    interviewLocationOrLink: { type: String, trim: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    rejectionReason: { type: String, trim: true },
    allowResubmission: { type: Boolean, default: true },
    volunteerProfileId: { type: Schema.Types.ObjectId, ref: 'VolunteerProfile' },
    history: [HistorySchema],
  },
  { timestamps: true }
);

VolunteerApplicationSchema.index({ organizationId: 1, applicationCode: 1 }, { unique: true });
VolunteerApplicationSchema.index({ organizationId: 1, email: 1, status: 1 });
VolunteerApplicationSchema.index({ organizationId: 1, createdAt: -1 });

export const VolunteerApplication: Model<IVolunteerApplicationDocument> =
  mongoose.models.VolunteerApplication ||
  mongoose.model<IVolunteerApplicationDocument>('VolunteerApplication', VolunteerApplicationSchema);

export default VolunteerApplication;
