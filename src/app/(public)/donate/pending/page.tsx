'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatMinorCurrency } from '@/lib/money';
import { Clock, ShieldAlert } from 'lucide-react';

function DonationPendingContent() {
  const sp = useSearchParams();
  const code = sp.get('code') || 'PENDING';
  const amountMinor = Number(sp.get('amountMinor') || '0');
  const currency = sp.get('currency') || 'INR';
  const method = sp.get('method') || 'UPI';
  const ref = sp.get('ref');

  return (
    <div className="min-h-[70vh] bg-slate-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full rounded-3xl border border-amber-200 bg-white p-8 sm:p-10 shadow-lg text-center space-y-5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <Clock className="h-9 w-9" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Donation Pending Verification</h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          Your contribution record has been logged as <strong>PENDING</strong>. For manual UPI and Bank Transfers—or awaiting asynchronous gateway webhooks—an official receipt is issued only after finance or gateway settlement is verified.
        </p>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left text-xs space-y-2 font-mono">
          <div className="flex justify-between">
            <span className="text-slate-500">Donation Code:</span>
            <span className="font-bold text-slate-900">{code}</span>
          </div>
          {amountMinor > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-500">Submitted Amount:</span>
              <span className="font-bold text-slate-900">
                {formatMinorCurrency(amountMinor, currency)}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">Payment Method:</span>
            <span className="font-bold text-slate-900">{method}</span>
          </div>
          {ref && (
            <div className="flex justify-between">
              <span className="text-slate-500">Transfer Reference:</span>
              <span className="font-bold text-emerald-700">{ref}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">Current Status:</span>
            <span className="font-bold text-amber-700">PENDING VERIFICATION</span>
          </div>
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-900 flex items-start gap-2 text-left">
          <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Please include your donation code <strong>{code}</strong> in your UPI / Bank Transfer remarks. You will receive an email confirmation and official receipt once verified.
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/campaigns"
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
          >
            Return to Campaigns
          </Link>
          <Link
            href="/contact"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Questions? Contact Finance
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DonatePendingPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs text-slate-500">Loading status...</div>}>
      <DonationPendingContent />
    </Suspense>
  );
}
