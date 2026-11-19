'use client';

import React from 'react';
import { DonorItem } from '../services/donor-api.service';
import { formatMinorCurrency } from '@/lib/money';
import { Mail, Phone, Building2, Shield, RefreshCw } from 'lucide-react';

export function DonorProfileCard({ donor }: { donor: DonorItem }) {
  return (
    <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-slate-900 dark:text-white">{donor.name}</h3>
            <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
              {donor.donorType}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                donor.status === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : donor.status === 'DO_NOT_CONTACT'
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {donor.status.replace(/_/g, ' ')}
            </span>
          </div>
          {donor.organizationName && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Building2 className="h-3.5 w-3.5" /> {donor.organizationName}
            </p>
          )}
        </div>

        <div className="text-right">
          <div className="text-lg font-black text-emerald-700 dark:text-emerald-400">
            {formatMinorCurrency(donor.lifetimeAmountMinor, 'INR')}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {donor.donationCount} verified donation{donor.donationCount === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <Mail className="h-3.5 w-3.5 text-slate-400" />
          <span className="truncate">{donor.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 text-slate-400" />
          <span>{donor.phone || 'Not provided'}</span>
        </div>
        {donor.taxDetails?.panNumber && (
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-slate-400" />
            <span>PAN: {donor.taxDetails.panNumber}</span>
          </div>
        )}
        {donor.hasActiveRecurring && (
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Active Recurring Mandate</span>
          </div>
        )}
      </div>

      {donor.segments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-[#1d332b]">
          {donor.segments.map((seg) => (
            <span
              key={seg}
              className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300"
            >
              {seg.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}

      {donor.internalNotes && (
        <div className="rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="font-bold text-[11px] uppercase tracking-wide mb-1">
            Restricted Internal Notes
          </div>
          <p className="whitespace-pre-line">{donor.internalNotes}</p>
        </div>
      )}
    </div>
  );
}
