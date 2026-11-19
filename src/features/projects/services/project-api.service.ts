import { ApiResponse } from '@/lib/api-response';
import {
  CreateProjectInput,
  UpdateProjectInput,
  AssignProjectTeamMemberInput,
  CreateProjectRiskInput,
  UpdateProjectRiskInput,
} from '../schemas/project.schema';
import { CreateMilestoneInput, UpdateMilestoneInput } from '@/features/milestones/schemas/milestone.schema';
import { CreateBudgetEntryInput, UpdateBudgetEntryInput } from '@/features/project-budget/schemas/budget.schema';
import { CreateProjectDocumentInput } from '@/features/project-documents/schemas/document.schema';
import { SubmitApprovalInput, DecideApprovalInput } from '@/features/project-approvals/schemas/approval.schema';

export interface ProjectTeamMemberView {
  userId: string;
  name: string;
  email: string;
  role: string;
  designation?: string;
  status: string;
  responsibility: string;
  accessLevel: 'LEAD' | 'CONTRIBUTOR' | 'VIEWER';
  assignedAt: string;
  workload: { openTasks: number; projectTasks: number };
}

export interface ProjectListItem {
  id: string;
  name: string;
  code: string;
  slug: string;
  shortDescription: string;
  category: string;
  program?: { _id: string; title: string; slug: string; code: string };
  projectManager?: { _id: string; name: string; email: string; designation?: string };
  department?: { _id: string; name: string; slug: string };
  teamCount?: number;
  location?: string;
  state?: string;
  district?: string;
  block?: string;
  village?: string;
  startDate?: string;
  endDate?: string;
  approvedBudget?: number;
  targetBeneficiaries: number;
  actualBeneficiaries: number;
  riskLevel: string;
  priority: string;
  progressPercentage: number;
  status: string;
  isPublicVisible: boolean;
  createdAt: string;
}

export interface ProjectDetailItem extends ProjectListItem {
  detailedDescription?: string;
  team: ProjectTeamMemberView[];
  coordinates?: { lat?: number; lng?: number };
  beneficiarySummary?: {
    targetCount: number;
    actualCount: number;
    categories: string[];
    geographicCoverage: string[];
    includesMinorBeneficiaries: boolean;
    safeguardingVerified: boolean;
    demographics: Array<{ groupLabel: string; count: number }>;
    participationNotes?: string;
    outcomeSummary?: string;
  };
  expectedOutcomes: string[];
  keyDeliverables: string[];
  images: string[];
  activity: Array<{
    id: string;
    actorName: string;
    actorRole: string;
    action: string;
    details?: string;
    timestamp: string;
  }>;
}

export interface ProjectMilestoneItem {
  id: string;
  project?: { _id: string; name: string; code: string; slug: string };
  title: string;
  description?: string;
  targetDate: string;
  completionDate?: string | null;
  status: string;
  responsibleUser?: { _id: string; name: string; email: string };
  deliverables: string[];
  completionPercentage: number;
}

export interface ProjectBudgetSummaryView {
  approvedBudget: number;
  totalPlanned: number;
  totalActual: number;
  remainingBudget: number;
  remainingPlanned: number;
  utilizationPercentage: number;
  plannedUtilizationPercentage: number;
  exceedsPlanned: boolean;
  exceedsApproved: boolean;
  byCategory: Array<{ category: string; plannedAmount: number; actualAmount: number; variance: number }>;
}

export interface ProjectBudgetEntryItem {
  id: string;
  budgetPeriod: string;
  category: string;
  description: string;
  plannedAmount: number;
  actualAmount: number;
  variance: number;
  notes?: string;
  createdAt: string;
}

export interface ProjectDocumentItem {
  id: string;
  title: string;
  category: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  visibility: 'INTERNAL' | 'RESTRICTED' | 'PUBLIC_APPROVED';
  description?: string;
  signedDownloadUrl: string;
  createdAt: string;
}

export interface ProjectRiskItem {
  id: string;
  title: string;
  description?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  likelihood: 'LOW' | 'MEDIUM' | 'HIGH';
  mitigationPlan?: string;
  owner?: { _id: string; name: string; email: string };
  status: 'OPEN' | 'MITIGATING' | 'RESOLVED' | 'CLOSED';
  resolvedAt?: string;
  createdAt: string;
}

export interface ProjectApprovalItem {
  id: string;
  stage: string;
  status: string;
  submittedBy?: { _id: string; name: string; email: string; role: string };
  assignedApproverId?: { _id: string; name: string; email: string };
  decidedBy?: { _id: string; name: string; email: string };
  submissionNotes?: string;
  decisionComments?: string;
  rejectionReason?: string;
  revisionCount: number;
  history: Array<{ action: string; actorName: string; actorRole: string; comments?: string; timestamp: string }>;
  createdAt: string;
  decidedAt?: string;
}

