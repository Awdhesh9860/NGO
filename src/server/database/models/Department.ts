import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDepartmentDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  headUserId?: mongoose.Types.ObjectId;
  budget?: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartmentDocument>(
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
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    headUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    budget: {
      type: Number,
      default: 0,
      min: 0,
    },
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

DepartmentSchema.index({ organizationId: 1, slug: 1 }, { unique: true });

export const Department: Model<IDepartmentDocument> =
  mongoose.models.Department || mongoose.model<IDepartmentDocument>('Department', DepartmentSchema);

export default Department;
