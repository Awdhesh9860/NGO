/**
 * Configuration-Driven Navigation Trees
 * Standardized across Public, Admin, Team Member, Volunteer, Donor, and Member portals.
 * Designed to support dynamic RBAC and tenant feature flags in subsequent phases.
 */

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  badge?: string;
  requiredPermission?: string;
  children?: NavItem[];
}

export const NAVIGATION_CONFIG = {
  // Public Portal Navigation
  public: [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'about', label: 'About Us', href: '/about' },
    { id: 'projects', label: 'Projects & Impact', href: '/projects' },
    { id: 'transparency', label: '80G & Financials', href: '/transparency' },
    { id: 'news', label: 'News & Stories', href: '/news' },
    { id: 'events', label: 'Events', href: '/events' },
    { id: 'verify', label: 'Verify Certificate', href: '/verify' },
    { id: 'contact', label: 'Contact', href: '/contact' },
  ] as NavItem[],

  // Admin Portal Navigation (Full System Control)
  admin: [
    { id: 'admin-dash', label: 'Overview', href: '/admin', icon: 'LayoutDashboard' },
    {
      id: 'admin-impact',
      label: 'Impact Programs',
      href: '/admin/programs',
      icon: 'Target',
      children: [
        { id: 'adm-projects', label: 'Projects', href: '/admin/projects' },
        { id: 'adm-campaigns', label: 'Campaigns', href: '/admin/campaigns' },
        { id: 'adm-beneficiaries', label: 'Beneficiaries', href: '/admin/beneficiaries' },
      ],
    },
    {
      id: 'admin-finance',
      label: 'Donations & 80G',
      href: '/admin/donations',
      icon: 'Receipt',
      children: [
        { id: 'adm-donations-list', label: 'All Donations', href: '/admin/donations' },
        { id: 'adm-80g-receipts', label: '80G Form 10BE', href: '/admin/donations/80g' },
        { id: 'adm-donors', label: 'Donor Database', href: '/admin/donors' },
        { id: 'adm-financial-audits', label: 'Audit Statements', href: '/admin/finance/audits' },
      ],
    },
    {
      id: 'admin-people',
      label: 'Staff & Volunteers',
      href: '/admin/people',
      icon: 'Users',
      children: [
        { id: 'adm-team', label: 'Team Directory', href: '/admin/team' },
        { id: 'adm-volunteers', label: 'Volunteers', href: '/admin/volunteers' },
        { id: 'adm-attendance', label: 'Attendance & Leaves', href: '/admin/attendance' },
      ],
    },
    {
      id: 'admin-community',
      label: 'Community & Events',
      href: '/admin/events',
      icon: 'Calendar',
      children: [
        { id: 'adm-events-list', label: 'Events & Workshops', href: '/admin/events' },
        { id: 'adm-certificates', label: 'Certificates Vault', href: '/admin/certificates' },
        { id: 'adm-memberships', label: 'Memberships', href: '/admin/memberships' },
      ],
    },
    {
      id: 'admin-cms',
      label: 'CMS & Stories',
      href: '/admin/cms',
      icon: 'FileText',
      children: [
        { id: 'adm-blogs', label: 'Blog Posts', href: '/admin/cms/blogs' },
        { id: 'adm-news', label: 'Press Releases', href: '/admin/cms/news' },
        { id: 'adm-media', label: 'Media Library', href: '/admin/cms/media' },
      ],
    },
    {
      id: 'admin-system',
      label: 'Governance & Settings',
      href: '/admin/settings',
      icon: 'Settings',
      children: [
        { id: 'adm-rbac', label: 'Roles & RBAC', href: '/admin/settings/roles' },
        { id: 'adm-audit-logs', label: 'Audit Trail', href: '/admin/settings/audit-logs' },
        { id: 'adm-statutory', label: 'NGO Compliance (FCRA/12A)', href: '/admin/settings/compliance' },
      ],
    },
  ] as NavItem[],

  // Team Member Navigation (Focused operational workspace)
  team: [
    { id: 'team-dash', label: 'Workspace', href: '/team', icon: 'LayoutDashboard' },
    { id: 'team-projects', label: 'My Projects', href: '/team/projects', icon: 'FolderKanban' },
    { id: 'team-tasks', label: 'My Tasks', href: '/team/tasks', icon: 'CheckSquare' },
    { id: 'team-attendance', label: 'Attendance & Check-in', href: '/team/attendance', icon: 'Clock' },
    { id: 'team-leave', label: 'Leave Requests', href: '/team/leave', icon: 'CalendarDays' },
    { id: 'team-events', label: 'Field Events', href: '/team/events', icon: 'Calendar' },
    { id: 'team-docs', label: 'Field Documents', href: '/team/documents', icon: 'FileSpreadsheet' },
    { id: 'team-notifications', label: 'Notifications', href: '/team/notifications', icon: 'Bell' },
    { id: 'team-profile', label: 'My Profile', href: '/team/profile', icon: 'User' },
  ] as NavItem[],

  // Volunteer Navigation (Service hours, badges & tasks)
  volunteer: [
    { id: 'vol-dash', label: 'Volunteer Hub', href: '/volunteer', icon: 'LayoutDashboard' },
    { id: 'vol-tasks', label: 'Assigned Tasks', href: '/volunteer/tasks', icon: 'CheckCircle' },
    { id: 'vol-events', label: 'Upcoming Drives', href: '/volunteer/events', icon: 'Calendar' },
    { id: 'vol-hours', label: 'Hours & Attendance', href: '/volunteer/hours', icon: 'Clock' },
    { id: 'vol-certificates', label: 'My Certificates', href: '/volunteer/certificates', icon: 'Award' },
    { id: 'vol-leaderboard', label: 'Badge & Impact Tier', href: '/volunteer/badges', icon: 'Trophy' },
    { id: 'vol-notifications', label: 'Announcements', href: '/volunteer/notifications', icon: 'Bell' },
    { id: 'vol-profile', label: 'Volunteer Profile', href: '/volunteer/profile', icon: 'User' },
  ] as NavItem[],

  // Donor Navigation (Receipts, Form 10BE, direct impact reports)
  donor: [
    { id: 'donor-dash', label: 'Impact Dashboard', href: '/donor', icon: 'HeartHandshake' },
    { id: 'donor-history', label: 'Donation History', href: '/donor/donations', icon: 'Receipt' },
    { id: 'donor-80g', label: '80G Tax Certificates', href: '/donor/80g', icon: 'FileCheck' },
    { id: 'donor-recurring', label: 'Sustained Giving', href: '/donor/recurring', icon: 'Repeat' },
    { id: 'donor-campaigns', label: 'Supported Causes', href: '/donor/causes', icon: 'Target' },
    { id: 'donor-updates', label: 'Field Reports', href: '/donor/reports', icon: 'TrendingUp' },
    { id: 'donor-profile', label: 'Donor Profile', href: '/donor/profile', icon: 'User' },
  ] as NavItem[],

  // Member Navigation (Digital pass, QR badge, exclusive privileges)
  member: [
    { id: 'member-dash', label: 'Member Center', href: '/member', icon: 'BadgeCheck' },
    { id: 'member-card', label: 'Digital Pass & QR', href: '/member/card', icon: 'QrCode' },
    { id: 'member-renew', label: 'Membership Tier', href: '/member/renewal', icon: 'Sparkles' },
    { id: 'member-events', label: 'Member Assemblies', href: '/member/events', icon: 'Calendar' },
    { id: 'member-benefits', label: 'Privileges & Access', href: '/member/privileges', icon: 'Gift' },
    { id: 'member-profile', label: 'Membership Profile', href: '/member/profile', icon: 'User' },
  ] as NavItem[],
};
