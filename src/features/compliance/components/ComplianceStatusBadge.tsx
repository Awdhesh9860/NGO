'use client';

import React from 'react';
import { ComplianceRecordItem } from '../services/compliance-api.service';

const STATUS_STYLE: Record<ComplianceRecordItem['validityStatus'], string> = {
  DRAFT: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  DOCUMENT_RECORDED: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
  INDEPENDENTLY_VERIFIED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  EXPIRING_SOON: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  EXPIRED: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
  NOT_APPLICABLE: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
};

const LABEL_MAP: Record<ComplianceRecordItem['validityStatus'], string> = {
  DRAFT: 'Draft',
  DOCUMENT_RECORDED: 'Recorded (Unverified)',
  INDEPENDENTLY_VERIFIED: 'Independently Verified',
  EXPIRING_SOON: 'Expiring Soon',
  EXPIRED: 'Expired',
  NOT_APPLICABLE: 'Not Applicable',
};

export function ComplianceStatusBadge({
  status,
}: {
  status: ComplianceRecordItem['validityStatus'];
}) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${STATUS_STYLE[status] || STATUS_STYLE.DRAFT}`}>
      {LABEL_MAP[status] || status}
    </span>
  );
}
