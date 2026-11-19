'use client';

import React from 'react';
import { MembershipPlanItem } from '../services/membership-api.service';
import { formatMinorCurrency } from '@/lib/money';
import { CheckCircle2, Award } from 'lucide-react';

export function MembershipPlanCard({
  plan,
  selected = false,
  onSelect,
}: {
  plan: MembershipPlanItem;
  selected?: boolean;
  onSelect?: (plan: MembershipPlanItem) => void;
}) {
  return (
    <div
      onClick={() => onSelect?.(plan)}
      className={`rounded-2xl border-2 p-5 transition ${
        onSelect ? 'cursor-pointer' : ''
      } ${
        selected
          ? 'border-[#087F5B] bg-emerald-50/50 dark:bg-emerald-950/30 shadow-sm'
          : 'border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] hover:border-emerald-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
            <Award className="h-3 w-3" /> {plan.category}
          </span>
          <h3 className="mt-1.5 text-base font-black text-slate-900 dark:text-white">{plan.name}</h3>
          <p className="text-[11px] font-mono text-slate-400">{plan.code}</p>
        </div>

        <div className="text-right">
          <div className="text-lg font-black text-slate-900 dark:text-white">
            {plan.feeAmountMinor > 0 ? formatMinorCurrency(plan.feeAmountMinor, plan.currency) : 'Free'}
          </div>
          <span className="text-[10px] text-slate-500">
            {plan.isLifetime ? 'Lifetime validity' : `${plan.validityDays} days`}
          </span>
        </div>
      </div>

      <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        {plan.description}
      </p>

      {plan.benefits.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
          {plan.benefits.map((b, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#1d332b] flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
        <span>{plan.votingRights ? 'Includes AGM Voting Rights' : 'Advisory / Supporting Tier'}</span>
        <span>Fee distinct from charitable donations</span>
      </div>
    </div>
  );
}
