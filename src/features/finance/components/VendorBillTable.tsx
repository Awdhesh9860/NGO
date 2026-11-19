'use client';

import React from 'react';
import { VendorBillItem } from '../services/finance-api.service';
import { formatMinorCurrency, subtractMinorUnits } from '@/lib/money';

export function VendorBillTable({ bills }: { bills: VendorBillItem[] }) {
  if (bills.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] p-5 text-center text-xs text-slate-500">
        No bills recorded for this vendor yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] overflow-x-auto">
      <table className="w-full min-w-[600px] text-left text-xs">
        <thead className="bg-slate-50 dark:bg-[#0d1a14] text-slate-500 uppercase text-[11px]">
          <tr>
            <th className="px-4 py-3">Bill #</th>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3">Due Date</th>
            <th className="px-4 py-3 text-right">Total</th>
            <th className="px-4 py-3 text-right">Balance Due</th>
            <th className="px-4 py-3">Payment Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {bills.map((bill) => {
            const dueMinor = Math.max(0, subtractMinorUnits(bill.totalAmountMinor, bill.paidAmountMinor));
            return (
              <tr key={bill._id}>
                <td className="px-4 py-3 font-mono font-bold text-[#087F5B] dark:text-emerald-400">
                  {bill.billNumber}
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-200 max-w-xs truncate">
                  {bill.description}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Date(bill.dueDate).toLocaleDateString('en-IN')}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {formatMinorCurrency(bill.totalAmountMinor, bill.currency)}
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                  {formatMinorCurrency(dueMinor, bill.currency)}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold">
                    {bill.paymentStatus}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
