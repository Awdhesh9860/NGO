'use client';

import React from 'react';
import { formatMinorCurrency, calculateMinorPercentage } from '@/lib/money';

export interface CampaignProgressProps {
  raisedAmountMinor: number;
  targetAmountMinor: number;
  currency?: string;
  donorCount?: number;
  compact?: boolean;
}

export function CampaignProgress({
  raisedAmountMinor,
  targetAmountMinor,
  currency = 'INR',
  donorCount,
  compact = false,
}: CampaignProgressProps) {
  const pct = Math.min(100, calculateMinorPercentage(raisedAmountMinor, targetAmountMinor));

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <div>
          <span className="font-black text-slate-900 dark:text-white">
            {formatMinorCurrency(raisedAmountMinor, currency)}
          </span>
          {!compact && (
            <span className="ml-1.5 text-slate-500 dark:text-slate-400">
              verified of {formatMinorCurrency(targetAmountMinor, currency)}
            </span>
          )}
        </div>
        <span className="font-bold text-emerald-700 dark:text-emerald-400">{pct.toFixed(0)}%</span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#087F5B] to-emerald-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      {!compact && (
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>
            {typeof donorCount === 'number'
              ? `${donorCount} verified supporter${donorCount === 1 ? '' : 's'}`
              : 'Verified donations only'}
          </span>
          <span>Goal: {formatMinorCurrency(targetAmountMinor, currency)}</span>
        </div>
      )}
    </div>
  );
}
