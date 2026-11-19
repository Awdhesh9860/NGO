'use client';

import React from 'react';
import { RecurringDonationItem } from '../services/donation-api.service';
import { formatMinorCurrency } from '@/lib/money';
import { PauseCircle, PlayCircle, XCircle, RefreshCw } from 'lucide-react';

export interface RecurringDonationPanelProps {
  items: RecurringDonationItem[];
  onAction?: (id: string, action: 'PAUSE' | 'RESUME' | 'CANCEL') => Promise<void>;
  canManage?: boolean;
}

export function RecurringDonationPanel({
  items,
  onAction,
  canManage = false,
}: RecurringDonationPanelProps) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 dark:border-[#1d332b] p-8 text-center text-xs text-slate-500 dark:text-slate-400">
        No provider-mandated recurring donation plans recorded yet. Recurring plans are executed exclusively through configured Razorpay or Stripe subscriptions.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {items.map((item) => {
        const donorName =
          typeof item.donorId === 'object' && item.donorId ? item.donorId.name : 'Supporter';
        return (
          <div
            key={item._id}
            className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {formatMinorCurrency(item.amountMinor, item.currency)} / {item.planInterval}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {donorName} • {item.provider}
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                {item.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Completed cycles: {item.completedCycles}</span>
              <span>Failed cycles: {item.failedCycles}</span>
            </div>

            {canManage && onAction && !['CANCELLED', 'COMPLETED'].includes(item.status) && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-[#1d332b]">
                {item.status === 'ACTIVE' && (
                  <button
                    type="button"
                    onClick={() => onAction(item._id, 'PAUSE')}
                    className="inline-flex items-center gap-1 rounded-lg border border-amber-300 px-2.5 py-1 text-[11px] font-bold text-amber-700 hover:bg-amber-50"
                  >
                    <PauseCircle className="h-3.5 w-3.5" /> Pause
                  </button>
                )}
                {item.status === 'PAUSED' && (
                  <button
                    type="button"
                    onClick={() => onAction(item._id, 'RESUME')}
                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50"
                  >
                    <PlayCircle className="h-3.5 w-3.5" /> Resume
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onAction(item._id, 'CANCEL')}
                  className="inline-flex items-center gap-1 rounded-lg border border-rose-300 px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-50"
                >
                  <XCircle className="h-3.5 w-3.5" /> Cancel Mandate
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
