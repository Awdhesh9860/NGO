'use client';

import React from 'react';
import { formatMinorCurrency } from '@/lib/money';
import { DonationStatusBadge } from '@/features/donations/components/DonationStatusBadge';

export interface DonorDonationRow {
  _id: string;
  donationCode: string;
  amountMinor: number;
  refundedAmountMinor: number;
  currency: string;
  status: string;
  paymentProvider: string;
  purpose: string;
  receiptStatus: string;
  createdAt: string;
}

export function DonorDonationHistory({
  donations,
  onSelectDonation,
}: {
  donations: DonorDonationRow[];
  onSelectDonation?: (id: string) => void;
}) {
  if (!donations || donations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 dark:border-[#1d332b] p-8 text-center text-xs text-slate-500 dark:text-slate-400">
        No donations recorded for this donor yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b]">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 dark:bg-[#162720] text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
          <tr>
            <th className="px-4 py-3">Donation Code</th>
            <th className="px-4 py-3">Purpose</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Method</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Receipt</th>
            <th className="px-4 py-3">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-[#1d332b]">
          {donations.map((d) => (
            <tr
              key={d._id}
              onClick={() => onSelectDonation?.(d._id)}
              className={onSelectDonation ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-[#172b22]' : ''}
            >
              <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                {d.donationCode}
              </td>
              <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{d.purpose}</td>
              <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                {formatMinorCurrency(d.amountMinor, d.currency)}
                {d.refundedAmountMinor > 0 && (
                  <span className="ml-1.5 text-[10px] font-semibold text-rose-600">
                    (-{formatMinorCurrency(d.refundedAmountMinor, d.currency)})
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{d.paymentProvider}</td>
              <td className="px-4 py-3">
                <DonationStatusBadge status={d.status} />
              </td>
              <td className="px-4 py-3 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                {d.receiptStatus}
              </td>
              <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                {new Date(d.createdAt).toLocaleDateString('en-IN')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
