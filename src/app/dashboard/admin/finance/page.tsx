'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/features/admin';
import {
  financeApiService,
  FinanceDashboardData,
  FinanceStatCard,
  FundUtilizationChart,
} from '@/features/finance';
import { formatMinorCurrency } from '@/lib/money';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  CheckCircle2,
  FileCheck2,
  Landmark,
  Receipt,
  RefreshCw,
  Scale,
  TrendingUp,
  Wallet,
} from 'lucide-react';

export default function AdminFinanceDashboardPage() {
  const [data, setData] = useState<FinanceDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await financeApiService.getDashboard();
      if (res.success && res.data) setData(res.data);
      else setError(res.error?.message || 'Unable to load finance dashboard');
    } catch {
      setError('Failed to fetch ledger-derived finance dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) void loadDashboard();
    });
    return () => {
      active = false;
    };
  }, [loadDashboard]);

  const maxMonthly = Math.max(
    1,
    ...(data?.charts.monthlyIncomeVsExpenses.flatMap((m) => [m.incomeMinor, m.expenseMinor]) || [1])
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enterprise Finance & Accounting Control Center"
        description="Real-time NGO financial posture strictly derived from posted double-entry General Ledger entries (draft and unposted journals excluded)."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={loadDashboard}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-semibold"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              href="/dashboard/admin/finance/journals"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#087F5B] px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
            >
              New Journal Entry <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>
      )}

      {data && (
        <>
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-950/20 px-4 py-3 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
            {data.kpis.trialBalanceIsBalanced ? (
              <CheckCircle2 className="h-4 w-4 text-[#087F5B] shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span>{data.dataIntegrityNotice}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FinanceStatCard
              title="Posted Income"
              amountMinor={data.kpis.totalPostedIncomeMinor}
              subtitle="Posted INCOME ledger credits"
              accent="emerald"
              icon={<TrendingUp className="h-5 w-5" />}
            />
            <FinanceStatCard
              title="Posted Expenses"
              amountMinor={data.kpis.totalPostedExpenseMinor}
              subtitle="Posted EXPENSE ledger debits"
              accent="rose"
              icon={<Receipt className="h-5 w-5" />}
            />
            <FinanceStatCard
              title="Net Operating Result"
              amountMinor={data.kpis.netOperatingResultMinor}
              badgeText={data.kpis.trialBalanceIsBalanced ? 'Ledger Balanced' : 'Check TB'}
              accent={data.kpis.netOperatingResultMinor >= 0 ? 'emerald' : 'amber'}
              icon={<Scale className="h-5 w-5" />}
            />
            <FinanceStatCard
              title="Reconciled Bank Cash"
              amountMinor={data.kpis.reconciledBankBalanceMinor}
              badgeText={data.kpis.hasUnreconciledBankAccounts ? 'Unreconciled Accts' : 'Reconciled'}
              accent={data.kpis.hasUnreconciledBankAccounts ? 'amber' : 'sky'}
              icon={<Landmark className="h-5 w-5" />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FinanceStatCard
              title="Pending Expense Approvals"
              countValue={data.kpis.pendingExpenseApprovalsCount}
              subtitle="Awaiting authorized review"
              accent="amber"
              icon={<Wallet className="h-5 w-5" />}
            />
            <FinanceStatCard
              title="Vendor Payables"
              amountMinor={data.kpis.outstandingVendorPayablesMinor}
              subtitle={`${data.kpis.outstandingVendorBillsCount} unpaid/partial bill(s)`}
              accent="slate"
              icon={<Receipt className="h-5 w-5" />}
            />
            <FinanceStatCard
              title="Restricted Funds Avail."
              amountMinor={data.kpis.restrictedFundsAvailableMinor}
              subtitle={`Budget utilization: ${data.kpis.budgetUtilizationPercent.toFixed(1)}%`}
              accent="sky"
              icon={<Award className="h-5 w-5" />}
            />
            <FinanceStatCard
              title="Compliance Deadlines"
              countValue={data.kpis.upcomingComplianceDeadlinesCount}
              subtitle="Overdue or due within 45d"
              accent={data.kpis.upcomingComplianceDeadlinesCount > 0 ? 'rose' : 'emerald'}
              icon={<FileCheck2 className="h-5 w-5" />}
            />
          </div>

          {/* Verified Donations Bridge (Phase 08 Integration) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Phase 08 Verified Donations & Refund Bridge
                </h3>
                <p className="text-xs text-slate-500">
                  Only settled SUCCESSFUL donations are eligible for idempotent ledger recognition (pending/failed excluded).
                </p>
              </div>
              <Link
                href="/dashboard/admin/finance/journals"
                className="text-xs font-bold text-[#087F5B] hover:underline"
              >
                Sync Donation to Ledger →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl bg-slate-50 dark:bg-[#0d1a14] p-3">
                <p className="text-slate-500">Gross Verified Donations ({data.verifiedDonationsBridge.verifiedCount})</p>
                <p className="font-mono font-bold text-base mt-0.5">
                  {formatMinorCurrency(data.verifiedDonationsBridge.grossVerifiedMinor)}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-[#0d1a14] p-3">
                <p className="text-slate-500">Processed Refunds</p>
                <p className="font-mono font-bold text-base text-rose-600 mt-0.5">
                  {formatMinorCurrency(data.verifiedDonationsBridge.refundedMinor)}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-[#0d1a14] p-3">
                <p className="text-slate-500">Net Verified Donations</p>
                <p className="font-mono font-bold text-base text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {formatMinorCurrency(data.verifiedDonationsBridge.netVerifiedMinor)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] p-4 sm:p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Monthly Posted Income vs Expenses
              </h3>
              {data.charts.monthlyIncomeVsExpenses.length === 0 ? (
                <p className="text-xs text-slate-500">No monthly posted journal history yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.charts.monthlyIncomeVsExpenses.map((row) => (
                    <div key={row.month} className="space-y-1 text-xs">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="font-bold">{row.month}</span>
                        <span>
                          In: {formatMinorCurrency(row.incomeMinor)} | Out: {formatMinorCurrency(row.expenseMinor)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-[#087F5B]"
                            style={{ width: `${Math.round((Math.max(0, row.incomeMinor) / maxMonthly) * 100)}%` }}
                          />
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-rose-500"
                            style={{ width: `${Math.round((Math.max(0, row.expenseMinor) / maxMonthly) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <FundUtilizationChart
              title="Grant & Budget Utilization"
              items={data.charts.budgetSummaries.map((b) => ({
                label: b.name,
                allocatedMinor: b.approvedAmountMinor || b.plannedAmountMinor,
                utilizedMinor: b.actualSpentMinor,
                currency: b.currency,
                tag: b.level,
              }))}
            />
          </div>
        </>
      )}
    </div>
  );
}
