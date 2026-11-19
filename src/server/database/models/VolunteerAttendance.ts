import mongoose, { Schema, Document, Model } from 'mongoose';

export type VolunteerAttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'HALF_DAY'
  | 'EXCUSED'
  | 'PENDING_VERIFICATION';

export type AttendanceApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface IVolunteerAttendanceDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  volunteerId: mongoose.Types.ObjectId;
  assignmentId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  /** Calendar date in YYYY-MM-DD format for deterministic duplicate check-in prevention */
  attendanceDate: string;
  checkInAt?: Date;
  checkOutAt?: Date;
  /** Verified duration stored strictly in integer minutes */
  minutesLogged: number;
  status: VolunteerAttendanceStatus;
  approvalStatus: AttendanceApprovalStatus;
  activityDescription: string;
  entrySource: 'CHECK_IN' | 'MANUAL_STAFF' | 'CORRECTION';
  correctionRequested: boolean;
  correctionReason?: string;
  createdBy: mongoose.Types.ObjectId;
  correctedBy?: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VolunteerAttendanceSchema = new Schema<IVolunteerAttendanceDocument>(
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
    assignmentId: { type: Schema.Types.ObjectId, ref: 'VolunteerAssignment', index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
    attendanceDate: { type: String, required: true, trim: true },
    checkInAt: { type: Date },
    checkOutAt: { type: Date },
    minutesLogged: { type: Number, default: 0, min: 0, max: 1440 },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'HALF_DAY', 'EXCUSED', 'PENDING_VERIFICATION'],
      default: 'PENDING_VERIFICATION',
      index: true,
    },
    approvalStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    activityDescription: { type: String, required: true, trim: true },
    entrySource: {
      type: String,
      enum: ['CHECK_IN', 'MANUAL_STAFF', 'CORRECTION'],
      default: 'CHECK_IN',
    },
    correctionRequested: { type: Boolean, default: false },
    correctionReason: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    correctedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectionReason: { type: String, trim: true },
  },
  { timestamps: true }
);

VolunteerAttendanceSchema.index(
  { organizationId: 1, volunteerId: 1, attendanceDate: 1, assignmentId: 1 },
  { unique: true }
);
VolunteerAttendanceSchema.index({ organizationId: 1, approvalStatus: 1, attendanceDate: -1 });

export const VolunteerAttendance: Model<IVolunteerAttendanceDocument> =
  mongoose.models.VolunteerAttendance ||
  mongoose.model<IVolunteerAttendanceDocument>('VolunteerAttendance', VolunteerAttendanceSchema);

export default VolunteerAttendance;
