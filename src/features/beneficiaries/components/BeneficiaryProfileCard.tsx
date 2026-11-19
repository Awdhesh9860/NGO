'use client';

import React from 'react';
import { BeneficiaryDetailItem } from '../services/beneficiary-api.service';
import { BeneficiaryStatusBadge } from './BeneficiaryStatusBadge';
import { ShieldAlert, MapPin, Lock } from 'lucide-react';

export function BeneficiaryProfileCard({ beneficiary }: { beneficiary: BeneficiaryDetailItem }) {
  return (
    <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {beneficiary.fullName}
            </h3>
            <span className="font-mono text-xs font-bold text-slate-500">
              {beneficiary.beneficiaryCode}
            </span>
            <BeneficiaryStatusBadge status={beneficiary.status} />
            <BeneficiaryStatusBadge status={beneficiary.verificationStatus} />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Category: <strong>{beneficiary.assistanceCategory}</strong> • Eligibility:{' '}
            <strong>{beneficiary.eligibilityStatus}</strong>
          </p>
        </div>

        {beneficiary.requiresSafeguarding && (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 dark:bg-rose-950/60 px-3 py-1 text-[11px] font-bold text-rose-800 dark:text-rose-300">
            <ShieldAlert className="h-3.5 w-3.5" /> Safeguarded Record
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
          <span>
            {[beneficiary.village, beneficiary.district, beneficiary.state].filter(Boolean).join(', ')}
          </span>
        </div>
        <div>
          <span className="text-slate-400">Age / Range:</span>{' '}
          <strong>{beneficiary.ageOrRange || 'Not recorded'}</strong>
        </div>
        <div>
          <span className="text-slate-400">Source:</span>{' '}
          <strong>{beneficiary.registrationSource.replace(/_/g, ' ')}</strong>
        </div>
      </div>

      {beneficiary.sensitiveFieldsRedacted ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/30 p-3 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
          <Lock className="h-4 w-4 shrink-0" />
          <span>
            Sensitive contact, guardian, and demographic details are redacted under least-privilege access control (requires explicit <code>beneficiaries.sensitive.view</code> clearance).
          </span>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-100 dark:border-[#1d332b] bg-slate-50/60 dark:bg-[#162720]/60 p-3.5 text-xs space-y-1.5">
          <div className="text-[10px] font-bold uppercase text-slate-400">
            Authorized Restricted Contact &amp; Guardian Details
          </div>
          {beneficiary.contactPhone && <div>Phone: {beneficiary.contactPhone}</div>}
          {beneficiary.address && <div>Address: {beneficiary.address}</div>}
          {beneficiary.guardianDetails?.name && (
            <div>
              Guardian: <strong>{beneficiary.guardianDetails.name}</strong> (
              {beneficiary.guardianDetails.relation}) — Auth documented:{' '}
              {beneficiary.guardianDetails.authorizationDocumented ? 'Yes' : 'Pending'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