export class ProjectApiService {
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
    programId?: string;
    departmentId?: string;
    category?: string;
    state?: string;
    priority?: string;
    search?: string;
    includeArchived?: boolean;
  } = {}): Promise<ApiResponse<ProjectListItem[]>> {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') q.set(k, String(v));
    });
    return this.fetchJson<ProjectListItem[]>(`/api/v1/projects?${q.toString()}`);
  }

  async getById(id: string): Promise<ApiResponse<ProjectDetailItem>> {
    return this.fetchJson<ProjectDetailItem>(`/api/v1/projects/${id}`);
  }

  async create(data: CreateProjectInput): Promise<ApiResponse<ProjectListItem>> {
    return this.fetchJson<ProjectListItem>('/api/v1/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: UpdateProjectInput): Promise<ApiResponse<ProjectListItem>> {
    return this.fetchJson<ProjectListItem>(`/api/v1/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async archive(id: string): Promise<ApiResponse<{ id: string; status: string }>> {
    return this.fetchJson(`/api/v1/projects/${id}`, { method: 'DELETE' });
  }

  // Team
  async getTeam(projectId: string): Promise<ApiResponse<ProjectTeamMemberView[]>> {
    return this.fetchJson(`/api/v1/projects/${projectId}/team`);
  }

  async assignTeamMember(
    projectId: string,
    data: AssignProjectTeamMemberInput
  ): Promise<ApiResponse<ProjectTeamMemberView[]>> {
    return this.fetchJson(`/api/v1/projects/${projectId}/team`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async removeTeamMember(projectId: string, userId: string): Promise<ApiResponse<ProjectTeamMemberView[]>> {
    return this.fetchJson(`/api/v1/projects/${projectId}/team?userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
  }

  // Milestones
  async listMilestones(projectId: string): Promise<ApiResponse<ProjectMilestoneItem[]>> {
    return this.fetchJson(`/api/v1/projects/${projectId}/milestones`);
  }

  async listAllMilestones(params: { projectId?: string; status?: string; overdueOnly?: boolean } = {}): Promise<
    ApiResponse<ProjectMilestoneItem[]>
  > {
    const q = new URLSearchParams();
    if (params.projectId) q.set('projectId', params.projectId);
    if (params.status) q.set('status', params.status);
    if (params.overdueOnly) q.set('overdueOnly', 'true');
    return this.fetchJson(`/api/v1/milestones?${q.toString()}`);
  }

  async createMilestone(projectId: string, data: CreateMilestoneInput): Promise<ApiResponse<ProjectMilestoneItem>> {
    return this.fetchJson(`/api/v1/projects/${projectId}/milestones`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMilestone(
    projectId: string,
    milestoneId: string,
    data: UpdateMilestoneInput
  ): Promise<ApiResponse<ProjectMilestoneItem>> {
    return this.fetchJson(`/api/v1/projects/${projectId}/milestones`, {
      method: 'PATCH',
      body: JSON.stringify({ ...data, milestoneId }),
    });
  }

  async deleteMilestone(projectId: string, milestoneId: string): Promise<ApiResponse<unknown>> {
    return this.fetchJson(`/api/v1/projects/${projectId}/milestones?milestoneId=${encodeURIComponent(milestoneId)}`, {
      method: 'DELETE',
    });
  }

  // Budget
  async getBudget(projectId: string): Promise<
    ApiResponse<{ summary: ProjectBudgetSummaryView; entries: ProjectBudgetEntryItem[] }>
  > {
    return this.fetchJson(`/api/v1/projects/${projectId}/budget`);
  }

  async createBudgetEntry(projectId: string, data: CreateBudgetEntryInput): Promise<ApiResponse<unknown>> {
    return this.fetchJson(`/api/v1/projects/${projectId}/budget`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBudgetEntry(
    projectId: string,
    entryId: string,
    data: UpdateBudgetEntryInput
  ): Promise<ApiResponse<unknown>> {
    return this.fetchJson(`/api/v1/projects/${projectId}/budget`, {
      method: 'PATCH',
      body: JSON.stringify({ ...data, entryId }),
    });
  }

  async deleteBudgetEntry(projectId: string, entryId: string): Promise<ApiResponse<unknown>> {
    return this.fetchJson(`/api/v1/projects/${projectId}/budget?entryId=${encodeURIComponent(entryId)}`, {
      method: 'DELETE',
    });
  }

  // Documents
  async listDocuments(projectId: string): Promise<ApiResponse<ProjectDocumentItem[]>> {
    return this.fetchJson(`/api/v1/projects/${projectId}/documents`);
  }

  async createDocument(projectId: string, data: CreateProjectDocumentInput): Promise<ApiResponse<unknown>> {
    return this.fetchJson(`/api/v1/projects/${projectId}/documents`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteDocument(projectId: string, documentId: string): Promise<ApiResponse<unknown>> {
    return this.fetchJson(`/api/v1/projects/${projectId}/documents?documentId=${encodeURIComponent(documentId)}`, {
      method: 'DELETE',
    });
  }

  // Approvals
  async listApprovals(projectId: string): Promise<ApiResponse<ProjectApprovalItem[]>> {
    return this.fetchJson(`/api/v1/projects/${projectId}/approvals`);
  }

  async submitApproval(projectId: string, data: SubmitApprovalInput): Promise<ApiResponse<unknown>> {
    return this.fetchJson(`/api/v1/projects/${projectId}/approvals`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async decideApproval(projectId: string, data: DecideApprovalInput): Promise<ApiResponse<unknown>> {
    return this.fetchJson(`/api/v1/projects/${projectId}/approvals`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Risks
  async listRisks(projectId: string): Promise<ApiResponse<ProjectRiskItem[]>> {
    return this.fetchJson(`/api/v1/projects/${projectId}/risks`);
  }

  async createRisk(projectId: string, data: CreateProjectRiskInput): Promise<ApiResponse<unknown>> {
    return this.fetchJson(`/api/v1/projects/${projectId}/risks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRisk(projectId: string, riskId: string, data: UpdateProjectRiskInput): Promise<ApiResponse<unknown>> {
    return this.fetchJson(`/api/v1/projects/${projectId}/risks`, {
      method: 'PATCH',
      body: JSON.stringify({ ...data, riskId }),
    });
  }

  async deleteRisk(projectId: string, riskId: string): Promise<ApiResponse<unknown>> {
    return this.fetchJson(`/api/v1/projects/${projectId}/risks?riskId=${encodeURIComponent(riskId)}`, {
      method: 'DELETE',
    });
  }
}

export const projectApiService = new ProjectApiService();
