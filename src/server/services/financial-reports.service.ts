import mongoose from 'mongoose';
import connectToDatabase from '@/server/database/connection';
import { financeRepository } from '@/server/repositories/finance.repository';
import { IJournalLineDocument } from '@/server/database/models/JournalLine';
import { Expense } from '@/server/database/models/Expense';
import { VendorBill } from '@/server/database/models/VendorBill';
import { Donation } from '@/server/database/models/Donation';
import { accountingService } from '@/server/services/accounting.service';
import { budgetGrantComplianceService } from '@/server/services/budget-grant-compliance.service';
import { adminService, AdminActor } from '@/server/services/admin.service';
import { checkRolePermission } from '@/server/authorization/permissions';
import { escapeCsvCell } from '@/server/security/financial-crypto';
import { AuthorizationError } from '@/lib/error-handler';
import {
  calculateMinorPercentage,
  formatMinorCurrency,
  subtractMinorUnits,
  sumMinorUnits,
} from '@/lib/money';

// ======================== PURE LEDGER-DERIVED STATEMENT BUILDERS ========================

export interface StatementAccountLine {
  accountCode: string;
  accountName: string;
  amountMinor: number;
}

export interface IncomeAndExpenseStatement {
  incomeLines: StatementAccountLine[];
  expenseLines: StatementAccountLine[];
  totalIncomeMinor: number;
  totalExpenseMinor: number;
  netSurplusOrDeficitMinor: number;
  derivedFromPostedLedgerOnly: true;
}

/**
 * Computes Income & Expense Statement strictly from posted JournalLine rows (integer minor units).
 * Income normal balance = Credit - Debit; Expense normal balance = Debit - Credit.
 */
export function buildIncomeAndExpenseStatement(
  lines: Array<
    Pick<
      IJournalLineDocument,
      'accountCodeSnapshot' | 'accountNameSnapshot' | 'accountTypeSnapshot' | 'debitMinor' | 'creditMinor'
    >
  >
): IncomeAndExpenseStatement {
  const incomeMap = new Map<string, StatementAccountLine>();
  const expenseMap = new Map<string, StatementAccountLine>();

  for (const line of lines) {
    if (line.accountTypeSnapshot === 'INCOME') {
      const existing = incomeMap.get(line.accountCodeSnapshot) || {
        accountCode: line.accountCodeSnapshot,
        accountName: line.accountNameSnapshot,
        amountMinor: 0,
      };
      // Credits increase income, debits (e.g., refund contra-income) reduce net income
      existing.amountMinor = sumMinorUnits([
        existing.amountMinor,
        subtractMinorUnits(line.creditMinor, line.debitMinor),
      ]);
      incomeMap.set(line.accountCodeSnapshot, existing);
    } else if (line.accountTypeSnapshot === 'EXPENSE') {
      const existing = expenseMap.get(line.accountCodeSnapshot) || {
        accountCode: line.accountCodeSnapshot,
        accountName: line.accountNameSnapshot,
        amountMinor: 0,
      };
      existing.amountMinor = sumMinorUnits([
        existing.amountMinor,
        subtractMinorUnits(line.debitMinor, line.creditMinor),
      ]);
      expenseMap.set(line.accountCodeSnapshot, existing);
    }
  }

  const incomeLines = Array.from(incomeMap.values()).sort((a, b) =>
    a.accountCode.localeCompare(b.accountCode)
  );
  const expenseLines = Array.from(expenseMap.values()).sort((a, b) =>
    a.accountCode.localeCompare(b.accountCode)
  );

  const totalIncomeMinor = sumMinorUnits(incomeLines.map((l) => l.amountMinor));
  const totalExpenseMinor = sumMinorUnits(expenseLines.map((l) => l.amountMinor));

  return {
    incomeLines,
    expenseLines,
    totalIncomeMinor,
    totalExpenseMinor,
    netSurplusOrDeficitMinor: subtractMinorUnits(totalIncomeMinor, totalExpenseMinor),
    derivedFromPostedLedgerOnly: true,
  };
}

