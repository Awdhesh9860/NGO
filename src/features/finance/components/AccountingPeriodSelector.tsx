'use client';

import React from 'react';
import { AccountingPeriodItem } from '../services/finance-api.service';
import { Calendar, Lock, Unlock } from 'lucide-react';

interface AccountingPeriodSelectorProps {
  periods: AccountingPeriodItem[];
  selectedPeriodId: string;
  onSelect: (periodId: string) => void;
  onPeriodAction?: (periodId: string, action: 'CLOSE' | 'LOCK' | 'REOPEN') => void;
}

const PERIOD_BADGE: Record<AccountingPeriodItem['status'], string> = {
  OPEN: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  CLOSED: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  LOCKED: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
};

export function AccountingPeriodSelector({
  periods,
  selectedPeriodId,
  onSelect,
  onPeriodAction,
}: AccountingPeriodSelectorProps) {
  const activePeriod = periods.find((p) => p._id === selectedPeriodId);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <Calendar className="h-4 w-4 text-[#087F5B]" />
        <label htmlFor="period-select" className="text-xs font-bold text-slate-700 dark:text-slate-200">
          Accounting Period:
        </label>
        <select
          id="period-select"
          value={selectedPeriodId}
          onChange={(e) => onSelect(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100"
        >
          <option value="">All Periods</option>
          {periods.map((p) => (
            <option key={p._id} value={p._id}>
              {p.financialYearLabel} — {p.periodName} ({p.status})
            </option>
          ))}
        </select>
        {activePeriod && (
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${PERIOD_BADGE[activePeriod.status]}`}>
            {activePeriod.status}
          </span>
        )}
      </div>

      {activePeriod && onPeriodAction && (
        <div className="flex flex-wrap items-center gap-2">
          {activePeriod.status === 'OPEN' && (
            <button
              type="button"
              onClick={() => onPeriodAction(activePeriod._id, 'CLOSE')}
              className="inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100"
            >
              <Lock className="h-3.5 w-3.5" /> Close Period
            </button>
          )}
          {activePeriod.status === 'CLOSED' && (
            <button
              type="button"
              onClick={() => onPeriodAction(activePeriod._id, 'LOCK')}
              className="inline-flex items-center gap-1 rounded-xl border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-800 hover:bg-rose-100"
            >
              <Lock className="h-3.5 w-3.5" /> Lock Period
            </button>
          )}
          {activePeriod.status !== 'OPEN' && (
            <button
              type="button"
              onClick={() => onPeriodAction(activePeriod._id, 'REOPEN')}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
            >
              <Unlock className="h-3.5 w-3.5" /> Reopen (Privileged)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
