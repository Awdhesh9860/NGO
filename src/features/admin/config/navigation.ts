import { PermissionKey, UserRole } from '@/types';
import { checkRoleAnyPermission } from '@/server/authorization/permissions';

export type AdminNavIconKey =
  | 'overview'
  | 'users'
  | 'roles'
  | 'departments'
  | 'invitations'
  | 'organization'
  | 'settings'
  | 'audit'
  | 'notifications';

export interface AdminNavItem {
  id: string;
  name: string;
  href: string;
  icon: AdminNavIconKey;
  exact?: boolean;
  group: 'Core' | 'Organization' | 'Security';
  requiredPermissions: PermissionKey[];
  description: string;
}

/**
 * Configuration-driven administration navigation.
 * Visibility is strictly filtered by role permissions; API routes enforce the same permissions server-side.
 */
export const ADMIN_NAVIGATION_ITEMS: AdminNavItem[] = [
  {
    id: 'overview',
    name: 'Executive Overview',
    href: '/dashboard/admin',
    icon: 'overview',
    exact: true,
    group: 'Core',
    requiredPermissions: ['users.view', 'audit_logs.view', 'departments.manage'],
    description: 'Organization KPIs, trends & activity summary',
  },
  {
    id: 'users',
    name: 'User Management',
    href: '/dashboard/admin/users',
    icon: 'users',
    group: 'Core',
    requiredPermissions: ['users.view', 'users.manage'],
    description: 'Accounts, roles, departments & sessions',
  },
  {
    id: 'invitations',
    name: 'Invitations',
    href: '/dashboard/admin/invitations',
    icon: 'invitations',
    group: 'Core',
    requiredPermissions: ['users.manage'],
    description: 'Invite staff, resend or revoke tokens',
  },
  {
    id: 'roles',
    name: 'Roles & Permissions',
    href: '/dashboard/admin/roles',
    icon: 'roles',
    group: 'Organization',
    requiredPermissions: ['roles.manage', 'users.view'],
    description: '13-role RBAC matrix & custom roles',
  },
  {
    id: 'departments',
    name: 'Departments',
    href: '/dashboard/admin/departments',
    icon: 'departments',
    group: 'Organization',
    requiredPermissions: ['departments.manage'],
    description: 'Units, department heads, budgets & rosters',
  },
  {
    id: 'organization',
    name: 'Organization Profile',
    href: '/dashboard/admin/organization',
    icon: 'organization',
    exact: true,
    group: 'Organization',
    requiredPermissions: ['users.view', 'settings.manage', 'organizations.manage'],
    description: 'Legal identity, verification & contact info',
  },
  {
    id: 'settings',
    name: 'Organization Settings',
    href: '/dashboard/admin/organization/settings',
    icon: 'settings',
    group: 'Organization',
    requiredPermissions: ['settings.manage', 'organizations.manage'],
    description: 'Regional, statutory, security & notifications',
  },
  {
    id: 'audit-logs',
    name: 'Audit Logs',
    href: '/dashboard/admin/audit-logs',
    icon: 'audit',
    group: 'Security',
    requiredPermissions: ['audit_logs.view'],
    description: 'Immutable security & administrative trail',
  },
  {
    id: 'notifications',
    name: 'Admin Notifications',
    href: '/dashboard/admin/notifications',
    icon: 'notifications',
    group: 'Security',
    requiredPermissions: ['notifications.manage'],
    description: 'Security alerts & operational notices',
  },
];

export const ADMIN_ACCESS_ROLES: UserRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'EXECUTIVE_DIRECTOR',
  'MANAGER',
  'ACCOUNTANT',
  'COMMUNICATIONS',
];

export function getAuthorizedAdminNav(role: UserRole): AdminNavItem[] {
  if (role === 'GUEST') return [];
  if (role === 'SUPER_ADMIN') return ADMIN_NAVIGATION_ITEMS;
  return ADMIN_NAVIGATION_ITEMS.filter((item) =>
    checkRoleAnyPermission(role, item.requiredPermissions)
  );
}
