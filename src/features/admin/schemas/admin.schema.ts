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

export const ORGANIZATION_STATUS_ARRAY = [
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
  'PENDING_VERIFICATION',
] as const;

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  role: z.enum(USER_ROLES_ARRAY),
  customRoleId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  managerId: z.string().optional().nullable(),
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
  customRoleId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  managerId: z.string().optional().nullable(),
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

export const departmentMemberActionSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

export const createInvitationSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  role: z.enum(USER_ROLES_ARRAY),
  departmentId: z.string().optional().nullable(),
  expiryDays: z.number().int().min(1).max(30).default(7),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  legalName: z.string().max(200).optional().nullable(),
  logo: z.string().url().optional().nullable().or(z.literal('')),
  description: z.string().max(1000).optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal('')),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional().nullable(),
  headquartersAddress: z.string().max(300).optional().nullable(),
  status: z.enum(ORGANIZATION_STATUS_ARRAY).optional(),
  verificationStatus: z.enum(['unverified', 'pending', 'verified']).optional(),
  identity: z.object({
    registrationType: z.string().max(100).optional().nullable(),
    registrationNumber: z.string().max(100).optional().nullable(),
    registeredAddress: z.string().max(300).optional().nullable(),
    establishmentDate: z.string().max(40).optional().nullable(),
  }).optional(),
  statutory: z.object({
    panNumber: z.string().optional().nullable(),
    section80GNumber: z.string().optional().nullable(),
    section12ANumber: z.string().optional().nullable(),
    fcraNumber: z.string().optional().nullable(),
    darpanId: z.string().optional().nullable(),
    taxExemptionPercentage: z.number().min(0).max(100).default(50),
  }).optional(),
  regional: z.object({
    country: z.string().min(2).max(80).default('India'),
    state: z.string().max(80).optional().nullable(),
    district: z.string().max(80).optional().nullable(),
    timezone: z.string().default('Asia/Kolkata'),
    currencyCode: z.string().default('INR'),
    currencySymbol: z.string().default('₹'),
    dateFormat: z.string().default('DD/MM/YYYY'),
    language: z.string().default('en'),
  }).optional(),
  securitySettings: z.object({
    sessionTimeoutMinutes: z.number().int().min(15).max(43200).default(10080),
    minPasswordLength: z.number().int().min(8).max(64).default(8),
    requireStrongPassword: z.boolean().default(true),
    maxFailedLoginAttempts: z.number().int().min(3).max(20).default(5),
    invitationExpiryDays: z.number().int().min(1).max(30).default(7),
    twoFactorPolicy: z.enum(['optional', 'recommended', 'required_for_admins']).default('recommended'),
  }).optional(),
  notificationSettings: z.object({
    emailNotifications: z.boolean().default(true),
    adminAlerts: z.boolean().default(true),
    invitationNotifications: z.boolean().default(true),
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
