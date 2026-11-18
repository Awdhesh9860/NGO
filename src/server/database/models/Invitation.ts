import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole } from '@/types';

export interface IInvitationDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  email: string;
  role: UserRole;
  departmentId?: mongoose.Types.ObjectId;
  tokenHash: string;
  invitedBy: mongoose.Types.ObjectId;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'revoked' | 'expired';
  acceptedAt?: Date;
  createdAt: Date;
}

const InvitationSchema = new Schema<IInvitationDocument>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    tokenHash: { type: String, required: true, unique: true, index: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'revoked', 'expired'],
      default: 'pending',
      index: true,
    },
    acceptedAt: { type: Date },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Invitation: Model<IInvitationDocument> =
  mongoose.models.Invitation || mongoose.model<IInvitationDocument>('Invitation', InvitationSchema);

export default Invitation;
