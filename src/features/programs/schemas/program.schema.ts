import { z } from 'zod';

export const PROGRAM_STATUSES = [
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'ACTIVE',
  'ON_HOLD',
  'COMPLETED',
  'ARCHIVED',
  'REJECTED',
] as const;

export const PROGRAM_CATEGORIES = [
  'Education & Digital Literacy',
  'Healthcare & Medical Support',
  'Women Empowerment',
  'Child Welfare',
  'Rural Development',
  'Skill Development',
  'Environment & Sustainability',
  'Poverty Alleviation',
  'Community Development',
  'Livelihood Development',
] as const;

export const programKpiSchema = z.object({
  name: z.string().min(2).max(120),
  targetValue: z.number().min(0),
  currentValue: z.number().min(0).default(0),
  unit: z.string().min(1).max(40).default('units'),
});

export const createProgramSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(180),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  code: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[A-Z0-9-_]+$/, 'Code must be uppercase alphanumeric with hyphens/underscores'),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters').max(500),
  detailedDescription: z.string().max(10000).optional(),
  objectives: z.array(z.string().min(2).max(300)).default([]),
  targetAudience: z.string().max(250).optional(),
  focusArea: z.string().max(150).optional(),
  category: z.string().min(2).max(120),
  coverImage: z.string().url().optional().or(z.literal('')),
  gallery: z.array(z.string().url()).default([]),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  programManagerId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  budget: z.number().min(0).default(0),
  targetBeneficiaries: z.number().int().min(0).default(0),
  actualBeneficiaries: z.number().int().min(0).default(0),
  geographicCoverage: z.array(z.string().min(1).max(100)).default([]),
  expectedOutcomes: z.array(z.string().min(2).max(300)).default([]),
  kpis: z.array(programKpiSchema).default([]),
  isPublicVisible: z.boolean().default(false),
});

export const updateProgramSchema = createProgramSchema.partial().extend({
  status: z.enum(PROGRAM_STATUSES).optional(),
});

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;
