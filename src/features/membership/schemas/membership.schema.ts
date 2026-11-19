import { z } from 'zod';

export const membershipCategoryEnum = z.enum([
  'GENERAL',
  'ANNUAL',
  'LIFETIME',
  'SUPPORTING',
  'INSTITUTIONAL',
]);

export const createMembershipPlanSchema = z.object({
  name: z.string().trim().min(3).max(120),
  code: z
    .string()
    .trim()
    .min(2)
    .max(32)
    .regex(/^[A-Z0-9_-]+$/i, 'Plan code must be alphanumeric'),
  category: membershipCategoryEnum,
  description: z.string().trim().min(10).max(1000),
  feeAmountMinor: z.number().int('Membership fee must be integer minor units').min(0),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).optional().default('INR'),
  validityDays: z.number().int().min(0).max(36500).optional().default(365),
  isLifetime: z.boolean().optional().default(false),
  gracePeriodDays: z.number().int().min(0).max(180).optional().default(30),
  renewalReminderDaysBefore: z.array(z.number().int().min(1).max(180)).max(5).optional().default([30, 7, 1]),
  eligibilityCriteria: z.string().trim().max(1000).optional(),
  benefits: z.array(z.string().trim().max(200)).max(15).optional().default([]),
  votingRights: z.boolean().optional().default(false),
  requiresApproval: z.boolean().optional().default(true),
  isPublicVisible: z.boolean().optional().default(true),
});

export const createMembershipApplicationSchema = z.object({
  planId: z.string().trim().min(12, 'Please select a valid membership plan'),
  fullName: z.string().trim().min(2, 'Full name is required').max(140),
  email: z.string().trim().email('Valid email address is required').toLowerCase(),
  mobileNumber: z.string().trim().min(7, 'Valid mobile number is required').max(24),
  address: z.string().trim().max(300).optional(),
  dateOfBirth: z.string().optional(),
  occupation: z.string().trim().max(120).optional(),
  organizationName: z.string().trim().max(160).optional(),
  reasonForJoining: z.string().trim().min(10, 'Please describe your reason for joining').max(1500),
  relevantExperience: z.string().trim().max(1500).optional(),
  supportingDocumentUrls: z.array(z.string().trim().url()).max(5).optional().default([]),
  paymentReference: z.string().trim().max(120).optional(),
  consentAccepted: z.literal(true, {
    message: 'You must accept the membership bylaws and declaration',
  }),
  consentVersion: z.string().trim().max(20).optional().default('1.0'),
});

export const reviewMembershipApplicationSchema = z.object({
  action: z.enum(['UNDER_REVIEW', 'APPROVE', 'REJECT']),
  internalNotes: z.string().trim().max(1500).optional(),
  rejectionReason: z.string().trim().max(1000).optional(),
  feePaymentStatus: z.enum(['NOT_REQUIRED', 'PENDING', 'PAID', 'WAIVED']).optional(),
  paymentReference: z.string().trim().max(120).optional(),
  activateImmediately: z.boolean().optional().default(true),
});

export const updateMembershipStatusSchema = z.object({
  action: z.enum(['ACTIVATE', 'SUSPEND', 'CANCEL', 'MARK_EXPIRED', 'UPDATE_NOTES']),
  reason: z.string().trim().max(1000).optional(),
  internalNotes: z.string().trim().max(2000).optional(),
  feePaymentStatus: z.enum(['NOT_REQUIRED', 'PENDING', 'PAID', 'WAIVED']).optional(),
  paymentReference: z.string().trim().max(120).optional(),
});

export const createMembershipRenewalSchema = z.object({
  planId: z.string().trim().optional(),
  paymentStatus: z.enum(['NOT_REQUIRED', 'PENDING', 'PAID', 'WAIVED']).optional().default('PENDING'),
  paymentProvider: z.enum(['RAZORPAY', 'STRIPE', 'UPI', 'BANK_TRANSFER']).optional(),
  paymentReference: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(1000).optional(),
  approveAndComplete: z.boolean().optional().default(false),
});

export type CreateMembershipPlanInput = z.infer<typeof createMembershipPlanSchema>;
export type CreateMembershipApplicationInput = z.infer<typeof createMembershipApplicationSchema>;
export type ReviewMembershipApplicationInput = z.infer<typeof reviewMembershipApplicationSchema>;
export type UpdateMembershipStatusInput = z.infer<typeof updateMembershipStatusSchema>;
export type CreateMembershipRenewalInput = z.infer<typeof createMembershipRenewalSchema>;
