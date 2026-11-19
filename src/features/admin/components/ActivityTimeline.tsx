'use client';

import React from 'react';
import { ShieldCheck, Clock } from 'lucide-react';
import { EmptyState } from './EmptyState';

export interface ActivityTimelineItem {
  id: string;
  actorName?: string;
  actorRole?: string;
  action: string;
  resource?: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface ActivityTimelineProps {
  items: ActivityTimelineItem[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ActivityTimeline({
  items,
  emptyTitle = 'No recent activity',
  emptyDescription = 'Administrative actions will be recorded in this immutable timeline.',
}: ActivityTimelineProps) {
  if (!items || items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <ol className="relative space-y-3 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-slate-200 dark:before:bg-[#1d332b]">
      {items.map((item) => (
        <li key={item.id} className="relative pl-10">
          <span className="absolute left-1.5 top-1 flex h-5 w-5 items-center justify-center rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-3 w-3" />
          </span>

          <div className="rounded-xl border border-slate-100 dark:border-[#1d332b] bg-slate-50/60 dark:bg-[#162920]/50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {item.actorName && (
                  <span className="font-bold text-slate-900 dark:text-white">{item.actorName}</span>
                )}
                {item.actorRole && (
                  <span className="rounded bg-slate-200/80 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                    {item.actorRole}
                  </span>
                )}
                <span className="rounded bg-emerald-100/80 dark:bg-emerald-950/70 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                  {item.action.replace(/_/g, ' ')}
                </span>
              </div>

              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                <Clock className="h-3 w-3" />
                {new Date(item.timestamp).toLocaleString()}
              </span>
            </div>

            {item.details && (
              <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">{item.details}</p>
            )}

            {(item.resource || item.ipAddress) && (
              <p className="mt-1 text-[10px] text-slate-400">
                {item.resource ? `Entity: ${item.resource}` : ''}
                {item.resource && item.ipAddress ? ' • ' : ''}
                {item.ipAddress ? `IP: ${item.ipAddress}` : ''}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
