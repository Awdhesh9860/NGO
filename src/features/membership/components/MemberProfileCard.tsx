'use client';

import React from 'react';
import { MemberRecordItem } from '../services/membership-api.service';
import { MembershipStatusBadge } from './MembershipStatusBadge';
import { formatMinorCurrency } from '@/lib/money';
import { Mail, Phone, Calendar, Award } from 'lucide-react';

export function MemberProfileCard({ member }: { member: MemberRecordItem }) {
  return (
    <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-black text-slate-900 dark:text-white">{member.fullName}</h3>
            <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
              {member.membershipNumber}
            </span>
            <MembershipStatusBadge status={member.status} />
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <Award className="h-3.5 w-3.5 text-emerald-600" /> {member.category} Membership
            {member.organizationName ? ` • ${member.organizationName}` : ''}
          </p>
        </div>

        <div className="text-right text-xs">
          <div className="font-black text-slate-900 dark:text-white">
            {member.feeAmountMinor > 0
              ? formatMinorCurrency(member.feeAmountMinor, member.currency)
              : 'Fee Waived / Free'}
          </div>
          <span className="text-[11px] text-slate-500">Fee Status: {member.feePaymentStatus}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-1.5 truncate">
          <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{member.email}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>{member.mobileNumber || 'Not provided'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>
            {member.isLifetime
              ? 'Lifetime (No Expiry)'
              : member.expiryDate
              ? `Expires ${new Date(member.expiryDate).toLocaleDateString('en-IN')}`
              : 'No expiry set'}
          </span>
        </div>
      </div>
    </div>
  );
}
