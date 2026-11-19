'use client';

import React from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  footer?: React.ReactNode;
  icon: React.ReactNode;
  accent?: 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'slate';
  loading?: boolean;
}

const ACCENT_STYLES: Record<NonNullable<StatCardProps['accent']>, string> = {
  emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  sky: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  violet: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
  rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export function StatCard({
  title,
  value,
  subtitle,
  footer,
  icon,
  accent = 'emerald',
  loading = false,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs transition hover:border-emerald-200 dark:hover:border-emerald-800/60">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`rounded-xl p-2 ${ACCENT_STYLES[accent]}`}>{icon}</div>
      </div>

      <div className="mt-3.5 flex items-baseline gap-2">
        {loading ? (
          <div className="h-8 w-20 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        ) : (
          <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {value}
          </span>
        )}
        {subtitle && <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{subtitle}</span>}
      </div>

      {footer && <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">{footer}</div>}
    </div>
  );
}
