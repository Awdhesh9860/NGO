import { ApiResponse } from '@/lib/api-response';

export interface ChartOfAccountItem {
  _id: string;
  code: string;
  name: string;
  accountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
  category: string;
  normalBalance: 'DEBIT' | 'CREDIT';
  parentAccountId?: string;
  description?: string;
  isSystemAccount: boolean;
  isActive: boolean;
}

export interface AccountingPeriodItem {
  _id: string;
  financialYearLabel: string;
  periodName: string;
  startDate: string;
  endDate: string;
  status: 'OPEN' | 'CLOSED' | 'LOCKED';
}

export interface JournalEntryItem {
  _id: string;
  journalNumber: string;
  periodId: string;
  transactionDate: string;
  description: string;
  referenceType: string;
  referenceId?: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'POSTED' | 'REVERSED';
  totalDebitMinor: number;
  totalCreditMinor: number;
  currency: string;
  isReversed: boolean;
  reversedByJournalId?: string;
  reversalOfJournalId?: string;
  transactionalPost?: boolean;
  transactionNote?: string;
  createdAt: string;
}

export interface LedgerEntryItem {
  id: string;
  journalEntryId: string;
  transactionDate: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  description?: string;
  debitMinor: number;
  creditMinor: number;
  runningBalanceMinor: number;
}

export interface TrialBalanceData {
  rows: Array<{
    accountId: string;
    accountCode: string;
    accountName: string;
    accountType: string;
    debitTotalMinor: number;
    creditTotalMinor: number;
    netDebitMinor: number;
    netCreditMinor: number;
  }>;
  totalDebitMinor: number;
  totalCreditMinor: number;
  isBalanced: boolean;
}

export interface ExpenseItem {
  _id: string;
  expenseNumber: string;
  title: string;
  description: string;
  category: string;
  amountMinor: number;
  currency: string;
  expenseDate: string;
  paymentMethod: string;
  invoiceNumber?: string;
  status:
    | 'DRAFT'
    | 'SUBMITTED'
    | 'UNDER_REVIEW'
    | 'APPROVED'
    | 'REJECTED'
    | 'PAYMENT_PENDING'
    | 'PAID'
    | 'CANCELLED';
  rejectionReason?: string;
  paymentReference?: string;
  journalEntryId?: string;
  createdAt: string;
}

