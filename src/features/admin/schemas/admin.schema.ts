import { z } from 'zod';

export const USER_ROLES_ARRAY = [
  'SUPER_ADMIN',
  'ADMIN',
  'EXECUTIVE_DIRECTOR',
  'MANAGER',
  'PROJECT_MANAGER',
  'ACCOUNTANT',
  'COMMUNICATIONS',
  'CONTENT_EDITOR',
  'TEAM_MEMBER',
  'VOLUNTEER',
  'DONOR',
  'MEMBER',
] as const;

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  role: z.enum(USER_ROLES_ARRAY),
  departmentId: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  designation: z.string().max(100).optional().nullable(),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional().nullable(),
  designation: z.string().max(100).optional().nullable(),
  avatar: z.string().url().optional().nullable(),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format').optional().nullable(),
  role: z.enum(USER_ROLES_ARRAY).optional(),
  departmentId: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

export const createDepartmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().max(500).optional(),
  headUserId: z.string().optional().nullable(),
  budget: z.number().min(0, 'Budget must be non-negative').default(0),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional().nullable(),
  headUserId: z.string().optional().nullable(),
  budget: z.number().min(0).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export const createInvitationSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  role: z.enum(USER_ROLES_ARRAY),
  departmentId: z.string().optional().nullable(),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  logo: z.string().url().optional().nullable(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional().nullable(),
  headquartersAddress: z.string().max(300).optional().nullable(),
  statutory: z.object({
    panNumber: z.string().optional().nullable(),
    section80GNumber: z.string().optional().nullable(),
    section12ANumber: z.string().optional().nullable(),
    fcraNumber: z.string().optional().nullable(),
    darpanId: z.string().optional().nullable(),
    taxExemptionPercentage: z.number().min(0).max(100).default(50),
  }).optional(),
  settings: z.object({
    currencyCode: z.string().default('INR'),
    currencySymbol: z.string().default('₹'),
    defaultLocale: z.string().default('en'),
    autoSendReceipts: z.boolean().default(true),
    maintenanceMode: z.boolean().default(false),
  }).optional(),
});

export const createRoleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters').max(50),
  key: z.string().min(2).max(50).regex(/^[A-Z0-9_]+$/, 'Key must be uppercase alphanumeric with underscores'),
  description: z.string().max(250).optional(),
  permissions: z.array(z.string()).min(1, 'At least one permission must be assigned'),
});

export const updateRoleSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().max(250).optional().nullable(),
  permissions: z.array(z.string()).min(1).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
