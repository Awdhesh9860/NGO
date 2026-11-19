'use client';

import React, { useState } from 'react';
import { membershipApiService, MembershipPlanItem } from '../services/membership-api.service';
import { formatMinorCurrency } from '@/lib/money';
import { Award, Info } from 'lucide-react';

export function MembershipApplicationForm({
  plans,
  selectedPlanId,
  onSelectPlan,
  onSuccess,
}: {
  plans: MembershipPlanItem[];
  selectedPlanId: string;
  onSelectPlan: (id: string) => void;
  onSuccess?: (result: { applicationCode: string; fullName: string }) => void;
}) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [occupation, setOccupation] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [reasonForJoining, setReasonForJoining] = useState('');
  const [relevantExperience, setRelevantExperience] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPlan = plans.find((p) => p._id === selectedPlanId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedPlanId) {
      setError('Please select a membership plan');
      return;
    }
    if (!consentAccepted) {
      setError('Please accept the membership declaration and governance bylaws');
      return;
    }

    try {
      setSubmitting(true);
      const res = await membershipApiService.submitApplication({
        planId: selectedPlanId,
        fullName: fullName.trim(),
        email: email.trim(),
        mobileNumber: mobileNumber.trim(),
        address: address.trim() || undefined,
        occupation: occupation.trim() || undefined,
        organizationName: organizationName.trim() || undefined,
        reasonForJoining: reasonForJoining.trim(),
        relevantExperience: relevantExperience.trim() || undefined,
        supportingDocumentUrls: [],
        consentAccepted: true,
        consentVersion: '1.0',
      });

      if (!res.success || !res.data) {
        setError(res.error?.message || 'Unable to submit membership application');
        return;
      }

      onSuccess?.({
        applicationCode: res.data.applicationCode,
        fullName: fullName.trim(),
      });
    } catch {
      setError('Network error submitting membership application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700">
          {error}
        </div>
      )}

      {plans.length > 0 && (
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
            Selected Membership Category *
          </label>
          <select
            value={selectedPlanId}
            onChange={(e) => onSelectPlan(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
          >
            {plans.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.category}) —{' '}
                {p.feeAmountMinor > 0 ? formatMinorCurrency(p.feeAmountMinor, p.currency) : 'Free'}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          type="text"
          required
          placeholder="Full Legal Name *"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
        />
        <input
          type="email"
          required
          placeholder="Email Address *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
        />
        <input
          type="tel"
          required
          placeholder="Mobile Number *"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
        />
        <input
          type="text"
          placeholder="Occupation (Optional)"
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
        />
      </div>

      {selectedPlan?.category === 'INSTITUTIONAL' && (
        <input
          type="text"
          placeholder="Institution / Organization Name"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
        />
      )}

      <input
        type="text"
        placeholder="Mailing Address (Optional)"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
      />

      <textarea
        rows={3}
        required
        minLength={10}
        placeholder="Reason for joining the NGO membership assembly *"
        value={reasonForJoining}
        onChange={(e) => setReasonForJoining(e.target.value)}
        className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
      />

      <textarea
        rows={2}
        placeholder="Relevant social sector / governance experience (Optional)"
        value={relevantExperience}
        onChange={(e) => setRelevantExperience(e.target.value)}
        className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
      />

      <div className="rounded-xl border border-sky-200 bg-sky-50/70 dark:border-sky-900/50 dark:bg-sky-950/30 p-3 text-[11px] text-sky-900 dark:text-sky-200 flex items-start gap-2">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <span>
          <strong>Governance Notice:</strong> Membership applications are reviewed and approved by authorized NGO administrators. Membership fees are distinct from charitable donations and are not treated as 80G tax-exempt donations.
        </span>
      </div>

      <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          checked={consentAccepted}
          onChange={(e) => setConsentAccepted(e.target.checked)}
          className="mt-0.5 rounded border-slate-300"
        />
        <span>
          I declare that the information submitted is accurate and agree to abide by the organization&apos;s membership bylaws.
        </span>
      </label>

      <button
        type="submit"
        disabled={submitting || plans.length === 0}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#087F5B] py-3.5 text-xs font-black text-white hover:bg-emerald-700 disabled:opacity-50 transition"
      >
        <Award className="h-4 w-4" />
        <span>{submitting ? 'Submitting Application...' : 'Submit Membership Application'}</span>
      </button>
    </form>
  );
}
