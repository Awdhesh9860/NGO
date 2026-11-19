'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  donationApiService,
  DonationForm,
} from '@/features/donations';
import { campaignApiService, CampaignItem } from '@/features/campaigns';
import { GatewayConfigStatus } from '@/integrations/payment/payment.adapter';
import { Donation } from '../../types';
import {
  Heart,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  PieChart,
  Sparkles,
} from 'lucide-react';

interface DonateViewProps {
  onNavigate: (view: string, id?: string) => void;
  onDonationSuccess?: (donation: Donation) => void;
}

export const DonateView: React.FC<DonateViewProps> = ({ onNavigate }) => {
  const router = useRouter();
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [providers, setProviders] = useState<GatewayConfigStatus[]>([]);

  useEffect(() => {
    campaignApiService
      .listPublic()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) setCampaigns(res.data);
      })
      .catch(() => {});

    donationApiService
      .getPublicProviderStatuses()
      .then((res) => {
        if (res.success && res.data?.providers) setProviders(res.data.providers);
      })
      .catch(() => {});
  }, []);

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1 text-xs font-bold text-emerald-300">
            <Heart className="h-3.5 w-3.5 fill-emerald-400 text-emerald-400" />
            Verified &amp; Auditable Charitable Giving
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Give Hope. Change Lives.
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Every contribution is tracked in an immutable financial ledger. Online payments require gateway verification, and manual UPI/Bank transfers are verified by our finance team before receipts are issued.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Verified Donation Checkout (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900">Make a Contribution</h2>
                <p className="text-xs text-slate-500">
                  Idempotent order creation prevents accidental duplicate charges.
                </p>
              </div>
              <div className="flex gap-1 text-xs font-bold">
                {(['INR', 'USD'] as const).map((cur) => (
                  <button
                    key={cur}
                    type="button"
                    onClick={() => setCurrency(cur)}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      currency === cur ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {cur === 'INR' ? 'INR (₹)' : 'USD ($)'}
                  </button>
                ))}
              </div>
            </div>

            {campaigns.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Designate to an Approved Campaign (Optional)
                </label>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-800"
                >
                  <option value="">General Charitable Fund (Where Needed Most)</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.category})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <DonationForm
              campaignId={selectedCampaign?.id}
              campaignTitle={selectedCampaign?.title}
              currency={currency}
              presetsMinor={
                currency === 'INR'
                  ? [50000, 100000, 250000, 500000]
                  : [2500, 5000, 10000, 25000]
              }
              minimumMinor={currency === 'INR' ? 10000 : 500}
              providers={providers}
              onOrderCreated={(res) => {
                if (res.checkoutUrl) {
                  window.location.href = res.checkoutUrl;
                  return;
                }
                const query = new URLSearchParams({
                  code: res.donationCode,
                  amountMinor: String(res.amountMinor),
                  currency: res.currency,
                  method: res.paymentProvider,
                  status: res.status,
                });
                if (res.paymentInstructions?.referenceCode) {
                  query.set('ref', res.paymentInstructions.referenceCode);
                }
                if (res.paymentProvider === 'UPI' || res.paymentProvider === 'BANK_TRANSFER' || res.status === 'PENDING') {
                  router.push(`/donate/pending?${query.toString()}`);
                } else {
                  router.push(`/donate/pending?${query.toString()}`);
                }
              }}
            />
          </div>

          {/* Right: Transparency, Refund Policy & Privacy Disclosures (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                Why Your Support Matters
              </h3>
              <div className="space-y-2 pt-1 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Supports community education kits, clean water filters, and healthcare outreach.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Anonymous giving option protects your display identity on public supporter lists.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Full audit trail from payment verification to official receipt numbering.</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PieChart className="h-4 w-4 text-emerald-600" />
                Governance, Privacy &amp; Refund Policy
              </h3>
              <ul className="space-y-2 text-xs text-slate-600 leading-relaxed list-disc pl-4">
                <li>
                  <strong>Tax Receipt Eligibility:</strong> Official receipts are issued only after verified settlement. Section 80G tax-deduction claims are printed only when verified statutory approval is active for the donation date.
                </li>
                <li>
                  <strong>Refunds &amp; Disputes:</strong> Duplicate or erroneous donations can be requested for partial or full refund review by our finance officer with a two-stage approval audit.
                </li>
                <li>
                  <strong>Donor Privacy:</strong> Email, phone, PAN, and address are restricted to authorized personnel and never exposed on public endpoints.
                </li>
              </ul>
            </div>

            <div className="bg-emerald-50/60 rounded-3xl border border-emerald-100 p-5 space-y-2">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Financial Transparency
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                Explore our published governance disclosures, statutory registration details, and annual reports.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('transparency')}
                className="font-bold text-xs text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
              >
                Review Financial Transparency <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
