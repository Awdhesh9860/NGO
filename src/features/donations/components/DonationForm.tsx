'use client';

import React, { useState } from 'react';
import { GatewayConfigStatus, PaymentGatewayName } from '@/integrations/payment/payment.adapter';
import { DonationAmountSelector } from './DonationAmountSelector';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { donationApiService } from '../services/donation-api.service';
import { formatMinorCurrency } from '@/lib/money';
import { ShieldCheck, Info } from 'lucide-react';

export interface DonationFormProps {
  campaignId?: string;
  campaignTitle?: string;
  presetsMinor?: number[];
  minimumMinor?: number;
  currency?: 'INR' | 'USD' | 'EUR' | 'GBP';
  providers?: GatewayConfigStatus[];
  onOrderCreated?: (result: {
    donationId: string;
    donationCode: string;
    status: string;
    paymentProvider: PaymentGatewayName;
    amountMinor: number;
    currency: string;
    checkoutUrl?: string;
    paymentInstructions?: Record<string, string>;
  }) => void;
}

export function DonationForm({
  campaignId,
  campaignTitle,
  presetsMinor = [50000, 150000, 300000, 500000],
  minimumMinor = 10000,
  currency = 'INR',
  providers,
  onOrderCreated,
}: DonationFormProps) {
  const [amountMinor, setAmountMinor] = useState(presetsMinor[1] || 150000);
  const [provider, setProvider] = useState<PaymentGatewayName>('UPI');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isManual = provider === 'UPI' || provider === 'BANK_TRANSFER';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (amountMinor < minimumMinor) {
      setError(`Minimum donation is ${formatMinorCurrency(minimumMinor, currency)}`);
      return;
    }

    try {
      setSubmitting(true);
      const idempotencyKey = `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const res = await donationApiService.createPaymentOrder({
        idempotencyKey,
        amountMinor,
        currency,
        paymentProvider: provider,
        donationType: 'ONE_TIME',
        campaignId,
        purpose: campaignTitle || 'General Charitable Fund',
        isAnonymous,
        paymentReference: paymentReference.trim() || undefined,
        donor: {
          name: donorName.trim(),
          email: donorEmail.trim(),
          phone: donorPhone.trim() || undefined,
          panNumber: panNumber.trim().toUpperCase() || undefined,
        },
      });

      if (!res.success || !res.data) {
        setError(res.error?.message || 'Unable to initiate donation order');
        return;
      }

      onOrderCreated?.({
        donationId: res.data.donation.id,
        donationCode: res.data.donation.donationCode,
        status: res.data.donation.status,
        paymentProvider: provider,
        amountMinor: res.data.donation.amountMinor,
        currency: res.data.donation.currency,
        checkoutUrl: res.data.paymentOrder.checkoutUrl,
        paymentInstructions: res.data.paymentOrder.paymentInstructions,
      });
    } catch {
      setError('Network error while connecting to donation service');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}

      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          1. Choose Amount
        </h3>
        <DonationAmountSelector
          presetsMinor={presetsMinor}
          valueMinor={amountMinor}
          currency={currency}
          minimumMinor={minimumMinor}
          onChangeMinor={setAmountMinor}
        />
      </div>

      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          2. Select Payment Method
        </h3>
        <PaymentMethodSelector selected={provider} onSelect={setProvider} providers={providers} />
      </div>

      {isManual && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/30 p-3.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Manual Verification Disclosure ({provider})</p>
            <p className="mt-0.5 leading-relaxed">
              Submitting a UPI or Bank Transfer records your pledge as <strong>PENDING</strong>. Your donation is marked verified and an official receipt is issued only after our finance team confirms settlement.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
          3. Supporter Details
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            type="text"
            required
            placeholder="Full Name *"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
          />
          <input
            type="email"
            required
            placeholder="Email Address (for receipt) *"
            value={donorEmail}
            onChange={(e) => setDonorEmail(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
          />
          <input
            type="tel"
            placeholder="Phone Number (Optional)"
            value={donorPhone}
            onChange={(e) => setDonorPhone(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
          />
          <input
            type="text"
            placeholder="PAN (Optional, e.g. ABCDE1234F)"
            value={panNumber}
            onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
            className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
          />
        </div>

        {isManual && (
          <input
            type="text"
            placeholder="UTR / UPI Transaction Reference (Optional if paying now)"
            value={paymentReference}
            onChange={(e) => setPaymentReference(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
          />
        )}

        <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="rounded border-slate-300"
          />
          <span>Display my name as &quot;Anonymous Supporter&quot; on public campaign supporter lists</span>
        </label>
      </div>

      <div className="rounded-xl bg-slate-50 dark:bg-[#162720] border border-slate-200 dark:border-[#1d332b] p-3 text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-2">
        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Transparency &amp; Tax Eligibility:</strong> Official donation receipts are issued strictly after verified settlement. Section 80G tax-deduction eligibility is printed on receipts only when the organization holds active, verified Section 80G approval valid for the donation date.
        </p>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-[#087F5B] px-5 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
      >
        {submitting
          ? 'Processing...'
          : `${isManual ? 'Submit' : 'Proceed to Pay'} ${formatMinorCurrency(amountMinor, currency)}`}
      </button>
    </form>
  );
}
