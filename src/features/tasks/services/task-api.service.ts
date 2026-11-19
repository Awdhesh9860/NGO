import { ApiResponse } from '@/lib/api-response';
import { CreateTaskInput, UpdateTaskInput } from '../schemas/task.schema';

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  project?: { _id: string; name: string; code: string; slug: string };
  assignedUser?: { _id: string; name: string; email: string; designation?: string; role?: string };
  createdBy?: { _id: string; name: string; email: string };
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  startDate?: string;
  dueDate?: string;
  estimatedEffortHours?: number;
  actualEffortHours?: number;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'BLOCKED' | 'COMPLETED' | 'CANCELLED';
  completionPercentage: number;
  attachments?: Array<{ fileName: string; fileUrl: string; mimeType?: string }>;
  comments?: Array<{ authorName: string; body: string; createdAt: string }>;
  commentsCount?: number;
  completedAt?: string | null;
  createdAt: string;
}

export class TaskApiService {
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
    projectId?: string;
    assignedUserId?: string;
    status?: string;
    priority?: string;
    overdueOnly?: boolean;
    search?: string;
  } = {}): Promise<ApiResponse<TaskItem[]>> {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== false) q.set(k, String(v));
    });
    return this.fetchJson<TaskItem[]>(`/api/v1/tasks?${q.toString()}`);
  }

  async create(data: CreateTaskInput): Promise<ApiResponse<TaskItem>> {
    return this.fetchJson<TaskItem>('/api/v1/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: UpdateTaskInput): Promise<ApiResponse<TaskItem>> {
    return this.fetchJson<TaskItem>(`/api/v1/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<ApiResponse<{ deleted: boolean; id: string }>> {
    return this.fetchJson(`/api/v1/tasks/${id}`, { method: 'DELETE' });
  }
}

export const taskApiService = new TaskApiService();
