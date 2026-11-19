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

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  departmentId?: { _id: string; name: string; slug: string } | string;
  phone?: string;
  designation?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AdminDepartment {
  id: string;
  name: string;
  slug: string;
  description?: string;
  headUser?: { _id: string; name: string; email: string; avatar?: string };
  budget: number;
  status: 'active' | 'inactive';
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
  ipAddress?: string;
  timestamp: string;
}

export interface AdminOrganization {
  id: string;
  name: string;
  slug: string;
  customDomain?: string;
  logo?: string;
  contactEmail: string;
  contactPhone?: string;
  headquartersAddress?: string;
  statutory: {
    panNumber?: string;
    section80GNumber?: string;
    section12ANumber?: string;
    fcraNumber?: string;
    darpanId?: string;
    taxExemptionPercentage: number;
  };
  settings: {
    currencyCode: string;
    currencySymbol: string;
    defaultLocale: string;
    autoSendReceipts: boolean;
    maintenanceMode: boolean;
  };
  isActive: boolean;
}

export interface AdminExecutiveStats {
  userMetrics: {
    total: number;
    active: number;
    suspended: number;
    byRole: Record<string, number>;
  };
  organizationMetrics: {
    departmentCount: number;
    pendingInvitationsCount: number;
    recentAuditCount: number;
  };
  recentActivity: AdminAuditLog[];
}

export class AdminApiService {
  private async fetchJson<T>(url: string, init?: RequestInit): Promise<ApiResponse<T>> {
    const res = await fetch(url, {
      ...init,
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

  async getUsers(params: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    departmentId?: string;
    search?: string;
  } = {}): Promise<ApiResponse<AdminUser[]>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.role) query.set('role', params.role);
    if (params.status) query.set('status', params.status);
    if (params.departmentId) query.set('departmentId', params.departmentId);
    if (params.search) query.set('search', params.search);

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

  async revokeInvitation(id: string): Promise<ApiResponse<{ id: string; status: string }>> {
    return this.fetchJson<{ id: string; status: string }>(`/api/v1/admin/invitations/${id}`, {
      method: 'DELETE',
    });
  }

  async getRoles(): Promise<ApiResponse<{
    systemRoles: Record<string, string[]>;
    customRoles: Array<{
      id: string;
      name: string;
      key: string;
      description?: string;
      permissions: string[];
      isSystemRole: boolean;
      status: string;
      createdAt: string;
    }>;
    allPermissionsCatalog: Array<{ key: string; name: string; description: string; module: string }>;
  }>> {
    return this.fetchJson('/api/v1/admin/roles');
  }

  async createRole(data: CreateRoleInput): Promise<ApiResponse<unknown>> {
    return this.fetchJson('/api/v1/admin/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRole(id: string, data: UpdateRoleInput): Promise<ApiResponse<unknown>> {
    return this.fetchJson(`/api/v1/admin/roles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getOrganization(): Promise<ApiResponse<AdminOrganization>> {
    return this.fetchJson<AdminOrganization>('/api/v1/admin/organization');
  }

  async updateOrganization(data: UpdateOrganizationInput): Promise<ApiResponse<AdminOrganization>> {
    return this.fetchJson<AdminOrganization>('/api/v1/admin/organization', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

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
