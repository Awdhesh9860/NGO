'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, RotateCcw } from 'lucide-react';

function DonationFailedContent() {
  const sp = useSearchParams();
  const reason = sp.get('reason');
  const cancelled = sp.get('cancelled') === 'true';

  return (
    <div className="min-h-[70vh] bg-slate-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full rounded-3xl border border-rose-200 bg-white p-8 sm:p-10 shadow-lg text-center space-y-5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-700">
          <XCircle className="h-9 w-9" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          {cancelled ? 'Donation Checkout Cancelled' : 'Donation Payment Could Not Be Verified'}
        </h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          {reason ||
            'Your transaction was cancelled or declined by the payment provider. No donation has been recorded as completed, and no receipt was issued.'}
        </p>
        <p className="text-[11px] text-slate-500">
          If your bank statement shows a temporary hold, it is typically auto-reversed within 5–7 business days.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/donate"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Try Donating Again
          </Link>
          <Link
            href="/contact"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Contact Donor Support
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DonateFailedPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs text-slate-500">Loading status...</div>}>
      <DonationFailedContent />
    </Suspense>
  );
}
