'use client';

import React from 'react';
import { BudgetWithUtilizationItem } from '../services/finance-api.service';
import { formatMinorCurrency } from '@/lib/money';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface BudgetAllocationPanelProps {
  budgets: BudgetWithUtilizationItem[];
  onApprove?: (id: string) => void;
  onSubmit?: (id: string) => void;
}

export function BudgetAllocationPanel({ budgets, onApprove, onSubmit }: BudgetAllocationPanelProps) {
  if (budgets.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] p-6 text-center text-xs text-slate-500">
        No multi-level budgets configured yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {budgets.map((b) => {
        const clampedPct = Math.min(100, Math.max(0, b.utilizationPercent));
        return (
          <div
            key={b.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] font-mono font-bold uppercase text-[#087F5B] dark:text-emerald-400">
                  {b.budgetCode} • {b.level} • {b.financialYear}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{b.name}</h4>
                <p className="text-[11px] text-slate-500">{b.category} ({b.budgetPeriod})</p>
              </div>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold">
                {b.approvalStatus}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Planned / Appr.</p>
                <p className="font-mono font-bold">
                  {formatMinorCurrency(b.approvedAmountMinor || b.plannedAmountMinor, b.currency)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Ledger Actual</p>
                <p className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatMinorCurrency(b.actualSpentMinor, b.currency)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Remaining</p>
                <p
                  className={`font-mono font-bold ${
                    b.isOverBudget ? 'text-rose-600' : 'text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {formatMinorCurrency(b.remainingAmountMinor, b.currency)}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  Utilization: {b.utilizationPercent.toFixed(1)}%
                </span>
                {b.isOverBudget ? (
                  <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                    <AlertTriangle className="h-3 w-3" /> Over Budget
                  </span>
                ) : b.isAlertTriggered ? (
                  <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                    <AlertTriangle className="h-3 w-3" /> Threshold Alert
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="h-3 w-3" /> Within Budget
                  </span>
                )}
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    b.isOverBudget ? 'bg-rose-500' : b.isAlertTriggered ? 'bg-amber-500' : 'bg-[#087F5B]'
                  }`}
                  style={{ width: `${clampedPct}%` }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              {b.approvalStatus === 'DRAFT' && onSubmit && (
                <button
                  type="button"
                  onClick={() => onSubmit(b.id)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-[11px] font-semibold hover:bg-slate-50"
                >
                  Submit
                </button>
              )}
              {['DRAFT', 'SUBMITTED', 'REVISED'].includes(b.approvalStatus) && onApprove && (
                <button
                  type="button"
                  onClick={() => onApprove(b.id)}
                  className="rounded-lg bg-[#087F5B] px-3 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
                >
                  Approve Budget
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
