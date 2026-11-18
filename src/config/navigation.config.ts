import { UserRole } from '../types';

export interface DashboardNavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: string;
  description?: string;
  requiredPermission?: string;
}

export interface DashboardNavGroup {
  groupTitle: string;
  items: DashboardNavItem[];
}

/**
 * 13-Role Dashboard Navigation Architecture
 * Maps each role to permitted navigation groups and functional tabs.
 */
export const ROLE_DASHBOARD_NAVIGATION: Record<UserRole, DashboardNavGroup[]> = {
  SUPER_ADMIN: [
    {
      groupTitle: 'Platform Governance',
      items: [
        { id: 'overview', label: 'Overview', icon: 'LayoutDashboard', href: '/dashboard?tab=overview' },
        { id: 'tenants', label: 'Organizations', icon: 'Building', href: '/dashboard?tab=tenants', badge: 'Multi-Tenant' },
        { id: 'security', label: 'Security & RBAC', icon: 'ShieldCheck', href: '/dashboard?tab=audit_logs' },
      ],
    },
    {
      groupTitle: 'Operations & Finance',
      items: [
        { id: 'donations', label: 'Donations & 80G', icon: 'DollarSign', href: '/dashboard?tab=donations' },
        { id: 'projects', label: 'Field Projects', icon: 'FolderKanban', href: '/dashboard?tab=projects' },
        { id: 'campaigns', label: 'Urgent Appeals', icon: 'Heart', href: '/dashboard?tab=campaigns' },
        { id: 'volunteers', label: 'Volunteers', icon: 'Users', href: '/dashboard?tab=volunteers' },
        { id: 'certificates', label: 'Certificates', icon: 'Award', href: '/dashboard?tab=certificates' },
        { id: 'transparency', label: 'Compliance Reports', icon: 'FileText', href: '/dashboard?tab=transparency' },
        { id: 'google-sheets', label: 'Google Sheets Hub', icon: 'FileSpreadsheet', href: '/dashboard?tab=google-sheets' },
      ],
    },
  ],

  ADMIN: [
    {
      groupTitle: 'NGO Administration',
      items: [
        { id: 'overview', label: 'Overview', icon: 'LayoutDashboard', href: '/dashboard?tab=overview' },
        { id: 'donations', label: 'Donations & Receipts', icon: 'DollarSign', href: '/dashboard?tab=donations' },
        { id: 'projects', label: 'Projects & Milestones', icon: 'FolderKanban', href: '/dashboard?tab=projects' },
        { id: 'campaigns', label: 'Campaigns', icon: 'Heart', href: '/dashboard?tab=campaigns' },
        { id: 'volunteers', label: 'Volunteer Review', icon: 'Users', href: '/dashboard?tab=volunteers' },
        { id: 'certificates', label: 'Certificates Registry', icon: 'Award', href: '/dashboard?tab=certificates' },
        { id: 'leads', label: 'CRM & Subscribers', icon: 'Mail', href: '/dashboard?tab=leads' },
        { id: 'transparency', label: 'Statutory Reports', icon: 'FileText', href: '/dashboard?tab=transparency' },
        { id: 'audit_logs', label: 'Audit Trails', icon: 'Activity', href: '/dashboard?tab=audit_logs' },
        { id: 'google-sheets', label: 'Sheets Sync', icon: 'FileSpreadsheet', href: '/dashboard?tab=google-sheets' },
      ],
    },
  ],

  EXECUTIVE_DIRECTOR: [
    {
      groupTitle: 'Executive Oversight',
      items: [
        { id: 'overview', label: 'Executive Summary', icon: 'TrendingUp', href: '/dashboard?tab=overview' },
        { id: 'finance', label: 'Financial Statements', icon: 'DollarSign', href: '/dashboard?tab=donations' },
        { id: 'projects', label: 'Program Impact', icon: 'FolderKanban', href: '/dashboard?tab=projects' },
        { id: 'compliance', label: 'Governance & Audits', icon: 'ShieldCheck', href: '/dashboard?tab=transparency' },
      ],
    },
  ],

  MANAGER: [
    {
      groupTitle: 'Operations & Management',
      items: [
        { id: 'projects', label: 'Project Portfolios', icon: 'FolderKanban', href: '/dashboard?tab=projects' },
        { id: 'campaigns', label: 'Campaigns', icon: 'Heart', href: '/dashboard?tab=campaigns' },
        { id: 'volunteers', label: 'Volunteer Management', icon: 'Users', href: '/dashboard?tab=volunteers' },
      ],
    },
  ],

  PROJECT_MANAGER: [
    {
      groupTitle: 'Field Project Operations',
      items: [
        { id: 'assigned_projects', label: 'My Projects', icon: 'FolderKanban', href: '/dashboard' },
        { id: 'milestones', label: 'Milestone Tracker', icon: 'CheckCircle2', href: '/dashboard' },
        { id: 'field_updates', label: 'Field Dispatches', icon: 'Camera', href: '/dashboard' },
      ],
    },
  ],

  ACCOUNTANT: [
    {
      groupTitle: 'Financial Administration',
      items: [
        { id: 'ledger', label: 'Donation Ledger', icon: 'DollarSign', href: '/dashboard?tab=donations' },
        { id: '80g_receipts', label: 'Form 10BE Tax Ledger', icon: 'FileText', href: '/dashboard?tab=donations' },
        { id: 'refunds', label: 'Refund Authorizations', icon: 'RefreshCw', href: '/dashboard?tab=donations' },
        { id: 'audits', label: 'Audit Filings', icon: 'ShieldCheck', href: '/dashboard?tab=transparency' },
      ],
    },
  ],

  COMMUNICATIONS: [
    {
      groupTitle: 'Outreach & Public Relations',
      items: [
        { id: 'campaigns', label: 'Urgent Appeals', icon: 'Heart', href: '/dashboard?tab=campaigns' },
        { id: 'updates', label: 'Field Dispatches', icon: 'Camera', href: '/dashboard' },
        { id: 'leads', label: 'Newsletter Subscribers', icon: 'Mail', href: '/dashboard?tab=leads' },
      ],
    },
  ],

  CONTENT_EDITOR: [
    {
      groupTitle: 'Content Management',
      items: [
        { id: 'articles', label: 'Stories & Articles', icon: 'BookOpen', href: '/dashboard' },
        { id: 'media', label: 'Media Gallery Assets', icon: 'Image', href: '/dashboard' },
      ],
    },
  ],

  TEAM_MEMBER: [
    {
      groupTitle: 'My Workstation',
      items: [
        { id: 'my_tasks', label: 'Assigned Tasks', icon: 'CheckSquare', href: '/dashboard' },
        { id: 'my_projects', label: 'My Projects', icon: 'FolderKanban', href: '/dashboard' },
        { id: 'attendance', label: 'Daily Attendance', icon: 'Clock', href: '/dashboard' },
      ],
    },
  ],

  VOLUNTEER: [
    {
      groupTitle: 'Volunteer Service Hub',
      items: [
        { id: 'volunteer_hub', label: 'Service Hub & Hours', icon: 'Clock', href: '/dashboard' },
        { id: 'credentials', label: 'Earned Certificates', icon: 'Award', href: '/dashboard' },
        { id: 'community_drives', label: 'Community Drives', icon: 'Users', href: '/events' },
      ],
    },
  ],

  DONOR: [
    {
      groupTitle: 'Philanthropic Portfolio',
      items: [
        { id: 'giving_history', label: 'Giving History', icon: 'Heart', href: '/dashboard' },
        { id: 'tax_statements', label: '80G Tax Certificates', icon: 'FileText', href: '/dashboard' },
        { id: 'tax_calculator', label: 'Tax Savings Calculator', icon: 'DollarSign', href: '/dashboard' },
      ],
    },
  ],

  MEMBER: [
    {
      groupTitle: 'Assembly Member Hub',
      items: [
        { id: 'digital_card', label: 'Digital Membership Pass', icon: 'QrCode', href: '/dashboard' },
        { id: 'governance', label: 'Governance & Standing', icon: 'ShieldCheck', href: '/dashboard' },
        { id: 'annual_renewal', label: 'Membership Renewal', icon: 'Calendar', href: '/dashboard' },
      ],
    },
  ],

  GUEST: [
    {
      groupTitle: 'Public Portal',
      items: [
        { id: 'explore', label: 'Home', icon: 'Home', href: '/' },
        { id: 'donate', label: 'Donate Now', icon: 'Heart', href: '/donate' },
        { id: 'volunteer', label: 'Be a Volunteer', icon: 'Users', href: '/volunteer' },
      ],
    },
  ],
};

export const getDashboardNavForRole = (role: UserRole): DashboardNavGroup[] => {
  return ROLE_DASHBOARD_NAVIGATION[role] || ROLE_DASHBOARD_NAVIGATION.GUEST;
};

export * from './navigation';
