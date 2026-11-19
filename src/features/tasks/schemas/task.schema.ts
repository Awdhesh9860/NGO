import { z } from 'zod';

export const TASK_STATUSES = [
  'TODO',
  'IN_PROGRESS',
  'REVIEW',
  'BLOCKED',
  'COMPLETED',
  'CANCELLED',
] as const;

export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

export const createTaskSchema = z.object({
  title: z.string().min(3, 'Task title must be at least 3 characters').max(200),
  description: z.string().max(4000).optional(),
  projectId: z.string().min(1, 'Project ID is required'),
  programId: z.string().optional().nullable(),
  assignedUserId: z.string().optional().nullable(),
  priority: z.enum(TASK_PRIORITIES).default('MEDIUM'),
  startDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  estimatedEffortHours: z.number().min(0).max(5000).optional(),
  actualEffortHours: z.number().min(0).max(5000).optional(),
  status: z.enum(TASK_STATUSES).default('TODO'),
  completionPercentage: z.number().min(0).max(100).default(0),
  attachments: z
    .array(
      z.object({
        fileName: z.string().min(1).max(200),
        fileUrl: z.string().min(1),
        mimeType: z.string().optional(),
      })
    )
    .default([]),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  commentBody: z.string().min(1).max(1500).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
