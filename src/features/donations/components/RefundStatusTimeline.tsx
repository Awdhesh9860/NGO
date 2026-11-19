'use client';

import React from 'react';
import { RefundRecordItem } from '../services/donation-api.service';

export function RefundStatusTimeline({ history }: { history: RefundRecordItem['history'] }) {
  if (!history || history.length === 0) {
    return <p className="text-xs text-slate-500">No refund audit entries yet.</p>;
  }

  return (
    <ol className="relative border-l-2 border-slate-200 dark:border-[#1d332b] ml-2.5 space-y-3">
      {history.map((entry, idx) => (
        <li key={idx} className="ml-4 text-xs">
          <span className="absolute -left-[7px] h-3 w-3 rounded-full bg-emerald-600 ring-4 ring-white dark:ring-[#12221b]" />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-slate-900 dark:text-white">
              {entry.status.replace(/_/g, ' ')}
            </span>
            <span className="text-[10px] text-slate-400">
              {new Date(entry.timestamp).toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300">
            {entry.actorName} ({entry.actorRole})
          </p>
          {entry.notes && (
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{entry.notes}</p>
          )}
        </li>
      ))}
    </ol>
  );
}
