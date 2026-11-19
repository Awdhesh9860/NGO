'use client';

import React from 'react';
import { VolunteerCertificateItem } from '../services/volunteer-api.service';
import { Award, Printer, ShieldCheck } from 'lucide-react';

export function VolunteerCertificateViewer({
  certificate,
  onPrint,
}: {
  certificate: VolunteerCertificateItem;
  onPrint?: () => void;
}) {
  const recipient = certificate.volunteerNameSnapshot || certificate.recipientName || 'Volunteer';
  const orgName = certificate.organizationNameSnapshot || certificate.organizationName || 'HopeHorizon Foundation';

  return (
    <div className="rounded-2xl border-2 border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-[#12221b] p-6 shadow-sm space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 dark:border-[#1d332b] pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-100 dark:bg-emerald-950/60 p-2.5 text-emerald-700 dark:text-emerald-400">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              {certificate.certificateType} Certificate • {orgName}
            </span>
            <h4 className="text-base font-black text-slate-900 dark:text-white">
              {certificate.title}
            </h4>
          </div>
        </div>

        <div className="text-right space-y-1">
          <div className="font-mono text-xs font-black text-slate-900 dark:text-white">
            {certificate.certificateNumber}
          </div>
          <div className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400">
            Code: {certificate.verificationCode}
          </div>
          {onPrint && certificate.status === 'ISSUED' && (
            <button
              type="button"
              onClick={onPrint}
              className="mt-1 inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[11px] font-bold"
            >
              <Printer className="h-3.5 w-3.5" /> Print / PDF
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-slate-400 block text-[10px] font-bold uppercase">Awarded To</span>
          <span className="text-sm font-black text-slate-900 dark:text-white">{recipient}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] font-bold uppercase">Verified Service Hours</span>
          <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
            {certificate.verifiedHours} verified hours
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] font-bold uppercase">Service Period</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {new Date(certificate.participationStartDate).toLocaleDateString('en-IN')} —{' '}
            {new Date(certificate.participationEndDate).toLocaleDateString('en-IN')}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] font-bold uppercase">Authorized Signatory</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {certificate.signatoryName} ({certificate.signatoryRole})
          </span>
        </div>
      </div>

      <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 p-3 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
        <span>
          Hours derived exclusively from approved attendance records. Publicly verifiable at{' '}
          <code>/verify-certificate</code> without exposing volunteer contact details.
        </span>
      </div>
    </div>
  );
}
