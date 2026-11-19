import { z } from 'zod';

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export const paymentProviderEnum = z.enum(['RAZORPAY', 'STRIPE', 'UPI', 'BANK_TRANSFER']);
export const donationTypeEnum = z.enum(['ONE_TIME', 'RECURRING']);
export const recurringIntervalEnum = z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']);

export const createPaymentOrderSchema = z.object({
  idempotencyKey: z.string().trim().min(8, 'Idempotency key must be at least 8 characters').max(120),
  amountMinor: z
    .number()
    .int('Donation amount must be integer minor currency units')
    .min(100, 'Minimum donation is 100 minor units')
    .max(5000000000, 'Amount exceeds single online transaction limit'),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).optional().default('INR'),
  paymentProvider: paymentProviderEnum,
  donationType: donationTypeEnum.optional().default('ONE_TIME'),
  campaignId: z.string().trim().optional(),
  programId: z.string().trim().optional(),
  projectId: z.string().trim().optional(),
  purpose: z.string().trim().min(2).max(200).optional().default('General Charitable Fund'),
  isAnonymous: z.boolean().optional().default(false),
  paymentReference: z.string().trim().max(120).optional(),
  manualProofUrl: z.string().trim().url().optional().or(z.literal('')),
  donor: z.object({
    name: z.string().trim().min(2, 'Donor name is required').max(140),
    email: z.string().trim().email('Valid email is required').toLowerCase(),
    phone: z.string().trim().max(24).optional(),
    panNumber: z
      .string()
      .trim()
      .toUpperCase()
      .regex(panRegex, 'Invalid PAN format')
      .optional()
      .or(z.literal('')),
    address: z.string().trim().max(300).optional(),
  }),
});

export const verifyPaymentSchema = z.object({
  donationId: z.string().trim().min(12),
  paymentProvider: z.enum(['RAZORPAY', 'STRIPE']),
  gatewayOrderId: z.string().trim().min(4),
  gatewayPaymentId: z.string().trim().min(4),
  gatewaySignature: z.string().trim().min(4).optional().default(''),
});

export const manualDonationVerificationSchema = z.object({
  decision: z.enum(['APPROVE', 'REJECT']),
  paymentReference: z.string().trim().min(3).max(120).optional(),
  rejectionReason: z.string().trim().max(1000).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const reconcilePaymentSchema = z.object({
  donationId: z.string().trim().min(12),
});

export const cancelReceiptSchema = z.object({
  receiptId: z.string().trim().min(12),
  reason: z.string().trim().min(5, 'Cancellation reason is required').max(500),
  reissue: z.boolean().optional().default(false),
});

export const requestRefundSchema = z.object({
  donationId: z.string().trim().min(12),
  amountMinor: z.number().int('Refund amount must be integer minor units').min(1),
  reason: z.string().trim().min(5, 'Refund reason must be at least 5 characters').max(1000),
  idempotencyKey: z.string().trim().min(8).max(120),
});

export const approveRefundSchema = z.object({
  decision: z.enum(['APPROVE', 'REJECT']),
  comments: z.string().trim().max(1000).optional(),
  rejectionReason: z.string().trim().max(1000).optional(),
  processImmediately: z.boolean().optional().default(false),
});

export const createRecurringDonationSchema = z.object({
  provider: z.enum(['RAZORPAY', 'STRIPE']),
  planInterval: recurringIntervalEnum,
  amountMinor: z.number().int().min(100),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).optional().default('INR'),
  campaignId: z.string().trim().optional(),
  purpose: z.string().trim().max(200).optional().default('Recurring Charitable Contribution'),
  isAnonymous: z.boolean().optional().default(false),
  donor: z.object({
    name: z.string().trim().min(2).max(140),
    email: z.string().trim().email().toLowerCase(),
    phone: z.string().trim().max(24).optional(),
  }),
});

export const updateRecurringDonationSchema = z.object({
  action: z.enum(['PAUSE', 'RESUME', 'CANCEL']),
  reason: z.string().trim().max(500).optional(),
});

export type CreatePaymentOrderInput = z.infer<typeof createPaymentOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type ManualDonationVerificationInput = z.infer<typeof manualDonationVerificationSchema>;
export type RequestRefundInput = z.infer<typeof requestRefundSchema>;
export type ApproveRefundInput = z.infer<typeof approveRefundSchema>;
export type CreateRecurringDonationInput = z.infer<typeof createRecurringDonationSchema>;
export type UpdateRecurringDonationInput = z.infer<typeof updateRecurringDonationSchema>;
