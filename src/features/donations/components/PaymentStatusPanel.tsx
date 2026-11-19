'use client';

import React from 'react';
import { GatewayConfigStatus } from '@/integrations/payment/payment.adapter';
import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export function PaymentStatusPanel({ providers }: { providers: GatewayConfigStatus[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {providers.map((p) => (
        <div
          key={p.provider}
          className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-4 shadow-xs"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-black text-slate-900 dark:text-white">{p.provider}</span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                p.mode === 'LIVE'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : p.mode === 'TEST' || p.mode === 'MANUAL'
                  ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
              }`}
            >
              {p.configured ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <AlertTriangle className="h-3 w-3" />
              )}
              {p.mode}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            {p.note}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              {p.supportsOnlineCheckout ? 'Online API' : 'Manual Verify'}
            </span>
            {p.supportsRecurring && (
              <span className="rounded bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 text-emerald-700 dark:text-emerald-300">
                Mandates
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
