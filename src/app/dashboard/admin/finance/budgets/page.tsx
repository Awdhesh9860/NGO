'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { PageHeader, PermissionGate } from '@/features/admin';
import {
  financeApiService,
  BudgetAllocationPanel,
  BudgetWithUtilizationItem,
} from '@/features/finance';
import { formatMinorCurrency, toMinorUnits } from '@/lib/money';
import { Plus } from 'lucide-react';

export default function AdminBudgetsPage() {
  const [budgets, setBudgets] = useState<BudgetWithUtilizationItem[]>([]);
  const [bridgeRows, setBridgeRows] = useState<
    Array<{
      projectBudgetEntryId: string;
      projectId: string;
      budgetPeriod: string;
      category: string;
      description: string;
      plannedAmountMinor: number;
      ledgerActualSpentMinor: number;
      utilizationPercent: number;
    }>
  >([]);
  const [sourceNote, setSourceNote] = useState('');

  const [name, setName] = useState('');
  const [level, setLevel] = useState<'ORGANIZATION' | 'DEPARTMENT' | 'PROGRAM' | 'PROJECT'>('ORGANIZATION');
  const [financialYear, setFinancialYear] = useState('FY 2026-27');
  const [category, setCategory] = useState('Program Expenses');
  const [plannedMajor, setPlannedMajor] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const res = await financeApiService.listBudgets();
    if (res.success && res.data) {
      setBudgets(res.data.budgets);
      setBridgeRows(res.data.projectBudgetBridge);
      setSourceNote(res.data.authoritativeSourceNote);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) void loadData();
    });
    return () => {
      active = false;
    };
  }, [loadData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const amt = Number(plannedMajor);
    const res = await financeApiService.createBudget({
      name,
      level,
      financialYear,
      category,
      plannedAmountMinor: toMinorUnits(amt, 'INR'),
    });
    if (!res.success) setError(res.error?.message || 'Unable to create budget');
    else {
      setNotice(`Budget "${name}" created.`);
      setName('');
      setPlannedMajor('');
      await loadData();
    }
  };

  const handleWorkflow = async (id: string, action: 'SUBMIT' | 'APPROVE') => {
    setError(null);
    const res = await financeApiService.updateBudgetWorkflow(id, { action });
    if (!res.success) setError(res.error?.message || 'Budget workflow action failed');
    else {
      setNotice(`Budget ${action.toLowerCase()}d successfully.`);
      await loadData();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Multi-Level Budgets & Phase 07 Project Budget Integration"
        description="Track organizational, departmental, program, and project budgets with actual expenditure calculated strictly from posted General Ledger entries."
      />

      {sourceNote && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/50 dark:bg-emerald-950/20 px-4 py-3 text-xs text-emerald-900 dark:text-emerald-200">
          {sourceNote}
        </div>
      )}
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}
      {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">{notice}</div>}

      <PermissionGate permission="finance.budgets.manage">
        <form
          onSubmit={handleCreate}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3"
        >
          <input
            type="text"
            required
            placeholder="Budget Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
          />
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as typeof level)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
          >
            <option value="ORGANIZATION">Organization</option>
            <option value="DEPARTMENT">Department</option>
            <option value="PROGRAM">Program</option>
            <option value="PROJECT">Project</option>
          </select>
          <input
            type="text"
            required
            placeholder="Financial Year"
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
          />
          <input
            type="text"
            required
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
          />
          <input
            type="number"
            step="0.01"
            min="1"
            required
            placeholder="Planned Amount (₹)"
            value={plannedMajor}
            onChange={(e) => setPlannedMajor(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs font-mono"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#087F5B] px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
          >
            <Plus className="h-3.5 w-3.5" /> Create Budget
          </button>
        </form>
      </PermissionGate>

      <BudgetAllocationPanel
        budgets={budgets}
        onSubmit={(id) => handleWorkflow(id, 'SUBMIT')}
        onApprove={(id) => handleWorkflow(id, 'APPROVE')}
      />

      {bridgeRows.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] overflow-x-auto">
          <div className="px-4 py-3 bg-slate-50 dark:bg-[#0d1a14] border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Phase 07 Project Budget Entries (Reconciled to Posted Ledger)
            </h3>
          </div>
          <table className="w-full min-w-[600px] text-left text-xs">
            <thead className="text-slate-500 uppercase text-[11px] border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-4 py-2.5">Period & Category</th>
                <th className="px-4 py-2.5">Description</th>
                <th className="px-4 py-2.5 text-right">Planned</th>
                <th className="px-4 py-2.5 text-right">Ledger Actual</th>
                <th className="px-4 py-2.5 text-right">Utilized</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {bridgeRows.map((r) => (
                <tr key={r.projectBudgetEntryId}>
                  <td className="px-4 py-2.5 font-semibold">
                    {r.budgetPeriod} • {r.category}
                  </td>
                  <td className="px-4 py-2.5">{r.description}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{formatMinorCurrency(r.plannedAmountMinor)}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold">
                    {formatMinorCurrency(r.ledgerActualSpentMinor)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono">{r.utilizationPercent.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
