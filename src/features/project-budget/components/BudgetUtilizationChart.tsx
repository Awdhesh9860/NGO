'use client';

import React from 'react';
import { ProjectBudgetSummaryView } from '@/features/projects/services/project-api.service';
import { EmptyState } from '@/features/admin';

export interface BudgetUtilizationChartProps {
  byCategory: ProjectBudgetSummaryView['byCategory'];
}

export function BudgetUtilizationChart({ byCategory }: BudgetUtilizationChartProps) {
  if (!byCategory || byCategory.length === 0) {
    return (
      <EmptyState
        title="No budget allocations recorded yet"
        description="Add category-level planned and actual expenditure entries to track budget utilization."
      />
    );
  }

  const maxVal = Math.max(
    1,
    ...byCategory.flatMap((c) => [c.plannedAmount, c.actualAmount])
  );

  return (
    <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Planned vs Actual Expenditure by Category
          </h4>
          <p className="text-xs text-slate-500">All figures calculated from persisted budget entries</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-semibold">
          <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="h-2.5 w-2.5 rounded-sm bg-slate-300 dark:bg-slate-600" /> Planned
          </span>
          <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#087F5B]" /> Actual
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {byCategory.map((row) => {
          const plannedPct = Math.round((row.plannedAmount / maxVal) * 100);
          const actualPct = Math.round((row.actualAmount / maxVal) * 100);
          const overBudget = row.actualAmount > row.plannedAmount;
          return (
            <div key={row.category} className="space-y-1.5 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {row.category.replace(/_/g, ' ')}
                </span>
                <span className="text-[11px] text-slate-500">
                  Planned: <strong>₹{row.plannedAmount.toLocaleString('en-IN')}</strong> • Actual:{' '}
                  <strong className={overBudget ? 'text-rose-600' : 'text-emerald-700 dark:text-emerald-400'}>
                    ₹{row.actualAmount.toLocaleString('en-IN')}
                  </strong>
                </span>
              </div>
              <div className="space-y-1">
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-slate-400 dark:bg-slate-500"
                    style={{ width: `${plannedPct}%` }}
                  />
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${overBudget ? 'bg-rose-600' : 'bg-[#087F5B]'}`}
                    style={{ width: `${actualPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
