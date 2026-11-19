'use client';

import React from 'react';

export type StatusVariant =
  | 'active'
  | 'ACTIVE'
  | 'verified'
  | 'accepted'
  | 'inactive'
  | 'INACTIVE'
  | 'pending'
  | 'PENDING'
  | 'PENDING_VERIFICATION'
  | 'unverified'
  | 'suspended'
  | 'SUSPENDED'
  | 'revoked'
  | 'REVOKED'
  | 'expired'
  | 'EXPIRED'
  | 'critical'
  | 'warning'
  | 'info'
  | string;

const VARIANT_CLASSES: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
  verified: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
  pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
  pending_verification: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
  warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
  unverified: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/70 dark:text-slate-300 dark:border-slate-700',
  inactive: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/70 dark:text-slate-400 dark:border-slate-700',
  expired: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/70 dark:text-slate-400 dark:border-slate-700',
  suspended: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
  revoked: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
  critical: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
  info: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60',
};

export interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className = '' }: StatusBadgeProps) {
  const key = status.toLowerCase();
  const style = VARIANT_CLASSES[key] || VARIANT_CLASSES.info;
  const text = label || status.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize tracking-tight ${style} ${className}`}
    >
      {text}
    </span>
  );
}