export interface VendorItem {
  id: string;
  vendorCode: string;
  name: string;
  vendorType: string;
  contactPerson?: string;
  email?: string;
  mobileNumber?: string;
  taxIdentifier?: string;
  bankSummary?: {
    bankName?: string;
    ifscCode?: string;
    accountNumberMasked: string;
    beneficiaryAccountName?: string;
  };
  hasBankDetailsOnFile: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface VendorBillItem {
  _id: string;
  vendorId: string;
  billNumber: string;
  billDate: string;
  dueDate: string;
  subtotalMinor: number;
  taxAmountMinor: number;
  totalAmountMinor: number;
  paidAmountMinor: number;
  currency: string;
  description: string;
  approvalStatus: string;
  paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';
}

export interface BankAccountItem {
  id: string;
  accountName: string;
  bankName: string;
  branchName?: string;
  accountType: string;
  accountNumberMasked: string;
  ifscCode?: string;
  currency: string;
  openingBalanceMinor: number;
  lastReconciledBalanceMinor?: number;
  lastReconciledAt?: string;
  isReconciled: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'CLOSED';
}

export interface BankTransactionItem {
  _id: string;
  bankAccountId: string;
  transactionDate: string;
  description: string;
  reference?: string;
  debitMinor: number;
  creditMinor: number;
  runningBalanceMinor?: number;
  currency: string;
  reconciliationStatus: 'UNMATCHED' | 'MATCHED' | 'DISCREPANCY';
  matchedEntityType?: string;
  matchedEntityId?: string;
  matchedNote?: string;
}

export interface BudgetWithUtilizationItem {
  id: string;
  budgetCode: string;
  name: string;
  level: 'ORGANIZATION' | 'DEPARTMENT' | 'PROGRAM' | 'PROJECT';
  financialYear: string;
  budgetPeriod: string;
  category: string;
  currency: string;
  approvalStatus: string;
  plannedAmountMinor: number;
  approvedAmountMinor: number;
  actualSpentMinor: number;
  remainingAmountMinor: number;
  varianceMinor: number;
  utilizationPercent: number;
  isAlertTriggered: boolean;
  isOverBudget: boolean;
}

export interface FundAllocationItem {
  id: string;
  allocationCode: string;
  fundSource: string;
  sourceReferenceId: string;
  sourceLabel: string;
  restrictionType: 'UNRESTRICTED' | 'RESTRICTED';
  permittedPurposes: string[];
  purpose: string;
  allocatedAmountMinor: number;
  utilizedAmountMinor: number;
  availableBalanceMinor: number;
  utilizationPercent: number;
  currency: string;
  status: string;
}

export interface GrantItem {
  _id: string;
  grantReferenceNumber: string;
  grantName: string;
  providerName: string;
  providerType: string;
  startDate: string;
  endDate: string;
  awardAmountMinor: number;
  receivedAmountMinor: number;
  currency: string;
  isRestricted: boolean;
  restrictions?: string;
  status: string;
  reportingDeadlines: Array<{
    title: string;
    dueDate: string;
    status: 'PENDING' | 'SUBMITTED' | 'OVERDUE';
  }>;
}

export interface FinanceDashboardData {
  reportingPeriod: { from: string | null; to: string | null };
  kpis: {
    totalPostedIncomeMinor: number;
    totalPostedExpenseMinor: number;
    netOperatingResultMinor: number;
    reconciledBankBalanceMinor: number;
    hasUnreconciledBankAccounts: boolean;
    pendingExpenseApprovalsCount: number;
    outstandingVendorBillsCount: number;
    outstandingVendorPayablesMinor: number;
    budgetUtilizationPercent: number;
    restrictedFundsAvailableMinor: number;
    grantAwardedMinor: number;
    grantUtilizedMinor: number;
    upcomingComplianceDeadlinesCount: number;
    trialBalanceIsBalanced: boolean;
  };
  verifiedDonationsBridge: {
    verifiedCount: number;
    grossVerifiedMinor: number;
    refundedMinor: number;
    netVerifiedMinor: number;
  };
  charts: {
    monthlyIncomeVsExpenses: Array<{ month: string; incomeMinor: number; expenseMinor: number }>;
    incomeByAccount: Array<{ accountCode: string; accountName: string; amountMinor: number }>;
    expenseByAccount: Array<{ accountCode: string; accountName: string; amountMinor: number }>;
    budgetSummaries: BudgetWithUtilizationItem[];
    grantSummaries: Array<{
      id: string;
      grantReferenceNumber: string;
      grantName: string;
      providerName: string;
      awardAmountMinor: number;
      receivedAmountMinor: number;
      utilizedAmountMinor: number;
      utilizationPercent: number;
    }>;
  };
  dataIntegrityNotice: string;
}

async function request<T>(url: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  return res.json();
}

export const financeApiService = {
  getDashboard: () => request<FinanceDashboardData>('/api/v1/finance/dashboard'),

  // Accounts & Periods
  listAccounts: (includeInactive = false) =>
    request<ChartOfAccountItem[]>(`/api/v1/finance/accounts?includeInactive=${includeInactive}`),
  seedDefaultAccounts: () =>
    request<{ createdCount: number; accounts: ChartOfAccountItem[] }>('/api/v1/finance/accounts', {
      method: 'POST',
      body: JSON.stringify({ action: 'SEED_DEFAULTS' }),
    }),
  createAccount: (payload: Record<string, unknown>) =>
    request<ChartOfAccountItem>('/api/v1/finance/accounts', { method: 'POST', body: JSON.stringify(payload) }),
  updateAccount: (id: string, payload: Record<string, unknown>) =>
    request<ChartOfAccountItem>(`/api/v1/finance/accounts/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteAccount: (id: string) =>
    request<{ deleted: boolean }>(`/api/v1/finance/accounts/${id}`, { method: 'DELETE' }),

  listPeriods: () => request<AccountingPeriodItem[]>('/api/v1/finance/periods'),
  createPeriod: (payload: Record<string, unknown>) =>
    request<AccountingPeriodItem>('/api/v1/finance/periods', { method: 'POST', body: JSON.stringify(payload) }),
  updatePeriodStatus: (payload: { periodId: string; action: 'CLOSE' | 'LOCK' | 'REOPEN'; reason: string }) =>
    request<AccountingPeriodItem>('/api/v1/finance/periods', { method: 'PATCH', body: JSON.stringify(payload) }),

  // Journals, Ledger & Income Sync
  listJournals: (params?: { status?: string; periodId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.periodId) qs.set('periodId', params.periodId);
    return request<JournalEntryItem[]>(`/api/v1/finance/journals?${qs.toString()}`);
  },
  createJournal: (payload: Record<string, unknown>) =>
    request<{ journal: JournalEntryItem }>('/api/v1/finance/journals', { method: 'POST', body: JSON.stringify(payload) }),
  approveJournal: (id: string, decision: 'APPROVE' | 'REJECT' = 'APPROVE') =>
    request<JournalEntryItem>(`/api/v1/finance/journals/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ decision }),
    }),
  postJournal: (id: string) =>
    request<{ journal: JournalEntryItem; transactional: boolean; transactionNote: string }>(
      `/api/v1/finance/journals/${id}/post`,
      { method: 'POST' }
    ),
  reverseJournal: (id: string, reason: string) =>
    request<{ reversalJournal: JournalEntryItem }>(`/api/v1/finance/journals/${id}`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  getLedger: (params?: { accountId?: string; periodId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.accountId) qs.set('accountId', params.accountId);
    if (params?.periodId) qs.set('periodId', params.periodId);
    return request<{ entries: LedgerEntryItem[]; totalDebitMinor: number; totalCreditMinor: number }>(
      `/api/v1/finance/ledger?${qs.toString()}`
    );
  },
  getTrialBalance: (periodId?: string) =>
    request<TrialBalanceData>(`/api/v1/finance/trial-balance${periodId ? `?periodId=${periodId}` : ''}`),
  syncIncomeEvent: (sourceType: 'DONATION' | 'REFUND', sourceId: string) =>
    request<{ journal: JournalEntryItem; idempotentReplay: boolean }>('/api/v1/finance/income', {
      method: 'POST',
      body: JSON.stringify({ sourceType, sourceId }),
    }),

  // Expenses
  listExpenses: (status?: string) =>
    request<ExpenseItem[]>(`/api/v1/finance/expenses${status ? `?status=${status}` : ''}`),
  createExpense: (payload: Record<string, unknown>) =>
    request<ExpenseItem>('/api/v1/finance/expenses', { method: 'POST', body: JSON.stringify(payload) }),
  decideExpenseApproval: (id: string, payload: Record<string, unknown>) =>
    request<{ expense: ExpenseItem }>(`/api/v1/finance/expenses/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  payExpense: (id: string, payload: Record<string, unknown>) =>
    request<{ expense: ExpenseItem; journal: JournalEntryItem }>(`/api/v1/finance/expenses/${id}/pay`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Vendors & Bills
  listVendors: () => request<VendorItem[]>('/api/v1/finance/vendors'),
  createVendor: (payload: Record<string, unknown>) =>
    request<VendorItem>('/api/v1/finance/vendors', { method: 'POST', body: JSON.stringify(payload) }),
  getVendorDetail: (id: string) =>
    request<{
      vendor: VendorItem;
      bills: VendorBillItem[];
      summary: { totalBilledMinor: number; totalPaidMinor: number; outstandingBalanceMinor: number };
    }>(`/api/v1/finance/vendors/${id}`),
  createVendorBill: (vendorId: string, payload: Record<string, unknown>) =>
    request<VendorBillItem>(`/api/v1/finance/vendors/${vendorId}/bills`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Banking & Reconciliation
  listBankAccounts: () => request<BankAccountItem[]>('/api/v1/finance/bank-accounts'),
  createBankAccount: (payload: Record<string, unknown>) =>
    request<BankAccountItem>('/api/v1/finance/bank-accounts', { method: 'POST', body: JSON.stringify(payload) }),
  listBankTransactions: (bankAccountId?: string) =>
    request<BankTransactionItem[]>(
      `/api/v1/finance/bank-transactions${bankAccountId ? `?bankAccountId=${bankAccountId}` : ''}`
    ),
  importBankStatement: (bankAccountId: string, csvContent: string) =>
    request<{ importedCount: number; duplicatesSkipped: number; note: string }>(
      '/api/v1/finance/bank-transactions',
      { method: 'POST', body: JSON.stringify({ bankAccountId, csvContent }) }
    ),
  reconcile: (payload: Record<string, unknown>) =>
    request<Record<string, unknown>>('/api/v1/finance/reconciliation', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Budgets, Fund Allocations & Grants
  listBudgets: () =>
    request<{
      budgets: BudgetWithUtilizationItem[];
      projectBudgetBridge: Array<{
        projectBudgetEntryId: string;
        projectId: string;
        budgetPeriod: string;
        category: string;
        description: string;
        plannedAmountMinor: number;
        ledgerActualSpentMinor: number;
        utilizationPercent: number;
      }>;
      authoritativeSourceNote: string;
    }>('/api/v1/finance/budgets'),
  createBudget: (payload: Record<string, unknown>) =>
    request<BudgetWithUtilizationItem>('/api/v1/finance/budgets', { method: 'POST', body: JSON.stringify(payload) }),
  updateBudgetWorkflow: (id: string, payload: Record<string, unknown>) =>
    request<BudgetWithUtilizationItem>(`/api/v1/finance/budgets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  listFundAllocations: () => request<FundAllocationItem[]>('/api/v1/finance/fund-allocations'),
  createFundAllocation: (payload: Record<string, unknown>) =>
    request<FundAllocationItem>('/api/v1/finance/fund-allocations', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  listGrants: () => request<GrantItem[]>('/api/v1/finance/grants'),
  createGrant: (payload: Record<string, unknown>) =>
    request<GrantItem>('/api/v1/finance/grants', { method: 'POST', body: JSON.stringify(payload) }),
  updateGrant: (id: string, payload: Record<string, unknown>) =>
    request<{ grant: GrantItem }>(`/api/v1/finance/grants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Reports
  getIncomeExpenseReport: () =>
    request<{
      incomeLines: Array<{ accountCode: string; accountName: string; amountMinor: number }>;
      expenseLines: Array<{ accountCode: string; accountName: string; amountMinor: number }>;
      totalIncomeMinor: number;
      totalExpenseMinor: number;
      netSurplusOrDeficitMinor: number;
    }>('/api/v1/finance/reports/income-expense'),
  getBalanceSheetReport: () =>
    request<{
      assets: Array<{ accountCode: string; accountName: string; amountMinor: number }>;
      liabilities: Array<{ accountCode: string; accountName: string; amountMinor: number }>;
      equity: Array<{ accountCode: string; accountName: string; amountMinor: number }>;
      currentPeriodNetSurplusMinor: number;
      totalAssetsMinor: number;
      totalLiabilitiesMinor: number;
      totalEquityWithSurplusMinor: number;
      isBalanced: boolean;
    }>('/api/v1/finance/reports/balance-sheet'),
  getCashFlowReport: () =>
    request<{
      totalInflowMinor: number;
      totalOutflowMinor: number;
      netCashChangeMinor: number;
      reconciledBankTotalMinor: number;
      hasUnreconciledAccounts: boolean;
      bankBalances: Array<{
        id: string;
        accountName: string;
        accountNumberMasked: string;
        reconciledStatus: string;
        lastReconciledBalanceMinor: number | null;
      }>;
    }>('/api/v1/finance/reports/cash-flow'),
  getGrantUtilizationReport: () =>
    request<{
      grants: Array<{
        id: string;
        grantReferenceNumber: string;
        grantName: string;
        providerName: string;
        status: string;
        isRestricted: boolean;
        awardAmountMinor: number;
        receivedAmountMinor: number;
        utilizedAmountMinor: number;
        utilizationPercent: number;
      }>;
      restrictedFunds: {
        totalAllocatedMinor: number;
        totalUtilizedMinor: number;
        totalAvailableMinor: number;
      };
    }>('/api/v1/finance/reports/grant-utilization'),
};
