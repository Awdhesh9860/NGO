import mongoose, { Schema, Document, Model } from 'mongoose';

export type VolunteerStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED';
export type VolunteerVerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface IVolunteerVerificationChecks {
  emailVerified: boolean;
  mobileVerified: boolean;
  identityRequired: boolean;
  identityVerified: boolean;
  referenceRequired: boolean;
  referenceVerified: boolean;
  backgroundCheckRequired: boolean;
  backgroundCheckConsented: boolean;
  backgroundVerified: boolean;
}

export interface IVolunteerVerificationDocumentRef {
  label: string;
  documentType: 'IDENTITY' | 'REFERENCE' | 'BACKGROUND_CONSENT' | 'QUALIFICATION';
  storageRef: string;
  uploadedAt: Date;
}

export interface IVolunteerProfileDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  volunteerCode: string;
  userId?: mongoose.Types.ObjectId;
  applicationId?: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  mobileNumber?: string;
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
  status: VolunteerStatus;
  verificationStatus: VolunteerVerificationStatus;
  verificationChecks: IVolunteerVerificationChecks;
  /** Restricted verification document references visible only to users with volunteers.verify */
  verificationDocuments: IVolunteerVerificationDocumentRef[];
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  verificationNotes?: string;
  /** Total verified volunteer minutes strictly derived from APPROVED attendance records */
  verifiedMinutesTotal: number;
  completedAssignmentsCount: number;
  communicationPreferences: {
    emailUpdates: boolean;
    assignmentAlerts: boolean;
  };
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const VolunteerProfileSchema = new Schema<IVolunteerProfileDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    volunteerCode: { type: String, required: true, uppercase: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    applicationId: { type: Schema.Types.ObjectId, ref: 'VolunteerApplication' },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    mobileNumber: { type: String, trim: true },
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
    availability: { type: String, default: 'Flexible', trim: true },
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
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED'],
      default: 'ACTIVE',
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'],
      default: 'UNVERIFIED',
      index: true,
    },
    verificationChecks: {
      emailVerified: { type: Boolean, default: false },
      mobileVerified: { type: Boolean, default: false },
      identityRequired: { type: Boolean, default: false },
      identityVerified: { type: Boolean, default: false },
      referenceRequired: { type: Boolean, default: false },
      referenceVerified: { type: Boolean, default: false },
      backgroundCheckRequired: { type: Boolean, default: false },
      backgroundCheckConsented: { type: Boolean, default: false },
      backgroundVerified: { type: Boolean, default: false },
    },
    verificationDocuments: [
      {
        label: { type: String, required: true, trim: true },
        documentType: {
          type: String,
          enum: ['IDENTITY', 'REFERENCE', 'BACKGROUND_CONSENT', 'QUALIFICATION'],
          required: true,
        },
        storageRef: { type: String, required: true, trim: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    verificationNotes: { type: String, trim: true },
    verifiedMinutesTotal: { type: Number, default: 0, min: 0 },
    completedAssignmentsCount: { type: Number, default: 0, min: 0 },
    communicationPreferences: {
      emailUpdates: { type: Boolean, default: true },
      assignmentAlerts: { type: Boolean, default: true },
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

VolunteerProfileSchema.index({ organizationId: 1, volunteerCode: 1 }, { unique: true });
VolunteerProfileSchema.index({ organizationId: 1, email: 1 }, { unique: true });
VolunteerProfileSchema.index({ organizationId: 1, status: 1, verificationStatus: 1 });

export const VolunteerProfile: Model<IVolunteerProfileDocument> =
  mongoose.models.VolunteerProfile ||
  mongoose.model<IVolunteerProfileDocument>('VolunteerProfile', VolunteerProfileSchema);

export default VolunteerProfile;
