import { ApiResponse } from '@/lib/api-response';
import {
  CreateMembershipApplicationInput,
  CreateMembershipPlanInput,
  CreateMembershipRenewalInput,
  ReviewMembershipApplicationInput,
  UpdateMembershipStatusInput,
} from '../schemas/membership.schema';

export interface MembershipPlanItem {
  _id: string;
  name: string;
  code: string;
  category: 'GENERAL' | 'ANNUAL' | 'LIFETIME' | 'SUPPORTING' | 'INSTITUTIONAL';
  description: string;
  feeAmountMinor: number;
  currency: string;
  validityDays: number;
  isLifetime: boolean;
  gracePeriodDays: number;
  eligibilityCriteria?: string;
  benefits: string[];
  votingRights: boolean;
  requiresApproval: boolean;
  isPublicVisible: boolean;
  isActive: boolean;
}

export interface MembershipApplicationItem {
  _id: string;
  applicationCode: string;
  planId: MembershipPlanItem | string;
  category: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  occupation?: string;
  organizationName?: string;
  reasonForJoining: string;
  feeAmountMinor: number;
  currency: string;
  feePaymentStatus: string;
  status: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface MemberRecordItem {
  _id: string;
  membershipNumber: string;
  planId?: MembershipPlanItem | string;
  category: string;
  fullName: string;
  email: string;
  mobileNumber?: string;
  address?: string;
  occupation?: string;
  organizationName?: string;
  status: string;
  startDate: string;
  expiryDate?: string | null;
  graceUntilDate?: string | null;
  isLifetime: boolean;
  feeAmountMinor: number;
  currency: string;
  feePaymentStatus: string;
  internalNotes?: string;
  createdAt: string;
}

export interface MembershipRenewalItem {
  _id: string;
  previousExpiryDate?: string | null;
  newStartDate: string;
  newExpiryDate?: string | null;
  feeAmountMinor: number;
  currency: string;
  paymentStatus: string;
  paymentReference?: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export class MembershipApiService {
  private async fetchJson<T>(url: string, init?: RequestInit): Promise<ApiResponse<T>> {
    const res = await fetch(url, {
      ...init,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    });
    return await res.json();
  }

  async listPlans(publicOnly = false) {
    return this.fetchJson<MembershipPlanItem[]>(
      `/api/v1/membership/plans${publicOnly ? '?public=true' : ''}`
    );
  }

  async createPlan(data: CreateMembershipPlanInput) {
    return this.fetchJson<MembershipPlanItem>('/api/v1/membership/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listApplications(status?: string) {
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.fetchJson<MembershipApplicationItem[]>(`/api/v1/membership/applications${q}`);
  }

  async submitApplication(data: CreateMembershipApplicationInput) {
    return this.fetchJson<{ id: string; applicationCode: string; status: string }>(
      '/api/v1/membership/applications',
      { method: 'POST', body: JSON.stringify(data) }
    );
  }

  async reviewApplication(id: string, data: ReviewMembershipApplicationInput) {
    return this.fetchJson(`/api/v1/membership/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async listMembers(params: { status?: string; category?: string; search?: string } = {}) {
    const q = new URLSearchParams();
    if (params.status) q.set('status', params.status);
    if (params.category) q.set('category', params.category);
    if (params.search) q.set('search', params.search);
    return this.fetchJson<MemberRecordItem[]>(`/api/v1/membership/members?${q.toString()}`);
  }

  async getMemberDetail(id: string) {
    return this.fetchJson<{ member: MemberRecordItem; renewals: MembershipRenewalItem[] }>(
      `/api/v1/membership/members/${id}`
    );
  }

  async updateMemberStatus(id: string, data: UpdateMembershipStatusInput) {
    return this.fetchJson<MemberRecordItem>(`/api/v1/membership/members/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async processRenewal(id: string, data: CreateMembershipRenewalInput) {
    return this.fetchJson<MembershipRenewalItem>(`/api/v1/membership/members/${id}/renewals`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const membershipApiService = new MembershipApiService();
