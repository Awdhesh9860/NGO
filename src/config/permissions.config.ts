import { UserRole, PermissionKey } from '../types';

/**
 * Standard Role Permissions Catalog
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  SUPER_ADMIN: [
    'users.view', 'users.manage', 'roles.manage', 'projects.view', 'projects.manage',
    'projects.view_assigned', 'tasks.assign_manage', 'tasks.update_assigned', 'donations.view_all',
    'donations.refund', 'donations.view_own', 'content.publish', 'certificates.issue',
    'reports.export_financial', 'audit_logs.view', 'settings.manage'
  ],
  ADMIN: [
    'users.view', 'users.manage', 'projects.view', 'projects.manage', 'projects.view_assigned',
    'tasks.assign_manage', 'tasks.update_assigned', 'donations.view_all', 'donations.refund',
    'donations.view_own', 'content.publish', 'certificates.issue', 'reports.export_financial',
    'audit_logs.view', 'settings.manage'
  ],
  EXECUTIVE_DIRECTOR: [
    'users.view', 'projects.view', 'projects.view_assigned', 'donations.view_all',
    'donations.view_own', 'reports.export_financial', 'audit_logs.view'
  ],
  MANAGER: [
    'projects.view', 'projects.manage', 'projects.view_assigned', 'tasks.assign_manage',
    'tasks.update_assigned', 'donations.view_own'
  ],
  PROJECT_MANAGER: [
    'projects.view', 'projects.manage', 'projects.view_assigned', 'tasks.assign_manage',
    'tasks.update_assigned', 'donations.view_own'
  ],
  ACCOUNTANT: [
    'donations.view_all', 'donations.refund', 'donations.view_own', 'reports.export_financial'
  ],
  COMMUNICATIONS: [
    'projects.view', 'content.publish', 'donations.view_own'
  ],
  CONTENT_EDITOR: [
    'content.publish', 'projects.view'
  ],
  TEAM_MEMBER: [
    'projects.view_assigned', 'tasks.update_assigned', 'donations.view_own'
  ],
  VOLUNTEER: [
    'projects.view_assigned', 'donations.view_own'
  ],
  DONOR: [
    'donations.view_own'
  ],
  MEMBER: [
    'projects.view', 'donations.view_own'
  ],
  GUEST: []
};

export default DEFAULT_ROLE_PERMISSIONS;
