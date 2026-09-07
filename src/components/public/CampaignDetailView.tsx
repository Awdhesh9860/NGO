import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Heart,
  ArrowLeft,
  Users,
  Calendar,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  MessageSquareQuote
} from 'lucide-react';

interface CampaignDetailViewProps {
  campaignId: string;
  onBack: () => void;
  onOpenDonate: (campaignId?: string) => void;
}

export const CampaignDetailView: React.FC<CampaignDetailViewProps> = ({
  campaignId,
  onBack,
  onOpenDonate
}) => {
  const { campaigns, donations } = useDatabase();
  const [copied, setCopied] = useState(false);

  const campaign = campaigns.find((c) => c.id === campaignId) || campaigns[0];
  const campaignDonations = donations.filter((d) => d.campaignId === campaign?.id);

  if (!campaign) {
    return (
      <div className="mx-auto max-w-4xl p-12 text-center">
        <p className="text-slate-500">Campaign not found.</p>
        <button onClick={onBack} className="mt-4 text-emerald-600 font-bold">
          ← Return to Campaigns
        </button>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 space-y-10">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back to All Campaigns
      </button>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Story Column */}
        <div className="lg:col-span-8 space-y-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                {campaign.category}
              </span>
              {campaign.isUrgent && (
                <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                  Urgent Priority Appeal
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
              {campaign.title}
            </h1>

            <div className="overflow-hidden rounded-3xl shadow-xl">
              <img
                src={campaign.image}
                alt={campaign.title}
                className="h-96 w-full object-cover"
              />
            </div>
          </div>

          {/* Campaign Narrative */}
          <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
            <h3 className="text-lg font-bold text-slate-900">Why This Initiative Matters Now</h3>
            <p>{campaign.description}</p>
            <p>
              By contributing today, you ensure essential relief packages, emergency water purification units, or academic scholarships reach families without administrative delay. HopeHorizon maintains zero unallocated overhead on designated emergency appeals.
            </p>
          </div>

          {/* Verified Field Updates Feed */}
          {campaign.updates && campaign.updates.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-bold text-slate-900">
                  Live Dispatch from Ground Zero ({campaign.updates.length})
                </h3>
              </div>

              <div className="space-y-6">
                {campaign.updates.map((up) => (
                  <div key={up.id} className="border-l-2 border-emerald-500 pl-4 space-y-2">
                    <span className="text-[11px] font-mono text-slate-400 font-semibold">{up.date}</span>
                    <h4 className="text-sm font-bold text-slate-900">{up.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{up.content}</p>
                    {up.image && (
                      <img
                        src={up.image}
                        alt={up.title}
                        className="mt-2 h-44 w-full max-w-md rounded-2xl object-cover shadow-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Public Supporter Wall */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Recent Generous Contributors</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {campaignDonations.length > 0 ? (
                campaignDonations.map((d) => (
                  <div key={d.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{d.donorName}</p>
                      <span className="text-[11px] text-slate-400">
                        {new Date(d.createdAt).toLocaleDateString('en-US')}
                      </span>
                    </div>
                    <span className="font-black text-emerald-700">
                      ${d.amount.toLocaleString('en-US')}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">Be the first to back this verified campaign!</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Sticky Donation Box */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-emerald-700 text-2xl">${campaign.raisedAmount.toLocaleString('en-US')}</span>
                <span className="text-slate-500 self-end">Goal: ${campaign.targetAmount.toLocaleString('en-US')}</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  style={{
                    width: `${Math.min(100, (campaign.raisedAmount / campaign.targetAmount) * 100)}%`
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>{campaign.donorCount.toLocaleString('en-US')} Donors</span>
                <span>{((campaign.raisedAmount / campaign.targetAmount) * 100).toFixed(0)}% Funded</span>
              </div>
            </div>

            <button
              onClick={() => onOpenDonate(campaign.id)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-sm font-bold text-white shadow-xl shadow-emerald-600/30 hover:bg-emerald-700 transition"
            >
              <Heart className="h-4 w-4 fill-white" />
              Give Now to This Appeal
            </button>

            <button
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-slate-300 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <Share2 className="h-3.5 w-3.5" />
              {copied ? 'Campaign Link Copied!' : 'Share Appeal with Friends'}
            </button>

            <div className="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-100 text-xs space-y-2">
              <span className="flex items-center gap-1.5 font-bold text-emerald-950">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                100% Tax-Exemption & Receipts
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Eligible under 80G (India) and 501(c)(3) (USA). Instant digital receipts generated with statutory authorization.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
