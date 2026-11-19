import { z } from 'zod';

export const BUDGET_CATEGORIES = [
  'PERSONNEL',
  'EQUIPMENT',
  'TRAINING',
  'TRAVEL',
  'INFRASTRUCTURE',
  'HEALTHCARE_SUPPLIES',
  'EDUCATIONAL_MATERIALS',
  'ADMINISTRATION',
  'OTHER_OPERATIONAL',
] as const;

export const createBudgetEntrySchema = z.object({
  budgetPeriod: z.string().min(2).max(60).default('FY 2026-27'),
  category: z.enum(BUDGET_CATEGORIES),
  description: z.string().min(3).max(300),
  plannedAmount: z.number().min(0, 'Planned amount must be non-negative'),
  actualAmount: z.number().min(0, 'Actual expenditure must be non-negative').default(0),
  notes: z.string().max(1000).optional(),
});

export const updateBudgetEntrySchema = createBudgetEntrySchema.partial();

export type CreateBudgetEntryInput = z.infer<typeof createBudgetEntrySchema>;
export type UpdateBudgetEntryInput = z.infer<typeof updateBudgetEntrySchema>;
