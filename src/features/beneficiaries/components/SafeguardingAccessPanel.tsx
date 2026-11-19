'use client';

import React from 'react';
import { BeneficiaryDetailItem, BeneficiaryDetailResponse } from '../services/beneficiary-api.service';
import { ShieldAlert, Lock, CheckCircle2 } from 'lucide-react';

export function SafeguardingAccessPanel({
  beneficiary,
  clearance,
}: {
  beneficiary: BeneficiaryDetailItem;
  clearance: BeneficiaryDetailResponse['clearance'];
}) {
  return (
    <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 p-5 space-y-3 text-xs">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-black text-rose-900 dark:text-rose-200 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-rose-600" /> Child &amp; Vulnerable Person Safeguarding Status
        </h3>
        <span className="rounded-full bg-white dark:bg-[#12221b] px-2.5 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300 border border-rose-200">
          {beneficiary.requiresSafeguarding ? 'PROTECTED RECORD' : 'STANDARD PRIVACY'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="rounded-xl bg-white dark:bg-[#12221b] border border-rose-100 dark:border-rose-900/40 p-3 flex items-center gap-2">
          {clearance.canViewSensitive ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <Lock className="h-4 w-4 text-amber-600 shrink-0" />
          )}
          <div>
            <div className="font-bold text-slate-900 dark:text-white">Sensitive PII</div>
            <div className="text-[10px] text-slate-500">
              {clearance.canViewSensitive ? 'Authorized (Audit Logged)' : 'Redacted'}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white dark:bg-[#12221b] border border-rose-100 dark:border-rose-900/40 p-3 flex items-center gap-2">
          {clearance.canViewDocuments ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <Lock className="h-4 w-4 text-amber-600 shrink-0" />
          )}
          <div>
            <div className="font-bold text-slate-900 dark:text-white">Documents ({beneficiary.documentCount})</div>
            <div className="text-[10px] text-slate-500">
              {clearance.canViewDocuments ? 'Authorized' : 'Restricted'}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white dark:bg-[#12221b] border border-rose-100 dark:border-rose-900/40 p-3 flex items-center gap-2">
          {clearance.canManageSafeguarding ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <Lock className="h-4 w-4 text-amber-600 shrink-0" />
          )}
          <div>
            <div className="font-bold text-slate-900 dark:text-white">Safeguarding Escalation</div>
            <div className="text-[10px] text-slate-500">
              {beneficiary.safeguardingEscalationRef
                ? `Ref: ${beneficiary.safeguardingEscalationRef}`
                : 'No active escalation'}
            </div>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-rose-900/80 dark:text-rose-200/80">
        No public profile URLs or unrestricted document downloads exist for beneficiary records. All sensitive record views generate immutable audit entries.
      </p>
    </div>
  );
}
