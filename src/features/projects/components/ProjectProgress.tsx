'use client';

import React from 'react';

export interface ProjectProgressProps {
  percentage: number;
  label?: string;
  showPercent?: boolean;
}

export function ProjectProgress({
  percentage,
  label = 'Overall Progress',
  showPercent = true,
}: ProjectProgressProps) {
  const safe = Math.min(100, Math.max(0, Math.round(percentage || 0)));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold text-slate-600 dark:text-slate-300">{label}</span>
        {showPercent && <span className="font-bold text-slate-900 dark:text-white">{safe}%</span>}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-[#087F5B] dark:bg-emerald-500 transition-all duration-300"
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  );
}
