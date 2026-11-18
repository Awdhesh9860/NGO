import mongoose, { Schema, Document, Model } from 'mongoose';

export type OTPPurpose = 'VERIFY_EMAIL' | 'PASSWORD_RESET' | 'LOGIN_2FA';

export interface IEmailOTPDocument extends Document {
  email: string;
  otpHash: string;
  purpose: OTPPurpose;
  attempts: number;
  expiresAt: Date;
  verifiedAt?: Date;
  createdAt: Date;
}

const EmailOTPSchema = new Schema<IEmailOTPDocument>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    otpHash: { type: String, required: true },
    purpose: {
      type: String,
      required: true,
      enum: ['VERIFY_EMAIL', 'PASSWORD_RESET', 'LOGIN_2FA'],
    },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    verifiedAt: { type: Date },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const EmailOTP: Model<IEmailOTPDocument> =
  mongoose.models.EmailOTP || mongoose.model<IEmailOTPDocument>('EmailOTP', EmailOTPSchema);

export default EmailOTP;
