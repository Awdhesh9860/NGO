import { PermissionKey, UserRole } from '@/types';
import { checkRoleAnyPermission } from '@/server/authorization/permissions';

export type AdminNavIconKey =
  | 'overview'
  | 'programs'
  | 'projects'
  | 'tasks'
  | 'milestones'
  | 'project-reports'
  | 'campaigns'
  | 'donors'
  | 'donations'
  | 'payments'
  | 'recurring'
  | 'receipts'
  | 'refunds'
  | 'fundraising'
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
  group: 'Core' | 'Operations' | 'Fundraising' | 'Organization' | 'Security';
  requiredPermissions: PermissionKey[];
  description: string;
}

/**
 * Configuration-driven administration & operations navigation.
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
  // Phase 07: Operations (Programs, Projects, Tasks, Milestones, Reports)
  {
    id: 'programs',
    name: 'Programs',
    href: '/dashboard/admin/programs',
    icon: 'programs',
    group: 'Operations',
    requiredPermissions: ['programs.view', 'programs.manage'],
    description: 'Strategic NGO programs, KPIs & approvals',
  },
  {
    id: 'projects',
    name: 'Projects',
    href: '/dashboard/admin/projects',
    icon: 'projects',
    group: 'Operations',
    requiredPermissions: ['projects.view', 'projects.manage', 'projects.view_assigned'],
    description: 'Field projects, teams, budgets, risks & documents',
  },
  {
    id: 'tasks',
    name: 'Tasks',
    href: '/dashboard/admin/tasks',
    icon: 'tasks',
    group: 'Operations',
    requiredPermissions: ['tasks.view', 'tasks.assign_manage', 'tasks.update_assigned'],
    description: 'Kanban boards, task assignments & overdue tracking',
  },
  {
    id: 'milestones',
    name: 'Milestones',
    href: '/dashboard/admin/milestones',
    icon: 'milestones',
    group: 'Operations',
    requiredPermissions: ['milestones.manage', 'projects.view'],
    description: 'Project deliverables & target date progress',
  },
  {
    id: 'project-reports',
    name: 'Project Reports',
    href: '/dashboard/admin/project-reports',
    icon: 'project-reports',
    group: 'Operations',
    requiredPermissions: ['project_reports.view', 'projects.view'],
    description: 'Operational analytics, budget utilization & alerts',
  },
  // Phase 08: Fundraising & Donation Management
  {
    id: 'campaigns',
    name: 'Campaigns',
    href: '/dashboard/admin/campaigns',
    icon: 'campaigns',
    group: 'Fundraising',
    requiredPermissions: ['campaigns.view', 'campaigns.create', 'campaigns.update'],
    description: 'Fundraising campaigns, approvals & publishing',
  },
  {
    id: 'donors',
    name: 'Donors',
    href: '/dashboard/admin/donors',
    icon: 'donors',
    group: 'Fundraising',
    requiredPermissions: ['donors.view', 'donors.manage'],
    description: 'Donor CRM, segments & lifetime impact',
  },
  {
    id: 'donations',
    name: 'Donations',
    href: '/dashboard/admin/donations',
    icon: 'donations',
    group: 'Fundraising',
    requiredPermissions: ['donations.view_all', 'donations.verify', 'donations.manage'],
    description: 'Donation ledger & manual UPI/Bank verification',
  },
  {
    id: 'payments',
    name: 'Payments',
    href: '/dashboard/admin/payments',
    icon: 'payments',
    group: 'Fundraising',
    requiredPermissions: ['payments.view', 'payments.reconcile'],
    description: 'Gateway monitoring, webhooks & reconciliation',
  },
  {
    id: 'recurring-donations',
    name: 'Recurring Donations',
    href: '/dashboard/admin/recurring-donations',
    icon: 'recurring',
    group: 'Fundraising',
    requiredPermissions: ['donations.view_all', 'donations.manage'],
    description: 'Provider-mandated monthly/yearly plans',
  },
  {
    id: 'receipts',
    name: 'Receipts',
    href: '/dashboard/admin/receipts',
    icon: 'receipts',
    group: 'Fundraising',
    requiredPermissions: ['receipts.view', 'receipts.issue'],
    description: 'Official receipts & verified 80G/12A compliance',
  },
  {
    id: 'refunds',
    name: 'Refunds',
    href: '/dashboard/admin/refunds',
    icon: 'refunds',
    group: 'Fundraising',
    requiredPermissions: ['refunds.view', 'refunds.request', 'refunds.approve'],
    description: 'Two-stage refund approvals & partial/full processing',
  },
  {
    id: 'fundraising-analytics',
    name: 'Fundraising Analytics',
    href: '/dashboard/admin/fundraising',
    icon: 'fundraising',
    group: 'Fundraising',
    requiredPermissions: ['fundraising.analytics.view'],
    description: 'Net vs gross revenue, retention & campaign performance',
  },
  // Organization Governance
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
  // Security & Compliance
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
  'PROJECT_MANAGER',
  'ACCOUNTANT',
  'COMMUNICATIONS',
  'TEAM_MEMBER',
];

const NON_CONSOLE_PORTAL_ROLES: UserRole[] = ['GUEST', 'DONOR', 'MEMBER', 'VOLUNTEER'];

export function getAuthorizedAdminNav(role: UserRole): AdminNavItem[] {
  if (NON_CONSOLE_PORTAL_ROLES.includes(role)) return [];
  if (role === 'SUPER_ADMIN') return ADMIN_NAVIGATION_ITEMS;
  return ADMIN_NAVIGATION_ITEMS.filter((item) =>
    checkRoleAnyPermission(role, item.requiredPermissions)
  );
}
