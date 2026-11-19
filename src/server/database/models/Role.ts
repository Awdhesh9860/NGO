import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRoleDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  key: string;
  description?: string;
  isSystemRole: boolean;
  permissions: string[];
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRoleDocument>(
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
    key: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isSystemRole: {
      type: Boolean,
      default: false,
    },
    permissions: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

RoleSchema.index({ organizationId: 1, key: 1 }, { unique: true });

export const Role: Model<IRoleDocument> =
  mongoose.models.Role || mongoose.model<IRoleDocument>('Role', RoleSchema);

export default Role;
