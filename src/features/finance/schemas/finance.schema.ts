import { z } from 'zod';

const objectIdString = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid identifier');
const optionalObjectId = objectIdString.or(z.literal('')).transform((v) => (v ? v : undefined)).optional();
const integerMinorPositive = z.number().int('Amount must be an integer minor currency unit').positive();
const integerMinorNonNegative = z.number().int('Amount must be an integer minor currency unit').min(0);

// ======================== CHART OF ACCOUNTS ========================

export const createAccountSchema = z.object({
  code: z.string().trim().min(2).max(24).regex(/^[A-Za-z0-9._-]+$/, 'Account code must be alphanumeric'),
  name: z.string().trim().min(2).max(120),
  accountType: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE']),
  category: z.string().trim().min(2).max(80),
  parentAccountId: optionalObjectId,
  description: z.string().trim().max(500).optional(),
  isSystemAccount: z.boolean().optional().default(false),
});

export const updateAccountSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  category: z.string().trim().min(2).max(80).optional(),
  parentAccountId: optionalObjectId,
  description: z.string().trim().max(500).optional(),
  isActive: z.boolean().optional(),
});

// ======================== ACCOUNTING PERIODS ========================

export const createAccountingPeriodSchema = z.object({
  financialYearLabel: z.string().trim().min(4).max(32),
  periodName: z.string().trim().min(2).max(64),
  startDate: z.string().min(8),
  endDate: z.string().min(8),
});

export const updateAccountingPeriodStatusSchema = z.object({
  periodId: objectIdString,
  action: z.enum(['CLOSE', 'LOCK', 'REOPEN']),
  reason: z.string().trim().min(3).max(400),
});

// ======================== DOUBLE-ENTRY JOURNALS ========================

export const journalLineInputSchema = z
  .object({
    accountId: objectIdString,
    debitMinor: integerMinorNonNegative.default(0),
    creditMinor: integerMinorNonNegative.default(0),
    description: z.string().trim().max(300).optional(),
    programId: optionalObjectId,
    projectId: optionalObjectId,
    departmentId: optionalObjectId,
    campaignId: optionalObjectId,
    grantId: optionalObjectId,
    fundAllocationId: optionalObjectId,
    vendorId: optionalObjectId,
  })
  .refine((l) => (l.debitMinor > 0 && l.creditMinor === 0) || (l.creditMinor > 0 && l.debitMinor === 0), {
    message: 'Each journal line must have either a positive debitMinor OR positive creditMinor, never both or zero',
  });

export const createJournalEntrySchema = z.object({
  periodId: optionalObjectId,
  transactionDate: z.string().min(8),
  description: z.string().trim().min(3).max(400),
  referenceType: z
    .enum([
      'MANUAL',
      'DONATION',
      'REFUND',
      'EXPENSE',
      'VENDOR_BILL',
      'GRANT_RECEIPT',
      'MEMBERSHIP_FEE',
      'BANK_TRANSFER',
      'REVERSAL',
    ])
    .optional()
    .default('MANUAL'),
  referenceId: z.string().trim().max(120).optional(),
  idempotencyKey: z.string().trim().max(160).optional(),
  currency: z.string().trim().min(3).max(3).optional().default('INR'),
  submitForApproval: z.boolean().optional().default(false),
  auditNotes: z.string().trim().max(500).optional(),
  lines: z.array(journalLineInputSchema).min(2, 'Double-entry journal requires at least 2 lines'),
});

export const approveJournalEntrySchema = z.object({
  decision: z.enum(['APPROVE', 'REJECT']).default('APPROVE'),
  notes: z.string().trim().max(400).optional(),
});

export const reverseJournalEntrySchema = z.object({
  reason: z.string().trim().min(5, 'Reversal reason is mandatory').max(400),
  reversalDate: z.string().min(8).optional(),
});

// ======================== EXPENSES & APPROVALS ========================

export const createExpenseSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(5).max(1000),
  category: z.string().trim().min(2).max(80),
  amountMinor: integerMinorPositive,
  currency: z.string().trim().min(3).max(3).optional().default('INR'),
  expenseDate: z.string().min(8),
  vendorId: optionalObjectId,
  vendorBillId: optionalObjectId,
  departmentId: optionalObjectId,
  programId: optionalObjectId,
  projectId: optionalObjectId,
  grantId: optionalObjectId,
  fundAllocationId: optionalObjectId,
  expenseAccountId: optionalObjectId,
  paymentMethod: z
    .enum(['BANK_TRANSFER', 'UPI', 'CHEQUE', 'CASH', 'CARD', 'OTHER'])
    .optional()
    .default('BANK_TRANSFER'),
  invoiceNumber: z.string().trim().max(80).optional(),
  referenceNumber: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(500).optional(),
  submitImmediately: z.boolean().optional().default(true),
  documentRefs: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(120),
        storageKey: z.string().trim().min(1).max(300),
        mimeType: z.string().trim().min(3).max(100),
      })
    )
    .optional()
    .default([]),
});