export interface BalanceSheetReport {
  assets: StatementAccountLine[];
  liabilities: StatementAccountLine[];
  equity: StatementAccountLine[];
  currentPeriodNetSurplusMinor: number;
  totalAssetsMinor: number;
  totalLiabilitiesMinor: number;
  totalEquityWithSurplusMinor: number;
  isBalanced: boolean;
  derivedFromPostedLedgerOnly: true;
}

/**
 * Computes Balance Sheet strictly from posted JournalLine rows:
 * Assets === Liabilities + Equity + Net Surplus/Deficit
 */
export function buildBalanceSheet(
  lines: Array<
    Pick<
      IJournalLineDocument,
      'accountCodeSnapshot' | 'accountNameSnapshot' | 'accountTypeSnapshot' | 'debitMinor' | 'creditMinor'
    >
  >
): BalanceSheetReport {
  const assetMap = new Map<string, StatementAccountLine>();
  const liabMap = new Map<string, StatementAccountLine>();
  const equityMap = new Map<string, StatementAccountLine>();

  const incExp = buildIncomeAndExpenseStatement(lines);

  for (const line of lines) {
    if (line.accountTypeSnapshot === 'ASSET') {
      const existing = assetMap.get(line.accountCodeSnapshot) || {
        accountCode: line.accountCodeSnapshot,
        accountName: line.accountNameSnapshot,
        amountMinor: 0,
      };
      existing.amountMinor = sumMinorUnits([
        existing.amountMinor,
        subtractMinorUnits(line.debitMinor, line.creditMinor),
      ]);
      assetMap.set(line.accountCodeSnapshot, existing);
    } else if (line.accountTypeSnapshot === 'LIABILITY') {
      const existing = liabMap.get(line.accountCodeSnapshot) || {
        accountCode: line.accountCodeSnapshot,
        accountName: line.accountNameSnapshot,
        amountMinor: 0,
      };
      existing.amountMinor = sumMinorUnits([
        existing.amountMinor,
        subtractMinorUnits(line.creditMinor, line.debitMinor),
      ]);
      liabMap.set(line.accountCodeSnapshot, existing);
    } else if (line.accountTypeSnapshot === 'EQUITY') {
      const existing = equityMap.get(line.accountCodeSnapshot) || {
        accountCode: line.accountCodeSnapshot,
        accountName: line.accountNameSnapshot,
        amountMinor: 0,
      };
      existing.amountMinor = sumMinorUnits([
        existing.amountMinor,
        subtractMinorUnits(line.creditMinor, line.debitMinor),
      ]);
      equityMap.set(line.accountCodeSnapshot, existing);
    }
  }

  const assets = Array.from(assetMap.values()).sort((a, b) => a.accountCode.localeCompare(b.accountCode));
  const liabilities = Array.from(liabMap.values()).sort((a, b) => a.accountCode.localeCompare(b.accountCode));
  const equity = Array.from(equityMap.values()).sort((a, b) => a.accountCode.localeCompare(b.accountCode));

  const totalAssetsMinor = sumMinorUnits(assets.map((a) => a.amountMinor));
  const totalLiabilitiesMinor = sumMinorUnits(liabilities.map((l) => l.amountMinor));
  const baseEquityMinor = sumMinorUnits(equity.map((e) => e.amountMinor));
  const totalEquityWithSurplusMinor = sumMinorUnits([baseEquityMinor, incExp.netSurplusOrDeficitMinor]);

  return {
    assets,
    liabilities,
    equity,
    currentPeriodNetSurplusMinor: incExp.netSurplusOrDeficitMinor,
    totalAssetsMinor,
    totalLiabilitiesMinor,
    totalEquityWithSurplusMinor,
    isBalanced: totalAssetsMinor === sumMinorUnits([totalLiabilitiesMinor, totalEquityWithSurplusMinor]),
    derivedFromPostedLedgerOnly: true,
  };
}

