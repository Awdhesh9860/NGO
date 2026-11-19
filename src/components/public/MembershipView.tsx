'use client';

import React, { useEffect, useState } from 'react';
import {
  membershipApiService,
  MembershipPlanItem,
} from '@/features/membership/services/membership-api.service';
import { MembershipPlanCard } from '@/features/membership/components/MembershipPlanCard';
import { MembershipApplicationForm } from '@/features/membership/components/MembershipApplicationForm';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

interface MembershipViewProps {
  onOpenDonate?: (campaignId?: string) => void;
}

export const MembershipView: React.FC<MembershipViewProps> = ({ onOpenDonate }) => {
  const [plans, setPlans] = useState<MembershipPlanItem[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittedInfo, setSubmittedInfo] = useState<{
    applicationCode: string;
    fullName: string;
  } | null>(null);

  useEffect(() => {
    let active = true;
    membershipApiService
      .listPlans(true)
      .then((res) => {
        if (!active) return;
        if (res.success && Array.isArray(res.data)) {
          setPlans(res.data);
          if (res.data.length > 0) setSelectedPlanId(res.data[0]._id);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 space-y-12">
      {/* Header Banner */}
      <div className="rounded-3xl bg-slate-900 p-8 sm:p-14 text-white shadow-xl text-center space-y-4">
        <span className="inline-block rounded-full bg-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-300 uppercase tracking-wider">
          NGO Membership &amp; Governance
        </span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
          Apply for Official NGO Membership
        </h1>
        <p className="mx-auto max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
          Membership plans, fees, and validity periods are configured transparently by our organization. Every application undergoes formal administrative review before membership activation.
        </p>
      </div>

      {/* Configurable Plans Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900">Available Membership Categories</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-52 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center space-y-3">
            <h3 className="text-base font-black text-slate-900">
              No Public Membership Plans Configured Yet
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Organization administrators configure active membership tiers and fees in the Admin Console. You may still support our charitable programs directly.
            </p>
            {onOpenDonate && (
              <button
                type="button"
                onClick={() => onOpenDonate()}
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white"
              >
                Make a Charitable Donation
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((p) => (
              <MembershipPlanCard
                key={p._id}
                plan={p}
                selected={selectedPlanId === p._id}
                onSelect={(plan) => setSelectedPlanId(plan._id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Application Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-md">
          {submittedInfo ? (
            <div className="text-center py-10 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                Membership Application Submitted
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-slate-900">{submittedInfo.fullName}</strong>. Application reference{' '}
                <span className="font-mono font-bold text-emerald-700">
                  {submittedInfo.applicationCode}
                </span>{' '}
                is now awaiting governance review. Once approved and any applicable membership fee is confirmed, your unique membership number will be issued.
              </p>
              <button
                type="button"
                onClick={() => setSubmittedInfo(null)}
                className="mt-4 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white"
              >
                Submit Another Application
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900">Membership Application Form</h3>
                <p className="text-xs text-slate-500">
                  Select a configured membership category above and submit your details for approval.
                </p>
              </div>
              <MembershipApplicationForm
                plans={plans}
                selectedPlanId={selectedPlanId}
                onSelectPlan={setSelectedPlanId}
                onSuccess={(res) => setSubmittedInfo(res)}
              />
            </div>
          )}
        </div>

        <div className="lg:col-span-5 rounded-3xl border border-emerald-100 bg-emerald-50/60 p-6 space-y-3 text-xs text-slate-700">
          <div className="flex items-center gap-2 font-black text-emerald-950 text-sm">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            Membership Governance &amp; Fee Transparency
          </div>
          <p className="leading-relaxed">
            <strong>Distinct From Donations:</strong> Membership fees fund organizational governance and member participation and are strictly separated from charitable donations. Tax-exemption receipts (such as 80G) are never issued automatically for membership fees.
          </p>
          <p className="leading-relaxed">
            <strong>Renewal &amp; Grace Period:</strong> Annual and supporting memberships track explicit expiry dates, renewal windows, and configurable grace periods with full renewal history.
          </p>
        </div>
      </div>
    </div>
  );
};