export const approveExpenseSchema = z.object({
  decision: z.enum(['REVIEWED', 'APPROVED', 'REJECTED', 'ESCALATED']),
  stage: z
    .enum(['DEPARTMENT_REVIEW', 'FINANCE_VERIFICATION', 'FINAL_APPROVAL'])
    .optional()
    .default('FINAL_APPROVAL'),
  comment: z.string().trim().max(500).optional(),
  rejectionReason: z.string().trim().max(500).optional(),
  escalatedToRole: z.string().trim().max(50).optional(),
});

export const payExpenseSchema = z.object({
  bankAccountId: optionalObjectId,
  paymentMethod: z
    .enum(['BANK_TRANSFER', 'UPI', 'CHEQUE', 'CASH', 'CARD', 'OTHER'])
    .optional()
    .default('BANK_TRANSFER'),
  paymentReference: z.string().trim().min(2).max(120),
  paidDate: z.string().min(8).optional(),
  expenseAccountId: optionalObjectId,
  cashOrBankAccountId: optionalObjectId,
  notes: z.string().trim().max(400).optional(),
});

// ======================== VENDORS & BILLS ========================

export const createVendorSchema = z.object({
  name: z.string().trim().min(2).max(160),
  vendorType: z.string().trim().min(2).max(60).optional().default('SUPPLIER'),
  contactPerson: z.string().trim().max(120).optional(),
  email: z.string().trim().email().optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
  mobileNumber: z.string().trim().max(24).optional(),
  address: z.string().trim().max(300).optional(),
  taxIdentifier: z.string().trim().max(40).optional(),
  bankName: z.string().trim().max(120).optional(),
  bankBranch: z.string().trim().max(120).optional(),
  ifscCode: z.string().trim().max(20).optional(),
  bankAccountNumber: z.string().trim().min(6).max(34).optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
  beneficiaryAccountName: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(500).optional(),
});

export const updateVendorSchema = createVendorSchema.partial().extend({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
});

export const createVendorBillSchema = z.object({
  billNumber: z.string().trim().min(2).max(80),
  billDate: z.string().min(8),
  dueDate: z.string().min(8),
  subtotalMinor: integerMinorPositive,
  taxAmountMinor: integerMinorNonNegative.optional().default(0),
  currency: z.string().trim().min(3).max(3).optional().default('INR'),
  taxSummary: z.string().trim().max(200).optional(),
  description: z.string().trim().min(3).max(400),
  linkedExpenseId: optionalObjectId,
});

// ======================== BANKING & RECONCILIATION ========================

export const createBankAccountSchema = z.object({
  accountName: z.string().trim().min(2).max(120),
  bankName: z.string().trim().min(2).max(120),
  branchName: z.string().trim().max(120).optional(),
  accountType: z
    .enum(['SAVINGS', 'CURRENT', 'FCRA_DESIGNATED', 'PROJECT_DESIGNATED', 'PETTY_CASH'])
    .optional()
    .default('CURRENT'),
  accountNumber: z.string().trim().min(4).max(34),
  ifscCode: z.string().trim().max(20).optional(),
  swiftCode: z.string().trim().max(20).optional(),
  currency: z.string().trim().min(3).max(3).optional().default('INR'),
  openingBalanceMinor: z.number().int().default(0),
  ledgerAccountId: optionalObjectId,
  notes: z.string().trim().max(500).optional(),
});

export const importBankStatementSchema = z.object({
  bankAccountId: objectIdString,
  csvContent: z.string().min(10, 'CSV statement content is required'),
});

export const reconcileBankTransactionSchema = z.object({
  action: z.enum(['MATCH', 'DISCREPANCY', 'FINALIZE_SESSION']),
  transactionId: optionalObjectId,
  bankAccountId: optionalObjectId,
  matchedEntityType: z.enum(['DONATION', 'EXPENSE', 'VENDOR_BILL', 'JOURNAL_ENTRY', 'GRANT']).optional(),
  matchedEntityId: z.string().trim().max(120).optional(),
  note: z.string().trim().max(400).optional(),
  statementFromDate: z.string().min(8).optional(),
  statementToDate: z.string().min(8).optional(),
  statementClosingBalanceMinor: z.number().int().optional(),
});

// ======================== BUDGETS, FUNDS & GRANTS ========================

export const createBudgetSchema = z.object({
  name: z.string().trim().min(3).max(160),
  level: z.enum(['ORGANIZATION', 'DEPARTMENT', 'PROGRAM', 'PROJECT']),
  financialYear: z.string().trim().min(4).max(32),
  budgetPeriod: z.string().trim().min(2).max(64).optional().default('Annual'),
  category: z.string().trim().min(2).max(80),
  plannedAmountMinor: integerMinorPositive,
  currency: z.string().trim().min(3).max(3).optional().default('INR'),
  alertThresholdPercent: z.number().int().min(10).max(100).optional().default(85),
  departmentId: optionalObjectId,
  programId: optionalObjectId,
  projectId: optionalObjectId,
  linkedProjectBudgetEntryId: optionalObjectId,
  notes: z.string().trim().max(500).optional(),
});

