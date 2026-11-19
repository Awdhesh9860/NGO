'use client';

import React from 'react';
import { formatMinorCurrency } from '@/lib/money';

export interface TrendPoint {
  period: string;
  grossMinor: number;
  refundedMinor: number;
  netMinor: number;
  count: number;
}

export function FundraisingTrendChart({
  title,
  subtitle,
  points,
  currency = 'INR',
}: {
  title: string;
  subtitle?: string;
  points: TrendPoint[];
  currency?: string;
}) {
  const maxVal = Math.max(1, ...points.map((p) => p.netMinor));

  return (
    <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 shadow-xs">
      <div className="mb-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>

      {points.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 dark:border-[#1d332b] p-8 text-center text-xs text-slate-500 dark:text-slate-400">
          No verified donation transactions recorded for this timeframe yet.
        </div>
      ) : (
        <div className="flex items-end gap-3 h-52 pt-6 overflow-x-auto">
          {points.map((pt) => {
            const heightPct = Math.max(8, Math.round((pt.netMinor / maxVal) * 100));
            return (
              <div
                key={pt.period}
                className="flex-1 min-w-[48px] flex flex-col items-center gap-1.5 h-full justify-end"
              >
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 text-center">
                  {formatMinorCurrency(pt.netMinor, currency)}
                </span>
                <div
                  className="w-full max-w-[44px] rounded-t-lg bg-[#087F5B] dark:bg-emerald-500 transition-all"
                  style={{ height: `${heightPct}%` }}
                  title={`${pt.period}: Net ${formatMinorCurrency(pt.netMinor, currency)} (${pt.count} donations)`}
                />
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  {pt.period}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
