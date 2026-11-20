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
  | 'volunteers'
  | 'volunteer-apps'
  | 'members'
  | 'member-plans'
  | 'beneficiaries'
  | 'safeguarding'
  | 'stakeholders'
  | 'finance-dashboard'
  | 'chart-of-accounts'
  | 'journals'
  | 'ledger'
  | 'expenses'
  | 'vendors'
  | 'banking'
  | 'budgets'
  | 'grants'
  | 'financial-reports'
  | 'compliance'
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
  group: 'Core' | 'Operations' | 'Fundraising' | 'Stakeholders' | 'Finance' | 'Organization' | 'Security';
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
  // Phase 09: Volunteers, Members, Beneficiaries & Safeguarding
  {
    id: 'volunteers',
    name: 'Volunteers',
    href: '/dashboard/admin/volunteers',
    icon: 'volunteers',
    exact: true,
    group: 'Stakeholders',
    requiredPermissions: ['volunteers.view', 'volunteers.manage'],
    description: 'Volunteer profiles, verification, assignments & hours',
  },
  {
    id: 'volunteer-applications',
    name: 'Volunteer Applications',
    href: '/dashboard/admin/volunteers/applications',
    icon: 'volunteer-apps',
    group: 'Stakeholders',
    requiredPermissions: ['volunteers.view', 'volunteers.manage'],
    description: 'Review volunteer registrations, interviews & approvals',
  },
  {
    id: 'members',
    name: 'Members',
    href: '/dashboard/admin/members',
    icon: 'members',
    exact: true,
    group: 'Stakeholders',
    requiredPermissions: ['members.view', 'members.manage'],
    description: 'Member directory, approvals, renewals & status',
  },
  {
    id: 'membership-plans',
    name: 'Membership Plans',
    href: '/dashboard/admin/members/plans',
    icon: 'member-plans',
    group: 'Stakeholders',
    requiredPermissions: ['members.view', 'members.manage'],
    description: 'Configurable membership tiers, fees & validity',
  },
  {
    id: 'beneficiaries',
    name: 'Beneficiaries',
    href: '/dashboard/admin/beneficiaries',
    icon: 'beneficiaries',
    group: 'Stakeholders',
    requiredPermissions: ['beneficiaries.view', 'beneficiaries.manage'],
    description: 'Privacy-gated registration, eligibility, enrollment & assistance',
  },
  {
    id: 'safeguarding',
    name: 'Safeguarding & Consent',
    href: '/dashboard/admin/safeguarding',
    icon: 'safeguarding',
    group: 'Stakeholders',
    requiredPermissions: ['safeguarding.view', 'safeguarding.manage', 'consent.view'],
    description: 'Child protection controls, consent & anonymization',
  },
  {
    id: 'stakeholders-analytics',
    name: 'Stakeholder Analytics',
    href: '/dashboard/admin/stakeholders',
    icon: 'stakeholders',
    group: 'Stakeholders',
    requiredPermissions: ['volunteers.view', 'members.view', 'beneficiaries.view', 'privacy.reports.view'],
    description: 'Volunteer, membership & anonymized beneficiary dashboards',
  },
  // Phase 10: Finance, Accounting, Expense & Compliance Management
  {
    id: 'finance-dashboard',
    name: 'Finance Dashboard',
    href: '/dashboard/admin/finance',
    icon: 'finance-dashboard',
    exact: true,
    group: 'Finance',
    requiredPermissions: ['finance.reports.view', 'finance.ledger.view', 'finance.accounts.view'],
    description: 'Ledger-derived income, expenses, budgets, grants & compliance KPIs',
  },
  {
    id: 'chart-of-accounts',
    name: 'Chart of Accounts',
    href: '/dashboard/admin/finance/accounts',
    icon: 'chart-of-accounts',
    group: 'Finance',
    requiredPermissions: ['finance.accounts.view', 'finance.accounts.manage'],
    description: 'Hierarchical NGO Chart of Accounts & system account controls',
  },
  {
    id: 'journals',
    name: 'Journals & Periods',
    href: '/dashboard/admin/finance/journals',
    icon: 'journals',
    group: 'Finance',
    requiredPermissions: ['finance.journals.view', 'finance.journals.create', 'finance.journals.post'],
    description: 'Double-entry vouchers, approvals, posting, reversals & periods',
  },
  {
    id: 'ledger',
    name: 'General Ledger',
    href: '/dashboard/admin/finance/ledger',
    icon: 'ledger',
    group: 'Finance',
    requiredPermissions: ['finance.ledger.view', 'finance.reports.view'],
    description: 'Posted general ledger register & balanced trial balance',
  },
  {
    id: 'expenses',
    name: 'Expenses',
    href: '/dashboard/admin/finance/expenses',
    icon: 'expenses',
    group: 'Finance',
    requiredPermissions: ['finance.expenses.view', 'finance.expenses.create', 'finance.expenses.approve'],
    description: 'Expense claims, threshold approvals & payment posting',
  },
  {
    id: 'vendors',
    name: 'Vendors & Bills',
    href: '/dashboard/admin/finance/vendors',
    icon: 'vendors',
    group: 'Finance',
    requiredPermissions: ['finance.vendors.view', 'finance.vendors.manage'],
    description: 'Vendor directory, encrypted bank details & payable bills',
  },
  {
    id: 'banking',
    name: 'Bank & Reconcile',
    href: '/dashboard/admin/finance/banking',
    icon: 'banking',
    group: 'Finance',
    requiredPermissions: ['finance.bank_accounts.view', 'finance.reconciliation.manage'],
    description: 'Masked bank registry, CSV statement import & reconciliation',
  },
  {
    id: 'budgets',
    name: 'Budgets',
    href: '/dashboard/admin/finance/budgets',
    icon: 'budgets',
    group: 'Finance',
    requiredPermissions: ['finance.budgets.view', 'finance.budgets.manage', 'project_budget.view'],
    description: 'Org, department, program & project budgets vs ledger actuals',
  },
  {
    id: 'grants',
    name: 'Grants & Funds',
    href: '/dashboard/admin/finance/grants',
    icon: 'grants',
    group: 'Finance',
    requiredPermissions: ['finance.grants.view', 'finance.grants.manage'],
    description: 'Restricted fund allocations, grant awards & reporting deadlines',
  },
  {
    id: 'financial-reports',
    name: 'Financial Reports',
    href: '/dashboard/admin/finance/reports',
    icon: 'financial-reports',
    group: 'Finance',
    requiredPermissions: ['finance.reports.view', 'finance.reports.export'],
    description: 'Income & Expense, Balance Sheet, Cash Flow & CSV export',
  },
  {
    id: 'compliance',
    name: 'NGO Compliance',
    href: '/dashboard/admin/compliance',
    icon: 'compliance',
    group: 'Finance',
    requiredPermissions: ['compliance.view', 'compliance.manage', 'compliance.verify'],
    description: '12A/80G/FCRA/Audit registry, deadlines & verification status',
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

export type AdminNavGroupKey =
  | 'Core'
  | 'Operations'
  | 'Fundraising'
  | 'Stakeholders'
  | 'Finance'
  | 'Organization'
  | 'Security';

export const ADMIN_NAV_GROUPS_ORDER: AdminNavGroupKey[] = [
  'Core',
  'Operations',
  'Fundraising',
  'Stakeholders',
  'Finance',
  'Organization',
  'Security',
];

export interface GroupedAdminNavSection {
  group: AdminNavGroupKey;
  items: AdminNavItem[];
}

export function getAuthorizedAdminNav(role: UserRole): AdminNavItem[] {
  if (NON_CONSOLE_PORTAL_ROLES.includes(role)) return [];
  if (role === 'SUPER_ADMIN') return ADMIN_NAVIGATION_ITEMS;
  return ADMIN_NAVIGATION_ITEMS.filter((item) =>
    checkRoleAnyPermission(role, item.requiredPermissions)
  );
}

/**
 * Returns role-authorized admin navigation organized into non-empty semantic groups.
 * Guarantees unauthorized routes are never surfaced in sidebars or dropdowns.
 */
export function getGroupedAdminNav(role: UserRole): GroupedAdminNavSection[] {
  const authorized = getAuthorizedAdminNav(role);
  if (authorized.length === 0) return [];
  return ADMIN_NAV_GROUPS_ORDER.map((group) => ({
    group,
    items: authorized.filter((item) => item.group === group),
  })).filter((section) => section.items.length > 0);
}
