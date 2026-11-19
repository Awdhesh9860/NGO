'use client';

import React from 'react';
import { formatMinorCurrency } from '@/lib/money';

export interface FundraisingStatCardProps {
  title: string;
  amountMinor?: number;
  rawValue?: string | number;
  currency?: string;
  subtitle?: string;
  accent?: 'emerald' | 'amber' | 'rose' | 'sky';
  icon?: React.ReactNode;
}

const ACCENTS = {
  emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
  rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400',
  sky: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400',
};

export function FundraisingStatCard({
  title,
  amountMinor,
  rawValue,
  currency = 'INR',
  subtitle,
  accent = 'emerald',
  icon,
}: FundraisingStatCardProps) {
  const displayValue =
    typeof amountMinor === 'number' ? formatMinorCurrency(amountMinor, currency) : rawValue ?? 0;

  return (
    <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{title}</span>
        {icon && <div className={`rounded-xl p-2 ${ACCENTS[accent]}`}>{icon}</div>}
      </div>
      <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{displayValue}</div>
      {subtitle && <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
  );
}
