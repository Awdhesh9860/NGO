'use client';

import React from 'react';
import { ReceiptRecordItem } from '../services/donation-api.service';
import { formatMinorCurrency } from '@/lib/money';
import { Printer, ShieldCheck, AlertTriangle, Ban } from 'lucide-react';

export function DonationReceiptViewer({
  receipt,
  onPrint,
}: {
  receipt: ReceiptRecordItem;
  onPrint?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 shadow-xs space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 dark:border-[#1d332b] pb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
            Official Donation Receipt
          </span>
          <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
            {receipt.organizationSnapshot.name}
          </h3>
          {receipt.organizationSnapshot.legalName && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {receipt.organizationSnapshot.legalName}
            </p>
          )}
          {receipt.organizationSnapshot.address && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {receipt.organizationSnapshot.address}
            </p>
          )}
        </div>

        <div className="text-right space-y-1">
          <div className="font-mono text-sm font-black text-slate-900 dark:text-white">
            {receipt.receiptNumber}
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
              receipt.status === 'ISSUED'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
            }`}
          >
            {receipt.status === 'CANCELLED' && <Ban className="h-3 w-3" />}
            {receipt.status}
          </span>
          {onPrint && receipt.status === 'ISSUED' && (
            <div>
              <button
                type="button"
                onClick={onPrint}
                className="mt-1 inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Printer className="h-3.5 w-3.5" /> Print / PDF
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase text-slate-400">Supporter Details</p>
          <p className="font-bold text-slate-900 dark:text-white">{receipt.donorSnapshot.name}</p>
          <p className="text-slate-600 dark:text-slate-300">{receipt.donorSnapshot.email}</p>
          {receipt.donorSnapshot.panNumber && (
            <p className="text-slate-600 dark:text-slate-300">
              PAN: <span className="font-mono font-bold">{receipt.donorSnapshot.panNumber}</span>
            </p>
          )}
        </div>

        <div className="space-y-1.5 sm:text-right">
          <p className="text-[10px] font-bold uppercase text-slate-400">Verified Contribution</p>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
            {formatMinorCurrency(receipt.amountMinor, receipt.currency)}
          </p>
          <p className="text-slate-600 dark:text-slate-300">
            Date: {new Date(receipt.donationDate).toLocaleDateString('en-IN')} • {receipt.paymentProvider}
          </p>
          <p className="font-mono text-[11px] text-slate-500">Ref: {receipt.paymentReference}</p>
          <p className="text-slate-600 dark:text-slate-300">Purpose: {receipt.purpose}</p>
        </div>
      </div>

      {receipt.taxBenefitEligible ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/50 dark:bg-emerald-950/30 p-3.5 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Verified Section 80G Tax Eligibility</p>
            <p className="mt-0.5">{receipt.taxEligibilityReason}</p>
            {receipt.verifiedStatutorySnapshot?.section80GNumber && (
              <p className="mt-1 font-mono text-[11px]">
                80G Reg: {receipt.verifiedStatutorySnapshot.section80GNumber}
                {receipt.verifiedStatutorySnapshot.section12ANumber
                  ? ` | 12A Reg: ${receipt.verifiedStatutorySnapshot.section12ANumber}`
                  : ''}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/30 p-3.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Standard Acknowledgment Receipt (No Verified 80G Claim)</p>
            <p className="mt-0.5">{receipt.taxEligibilityReason}</p>
          </div>
        </div>
      )}

      {receipt.status === 'CANCELLED' && receipt.cancelledReason && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/30 p-3 text-xs text-rose-700 dark:text-rose-300">
          <strong>Cancelled Reason:</strong> {receipt.cancelledReason}
        </div>
      )}
    </div>
  );
}
