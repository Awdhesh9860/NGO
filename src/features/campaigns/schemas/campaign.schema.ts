import { z } from 'zod';

export const campaignStatusEnum = z.enum([
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'ACTIVE',
  'PAUSED',
  'GOAL_REACHED',
  'COMPLETED',
  'CANCELLED',
  'ARCHIVED',
]);

export const createCampaignSchema = z.object({
  title: z.string().trim().min(3, 'Campaign title must be at least 3 characters').max(180),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(120)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  code: z
    .string()
    .trim()
    .min(2)
    .max(32)
    .regex(/^[A-Z0-9_-]+$/i, 'Campaign code must be alphanumeric'),
  shortSummary: z.string().trim().min(10, 'Short summary must be at least 10 characters').max(400),
  story: z.string().trim().max(20000).optional(),
  category: z.string().trim().min(2).max(80),
  coverImage: z.string().trim().url().optional().or(z.literal('')),
  gallery: z.array(z.string().trim().url()).max(20).optional().default([]),
  videoUrl: z.string().trim().url().optional().or(z.literal('')),
  targetAmountMinor: z.number().int('Target amount must be integer minor units').min(100, 'Minimum target is 100 minor units'),
  minimumDonationMinor: z.number().int().min(100).optional().default(10000),
  suggestedAmountsMinor: z.array(z.number().int().min(100)).max(6).optional().default([50000, 150000, 300000, 500000]),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).optional().default('INR'),
  startDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  endDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  programId: z.string().trim().optional(),
  projectId: z.string().trim().optional(),
  campaignManagerId: z.string().trim().optional(),
  teamMemberIds: z.array(z.string().trim()).optional().default([]),
  isFeatured: z.boolean().optional().default(false),
  seoTitle: z.string().trim().max(120).optional(),
  seoDescription: z.string().trim().max(300).optional(),
});

export const updateCampaignSchema = createCampaignSchema.partial().extend({
  status: campaignStatusEnum.optional(),
  isPublicVisible: z.boolean().optional(),
});

export const campaignApprovalActionSchema = z.object({
  action: z.enum(['SUBMIT', 'APPROVE', 'REJECT']),
  comments: z.string().trim().max(1000).optional(),
  rejectionReason: z.string().trim().max(1000).optional(),
});

export const createCampaignUpdateSchema = z.object({
  title: z.string().trim().min(3).max(160),
  content: z.string().trim().min(10).max(5000),
  imageUrl: z.string().trim().url().optional().or(z.literal('')),
  isPublicVisible: z.boolean().optional().default(true),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type CampaignApprovalActionInput = z.infer<typeof campaignApprovalActionSchema>;
export type CreateCampaignUpdateInput = z.infer<typeof createCampaignUpdateSchema>;
