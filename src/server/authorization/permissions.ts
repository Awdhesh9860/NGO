import { UserRole, PermissionKey } from '@/types';

export const ROLE_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  SUPER_ADMIN: [
    'users.view',
    'users.manage',
    'roles.manage',
    'organizations.manage',
    'departments.manage',
    'teams.manage',
    'projects.view',
    'projects.manage',
    'projects.view_assigned',
    'programs.manage',
    'campaigns.manage',
    'volunteers.manage',
    'members.manage',
    'events.manage',
    'tasks.assign_manage',
    'tasks.update_assigned',
    'donations.view_all',
    'donations.refund',
    'donations.view_own',
    'content.publish',
    'certificates.issue',
    'reports.export_financial',
    'audit_logs.view',
    'settings.manage',
    'notifications.manage',
    'compliance.manage',
  ],
  ADMIN: [
    'users.view',
    'users.manage',
    'roles.manage',
    'departments.manage',
    'teams.manage',
    'projects.view',
    'projects.manage',
    'projects.view_assigned',
    'programs.manage',
    'campaigns.manage',
    'volunteers.manage',
    'members.manage',
    'events.manage',
    'tasks.assign_manage',
    'tasks.update_assigned',
    'donations.view_all',
    'donations.refund',
    'donations.view_own',
    'content.publish',
    'certificates.issue',
    'reports.export_financial',
    'audit_logs.view',
    'settings.manage',
    'notifications.manage',
    'compliance.manage',
  ],
  EXECUTIVE_DIRECTOR: [
    'users.view',
    'users.manage',
    'roles.manage',
    'departments.manage',
    'teams.manage',
    'projects.view',
    'projects.manage',
    'projects.view_assigned',
    'programs.manage',
    'campaigns.manage',
    'volunteers.manage',
    'members.manage',
    'events.manage',
    'tasks.assign_manage',
    'tasks.update_assigned',
    'donations.view_all',
    'donations.refund',
    'donations.view_own',
    'content.publish',
    'certificates.issue',
    'reports.export_financial',
    'audit_logs.view',
    'settings.manage',
    'notifications.manage',
    'compliance.manage',
  ],
  MANAGER: [
    'users.view',
    'departments.manage',
    'teams.manage',
    'projects.view',
    'projects.manage',
    'projects.view_assigned',
    'programs.manage',
    'campaigns.manage',
    'volunteers.manage',
    'members.manage',
    'events.manage',
    'tasks.assign_manage',
    'tasks.update_assigned',
    'donations.view_all',
    'donations.view_own',
    'content.publish',
    'certificates.issue',
    'audit_logs.view',
    'notifications.manage',
  ],
  PROJECT_MANAGER: [
    'projects.view',
    'projects.manage',
    'projects.view_assigned',
    'tasks.assign_manage',
    'tasks.update_assigned',
    'donations.view_own',
    'certificates.issue',
  ],
  ACCOUNTANT: [
    'donations.view_all',
    'donations.refund',
    'donations.view_own',
    'reports.export_financial',
    'audit_logs.view',
    'compliance.manage',
  ],
  COMMUNICATIONS: [
    'content.publish',
    'donations.view_own',
    'certificates.issue',
    'notifications.manage',
  ],
  CONTENT_EDITOR: [
    'content.publish',
    'donations.view_own',
  ],
  TEAM_MEMBER: [
    'projects.view_assigned',
    'tasks.update_assigned',
    'donations.view_own',
  ],
  VOLUNTEER: [
    'projects.view_assigned',
    'tasks.update_assigned',
    'donations.view_own',
  ],
  DONOR: [
    'donations.view_own',
  ],
  MEMBER: [
    'donations.view_own',
  ],
  GUEST: [],
};

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  description: string;
  module: string;
}