export const updateBudgetSchema = z.object({
  action: z.enum(['SUBMIT', 'APPROVE', 'REJECT', 'REVISE']),
  newPlannedAmountMinor: integerMinorPositive.optional(),
  approvedAmountMinor: integerMinorPositive.optional(),
  reason: z.string().trim().min(3).max(400).optional(),
});

export const createFundAllocationSchema = z.object({
  fundSource: z.enum(['DONATION', 'GRANT', 'CAMPAIGN', 'GENERAL_RESERVE']),
  sourceReferenceId: z.string().trim().min(2).max(120),
  sourceLabel: z.string().trim().min(2).max(160),
  restrictionType: z.enum(['UNRESTRICTED', 'RESTRICTED']).default('UNRESTRICTED'),
  permittedPurposes: z.array(z.string().trim().min(2).max(100)).optional().default([]),
  permittedProgramId: optionalObjectId,
  permittedProjectId: optionalObjectId,
  allocatedProgramId: optionalObjectId,
  allocatedProjectId: optionalObjectId,
  allocatedDepartmentId: optionalObjectId,
  purpose: z.string().trim().min(3).max(200),
  allocatedAmountMinor: integerMinorPositive,
  currency: z.string().trim().min(3).max(3).optional().default('INR'),
});

export const createGrantSchema = z.object({
  grantReferenceNumber: z.string().trim().min(2).max(80),
  grantName: z.string().trim().min(3).max(180),
  providerName: z.string().trim().min(2).max(160),
  providerType: z
    .enum(['FOUNDATION', 'CORPORATE_CSR', 'GOVERNMENT', 'MULTILATERAL', 'OTHER'])
    .optional()
    .default('FOUNDATION'),
  awardDate: z.string().min(8).optional(),
  startDate: z.string().min(8),
  endDate: z.string().min(8),
  awardAmountMinor: integerMinorPositive,
  currency: z.string().trim().min(3).max(3).optional().default('INR'),
  isRestricted: z.boolean().optional().default(true),
  restrictions: z.string().trim().max(1000).optional(),
  permittedPurposes: z.array(z.string().trim().min(2).max(100)).optional().default([]),
  linkedProgramId: optionalObjectId,
  linkedProjectId: optionalObjectId,
  reportingDeadlines: z
    .array(
      z.object({
        title: z.string().trim().min(2).max(140),
        dueDate: z.string().min(8),
        notes: z.string().trim().max(300).optional(),
      })
    )
    .optional()
    .default([]),
  disbursementSchedule: z
    .array(
      z.object({
        trancheLabel: z.string().trim().min(2).max(100),
        expectedDate: z.string().min(8),
        expectedAmountMinor: integerMinorPositive,
      })
    )
    .optional()
    .default([]),
});

export const updateGrantSchema = z.object({
  action: z.enum(['UPDATE_STATUS', 'RECORD_RECEIPT', 'SUBMIT_REPORT']),
  status: z
    .enum(['DRAFT', 'APPLIED', 'UNDER_REVIEW', 'APPROVED', 'ACTIVE', 'COMPLETED', 'REJECTED', 'CANCELLED'])
    .optional(),
  receiptAmountMinor: integerMinorPositive.optional(),
  receiptDate: z.string().min(8).optional(),
  trancheLabel: z.string().trim().max(100).optional(),
  reportTitle: z.string().trim().max(140).optional(),
  note: z.string().trim().max(400).optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type CreateAccountingPeriodInput = z.infer<typeof createAccountingPeriodSchema>;
export type UpdateAccountingPeriodStatusInput = z.infer<typeof updateAccountingPeriodStatusSchema>;
export type CreateJournalEntryInput = z.infer<typeof createJournalEntrySchema>;
export type ApproveJournalEntryInput = z.infer<typeof approveJournalEntrySchema>;
export type ReverseJournalEntryInput = z.infer<typeof reverseJournalEntrySchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type ApproveExpenseInput = z.infer<typeof approveExpenseSchema>;
export type PayExpenseInput = z.infer<typeof payExpenseSchema>;
export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;
export type CreateVendorBillInput = z.infer<typeof createVendorBillSchema>;
export type CreateBankAccountInput = z.infer<typeof createBankAccountSchema>;
export type ImportBankStatementInput = z.infer<typeof importBankStatementSchema>;
export type ReconcileBankTransactionInput = z.infer<typeof reconcileBankTransactionSchema>;
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type CreateFundAllocationInput = z.infer<typeof createFundAllocationSchema>;
export type CreateGrantInput = z.infer<typeof createGrantSchema>;
export type UpdateGrantInput = z.infer<typeof updateGrantSchema>;
