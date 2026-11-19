import { ApiResponse } from '@/lib/api-response';
import { CreateProgramInput, UpdateProgramInput } from '../schemas/program.schema';
import { SubmitApprovalInput, DecideApprovalInput } from '@/features/project-approvals/schemas/approval.schema';

export interface ProgramItem {
  id: string;
  title: string;
  slug: string;
  code: string;
  shortDescription: string;
  detailedDescription?: string;
  objectives?: string[];
  targetAudience?: string;
  focusArea?: string;
  category: string;
  coverImage?: string;
  gallery?: string[];
  startDate?: string;
  endDate?: string;
  programManager?: { _id: string; name: string; email: string; designation?: string };
  department?: { _id: string; name: string; slug: string };
  budget: number;
  targetBeneficiaries: number;
  actualBeneficiaries: number;
  geographicCoverage?: string[];
  expectedOutcomes?: string[];
  kpis?: Array<{ name: string; targetValue: number; currentValue: number; unit: string }>;
  kpisCount?: number;
  status: string;
  isPublicVisible: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ProgramDetailResponse {
  program: ProgramItem;
  projects: Array<{
    id: string;
    name: string;
    code: string;
    slug: string;
    status: string;
    approvedBudget: number;
    progressPercentage: number;
    targetBeneficiaries: number;
    actualBeneficiaries: number;
  }>;
  approvals: Array<{
    id: string;
    stage: string;
    status: string;
    submittedBy?: { _id: string; name: string; email: string };
    assignedApproverId?: { _id: string; name: string; email: string };
    decidedBy?: { _id: string; name: string; email: string };
    submissionNotes?: string;
    decisionComments?: string;
    rejectionReason?: string;
    revisionCount: number;
    history: Array<{ action: string; actorName: string; actorRole: string; comments?: string; timestamp: string }>;
    createdAt: string;
    decidedAt?: string;
  }>;
  activity: Array<{
    id: string;
    actorName: string;
    actorRole: string;
    action: string;
    details?: string;
    timestamp: string;
  }>;
  performance: {
    projectCount: number;
    activeProjectCount: number;
    completedProjectCount: number;
    programBudget: number;
    allocatedProjectBudgets: number;
    totalPlannedExpenditure: number;
    totalActualExpenditure: number;
    remainingProgramBudget: number;
    utilizationPercentage: number;
    targetBeneficiaries: number;
    actualBeneficiaries: number;
  };
}

export class ProgramApiService {
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
    departmentId?: string;
    search?: string;
    includeArchived?: boolean;
  } = {}): Promise<ApiResponse<ProgramItem[]>> {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.status) q.set('status', params.status);
    if (params.category) q.set('category', params.category);
    if (params.departmentId) q.set('departmentId', params.departmentId);
    if (params.search) q.set('search', params.search);
    if (params.includeArchived) q.set('includeArchived', 'true');
    return this.fetchJson<ProgramItem[]>(`/api/v1/programs?${q.toString()}`);
  }

  async getById(id: string): Promise<ApiResponse<ProgramDetailResponse>> {
    return this.fetchJson<ProgramDetailResponse>(`/api/v1/programs/${id}`);
  }

  async create(data: CreateProgramInput): Promise<ApiResponse<ProgramItem>> {
    return this.fetchJson<ProgramItem>('/api/v1/programs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: UpdateProgramInput): Promise<ApiResponse<ProgramItem>> {
    return this.fetchJson<ProgramItem>(`/api/v1/programs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async archive(id: string): Promise<ApiResponse<{ id: string; status: string }>> {
    return this.fetchJson(`/api/v1/programs/${id}`, { method: 'DELETE' });
  }

  async submitApproval(id: string, data: SubmitApprovalInput): Promise<ApiResponse<unknown>> {
    return this.fetchJson(`/api/v1/programs/${id}/approvals`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async decideApproval(id: string, data: DecideApprovalInput): Promise<ApiResponse<unknown>> {
    return this.fetchJson(`/api/v1/programs/${id}/approvals`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export const programApiService = new ProgramApiService();
