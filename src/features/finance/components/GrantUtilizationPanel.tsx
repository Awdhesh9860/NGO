'use client';

import React from 'react';
import { FundAllocationItem } from '../services/finance-api.service';
import { formatMinorCurrency } from '@/lib/money';
import { Lock, Unlock } from 'lucide-react';

export function GrantUtilizationPanel({ allocations }: { allocations: FundAllocationItem[] }) {
  if (allocations.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] p-5 text-center text-xs text-slate-500">
        No fund allocations recorded yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] overflow-x-auto">
      <table className="w-full min-w-[680px] text-left text-xs">
        <thead className="bg-slate-50 dark:bg-[#0d1a14] text-slate-500 uppercase text-[11px]">
          <tr>
            <th className="px-4 py-3">Code & Source</th>
            <th className="px-4 py-3">Restriction</th>
            <th className="px-4 py-3">Permitted Purpose</th>
            <th className="px-4 py-3 text-right">Allocated</th>
            <th className="px-4 py-3 text-right">Utilized</th>
            <th className="px-4 py-3 text-right">Available</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {allocations.map((a) => (
            <tr key={a.id}>
              <td className="px-4 py-3">
                <p className="font-mono font-bold text-[#087F5B] dark:text-emerald-400">{a.allocationCode}</p>
                <p className="text-[11px] text-slate-500">
                  {a.fundSource}: {a.sourceLabel}
                </p>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    a.restrictionType === 'RESTRICTED'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {a.restrictionType === 'RESTRICTED' ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                  {a.restrictionType}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-700 dark:text-slate-200 max-w-xs truncate">{a.purpose}</td>
              <td className="px-4 py-3 text-right font-mono">
                {formatMinorCurrency(a.allocatedAmountMinor, a.currency)}
              </td>
              <td className="px-4 py-3 text-right font-mono">
                {formatMinorCurrency(a.utilizedAmountMinor, a.currency)} ({a.utilizationPercent.toFixed(0)}%)
              </td>
              <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                {formatMinorCurrency(a.availableBalanceMinor, a.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