export class FinancialReportsService {
  async getIncomeAndExpenseReport(
    organizationId: string,
    filters: {
      periodId?: string;
      programId?: string;
      projectId?: string;
      departmentId?: string;
      from?: Date;
      to?: Date;
    }
  ) {
    const lines = await financeRepository.findPostedLedgerLines(organizationId, filters, 5000);
    const statement = buildIncomeAndExpenseStatement(lines);

    // Monthly Income vs Expense distribution strictly from posted lines
    const monthlyMap = new Map<string, { month: string; incomeMinor: number; expenseMinor: number }>();
    for (const line of lines) {
      const month = new Date(line.transactionDate).toISOString().slice(0, 7);
      const bucket = monthlyMap.get(month) || { month, incomeMinor: 0, expenseMinor: 0 };
      if (line.accountTypeSnapshot === 'INCOME') {
        bucket.incomeMinor = sumMinorUnits([
          bucket.incomeMinor,
          subtractMinorUnits(line.creditMinor, line.debitMinor),
        ]);
      } else if (line.accountTypeSnapshot === 'EXPENSE') {
        bucket.expenseMinor = sumMinorUnits([
          bucket.expenseMinor,
          subtractMinorUnits(line.debitMinor, line.creditMinor),
        ]);
      }
      monthlyMap.set(month, bucket);
    }

    return {
      ...statement,
      monthlyTrend: Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month)),
      filters,
    };
  }

  async getBalanceSheetReport(organizationId: string, filters: { periodId?: string; to?: Date }) {
    const lines = await financeRepository.findPostedLedgerLines(
      organizationId,
      { periodId: filters.periodId, to: filters.to },
      5000
    );
    return buildBalanceSheet(lines);
  }

  async getCashFlowReport(organizationId: string, filters: { periodId?: string; from?: Date; to?: Date }) {
    const [lines, bankAccounts] = await Promise.all([
      financeRepository.findPostedLedgerLines(organizationId, filters, 5000),
      financeRepository.findBankAccounts(organizationId),
    ]);

    // Cash & Bank accounts are ASSET accounts whose code starts with '10' (e.g., 1010, 1020, 1030)
    const cashLines = lines.filter(
      (l) => l.accountTypeSnapshot === 'ASSET' && l.accountCodeSnapshot.startsWith('10')
    );
    const totalInflowMinor = sumMinorUnits(cashLines.map((l) => l.debitMinor));
    const totalOutflowMinor = sumMinorUnits(cashLines.map((l) => l.creditMinor));
    const netCashChangeMinor = subtractMinorUnits(totalInflowMinor, totalOutflowMinor);

    const bankBalances = bankAccounts.map((b) => ({
      id: b._id.toString(),
      accountName: b.accountName,
      bankName: b.bankName,
      accountNumberMasked: b.accountNumberMasked,
      currency: b.currency,
      reconciledStatus: b.lastReconciledAt ? ('RECONCILED' as const) : ('UNRECONCILED_PROVISIONAL' as const),
      lastReconciledBalanceMinor: b.lastReconciledBalanceMinor ?? null,
      lastReconciledAt: b.lastReconciledAt ?? null,
      openingBalanceMinor: b.openingBalanceMinor,
    }));

    return {
      totalInflowMinor,
      totalOutflowMinor,
      netCashChangeMinor,
      bankBalances,
      reconciledBankTotalMinor: sumMinorUnits(
        bankBalances
          .filter((b) => b.reconciledStatus === 'RECONCILED' && b.lastReconciledBalanceMinor !== null)
          .map((b) => b.lastReconciledBalanceMinor || 0)
      ),
      hasUnreconciledAccounts: bankBalances.some((b) => b.reconciledStatus === 'UNRECONCILED_PROVISIONAL'),
      derivedFromPostedLedgerOnly: true,
    };
  }

  async getBudgetVsActualReport(
    organizationId: string,
    filters?: { financialYear?: string; level?: 'ORGANIZATION' | 'DEPARTMENT' | 'PROGRAM' | 'PROJECT'; projectId?: string }
  ) {
    const data = await budgetGrantComplianceService.listBudgetsWithUtilization(organizationId, filters);
    const totalPlannedMinor = sumMinorUnits(data.budgets.map((b) => b.plannedAmountMinor));
    const totalApprovedMinor = sumMinorUnits(data.budgets.map((b) => b.approvedAmountMinor));
    const totalActualMinor = sumMinorUnits(data.budgets.map((b) => b.actualSpentMinor));
    return {
      ...data,
      summary: {
        totalPlannedMinor,
        totalApprovedMinor,
        totalActualMinor,
        overallUtilizationPercent: calculateMinorPercentage(
          totalActualMinor,
          totalApprovedMinor > 0 ? totalApprovedMinor : totalPlannedMinor
        ),
        alertCount: data.budgets.filter((b) => b.isAlertTriggered).length,
      },
    };
  }

  async getGrantUtilizationReport(organizationId: string) {
    const [grants, allocations, postedExpenseLines] = await Promise.all([
      financeRepository.findGrants(organizationId),
      budgetGrantComplianceService.listFundAllocations(organizationId),
      financeRepository.findPostedLedgerLines(organizationId, { accountType: 'EXPENSE' }, 5000),
    ]);

    const grantRows = grants.map((g) => {
      const utilizedMinor = sumMinorUnits(
        postedExpenseLines
          .filter((l) => l.grantId?.toString() === g._id.toString())
          .map((l) => subtractMinorUnits(l.debitMinor, l.creditMinor))
      );
      return {
        id: g._id.toString(),
        grantReferenceNumber: g.grantReferenceNumber,
        grantName: g.grantName,
        providerName: g.providerName,
        status: g.status,
        isRestricted: g.isRestricted,
        currency: g.currency,
        awardAmountMinor: g.awardAmountMinor,
        receivedAmountMinor: g.receivedAmountMinor,
        utilizedAmountMinor: Math.max(0, utilizedMinor),
        remainingReceivedMinor: Math.max(0, subtractMinorUnits(g.receivedAmountMinor, Math.max(0, utilizedMinor))),
        utilizationPercent: calculateMinorPercentage(Math.max(0, utilizedMinor), g.receivedAmountMinor || g.awardAmountMinor),
        pendingReportsCount: (g.reportingDeadlines || []).filter((d) => d.status !== 'SUBMITTED').length,
      };
    });

    const restrictedAllocations = allocations.filter((a) => a.restrictionType === 'RESTRICTED');

    return {
      grants: grantRows,
      restrictedFunds: {
        totalAllocatedMinor: sumMinorUnits(restrictedAllocations.map((a) => a.allocatedAmountMinor)),
        totalUtilizedMinor: sumMinorUnits(restrictedAllocations.map((a) => a.utilizedAmountMinor)),
        totalAvailableMinor: sumMinorUnits(restrictedAllocations.map((a) => a.availableBalanceMinor)),
        allocations: restrictedAllocations,
      },
      summary: {
        totalAwardedMinor: sumMinorUnits(grantRows.map((g) => g.awardAmountMinor)),
        totalReceivedMinor: sumMinorUnits(grantRows.map((g) => g.receivedAmountMinor)),
        totalUtilizedMinor: sumMinorUnits(grantRows.map((g) => g.utilizedAmountMinor)),
      },
    };
  }

  /**
   * Executive Finance Dashboard — 100% derived from posted accounting entries & verified records.
   * Excludes draft/unposted journals and clearly labels unreconciled bank balances as provisional.
   */
  async getFinanceDashboard(organizationId: string, filters?: { from?: Date; to?: Date }) {
    await connectToDatabase();
    const orgObjId = new mongoose.Types.ObjectId(organizationId);

    const [
      incExp,
      trialBalance,
      cashFlow,
      budgetReport,
      grantReport,
      complianceDeadlines,
      pendingExpenseCount,
      outstandingBills,
      verifiedDonationAgg,
    ] = await Promise.all([
      this.getIncomeAndExpenseReport(organizationId, filters || {}),
      accountingService.getTrialBalance(organizationId, filters),
      this.getCashFlowReport(organizationId, filters || {}),
      this.getBudgetVsActualReport(organizationId),
      this.getGrantUtilizationReport(organizationId),
      budgetGrantComplianceService.getComplianceDeadlines(organizationId),
      Expense.countDocuments({
        organizationId: orgObjId,
        status: { $in: ['SUBMITTED', 'UNDER_REVIEW'] },
      }),
      VendorBill.find({
        organizationId: orgObjId,
        paymentStatus: { $in: ['UNPAID', 'PARTIALLY_PAID'] },
      }),
      Donation.aggregate([
        {
          $match: {
            organizationId: orgObjId,
            status: { $in: ['SUCCESSFUL', 'PARTIALLY_REFUNDED', 'REFUNDED'] },
          },
        },
        {
          $group: {
            _id: null,
            grossMinor: { $sum: '$amountMinor' },
            refundedMinor: { $sum: '$refundedAmountMinor' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const outstandingVendorPayablesMinor = sumMinorUnits(
      outstandingBills.map((b) => Math.max(0, subtractMinorUnits(b.totalAmountMinor, b.paidAmountMinor)))
    );

    const donationTotals = verifiedDonationAgg[0] || { grossMinor: 0, refundedMinor: 0, count: 0 };

    return {
      reportingPeriod: {
        from: filters?.from?.toISOString() || null,
        to: filters?.to?.toISOString() || null,
      },
      kpis: {
        totalPostedIncomeMinor: incExp.totalIncomeMinor,
        totalPostedExpenseMinor: incExp.totalExpenseMinor,
        netOperatingResultMinor: incExp.netSurplusOrDeficitMinor,
        reconciledBankBalanceMinor: cashFlow.reconciledBankTotalMinor,
        hasUnreconciledBankAccounts: cashFlow.hasUnreconciledAccounts,
        pendingExpenseApprovalsCount: pendingExpenseCount,
        outstandingVendorBillsCount: outstandingBills.length,
        outstandingVendorPayablesMinor,
        budgetUtilizationPercent: budgetReport.summary.overallUtilizationPercent,
        restrictedFundsAvailableMinor: grantReport.restrictedFunds.totalAvailableMinor,
        grantAwardedMinor: grantReport.summary.totalAwardedMinor,
        grantUtilizedMinor: grantReport.summary.totalUtilizedMinor,
        upcomingComplianceDeadlinesCount:
          complianceDeadlines.overdue.length + complianceDeadlines.dueSoon.length,
        trialBalanceIsBalanced: trialBalance.isBalanced,
      },
      verifiedDonationsBridge: {
        verifiedCount: donationTotals.count,
        grossVerifiedMinor: Math.trunc(donationTotals.grossMinor || 0),
        refundedMinor: Math.trunc(donationTotals.refundedMinor || 0),
        netVerifiedMinor: subtractMinorUnits(
          Math.trunc(donationTotals.grossMinor || 0),
          Math.trunc(donationTotals.refundedMinor || 0)
        ),
      },
      charts: {
        monthlyIncomeVsExpenses: incExp.monthlyTrend,
        incomeByAccount: incExp.incomeLines,
        expenseByAccount: incExp.expenseLines,
        budgetSummaries: budgetReport.budgets.slice(0, 8),
        grantSummaries: grantReport.grants.slice(0, 8),
      },
      dataIntegrityNotice: cashFlow.hasUnreconciledAccounts
        ? 'Figures are derived strictly from posted General Ledger entries (draft/unposted journals excluded). One or more bank accounts remain unreconciled and are marked provisional.'
        : 'All figures are derived strictly from posted General Ledger entries (draft/unposted journals excluded).',
    };
  }

  /**
   * Authorized CSV export for financial reports — enforces `finance.reports.export`,
   * protects against spreadsheet formula injection (`escapeCsvCell`), and records audit trail.
   */
  async exportStatementCsv(
    organizationId: string,
    reportType: 'TRIAL_BALANCE' | 'INCOME_EXPENSE' | 'BALANCE_SHEET',
    actor: AdminActor,
    currency = 'INR'
  ): Promise<string> {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'finance.reports.export')) {
      throw new AuthorizationError('Missing finance.reports.export permission');
    }

    const lines: string[] = [];

    if (reportType === 'TRIAL_BALANCE') {
      const tb = await accountingService.getTrialBalance(organizationId);
      lines.push(['Account Code', 'Account Name', 'Type', 'Net Debit', 'Net Credit'].map(escapeCsvCell).join(','));
      for (const row of tb.rows) {
        lines.push(
          [
            row.accountCode,
            row.accountName,
            row.accountType,
            formatMinorCurrency(row.netDebitMinor, currency),
            formatMinorCurrency(row.netCreditMinor, currency),
          ]
            .map(escapeCsvCell)
            .join(',')
        );
      }
      lines.push(
        ['TOTAL', '', '', formatMinorCurrency(tb.totalDebitMinor, currency), formatMinorCurrency(tb.totalCreditMinor, currency)]
          .map(escapeCsvCell)
          .join(',')
      );
    } else if (reportType === 'INCOME_EXPENSE') {
      const st = await this.getIncomeAndExpenseReport(organizationId, {});
      lines.push(['Section', 'Account Code', 'Account Name', 'Amount'].map(escapeCsvCell).join(','));
      for (const row of st.incomeLines) {
        lines.push(['INCOME', row.accountCode, row.accountName, formatMinorCurrency(row.amountMinor, currency)].map(escapeCsvCell).join(','));
      }
      for (const row of st.expenseLines) {
        lines.push(['EXPENSE', row.accountCode, row.accountName, formatMinorCurrency(row.amountMinor, currency)].map(escapeCsvCell).join(','));
      }
      lines.push(['NET RESULT', '', 'Net Surplus / (Deficit)', formatMinorCurrency(st.netSurplusOrDeficitMinor, currency)].map(escapeCsvCell).join(','));
    } else {
      const bs = await this.getBalanceSheetReport(organizationId, {});
      lines.push(['Section', 'Account Code', 'Account Name', 'Amount'].map(escapeCsvCell).join(','));
      for (const row of bs.assets) {
        lines.push(['ASSET', row.accountCode, row.accountName, formatMinorCurrency(row.amountMinor, currency)].map(escapeCsvCell).join(','));
      }
      for (const row of bs.liabilities) {
        lines.push(['LIABILITY', row.accountCode, row.accountName, formatMinorCurrency(row.amountMinor, currency)].map(escapeCsvCell).join(','));
      }
      for (const row of bs.equity) {
        lines.push(['EQUITY', row.accountCode, row.accountName, formatMinorCurrency(row.amountMinor, currency)].map(escapeCsvCell).join(','));
      }
      lines.push(['EQUITY', '', 'Current Period Net Surplus / (Deficit)', formatMinorCurrency(bs.currentPeriodNetSurplusMinor, currency)].map(escapeCsvCell).join(','));
    }

    await adminService.logAudit(
      actor,
      'FINANCE_REPORT_EXPORTED',
      'FinancialReport',
      organizationId,
      `Exported ${reportType} financial report to CSV`
    );

    return lines.join('\n');
  }
}

export const financialReportsService = new FinancialReportsService();
