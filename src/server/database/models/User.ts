import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole } from '@/types';

export interface IUserDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  departmentId?: mongoose.Types.ObjectId;
  phone?: string;
  designation?: string;
  avatar?: string;
  panNumber?: string;
  givingInterests?: string[];
  givingFrequency?: string;
  status: 'active' | 'inactive' | 'suspended';
  isEmailVerified: boolean;
  emailVerifiedAt?: Date;
  twoFactor: {
    enabled: boolean;
    secret?: string;
    backupCodes?: string[];
  };
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: [
        'SUPER_ADMIN',
        'ADMIN',
        'EXECUTIVE_DIRECTOR',
        'MANAGER',
        'PROJECT_MANAGER',
        'ACCOUNTANT',
        'COMMUNICATIONS',
        'CONTENT_EDITOR',
        'TEAM_MEMBER',
        'VOLUNTEER',
        'DONOR',
        'MEMBER',
        'GUEST',
      ],
      default: 'DONOR',
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    phone: { type: String, trim: true },
    designation: { type: String, trim: true },
    avatar: { type: String },
    panNumber: { type: String, trim: true },
    givingInterests: [{ type: String }],
    givingFrequency: { type: String },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
      index: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifiedAt: { type: Date },
    twoFactor: {
      enabled: { type: Boolean, default: false },
      secret: { type: String },
      backupCodes: [{ type: String }],
    },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Unique compound index: One email per organization
UserSchema.index({ organizationId: 1, email: 1 }, { unique: true });

export const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

export default User;
