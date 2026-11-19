'use client';

import React from 'react';

export interface LoadingSkeletonProps {
  variant?: 'table' | 'cards' | 'form';
  rows?: number;
}

export function LoadingSkeleton({ variant = 'table', rows = 5 }: LoadingSkeletonProps) {
  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5"
          >
            <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mt-4 h-8 w-16 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mt-3 h-2.5 w-36 rounded bg-slate-100 dark:bg-slate-800/70" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'form') {
    return (
      <div className="space-y-4 rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-2 animate-pulse">
            <div className="h-3 w-32 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-10 w-full rounded-xl bg-slate-100 dark:bg-slate-800/70" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b]">
      <div className="border-b border-slate-100 dark:border-slate-800 p-4">
        <div className="h-4 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-32 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-2.5 w-44 rounded bg-slate-100 dark:bg-slate-800/70" />
              </div>
            </div>
            <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
