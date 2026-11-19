'use client';

import React from 'react';
import { VendorItem } from '../services/finance-api.service';
import { Building2, ShieldCheck } from 'lucide-react';

interface VendorProfileCardProps {
  vendor: VendorItem;
  onSelect?: (vendor: VendorItem) => void;
  isSelected?: boolean;
}

export function VendorProfileCard({ vendor, onSelect, isSelected }: VendorProfileCardProps) {
  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        isSelected
          ? 'border-[#087F5B] bg-emerald-50/40 dark:bg-emerald-950/20'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b]'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[#087F5B] shrink-0" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{vendor.name}</h4>
          </div>
          <p className="mt-0.5 text-[11px] font-mono text-slate-500">
            {vendor.vendorCode} • {vendor.vendorType}
          </p>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
            vendor.status === 'ACTIVE'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {vendor.status}
        </span>
      </div>

      <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-300">
        {vendor.contactPerson && <p>Contact: {vendor.contactPerson}</p>}
        {vendor.email && <p className="truncate">Email: {vendor.email}</p>}
        {vendor.taxIdentifier && <p className="font-mono text-[11px]">Tax ID: {vendor.taxIdentifier}</p>}
        {vendor.bankSummary ? (
          <div className="mt-2 rounded-xl bg-slate-50 dark:bg-[#0d1a14] p-2 text-[11px] flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-[#087F5B] shrink-0" />
            <span className="font-mono">
              {vendor.bankSummary.bankName || 'Bank'}: {vendor.bankSummary.accountNumberMasked}
              {vendor.bankSummary.ifscCode ? ` (${vendor.bankSummary.ifscCode})` : ''}
            </span>
          </div>
        ) : vendor.hasBankDetailsOnFile ? (
          <p className="text-[11px] text-amber-700 dark:text-amber-400">
            Bank payout details encrypted on file (restricted view).
          </p>
        ) : null}
      </div>

      {onSelect && (
        <button
          type="button"
          onClick={() => onSelect(vendor)}
          className="mt-3 w-full rounded-xl border border-slate-200 dark:border-slate-700 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          {isSelected ? 'Viewing Vendor Bills' : 'View Bills & Balance'}
        </button>
      )}
    </div>
  );
}
