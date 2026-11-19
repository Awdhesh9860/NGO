import { ApiResponse } from '@/lib/api-response';
import {
  CreateUserInput,
  UpdateUserInput,
  CreateDepartmentInput,
  UpdateDepartmentInput,
  CreateInvitationInput,
  UpdateOrganizationInput,
  CreateRoleInput,
  UpdateRoleInput,
} from '../schemas/admin.schema';

export interface AdminUserActivity {
  id: string;
  action: string;
  resource: string;
  details?: string;
  timestamp: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  customRoleId?: { _id: string; name: string; key: string; permissions: string[] } | string;
  departmentId?: { _id: string; name: string; slug: string } | string;
  managerId?: { _id: string; name: string; email: string; designation?: string } | string;
  phone?: string;
  designation?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
  activity?: AdminUserActivity[];
}

export interface AdminUserSession {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  lastActiveAt: string;
  expiresAt: string;
  createdAt: string;
}

export interface AdminDepartmentMember {
  id: string;
  name: string;
  email: string;
  role: string;
  designation?: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface AdminDepartment {
  id: string;
  name: string;
  slug: string;
  description?: string;
  headUser?: { _id: string; name: string; email: string; avatar?: string; designation?: string };
  budget: number;
  status: 'active' | 'inactive';
  memberCount: number;
  members?: AdminDepartmentMember[];
  activity?: Array<{ id: string; actorName: string; action: string; details?: string; timestamp: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface AdminInvitation {
  id: string;
  email: string;
  role: string;
  department?: { _id: string; name: string; slug: string };
  invitedBy?: { _id: string; name: string; email: string };
  expiresAt: string;
  status: 'pending' | 'accepted' | 'revoked' | 'expired';
  acceptedAt?: string;
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  metadata?: Record<string, unknown>;
  correlationId?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface AdminRoleSummary {
  id: string;
  name: string;
  key: string;
  description?: string;
  permissions: string[];
  isSystemRole: boolean;
  status: 'active' | 'inactive';
  assignedUserCount?: number;
  createdAt?: string;
}

export interface PermissionCatalogItem {
  key: string;
  label: string;
  description: string;
  module: string;
  isPlatformProtected?: boolean;
}

export interface AdminOrganization {
  id: string;
  name: string;
  legalName?: string;
  slug: string;
  customDomain?: string;
  logo?: string;
  description?: string;
  website?: string;
  contactEmail: string;
  contactPhone?: string;
  headquartersAddress?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  verificationStatus: 'unverified' | 'pending' | 'verified';
  verifiedAt?: string;
  identity: {
    registrationType?: string;
    registrationNumber?: string;
    registeredAddress?: string;
    establishmentDate?: string;
  };
  statutory: {
    panNumber?: string;
    section80GNumber?: string;
    section12ANumber?: string;
    fcraNumber?: string;
    darpanId?: string;
    taxExemptionPercentage: number;
  };
  regional: {
    country: string;
    state?: string;
    district?: string;
    timezone: string;
    currencyCode: string;
    currencySymbol: string;
    dateFormat: string;
    language: string;
  };
  securitySettings: {
    sessionTimeoutMinutes: number;
    minPasswordLength: number;
    requireStrongPassword: boolean;
    maxFailedLoginAttempts: number;
    invitationExpiryDays: number;
    twoFactorPolicy: 'optional' | 'recommended' | 'required_for_admins';
  };
  notificationSettings: {
    emailNotifications: boolean;
    adminAlerts: boolean;
    invitationNotifications: boolean;
  };
  settings: {
    currencyCode: string;
    currencySymbol: string;
    defaultLocale: string;
    autoSendReceipts: boolean;
    maintenanceMode: boolean;
  };
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminNotification {
  id: string;
  type: 'security' | 'invitation' | 'compliance' | 'system';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  actionUrl?: string;
}

export interface AdminSearchResult {
  users: Array<{ id: string; name: string; email: string; role: string; status: string }>;
  departments: Array<{ id: string; name: string; slug: string; status: string }>;
  invitations: Array<{ id: string; email: string; role: string; status: string }>;
  roles: Array<{ id: string; name: string; key: string; status: string }>;
}

export interface AdminExecutiveStats {
  userMetrics: {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    byRole: Record<string, number>;
  };
  organizationMetrics: {
    departmentCount: number;
    activeDepartmentCount: number;
    pendingInvitationsCount: number;
    customRolesCount: number;
    recentAuditCount: number;
    volunteersCount: number;
    membersCount: number;
    donorsCount: number;
  };
  charts: {
    monthlyRegistrations: Array<{ month: string; count: number }>;
    departmentDistribution: Array<{ departmentId: string; name: string; count: number }>;
  };
  recentActivity: AdminAuditLog[];
}

export class AdminApiService {
  private async fetchJson<T>(url: string, init?: RequestInit): Promise<ApiResponse<T>> {
    const res = await fetch(url, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    });
    return await res.json();
  }

  async getExecutiveStats(): Promise<ApiResponse<AdminExecutiveStats>> {
    return this.fetchJson<AdminExecutiveStats>('/api/v1/admin/stats');
  }

  async globalSearch(query: string): Promise<ApiResponse<AdminSearchResult>> {
    return this.fetchJson<AdminSearchResult>(`/api/v1/admin/search?q=${encodeURIComponent(query)}`);
  }

  async getNotifications(): Promise<ApiResponse<AdminNotification[]>> {
    return this.fetchJson<AdminNotification[]>('/api/v1/admin/notifications');
  }

  // Users
  async getUsers(params: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    departmentId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<ApiResponse<AdminUser[]>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.role) query.set('role', params.role);
    if (params.status) query.set('status', params.status);
    if (params.departmentId) query.set('departmentId', params.departmentId);
    if (params.search) query.set('search', params.search);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);

    return this.fetchJson<AdminUser[]>(`/api/v1/admin/users?${query.toString()}`);
  }

  async getUserById(id: string): Promise<ApiResponse<AdminUser>> {
    return this.fetchJson<AdminUser>(`/api/v1/admin/users/${id}`);
  }

  async createUser(data: CreateUserInput): Promise<ApiResponse<AdminUser>> {
    return this.fetchJson<AdminUser>('/api/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: UpdateUserInput): Promise<ApiResponse<AdminUser>> {
    return this.fetchJson<AdminUser>(`/api/v1/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deactivateUser(id: string): Promise<ApiResponse<{ id: string; status: string }>> {
    return this.fetchJson<{ id: string; status: string }>(`/api/v1/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getUserSessions(id: string): Promise<ApiResponse<AdminUserSession[]>> {
    return this.fetchJson<AdminUserSession[]>(`/api/v1/admin/users/${id}/sessions`);
  }

  async revokeUserSession(
    userId: string,
    options: { sessionId?: string; all?: boolean }
  ): Promise<ApiResponse<{ revokedCount: number }>> {
    const query = options.all
      ? 'all=true'
      : `sessionId=${encodeURIComponent(options.sessionId || '')}`;
    return this.fetchJson<{ revokedCount: number }>(
      `/api/v1/admin/users/${userId}/sessions?${query}`,
      { method: 'DELETE' }
    );
  }

  // Departments
  async getDepartments(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}): Promise<ApiResponse<AdminDepartment[]>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);

    return this.fetchJson<AdminDepartment[]>(`/api/v1/admin/departments?${query.toString()}`);
  }

  async getDepartmentById(id: string): Promise<ApiResponse<AdminDepartment>> {
    return this.fetchJson<AdminDepartment>(`/api/v1/admin/departments/${id}`);
  }

  async createDepartment(data: CreateDepartmentInput): Promise<ApiResponse<AdminDepartment>> {
    return this.fetchJson<AdminDepartment>('/api/v1/admin/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDepartment(id: string, data: UpdateDepartmentInput): Promise<ApiResponse<AdminDepartment>> {
    return this.fetchJson<AdminDepartment>(`/api/v1/admin/departments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteDepartment(id: string): Promise<ApiResponse<{ id: string; deleted: boolean }>> {
    return this.fetchJson<{ id: string; deleted: boolean }>(`/api/v1/admin/departments/${id}`, {
      method: 'DELETE',
    });
  }

  async assignDepartmentMember(departmentId: string, userId: string): Promise<ApiResponse<unknown>> {
    return this.fetchJson(`/api/v1/admin/departments/${departmentId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async removeDepartmentMember(departmentId: string, userId: string): Promise<ApiResponse<unknown>> {
    return this.fetchJson(
      `/api/v1/admin/departments/${departmentId}/members?userId=${encodeURIComponent(userId)}`,
      { method: 'DELETE' }
    );
  }

  // Invitations
  async getInvitations(params: {
    page?: number;
    limit?: number;
    status?: string;
    role?: string;
    search?: string;
  } = {}): Promise<ApiResponse<AdminInvitation[]>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.status) query.set('status', params.status);
    if (params.role) query.set('role', params.role);
    if (params.search) query.set('search', params.search);

    return this.fetchJson<AdminInvitation[]>(`/api/v1/admin/invitations?${query.toString()}`);
  }

  async sendInvitation(data: CreateInvitationInput): Promise<ApiResponse<AdminInvitation>> {
    return this.fetchJson<AdminInvitation>('/api/v1/admin/invitations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resendInvitation(id: string): Promise<ApiResponse<AdminInvitation>> {
    return this.fetchJson<AdminInvitation>(`/api/v1/admin/invitations/${id}/resend`, {
      method: 'POST',
    });
  }

  async revokeInvitation(id: string): Promise<ApiResponse<{ id: string; status: string }>> {
    return this.fetchJson<{ id: string; status: string }>(`/api/v1/admin/invitations/${id}`, {
      method: 'DELETE',
    });
  }

  // Roles & Permissions
  async getRoles(): Promise<
    ApiResponse<{
      systemRoles: Record<string, string[]>;
      customRoles: AdminRoleSummary[];
      allPermissionsCatalog: PermissionCatalogItem[];
    }>
  > {
    return this.fetchJson('/api/v1/admin/roles');
  }

  async getRoleById(id: string): Promise<
    ApiResponse<{
      role: AdminRoleSummary;
      allPermissionsCatalog: PermissionCatalogItem[];
    }>
  > {
    return this.fetchJson(`/api/v1/admin/roles/${id}`);
  }

  async createRole(data: CreateRoleInput): Promise<ApiResponse<AdminRoleSummary>> {
    return this.fetchJson<AdminRoleSummary>('/api/v1/admin/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRole(id: string, data: UpdateRoleInput): Promise<ApiResponse<AdminRoleSummary>> {
    return this.fetchJson<AdminRoleSummary>(`/api/v1/admin/roles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Organization
  async getOrganization(): Promise<ApiResponse<AdminOrganization>> {
    return this.fetchJson<AdminOrganization>('/api/v1/admin/organization');
  }

  async updateOrganization(data: UpdateOrganizationInput): Promise<ApiResponse<AdminOrganization>> {
    return this.fetchJson<AdminOrganization>('/api/v1/admin/organization', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async listPlatformOrganizations(): Promise<
    ApiResponse<
      Array<{
        id: string;
        name: string;
        slug: string;
        status: string;
        verificationStatus: string;
        contactEmail: string;
      }>
    >
  > {
    return this.fetchJson('/api/v1/admin/organizations');
  }

  // Audit Logs
  async getAuditLogs(params: {
    page?: number;
    limit?: number;
    actorId?: string;
    action?: string;
    resource?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<ApiResponse<AdminAuditLog[]>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.actorId) query.set('actorId', params.actorId);
    if (params.action) query.set('action', params.action);
    if (params.resource) query.set('resource', params.resource);
    if (params.search) query.set('search', params.search);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);

    return this.fetchJson<AdminAuditLog[]>(`/api/v1/admin/audit-logs?${query.toString()}`);
  }
}

export const adminApiService = new AdminApiService();
