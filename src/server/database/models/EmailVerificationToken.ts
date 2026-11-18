import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmailVerificationTokenDocument extends Document {
  userId: mongoose.Types.ObjectId;
  email: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}

const EmailVerificationTokenSchema = new Schema<IEmailVerificationTokenDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    usedAt: { type: Date },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const EmailVerificationToken: Model<IEmailVerificationTokenDocument> =
  mongoose.models.EmailVerificationToken ||
  mongoose.model<IEmailVerificationTokenDocument>('EmailVerificationToken', EmailVerificationTokenSchema);

export default EmailVerificationToken;