export const ALL_PERMISSIONS: PermissionDefinition[] = [
  // User & Access Control
  { key: 'users.view', label: 'View Users', description: 'View user directory and team rosters', module: 'Users' },
  { key: 'users.manage', label: 'Manage Users', description: 'Create, edit, suspend, or invite users', module: 'Users' },
  { key: 'roles.manage', label: 'Manage Roles', description: 'Configure custom roles and permission assignments', module: 'Users' },
  // Organization & Departments
  { key: 'organizations.manage', label: 'Manage Organization', description: 'Configure tenant profiles and multi-tenant settings', module: 'Organization' },
  { key: 'departments.manage', label: 'Manage Departments', description: 'Create, edit, and assign department units', module: 'Organization' },
  { key: 'teams.manage', label: 'Manage Teams', description: 'Structure functional operational teams', module: 'Organization' },
  { key: 'settings.manage', label: 'Manage Settings', description: 'Update statutory configurations and security policies', module: 'Organization' },
  // Operations & Programs
  { key: 'programs.manage', label: 'Manage Programs', description: 'Create and direct strategic humanitarian programs', module: 'Operations' },
  { key: 'projects.view', label: 'View All Projects', description: 'Inspect all organization ground projects', module: 'Operations' },
  { key: 'projects.manage', label: 'Manage Projects', description: 'Create, budget, and milestone-track projects', module: 'Operations' },
  { key: 'projects.view_assigned', label: 'View Assigned Projects', description: 'Access projects specifically assigned to user', module: 'Operations' },
  { key: 'tasks.assign_manage', label: 'Assign & Manage Tasks', description: 'Delegate field work and track progress', module: 'Operations' },
  { key: 'tasks.update_assigned', label: 'Update Assigned Tasks', description: 'Mark completion and log service hours', module: 'Operations' },
  // Philanthropy & Finance
  { key: 'campaigns.manage', label: 'Manage Campaigns', description: 'Create and administer fundraising appeals', module: 'Finance' },
  { key: 'donations.view_all', label: 'View All Donations', description: 'Inspect full organizational financial ledgers', module: 'Finance' },
  { key: 'donations.refund', label: 'Issue Refunds', description: 'Authorize transaction reversals and void receipts', module: 'Finance' },
  { key: 'donations.view_own', label: 'View Own Donations', description: 'Access personal giving history and 80G tax slips', module: 'Finance' },
  { key: 'reports.export_financial', label: 'Export Financial Reports', description: 'Generate Form 10BD, 80G registers, and P&L', module: 'Finance' },
  { key: 'compliance.manage', label: 'Compliance & 80G', description: 'Manage statutory tax filings and audit credentials', module: 'Finance' },
  // Community & Outreach
  { key: 'volunteers.manage', label: 'Manage Volunteers', description: 'Review volunteer applications and allocate rosters', module: 'Community' },
  { key: 'members.manage', label: 'Manage Members', description: 'Administer annual patron and ambassador memberships', module: 'Community' },
  { key: 'events.manage', label: 'Manage Events', description: 'Schedule and manage community townhalls and camps', module: 'Community' },
  { key: 'content.publish', label: 'Publish Content', description: 'Publish news, field stories, and press statements', module: 'Community' },
  { key: 'certificates.issue', label: 'Issue Certificates', description: 'Generate cryptographically verified service certificates', module: 'Community' },
  { key: 'notifications.manage', label: 'Manage Notifications', description: 'Broadcast administrative alerts and community bulletins', module: 'Community' },
  { key: 'audit_logs.view', label: 'View Audit Logs', description: 'Inspect immutable system security and compliance logs', module: 'Security' },
];

/**
 * Checks if a given role has a specific permission
 */
export function checkRolePermission(role: UserRole, permission: PermissionKey): boolean {
  const allowed = ROLE_PERMISSIONS[role] || [];
  return allowed.includes(permission);
}

/**
 * Checks if a role has any of the required permissions
 */
export function checkRoleAnyPermission(role: UserRole, permissions: PermissionKey[]): boolean {
  const allowed = ROLE_PERMISSIONS[role] || [];
  return permissions.some((p) => allowed.includes(p));
}

/**
 * Checks if a role has all of the required permissions
 */
export function checkRoleAllPermissions(role: UserRole, permissions: PermissionKey[]): boolean {
  const allowed = ROLE_PERMISSIONS[role] || [];
  return permissions.every((p) => allowed.includes(p));
}
