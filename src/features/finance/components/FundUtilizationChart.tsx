'use client';

import React from 'react';
import { formatMinorCurrency } from '@/lib/money';

export interface FundUtilizationBarItem {
  label: string;
  allocatedMinor: number;
  utilizedMinor: number;
  currency?: string;
  tag?: string;
}

export function FundUtilizationChart({
  title = 'Fund & Expenditure Utilization',
  items,
}: {
  title?: string;
  items: FundUtilizationBarItem[];
}) {
  const maxVal = Math.max(1, ...items.map((i) => Math.max(i.allocatedMinor, i.utilizedMinor)));

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] p-4 sm:p-5 space-y-4">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-slate-500">No posted utilization data available yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => {
            const allocPct = Math.round((item.allocatedMinor / maxVal) * 100);
            const usedPct = Math.round((item.utilizedMinor / maxVal) * 100);
            return (
              <div key={idx} className="space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {item.label}
                    {item.tag && (
                      <span className="ml-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        {item.tag}
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    {formatMinorCurrency(item.utilizedMinor, item.currency)} /{' '}
                    {formatMinorCurrency(item.allocatedMinor, item.currency)}
                  </span>
                </div>
                <div className="relative h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-emerald-200 dark:bg-emerald-900/60 rounded-full"
                    style={{ width: `${allocPct}%` }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 bg-[#087F5B] rounded-full"
                    style={{ width: `${usedPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
