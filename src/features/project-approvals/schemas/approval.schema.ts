import { z } from 'zod';

export const submitApprovalSchema = z.object({
  assignedApproverId: z.string().optional().nullable(),
  stage: z
    .enum(['DEPARTMENT_HEAD_REVIEW', 'MANAGER_EXECUTIVE_APPROVAL'])
    .default('DEPARTMENT_HEAD_REVIEW'),
  submissionNotes: z.string().max(1500).optional(),
});

export const decideApprovalSchema = z.object({
  approvalId: z.string().min(1, 'Approval ID is required'),
  decision: z.enum(['APPROVED', 'REJECTED']),
  comments: z.string().max(1500).optional(),
  rejectionReason: z.string().max(1500).optional(),
});

export type SubmitApprovalInput = z.infer<typeof submitApprovalSchema>;
export type DecideApprovalInput = z.infer<typeof decideApprovalSchema>;
