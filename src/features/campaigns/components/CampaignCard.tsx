'use client';

import React from 'react';
import { CampaignItem } from '../services/campaign-api.service';
import { CampaignStatusBadge } from './CampaignStatusBadge';
import { CampaignProgress } from './CampaignProgress';
import { Calendar, Globe, Lock, ArrowRight } from 'lucide-react';

export interface CampaignCardProps {
  campaign: CampaignItem;
  onSelect?: (campaign: CampaignItem) => void;
  showAdminBadges?: boolean;
  ctaLabel?: string;
}

export function CampaignCard({
  campaign,
  onSelect,
  showAdminBadges = false,
  ctaLabel = 'View Campaign',
}: CampaignCardProps) {
  return (
    <article className="flex flex-col justify-between rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs hover:border-emerald-400 dark:hover:border-emerald-700 transition">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
            {campaign.category}
          </span>
          <div className="flex items-center gap-1.5">
            {showAdminBadges && (
              <span
                title={campaign.isPublicVisible ? 'Publicly visible' : 'Internal only'}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300"
              >
                {campaign.isPublicVisible ? <Globe className="h-3 w-3 text-emerald-600" /> : <Lock className="h-3 w-3" />}
                {campaign.isPublicVisible ? 'Public' : 'Private'}
              </span>
            )}
            <CampaignStatusBadge status={campaign.status} />
          </div>
        </div>

        <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug line-clamp-2">
          {campaign.title}
        </h3>
        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
          {campaign.shortSummary}
        </p>

        <div className="mt-4">
          <CampaignProgress
            raisedAmountMinor={campaign.raisedAmountMinor}
            targetAmountMinor={campaign.targetAmountMinor}
            currency={campaign.currency}
            donorCount={campaign.donorCount}
          />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1d332b] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            {campaign.endDate
              ? `Ends ${new Date(campaign.endDate).toLocaleDateString('en-IN')}`
              : 'Ongoing'}
          </span>
        </div>

        {onSelect && (
          <button
            type="button"
            onClick={() => onSelect(campaign)}
            className="inline-flex items-center gap-1 rounded-lg bg-[#087F5B] px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
          >
            <span>{ctaLabel}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </article>
  );
}
