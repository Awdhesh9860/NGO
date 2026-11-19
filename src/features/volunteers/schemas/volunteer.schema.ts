import { z } from 'zod';

export const createVolunteerApplicationSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required').max(140),
  email: z.string().trim().email('Valid email address is required').toLowerCase(),
  mobileNumber: z.string().trim().min(7, 'Valid mobile number is required').max(24),
  dateOfBirth: z.string().optional(),
  gender: z.string().trim().max(40).optional(),
  address: z.string().trim().max(300).optional(),
  country: z.string().trim().max(80).optional().default('India'),
  state: z.string().trim().max(80).optional(),
  district: z.string().trim().max(80).optional(),
  city: z.string().trim().max(80).optional(),
  education: z.string().trim().max(120).optional(),
  occupation: z.string().trim().max(120).optional(),
  skills: z.array(z.string().trim().max(60)).max(25).optional().default([]),
  areasOfInterest: z.array(z.string().trim().max(80)).max(15).optional().default([]),
  preferredActivities: z.array(z.string().trim().max(80)).max(15).optional().default([]),
  availability: z.string().trim().min(2, 'Availability is required').max(100),
  preferredWorkingDays: z.array(z.string().trim().max(20)).max(7).optional().default([]),
  preferredWorkingHours: z.string().trim().max(60).optional(),
  languagesKnown: z.array(z.string().trim().max(40)).max(15).optional().default([]),
  previousExperience: z.string().trim().max(2000).optional(),
  emergencyContact: z
    .object({
      name: z.string().trim().max(120).optional(),
      relation: z.string().trim().max(60).optional(),
      phone: z.string().trim().max(24).optional(),
    })
    .optional(),
  profilePhotoUrl: z.string().trim().url().optional().or(z.literal('')),
  documentUrls: z.array(z.string().trim().url()).max(5).optional().default([]),
  consentAccepted: z.literal(true, {
    message: 'You must accept the volunteer declaration and consent policy',
  }),
  consentVersion: z.string().trim().max(20).optional().default('1.0'),
});

export const reviewVolunteerApplicationSchema = z.object({
  action: z.enum(['UNDER_REVIEW', 'SCHEDULE_INTERVIEW', 'APPROVE', 'REJECT', 'WITHDRAW']),
  internalNotes: z.string().trim().max(2000).optional(),
  rejectionReason: z.string().trim().max(1000).optional(),
  allowResubmission: z.boolean().optional().default(true),
  interviewScheduledAt: z.string().optional(),
  interviewMode: z.enum(['IN_PERSON', 'VIDEO', 'PHONE']).optional(),
  interviewLocationOrLink: z.string().trim().max(300).optional(),
});

export const updateVolunteerProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(140).optional(),
  mobileNumber: z.string().trim().max(24).optional(),
  city: z.string().trim().max(80).optional(),
  district: z.string().trim().max(80).optional(),
  state: z.string().trim().max(80).optional(),
  skills: z.array(z.string().trim().max(60)).max(25).optional(),
  areasOfInterest: z.array(z.string().trim().max(80)).max(15).optional(),
  availability: z.string().trim().max(100).optional(),
  preferredWorkingDays: z.array(z.string().trim().max(20)).max(7).optional(),
  languagesKnown: z.array(z.string().trim().max(40)).max(15).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED']).optional(),
  verificationAction: z
    .object({
      verificationStatus: z.enum(['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED']),
      checks: z
        .object({
          emailVerified: z.boolean().optional(),
          mobileVerified: z.boolean().optional(),
          identityRequired: z.boolean().optional(),
          identityVerified: z.boolean().optional(),
          referenceRequired: z.boolean().optional(),
          referenceVerified: z.boolean().optional(),
          backgroundCheckRequired: z.boolean().optional(),
          backgroundCheckConsented: z.boolean().optional(),
          backgroundVerified: z.boolean().optional(),
        })
        .optional(),
      notes: z.string().trim().max(1000).optional(),
    })
    .optional(),
});

export const createVolunteerAssignmentSchema = z.object({
  programId: z.string().trim().optional(),
  projectId: z.string().trim().optional(),
  supervisorId: z.string().trim().optional(),
  roleTitle: z.string().trim().min(2).max(120),
  responsibilities: z.string().trim().min(5).max(2000),
  requiresVerification: z.boolean().optional().default(false),
  startDate: z.string().min(8),
  endDate: z.string().optional(),
  scheduledDays: z.array(z.string().trim().max(20)).max(7).optional().default([]),
});

export const updateVolunteerAssignmentSchema = z.object({
  assignmentId: z.string().trim().min(12),
  status: z.enum(['INVITED', 'ACCEPTED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'WITHDRAWN']),
  notes: z.string().trim().max(1000).optional(),
  completedActivitiesSummary: z.string().trim().max(2000).optional(),
});

export const createVolunteerAttendanceSchema = z.object({
  assignmentId: z.string().trim().optional(),
  projectId: z.string().trim().optional(),
  attendanceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Attendance date must be YYYY-MM-DD'),
  checkInAt: z.string().optional(),
  checkOutAt: z.string().optional(),
  minutesLogged: z.number().int().min(0).max(1440).optional(),
  status: z
    .enum(['PRESENT', 'ABSENT', 'HALF_DAY', 'EXCUSED', 'PENDING_VERIFICATION'])
    .optional()
    .default('PENDING_VERIFICATION'),
  activityDescription: z.string().trim().min(3, 'Activity description is required').max(1000),
  entrySource: z.enum(['CHECK_IN', 'MANUAL_STAFF', 'CORRECTION']).optional().default('CHECK_IN'),
  correctionReason: z.string().trim().max(500).optional(),
});

export const approveVolunteerAttendanceSchema = z.object({
  attendanceId: z.string().trim().min(12),
  decision: z.enum(['APPROVE', 'REJECT', 'CORRECT']),
  status: z.enum(['PRESENT', 'ABSENT', 'HALF_DAY', 'EXCUSED']).optional(),
  minutesLogged: z.number().int().min(0).max(1440).optional(),
  reason: z.string().trim().max(500).optional(),
});

export const issueVolunteerCertificateSchema = z.object({
  certificateType: z.enum(['PARTICIPATION', 'EXPERIENCE']),
  title: z.string().trim().min(4).max(160),
  projectId: z.string().trim().optional(),
  participationStartDate: z.string().min(8),
  participationEndDate: z.string().min(8),
  signatoryName: z.string().trim().min(2).max(120),
  signatoryRole: z.string().trim().min(2).max(120),
  minimumRequiredMinutes: z.number().int().min(1).optional().default(60),
});

export type CreateVolunteerApplicationInput = z.infer<typeof createVolunteerApplicationSchema>;
export type ReviewVolunteerApplicationInput = z.infer<typeof reviewVolunteerApplicationSchema>;
export type UpdateVolunteerProfileInput = z.infer<typeof updateVolunteerProfileSchema>;
export type CreateVolunteerAssignmentInput = z.infer<typeof createVolunteerAssignmentSchema>;
export type UpdateVolunteerAssignmentInput = z.infer<typeof updateVolunteerAssignmentSchema>;
export type CreateVolunteerAttendanceInput = z.infer<typeof createVolunteerAttendanceSchema>;
export type ApproveVolunteerAttendanceInput = z.infer<typeof approveVolunteerAttendanceSchema>;
export type IssueVolunteerCertificateInput = z.infer<typeof issueVolunteerCertificateSchema>;
