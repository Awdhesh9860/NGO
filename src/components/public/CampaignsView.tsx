'use client';

import React, { useEffect, useState } from 'react';
import { campaignApiService, CampaignItem, CampaignProgress } from '@/features/campaigns';
import { Heart, Search, ArrowRight, ShieldCheck } from 'lucide-react';

interface CampaignsViewProps {
  onOpenDonate: (campaignId?: string) => void;
  onNavigate: (view: string, id?: string) => void;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({ onOpenDonate, onNavigate }) => {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    let active = true;
    campaignApiService
      .listPublic({
        search: search || undefined,
        category: category || undefined,
      })
      .then((res) => {
        if (!active) return;
        if (res.success && Array.isArray(res.data)) {
          setCampaigns(res.data);
        } else {
          setCampaigns([]);
        }
      })
      .catch(() => {
        if (active) setCampaigns([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [search, category]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 space-y-10">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-900 to-teal-900 p-8 sm:p-12 text-white shadow-xl">
        <span className="inline-block rounded-full bg-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-200 uppercase tracking-wider">
          Approved Fundraising Campaigns
        </span>
        <h1 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight">
          Transparent Community Appeals
        </h1>
        <p className="mt-3 text-sm sm:text-base text-emerald-100 max-w-2xl leading-relaxed">
          Every public campaign shown here has completed internal governance review. Progress counters reflect verified net contributions only.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search approved campaigns..."
            className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700"
        >
          <option value="">All Categories</option>
          {['Education', 'Healthcare', 'Clean Water', 'Emergency Relief', 'Nutrition', 'Women Empowerment', 'Environment'].map(
            (c) => (
              <option key={c} value={c}>
                {c}
              </option>
            )
          )}
        </select>
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
          <h2 className="text-lg font-black text-slate-900">No Active Public Campaigns Yet</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Public campaigns appear automatically once created, approved by leadership, and published by our team. You can still support our general charitable fund.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('donate')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
          >
            <Heart className="h-3.5 w-3.5" /> Contribute to General Fund
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs hover:shadow-xl transition flex flex-col justify-between"
            >
              <div>
                <div className="relative h-52 overflow-hidden bg-emerald-950/10">
                  {camp.coverImage ? (
                    <img
                      src={camp.coverImage}
                      alt={camp.title}
                      className="h-full w-full object-cover transition duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-emerald-800 to-teal-700 flex items-center justify-center p-6 text-center text-white font-black text-lg">
                      {camp.title}
                    </div>
                  )}
                  <span className="absolute top-3 right-3 rounded-full bg-slate-900/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                    {camp.category}
                  </span>
                </div>

                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{camp.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {camp.shortSummary}
                  </p>
                  <CampaignProgress
                    raisedAmountMinor={camp.raisedAmountMinor}
                    targetAmountMinor={camp.targetAmountMinor}
                    currency={camp.currency}
                    donorCount={camp.donorCount}
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 p-4 bg-slate-50/70 flex gap-2">
                <button
                  type="button"
                  onClick={() => onOpenDonate(camp.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
                >
                  <Heart className="h-3.5 w-3.5 fill-white" />
                  Donate Now
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('campaign-detail', camp.slug)}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  <span>Details</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Honest Transparency Footer */}
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 flex items-start gap-3 text-xs text-slate-700">
        <ShieldCheck className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Financial Verification &amp; Tax Disclosure:</strong> Online donations are verified cryptographically through the payment gateway; UPI and Bank Transfers are marked verified only after finance confirms bank settlement. Official receipts include Section 80G tax-exemption details only when the organization holds verified, currently valid Section 80G registration.
        </p>
      </div>
    </div>
  );
};
