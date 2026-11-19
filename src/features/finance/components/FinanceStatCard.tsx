'use client';

import React from 'react';
import { formatMinorCurrency } from '@/lib/money';

export interface FinanceStatCardProps {
  title: string;
  amountMinor?: number;
  countValue?: number | string;
  currency?: string;
  subtitle?: string;
  badgeText?: string;
  accent?: 'emerald' | 'sky' | 'amber' | 'rose' | 'slate';
  icon?: React.ReactNode;
}

const ACCENT_MAP = {
  emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  sky: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
  slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export function FinanceStatCard({
  title,
  amountMinor,
  countValue,
  currency = 'INR',
  subtitle,
  badgeText,
  accent = 'emerald',
  icon,
}: FinanceStatCardProps) {
  const displayValue =
    amountMinor !== undefined ? formatMinorCurrency(amountMinor, currency) : String(countValue ?? 0);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] p-4 sm:p-5 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 truncate">
            {title}
          </p>
          <p className="mt-1.5 text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white break-words">
            {displayValue}
          </p>
        </div>
        {icon && (
          <div className={`shrink-0 rounded-xl p-2.5 ${ACCENT_MAP[accent]}`}>
            {icon}
          </div>
        )}
      </div>
      {(subtitle || badgeText) && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          {subtitle && <span className="text-slate-500 dark:text-slate-400">{subtitle}</span>}
          {badgeText && (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${ACCENT_MAP[accent]}`}>
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
