'use client';

import React, { useEffect, useState } from 'react';
import {
  campaignApiService,
  PublicCampaignDetailResponse,
  CampaignProgress,
  CampaignUpdatesTimeline,
} from '@/features/campaigns';
import { formatMinorCurrency } from '@/lib/money';
import { Heart, ArrowLeft, Share2, ShieldCheck } from 'lucide-react';

interface CampaignDetailViewProps {
  campaignId: string;
  onBack: () => void;
  onOpenDonate: (campaignId?: string) => void;
}

export const CampaignDetailView: React.FC<CampaignDetailViewProps> = ({
  campaignId,
  onBack,
  onOpenDonate,
}) => {
  const [detail, setDetail] = useState<PublicCampaignDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    campaignApiService
      .getPublicBySlug(campaignId)
      .then((res) => {
        if (!active) return;
        if (res.success && res.data) setDetail(res.data);
        else setDetail(null);
      })
      .catch(() => {
        if (active) setDetail(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [campaignId]);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="h-96 rounded-3xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="mx-auto max-w-4xl p-12 text-center space-y-4">
        <h1 className="text-xl font-black text-slate-900">Campaign Not Available</h1>
        <p className="text-xs text-slate-500">
          This fundraising campaign may be unpublished, archived, or awaiting governance approval.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Return to Campaigns
        </button>
      </div>
    );
  }

  const { campaign, updates, recentSupporters } = detail;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 space-y-10">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back to All Campaigns
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Story Column */}
        <div className="lg:col-span-8 space-y-8">
          <div className="space-y-4">
            <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              {campaign.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
              {campaign.title}
            </h1>
            {campaign.coverImage && (
              <div className="overflow-hidden rounded-3xl shadow-xl">
                <img
                  src={campaign.coverImage}
                  alt={campaign.title}
                  className="h-96 w-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
            <h2 className="text-lg font-bold text-slate-900">Campaign Overview</h2>
            <p>{campaign.shortSummary}</p>
            {campaign.story && <p className="whitespace-pre-line">{campaign.story}</p>}
          </div>

          {/* Public Updates */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Verified Field Updates ({updates.length})
            </h3>
            <CampaignUpdatesTimeline updates={updates} />
          </div>

          {/* Anonymous-Safe Supporter Wall */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Recent Verified Supporters</h3>
            {recentSupporters.length === 0 ? (
              <p className="text-xs text-slate-400">
                No verified contributions recorded yet. Be the first to support this campaign.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recentSupporters.map((s, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-3 flex justify-between items-center text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{s.displayName}</p>
                      <span className="text-[11px] text-slate-400">
                        {new Date(s.donatedAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <span className="font-black text-emerald-700">
                      {formatMinorCurrency(s.amountMinor, s.currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Sidebar */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl space-y-6">
            <CampaignProgress
              raisedAmountMinor={campaign.raisedAmountMinor}
              targetAmountMinor={campaign.targetAmountMinor}
              currency={campaign.currency}
              donorCount={campaign.donorCount}
            />

            <button
              type="button"
              onClick={() => onOpenDonate(campaign.id)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-sm font-bold text-white shadow-xl shadow-emerald-600/30 hover:bg-emerald-700 transition"
            >
              <Heart className="h-4 w-4 fill-white" />
              Donate to This Campaign
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-slate-300 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <Share2 className="h-3.5 w-3.5" />
              {copied ? 'Campaign Link Copied!' : 'Share Campaign'}
            </button>

            <div className="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-100 text-xs space-y-1.5">
              <span className="flex items-center gap-1.5 font-bold text-emerald-950">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Verified Receipts &amp; Statutory Honesty
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Receipts are issued strictly after verified settlement. Section 80G tax-benefit details appear on receipts only when our statutory registration is verified and active for the donation date.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
