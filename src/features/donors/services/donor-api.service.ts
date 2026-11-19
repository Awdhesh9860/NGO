import { ApiResponse } from '@/lib/api-response';
import { CreateDonorInput, UpdateDonorInput } from '../schemas/donor.schema';

export interface DonorItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  donorType: 'INDIVIDUAL' | 'CORPORATE' | 'INSTITUTIONAL' | 'FOUNDATION';
  organizationName?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  communicationPreferences?: {
    emailReceipts: boolean;
    campaignUpdates: boolean;
    newsletters: boolean;
    smsAlerts: boolean;
  };
  anonymousDisplayDefault: boolean;
  taxDetails?: {
    panNumber?: string;
  };
  firstDonationAt?: string | null;
  lastDonationAt?: string | null;
  lifetimeAmountMinor: number;
  donationCount: number;
  hasActiveRecurring: boolean;
  segments: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'DO_NOT_CONTACT';
  internalNotes?: string;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface DonorProfileResponse {
  donor: DonorItem;
  donations: Array<{
    _id: string;
    donationCode: string;
    amountMinor: number;
    refundedAmountMinor: number;
    currency: string;
    status: string;
    paymentProvider: string;
    purpose: string;
    receiptStatus: string;
    createdAt: string;
  }>;
  recurringDonations: Array<{
    _id: string;
    provider: string;
    planInterval: string;
    amountMinor: number;
    currency: string;
    status: string;
    completedCycles: number;
    createdAt: string;
  }>;
}

export class DonorApiService {
  private async fetchJson<T>(url: string, init?: RequestInit): Promise<ApiResponse<T>> {
    const res = await fetch(url, {
      ...init,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    });
    return await res.json();
  }

  async list(params: {
    page?: number;
    limit?: number;
    donorType?: string;
    status?: string;
    search?: string;
    hasActiveRecurring?: boolean;
  } = {}): Promise<ApiResponse<DonorItem[]>> {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.donorType) q.set('donorType', params.donorType);
    if (params.status) q.set('status', params.status);
    if (params.search) q.set('search', params.search);
    if (typeof params.hasActiveRecurring === 'boolean') {
      q.set('hasActiveRecurring', String(params.hasActiveRecurring));
    }
    return this.fetchJson<DonorItem[]>(`/api/v1/donors?${q.toString()}`);
  }

  async getById(id: string): Promise<ApiResponse<DonorProfileResponse>> {
    return this.fetchJson<DonorProfileResponse>(`/api/v1/donors/${id}`);
  }

  async create(data: CreateDonorInput): Promise<ApiResponse<DonorItem>> {
    return this.fetchJson<DonorItem>('/api/v1/donors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: UpdateDonorInput): Promise<ApiResponse<DonorItem>> {
    return this.fetchJson<DonorItem>(`/api/v1/donors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async exportDonors(): Promise<ApiResponse<DonorItem[]>> {
    return this.fetchJson<DonorItem[]>('/api/v1/donors?export=true');
  }
}

export const donorApiService = new DonorApiService();
