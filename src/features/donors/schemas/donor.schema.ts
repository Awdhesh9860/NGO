import { z } from 'zod';

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export const donorTypeEnum = z.enum(['INDIVIDUAL', 'CORPORATE', 'INSTITUTIONAL', 'FOUNDATION']);
export const donorStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'DO_NOT_CONTACT']);

export const createDonorSchema = z.object({
  name: z.string().trim().min(2, 'Donor name is required').max(140),
  email: z.string().trim().email('Valid email address required').toLowerCase(),
  phone: z.string().trim().max(24).optional(),
  donorType: donorTypeEnum.optional().default('INDIVIDUAL'),
  organizationName: z.string().trim().max(160).optional(),
  address: z
    .object({
      line1: z.string().trim().max(200).optional(),
      line2: z.string().trim().max(200).optional(),
      city: z.string().trim().max(100).optional(),
      state: z.string().trim().max(100).optional(),
      postalCode: z.string().trim().max(20).optional(),
      country: z.string().trim().max(80).optional(),
    })
    .optional(),
  communicationPreferences: z
    .object({
      emailReceipts: z.boolean().optional().default(true),
      campaignUpdates: z.boolean().optional().default(true),
      newsletters: z.boolean().optional().default(false),
      smsAlerts: z.boolean().optional().default(false),
    })
    .optional(),
  anonymousDisplayDefault: z.boolean().optional().default(false),
  panNumber: z.string().trim().toUpperCase().regex(panRegex, 'Invalid PAN format (e.g. ABCDE1234F)').optional().or(z.literal('')),
  status: donorStatusEnum.optional().default('ACTIVE'),
  internalNotes: z.string().trim().max(3000).optional(),
  tags: z.array(z.string().trim().max(50)).max(20).optional().default([]),
});

export const updateDonorSchema = createDonorSchema.partial();

export type CreateDonorInput = z.infer<typeof createDonorSchema>;
export type UpdateDonorInput = z.infer<typeof updateDonorSchema>;
