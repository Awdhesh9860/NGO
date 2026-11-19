'use client';

import React from 'react';
import { GrantItem } from '../services/finance-api.service';
import { formatMinorCurrency, calculateMinorPercentage } from '@/lib/money';
import { Award, ShieldAlert, CalendarClock } from 'lucide-react';

interface GrantProfileCardProps {
  grant: GrantItem;
  onRecordReceipt?: (grant: GrantItem) => void;
  onUpdateStatus?: (grant: GrantItem, nextStatus: string) => void;
}

export function GrantProfileCard({ grant, onRecordReceipt, onUpdateStatus }: GrantProfileCardProps) {
  const receivedPct = calculateMinorPercentage(grant.receivedAmountMinor, grant.awardAmountMinor);
  const pendingReports = (grant.reportingDeadlines || []).filter((r) => r.status !== 'SUBMITTED').length;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Award className="h-4 w-4 text-[#087F5B] shrink-0" />
            <span className="font-mono text-[11px] font-bold text-[#087F5B] dark:text-emerald-400">
              {grant.grantReferenceNumber}
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">{grant.grantName}</h4>
          <p className="text-xs text-slate-500">
            {grant.providerName} • {grant.providerType.replace(/_/g, ' ')}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold">
            {grant.status}
          </span>
          {grant.isRestricted && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-bold">
              <ShieldAlert className="h-3 w-3" /> Restricted
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs pt-1">
        <div>
          <p className="text-[10px] uppercase text-slate-500">Award Amount</p>
          <p className="font-mono font-bold text-slate-900 dark:text-white">
            {formatMinorCurrency(grant.awardAmountMinor, grant.currency)}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-slate-500">Received ({receivedPct.toFixed(0)}%)</p>
          <p className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
            {formatMinorCurrency(grant.receivedAmountMinor, grant.currency)}
          </p>
        </div>
      </div>

      {grant.restrictions && (
        <p className="rounded-xl bg-amber-50/70 dark:bg-amber-950/20 px-3 py-2 text-[11px] text-amber-900 dark:text-amber-200">
          Restrictions: {grant.restrictions}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
        <span className="inline-flex items-center gap-1">
          <CalendarClock className="h-3.5 w-3.5" />
          {new Date(grant.startDate).toLocaleDateString('en-IN')} – {new Date(grant.endDate).toLocaleDateString('en-IN')}
        </span>
        <span>{pendingReports} pending report(s)</span>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        {grant.status === 'DRAFT' && onUpdateStatus && (
          <button
            type="button"
            onClick={() => onUpdateStatus(grant, 'APPLIED')}
            className="rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[11px] font-semibold"
          >
            Mark Applied
          </button>
        )}
        {['APPLIED', 'UNDER_REVIEW'].includes(grant.status) && onUpdateStatus && (
          <button
            type="button"
            onClick={() => onUpdateStatus(grant, 'APPROVED')}
            className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800"
          >
            Approve Grant
          </button>
        )}
        {['APPROVED', 'ACTIVE'].includes(grant.status) && onRecordReceipt && (
          <button
            type="button"
            onClick={() => onRecordReceipt(grant)}
            className="rounded-lg bg-[#087F5B] px-3 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
          >
            Record Tranche Receipt
          </button>
        )}
      </div>
    </div>
  );
}
