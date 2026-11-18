import { UserRole, PermissionKey } from '@/types';

export const ROLE_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  SUPER_ADMIN: [
    'users.view',
    'users.manage',
    'roles.manage',
    'projects.view',
    'projects.manage',
    'projects.view_assigned',
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
  ],
  ADMIN: [
    'users.view',
    'users.manage',
    'roles.manage',
    'projects.view',
    'projects.manage',
    'projects.view_assigned',
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
  ],
  EXECUTIVE_DIRECTOR: [
    'users.view',
    'users.manage',
    'roles.manage',
    'projects.view',
    'projects.manage',
    'projects.view_assigned',
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
  ],
  MANAGER: [
    'users.view',
    'projects.view',
    'projects.manage',
    'projects.view_assigned',
    'tasks.assign_manage',
    'tasks.update_assigned',
    'donations.view_all',
    'donations.view_own',
    'content.publish',
    'certificates.issue',
    'audit_logs.view',
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
  ],
  COMMUNICATIONS: [
    'content.publish',
    'donations.view_own',
    'certificates.issue',
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
