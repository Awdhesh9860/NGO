import { z } from 'zod';

export const MILESTONE_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED'] as const;

export const createMilestoneSchema = z.object({
  title: z.string().min(3, 'Milestone title must be at least 3 characters').max(180),
  description: z.string().max(2000).optional(),
  targetDate: z.string().min(4, 'Target date is required'),
  completionDate: z.string().optional().nullable(),
  status: z.enum(MILESTONE_STATUSES).default('PENDING'),
  responsibleUserId: z.string().optional().nullable(),
  deliverables: z.array(z.string().min(2).max(250)).default([]),
  completionPercentage: z.number().min(0).max(100).default(0),
});

export const updateMilestoneSchema = createMilestoneSchema.partial();

export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;
