import { ApiResponse } from '@/lib/api-response';

export interface OperationalAnalyticsData {
  programOverview: {
    total: number;
    active: number;
    completed: number;
    pendingApproval: number;
    totalBudget: number;
    byCategory: Array<{ category: string; count: number }>;
  };
  projectOverview: {
    total: number;
    active: number;
    completed: number;
    onHold: number;
    overdue: number;
    pendingApproval: number;
    byStatus: Record<string, number>;
  };
  budgetOverview: {
    totalApprovedBudget: number;
    totalPlannedExpenditure: number;
    totalActualExpenditure: number;
    remainingBudget: number;
    utilizationPercentage: number;
  };
  charts: {
    monthlyProjectCreations: Array<{ month: string; count: number }>;
    departmentDistribution: Array<{ departmentId: string; name: string; count: number }>;
    geographicDistribution: Array<{ state: string; count: number }>;
  };
  attentionRequired: {
    overdueMilestones: Array<{
      id: string;
      title: string;
      targetDate: string;
      project?: { _id: string; name: string; code: string };
    }>;
    overdueTasks: Array<{
      id: string;
      title: string;
      dueDate: string;
      priority: string;
      project?: { _id: string; name: string; code: string };
      assignee?: { _id: string; name: string };
    }>;
    projectsExceedingPlannedBudgetCount: number;
    pendingApprovals: Array<{
      id: string;
      entityType: 'PROGRAM' | 'PROJECT';
      entityId: string;
      entityTitle: string;
      stage: string;
      submittedBy?: { _id: string; name: string };
      createdAt: string;
    }>;
    unresolvedHighRisks: Array<{
      id: string;
      title: string;
      severity: string;
      status: string;
      project?: { _id: string; name: string; code: string };
    }>;
  };
}

export class ProjectReportsApiService {
  async getOperationalAnalytics(): Promise<ApiResponse<OperationalAnalyticsData>> {
    const res = await fetch('/api/v1/projects/analytics', {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    return await res.json();
  }
}

export const projectReportsApiService = new ProjectReportsApiService();
