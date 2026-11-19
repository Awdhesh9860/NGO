'use client';

import React from 'react';
import { CampaignUpdateItem } from '../services/campaign-api.service';
import { Calendar, Globe, Lock } from 'lucide-react';

export function CampaignUpdatesTimeline({
  updates,
  showVisibilityBadge = false,
}: {
  updates: CampaignUpdateItem[];
  showVisibilityBadge?: boolean;
}) {
  if (!updates || updates.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 dark:border-[#1d332b] p-6 text-center text-xs text-slate-500 dark:text-slate-400">
        No field updates have been posted for this campaign yet.
      </div>
    );
  }

  return (
    <ol className="relative border-l-2 border-emerald-200 dark:border-emerald-900/60 ml-3 space-y-5">
      {updates.map((update, idx) => (
        <li key={update._id || update.id || idx} className="ml-5">
          <span className="absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 ring-4 ring-white dark:ring-[#12221b]" />
          <div className="rounded-xl border border-slate-100 dark:border-[#1d332b] bg-slate-50/70 dark:bg-[#162720]/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{update.title}</h4>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                {showVisibilityBadge && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white dark:bg-[#12221b] px-2 py-0.5 text-[10px] font-semibold">
                    {update.isPublicVisible ? (
                      <>
                        <Globe className="h-3 w-3 text-emerald-600" /> Public
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3" /> Internal
                      </>
                    )}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(update.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {update.content}
            </p>
            {update.authorName && (
              <p className="mt-2 text-[11px] font-semibold text-slate-400">
                Posted by {update.authorName}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
