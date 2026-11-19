import { ApiResponse } from '@/lib/api-response';
import {
  CampaignApprovalActionInput,
  CreateCampaignInput,
  CreateCampaignUpdateInput,
  UpdateCampaignInput,
} from '../schemas/campaign.schema';

export interface CampaignItem {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  code: string;
  shortSummary: string;
  story?: string;
  category: string;
  coverImage?: string;
  gallery?: string[];
  videoUrl?: string;
  targetAmountMinor: number;
  raisedAmountMinor: number;
  grossAmountMinor?: number;
  refundedAmountMinor?: number;
  progressPercentage: number;
  donorCount: number;
  donationCount: number;
  minimumDonationMinor: number;
  suggestedAmountsMinor?: number[];
  currency: string;
  startDate?: string;
  endDate?: string;
  program?: { _id: string; title: string; slug: string; code: string } | string;
  project?: { _id: string; name: string; slug: string; code: string } | string;
  campaignManager?: { _id: string; name: string; email: string; role: string } | string;
  status: string;
  isPublicVisible: boolean;
  isFeatured: boolean;
  rejectionReason?: string;
  approvalHistory?: Array<{
    action: string;
    actorName: string;
    actorRole: string;
    comments?: string;
    timestamp: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CampaignUpdateItem {
  _id?: string;
  id?: string;
  title: string;
  content: string;
  imageUrl?: string;
  isPublicVisible: boolean;
  authorName?: string;
  createdAt: string;
}

export interface CampaignDetailResponse {
  campaign: CampaignItem;
  metrics: {
    grossMinor: number;
    refundedMinor: number;
    netRaisedMinor: number;
    targetAmountMinor: number;
    progressPercentage: number;
    donorCount: number;
    donationCount: number;
  };
  updates: CampaignUpdateItem[];
  recentDonations: Array<{
    _id: string;
    donationCode: string;
    amountMinor: number;
    refundedAmountMinor: number;
    currency: string;
    status: string;
    paymentProvider: string;
    isAnonymous: boolean;
    donorSnapshot: { name: string; email: string };
    createdAt: string;
  }>;
}

export interface PublicCampaignDetailResponse {
  campaign: CampaignItem;
  updates: CampaignUpdateItem[];
  recentSupporters: Array<{
    displayName: string;
    amountMinor: number;
    currency: string;
    donatedAt: string;
  }>;
}

export class CampaignApiService {
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
    status?: string;
    category?: string;
    search?: string;
    includeArchived?: boolean;
  } = {}): Promise<ApiResponse<CampaignItem[]>> {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.status) q.set('status', params.status);
    if (params.category) q.set('category', params.category);
    if (params.search) q.set('search', params.search);
    if (params.includeArchived) q.set('includeArchived', 'true');
    return this.fetchJson<CampaignItem[]>(`/api/v1/campaigns?${q.toString()}`);
  }

  async getById(id: string): Promise<ApiResponse<CampaignDetailResponse>> {
    return this.fetchJson<CampaignDetailResponse>(`/api/v1/campaigns/${id}`);
  }

  async create(data: CreateCampaignInput): Promise<ApiResponse<CampaignItem>> {
    return this.fetchJson<CampaignItem>('/api/v1/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: UpdateCampaignInput): Promise<ApiResponse<CampaignItem>> {
    return this.fetchJson<CampaignItem>(`/api/v1/campaigns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async archive(id: string): Promise<ApiResponse<CampaignItem>> {
    return this.fetchJson<CampaignItem>(`/api/v1/campaigns/${id}`, {
      method: 'DELETE',
    });
  }

  async approvalAction(
    id: string,
    data: CampaignApprovalActionInput
  ): Promise<ApiResponse<CampaignItem>> {
    return this.fetchJson<CampaignItem>(`/api/v1/campaigns/${id}/approval`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addUpdate(
    id: string,
    data: CreateCampaignUpdateInput
  ): Promise<ApiResponse<CampaignUpdateItem>> {
    return this.fetchJson<CampaignUpdateItem>(`/api/v1/campaigns/${id}/updates`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listPublic(params: {
    category?: string;
    status?: string;
    search?: string;
  } = {}): Promise<ApiResponse<CampaignItem[]>> {
    const q = new URLSearchParams();
    if (params.category) q.set('category', params.category);
    if (params.status) q.set('status', params.status);
    if (params.search) q.set('search', params.search);
    return this.fetchJson<CampaignItem[]>(`/api/v1/public/campaigns?${q.toString()}`);
  }

  async getPublicBySlug(slug: string): Promise<ApiResponse<PublicCampaignDetailResponse>> {
    return this.fetchJson<PublicCampaignDetailResponse>(
      `/api/v1/public/campaigns/${encodeURIComponent(slug)}`
    );
  }
}

export const campaignApiService = new CampaignApiService();
