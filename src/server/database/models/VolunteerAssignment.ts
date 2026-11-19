import mongoose, { Schema, Document, Model } from 'mongoose';

export type VolunteerAssignmentStatus =
  | 'INVITED'
  | 'ACCEPTED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'WITHDRAWN';

export interface IVolunteerAssignmentHistoryEntry {
  status: VolunteerAssignmentStatus;
  actorId: mongoose.Types.ObjectId;
  actorName: string;
  notes?: string;
  timestamp: Date;
}

export interface IVolunteerAssignmentDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  volunteerId: mongoose.Types.ObjectId;
  programId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  supervisorId?: mongoose.Types.ObjectId;
  roleTitle: string;
  responsibilities: string;
  /** Restricted/field assignments require verificationStatus === 'VERIFIED' */
  requiresVerification: boolean;
  startDate: Date;
  endDate?: Date;
  scheduledDays: string[];
  status: VolunteerAssignmentStatus;
  completedActivitiesSummary?: string;
  history: IVolunteerAssignmentHistoryEntry[];
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentHistorySchema = new Schema<IVolunteerAssignmentHistoryEntry>(
  {
    status: {
      type: String,
      enum: ['INVITED', 'ACCEPTED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'WITHDRAWN'],
      required: true,
    },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorName: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const VolunteerAssignmentSchema = new Schema<IVolunteerAssignmentDocument>(
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
    programId: { type: Schema.Types.ObjectId, ref: 'Program', index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
    supervisorId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    roleTitle: { type: String, required: true, trim: true },
    responsibilities: { type: String, required: true, trim: true },
    requiresVerification: { type: Boolean, default: false },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    scheduledDays: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ['INVITED', 'ACCEPTED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'WITHDRAWN'],
      default: 'INVITED',
      index: true,
    },
    completedActivitiesSummary: { type: String, trim: true },
    history: [AssignmentHistorySchema],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

VolunteerAssignmentSchema.index({ organizationId: 1, volunteerId: 1, status: 1 });
VolunteerAssignmentSchema.index({ organizationId: 1, projectId: 1, status: 1 });

export const VolunteerAssignment: Model<IVolunteerAssignmentDocument> =
  mongoose.models.VolunteerAssignment ||
  mongoose.model<IVolunteerAssignmentDocument>('VolunteerAssignment', VolunteerAssignmentSchema);

export default VolunteerAssignment;
