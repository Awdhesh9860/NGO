import { z } from 'zod';

export const PROJECT_STATUSES = [
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'PLANNED',
  'ACTIVE',
  'ON_HOLD',
  'COMPLETED',
  'CANCELLED',
  'ARCHIVED',
] as const;

export const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export const PRIORITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
export const PROJECT_ACCESS_LEVELS = ['LEAD', 'CONTRIBUTOR', 'VIEWER'] as const;

export const beneficiarySummarySchema = z.object({
  targetCount: z.number().int().min(0).default(0),
  actualCount: z.number().int().min(0).default(0),
  categories: z.array(z.string().min(1).max(80)).default([]),
  geographicCoverage: z.array(z.string().min(1).max(100)).default([]),
  includesMinorBeneficiaries: z.boolean().default(false),
  safeguardingVerified: z.boolean().default(false),
  demographics: z
    .array(
      z.object({
        groupLabel: z.string().min(1).max(80),
        count: z.number().int().min(0),
      })
    )
    .default([]),
  participationNotes: z.string().max(1500).optional(),
  outcomeSummary: z.string().max(2000).optional(),
});

export const createProjectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters').max(180),
  code: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[A-Z0-9-_]+$/, 'Project code must be uppercase alphanumeric with hyphens/underscores'),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters').max(500),
  detailedDescription: z.string().max(10000).optional(),
  programId: z.string().optional().nullable(),
  category: z.string().min(2).max(120),
  projectManagerId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  location: z.string().max(200).optional(),
  state: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  block: z.string().max(100).optional(),
  village: z.string().max(100).optional(),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90).optional(),
      lng: z.number().min(-180).max(180).optional(),
    })
    .optional(),
  approvedBudget: z.number().min(0).default(0),
  targetBeneficiaries: z.number().int().min(0).default(0),
  actualBeneficiaries: z.number().int().min(0).default(0),
  beneficiarySummary: beneficiarySummarySchema.optional(),
  expectedOutcomes: z.array(z.string().min(2).max(300)).default([]),
  keyDeliverables: z.array(z.string().min(2).max(300)).default([]),
  riskLevel: z.enum(RISK_LEVELS).default('LOW'),
  priority: z.enum(PRIORITY_LEVELS).default('MEDIUM'),
  images: z.array(z.string().url()).default([]),
  isPublicVisible: z.boolean().default(false),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  status: z.enum(PROJECT_STATUSES).optional(),
  progressPercentage: z.number().min(0).max(100).optional(),
});

export const assignProjectTeamMemberSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  responsibility: z.string().min(2).max(150).default('Field Execution'),
  accessLevel: z.enum(PROJECT_ACCESS_LEVELS).default('CONTRIBUTOR'),
});

export const createProjectRiskSchema = z.object({
  title: z.string().min(3).max(180),
  description: z.string().max(1500).optional(),
  severity: z.enum(RISK_LEVELS).default('MEDIUM'),
  likelihood: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  mitigationPlan: z.string().max(2000).optional(),
  ownerUserId: z.string().optional().nullable(),
  status: z.enum(['OPEN', 'MITIGATING', 'RESOLVED', 'CLOSED']).default('OPEN'),
});

export const updateProjectRiskSchema = createProjectRiskSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AssignProjectTeamMemberInput = z.infer<typeof assignProjectTeamMemberSchema>;
export type CreateProjectRiskInput = z.infer<typeof createProjectRiskSchema>;
export type UpdateProjectRiskInput = z.infer<typeof updateProjectRiskSchema>;
