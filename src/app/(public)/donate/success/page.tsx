'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatMinorCurrency } from '@/lib/money';
import { CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

function DonationSuccessContent() {
  const sp = useSearchParams();
  const code = sp.get('code') || sp.get('session_id') || 'VERIFIED';
  const amountMinor = Number(sp.get('amountMinor') || '0');
  const currency = sp.get('currency') || 'INR';
  const receiptNumber = sp.get('receiptNumber');

  return (
    <div className="min-h-[70vh] bg-slate-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full rounded-3xl border border-emerald-200 bg-white p-8 sm:p-10 shadow-lg text-center space-y-5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Donation Verified &amp; Confirmed</h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          Thank you for your generous support. Your payment has been verified and recorded in our auditable ledger.
        </p>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left text-xs space-y-2 font-mono">
          <div className="flex justify-between">
            <span className="text-slate-500">Reference:</span>
            <span className="font-bold text-slate-900">{code}</span>
          </div>
          {amountMinor > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-500">Verified Amount:</span>
              <span className="font-bold text-emerald-700">
                {formatMinorCurrency(amountMinor, currency)}
              </span>
            </div>
          )}
          {receiptNumber && (
            <div className="flex justify-between">
              <span className="text-slate-500">Receipt Number:</span>
              <span className="font-bold text-slate-900">{receiptNumber}</span>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-emerald-50/70 border border-emerald-100 p-3 text-[11px] text-emerald-900 flex items-start gap-2 text-left">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            An official digital receipt is emailed to your registered address. Tax-exemption notices appear strictly when organization statutory approvals are verified and active.
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/campaigns"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Browse Campaigns
          </Link>
          <Link
            href="/transparency"
            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
          >
            <span>Financial Transparency</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DonateSuccessPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs text-slate-500">Loading confirmation...</div>}>
      <DonationSuccessContent />
    </Suspense>
  );
}
