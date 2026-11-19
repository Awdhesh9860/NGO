'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/features/admin';
import { financeApiService, FinancialReportViewer } from '@/features/finance';
import { formatMinorCurrency } from '@/lib/money';

export default function AdminFinancialReportsPage() {
  const [incExp, setIncExp] = useState<{
    incomeLines: Array<{ accountCode: string; accountName: string; amountMinor: number }>;
    expenseLines: Array<{ accountCode: string; accountName: string; amountMinor: number }>;
    totalIncomeMinor: number;
    totalExpenseMinor: number;
    netSurplusOrDeficitMinor: number;
  } | null>(null);

  const [balSheet, setBalSheet] = useState<{
    assets: Array<{ accountCode: string; accountName: string; amountMinor: number }>;
    liabilities: Array<{ accountCode: string; accountName: string; amountMinor: number }>;
    equity: Array<{ accountCode: string; accountName: string; amountMinor: number }>;
    currentPeriodNetSurplusMinor: number;
    totalAssetsMinor: number;
    totalLiabilitiesMinor: number;
    totalEquityWithSurplusMinor: number;
    isBalanced: boolean;
  } | null>(null);

  const [cashFlow, setCashFlow] = useState<{
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
  } | null>(null);

  const loadReports = useCallback(async () => {
    const [ieRes, bsRes, cfRes] = await Promise.all([
      financeApiService.getIncomeExpenseReport(),
      financeApiService.getBalanceSheetReport(),
      financeApiService.getCashFlowReport(),
    ]);
    if (ieRes.success && ieRes.data) setIncExp(ieRes.data);
    if (bsRes.success && bsRes.data) setBalSheet(bsRes.data);
    if (cfRes.success && cfRes.data) setCashFlow(cfRes.data);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) void loadReports();
    });
    return () => {
      active = false;
    };
  }, [loadReports]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ledger-Derived Financial Statements & Reports"
        description="Income & Expense Statement, Balance Sheet, and Cash Flow Summary computed strictly from posted double-entry General Ledger records with CSV export."
      />

      {incExp && (
        <FinancialReportViewer
          title="Income and Expense Statement"
          subtitle="Derived strictly from posted INCOME and EXPENSE ledger accounts (draft entries excluded)."
          exportCsvHref="/api/v1/finance/reports/income-expense?export=csv"
          sections={[
            {
              heading: 'Income',
              rows: incExp.incomeLines.map((l) => ({
                code: l.accountCode,
                label: l.accountName,
                amountMinor: l.amountMinor,
              })),
              subtotalMinor: incExp.totalIncomeMinor,
            },
            {
              heading: 'Expenses',
              rows: incExp.expenseLines.map((l) => ({
                code: l.accountCode,
                label: l.accountName,
                amountMinor: l.amountMinor,
              })),
              subtotalMinor: incExp.totalExpenseMinor,
            },
          ]}
          summaryLabel="Net Operating Surplus / (Deficit)"
          summaryAmountMinor={incExp.netSurplusOrDeficitMinor}
        />
      )}

      {balSheet && (
        <FinancialReportViewer
          title={`Balance Sheet (${balSheet.isBalanced ? 'Balanced: A = L + E' : 'Review Required'})`}
          subtitle="Derived strictly from posted ASSET, LIABILITY, EQUITY, and current-period net surplus."
          exportCsvHref="/api/v1/finance/reports/balance-sheet?export=csv"
          sections={[
            {
              heading: 'Assets',
              rows: balSheet.assets.map((l) => ({
                code: l.accountCode,
                label: l.accountName,
                amountMinor: l.amountMinor,
              })),
              subtotalMinor: balSheet.totalAssetsMinor,
            },
            {
              heading: 'Liabilities',
              rows: balSheet.liabilities.map((l) => ({
                code: l.accountCode,
                label: l.accountName,
                amountMinor: l.amountMinor,
              })),
              subtotalMinor: balSheet.totalLiabilitiesMinor,
            },
            {
              heading: 'Fund Balances / Equity & Surplus',
              rows: [
                ...balSheet.equity.map((l) => ({
                  code: l.accountCode,
                  label: l.accountName,
                  amountMinor: l.amountMinor,
                })),
                {
                  label: 'Current Period Net Surplus / (Deficit)',
                  amountMinor: balSheet.currentPeriodNetSurplusMinor,
                },
              ],
              subtotalMinor: balSheet.totalEquityWithSurplusMinor,
            },
          ]}
          summaryLabel="Total Assets"
          summaryAmountMinor={balSheet.totalAssetsMinor}
        />
      )}

      {cashFlow && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] p-4 sm:p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Cash Flow Summary & Bank Reconciliation Status
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl bg-slate-50 dark:bg-[#0d1a14] p-3">
              <p className="text-slate-500">Ledger Cash/Bank Inflows</p>
              <p className="font-mono font-bold text-base text-emerald-700 dark:text-emerald-400">
                {formatMinorCurrency(cashFlow.totalInflowMinor)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-[#0d1a14] p-3">
              <p className="text-slate-500">Ledger Cash/Bank Outflows</p>
              <p className="font-mono font-bold text-base text-rose-600">
                {formatMinorCurrency(cashFlow.totalOutflowMinor)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-[#0d1a14] p-3">
              <p className="text-slate-500">Net Cash Movement</p>
              <p className="font-mono font-bold text-base">
                {formatMinorCurrency(cashFlow.netCashChangeMinor)}
              </p>
            </div>
          </div>
          {cashFlow.hasUnreconciledAccounts && (
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Note: One or more registered bank accounts have not completed a reconciliation session and are labeled UNRECONCILED_PROVISIONAL.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
