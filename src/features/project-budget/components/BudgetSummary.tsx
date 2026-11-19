'use client';

import React from 'react';
import { ProjectBudgetSummaryView } from '@/features/projects/services/project-api.service';
import { StatCard } from '@/features/admin';
import { Wallet, TrendingUp, PiggyBank, AlertTriangle } from 'lucide-react';

export interface BudgetSummaryProps {
  summary: ProjectBudgetSummaryView;
}

export function BudgetSummary({ summary }: BudgetSummaryProps) {
  return (
    <div className="space-y-3">
      {(summary.exceedsApproved || summary.exceedsPlanned) && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/30 p-3.5 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            {summary.exceedsApproved
              ? 'Actual recorded expenditure exceeds the approved project budget.'
              : 'Actual recorded expenditure exceeds planned line-item expenditure.'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Approved Budget"
          value={`₹${summary.approvedBudget.toLocaleString('en-IN')}`}
          accent="emerald"
          icon={<Wallet className="h-5 w-5" />}
          footer={`Planned lines: ₹${summary.totalPlanned.toLocaleString('en-IN')}`}
        />
        <StatCard
          title="Actual Expenditure"
          value={`₹${summary.totalActual.toLocaleString('en-IN')}`}
          accent="sky"
          icon={<TrendingUp className="h-5 w-5" />}
          footer="Derived strictly from persisted entries"
        />
        <StatCard
          title="Remaining Budget"
          value={`₹${summary.remainingBudget.toLocaleString('en-IN')}`}
          accent={summary.remainingBudget < 0 ? 'rose' : 'violet'}
          icon={<PiggyBank className="h-5 w-5" />}
          footer={`Planned variance: ₹${summary.remainingPlanned.toLocaleString('en-IN')}`}
        />
        <StatCard
          title="Utilization"
          value={`${summary.utilizationPercentage}%`}
          accent={summary.utilizationPercentage > 100 ? 'rose' : 'amber'}
          icon={<AlertTriangle className="h-5 w-5" />}
          footer={`vs Planned: ${summary.plannedUtilizationPercentage}%`}
        />
      </div>
    </div>
  );
}
