'use client';

import React, { useState } from 'react';
import {
  DEFAULT_ASSISTANCE_CATEGORIES,
  CreateBeneficiaryInput,
} from '../schemas/beneficiary.schema';
import { ShieldAlert } from 'lucide-react';

export function BeneficiaryRegistrationForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: CreateBeneficiaryInput) => Promise<void>;
  onCancel?: () => void;
}) {
  const [fullName, setFullName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [ageOrRange, setAgeOrRange] = useState('');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [state, setState] = useState('');
  const [assistanceCategory, setAssistanceCategory] = useState<string>(DEFAULT_ASSISTANCE_CATEGORIES[0]);
  const [registrationSource, setRegistrationSource] = useState<'FIELD_STAFF' | 'PROJECT_REFERRAL' | 'COMMUNITY_INTAKE'>('FIELD_STAFF');
  const [isMinorOrVulnerable, setIsMinorOrVulnerable] = useState(false);
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianAuthorized, setGuardianAuthorized] = useState(false);
  const [initialConsentGranted, setInitialConsentGranted] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isMinorOrVulnerable && (!guardianName.trim() || !guardianRelation.trim())) {
      setError('Guardian name and relation are mandatory for child or safeguarded registrations.');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        fullName: fullName.trim(),
        contactPhone: contactPhone.trim() || undefined,
        ageOrRange: ageOrRange.trim() || undefined,
        district: district.trim(),
        village: village.trim() || undefined,
        state: state.trim() || undefined,
        assistanceCategory,
        registrationSource,
        isMinorOrVulnerable,
        requiresSafeguarding: isMinorOrVulnerable,
        guardianDetails: isMinorOrVulnerable
          ? {
              name: guardianName.trim(),
              relation: guardianRelation.trim(),
              contactPhone: guardianPhone.trim() || undefined,
              authorizationDocumented: guardianAuthorized,
            }
          : undefined,
        initialConsentGranted,
        consentVersion: '1.0',
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to register beneficiary');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-amber-200 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/30 p-3 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
        <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
        <span>
          <strong>Data Minimization Policy:</strong> Collect only fields necessary for service eligibility. Do not enter Aadhaar numbers, bank credentials, or clinical medical records here.
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          type="text"
          required
          placeholder="Beneficiary Full Name *"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
        />
        <input
          type="text"
          placeholder="Age or Age Range (e.g. 10-12 or 34)"
          value={ageOrRange}
          onChange={(e) => setAgeOrRange(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
        />
        <input
          type="tel"
          placeholder="Contact Phone (Optional)"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
        />
        <select
          value={assistanceCategory}
          onChange={(e) => setAssistanceCategory(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
        >
          {DEFAULT_ASSISTANCE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input
          type="text"
          required
          placeholder="District *"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
        />
        <input
          type="text"
          placeholder="Village / Ward"
          value={village}
          onChange={(e) => setVillage(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
        />
        <input
          type="text"
          placeholder="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
        />
      </div>

      <select
        value={registrationSource}
        onChange={(e) => setRegistrationSource(e.target.value as typeof registrationSource)}
        className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
      >
        <option value="FIELD_STAFF">Registered by Field Staff</option>
        <option value="PROJECT_REFERRAL">Project / Partner Referral</option>
        <option value="COMMUNITY_INTAKE">Community Intake Desk</option>
      </select>

      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
        <input
          type="checkbox"
          checked={isMinorOrVulnerable}
          onChange={(e) => setIsMinorOrVulnerable(e.target.checked)}
        />
        <span>Child or Vulnerable Person Requiring Safeguarding Protection</span>
      </label>

      {isMinorOrVulnerable && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 p-4 space-y-3">
          <div className="text-xs font-black text-rose-800 dark:text-rose-300">
            Lawful Guardian Details (Restricted Access)
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <input
              type="text"
              required
              placeholder="Guardian Name *"
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
              className="rounded-xl border border-rose-200 bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs"
            />
            <input
              type="text"
              required
              placeholder="Relation (e.g. Mother) *"
              value={guardianRelation}
              onChange={(e) => setGuardianRelation(e.target.value)}
              className="rounded-xl border border-rose-200 bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs"
            />
            <input
              type="tel"
              placeholder="Guardian Phone"
              value={guardianPhone}
              onChange={(e) => setGuardianPhone(e.target.value)}
              className="rounded-xl border border-rose-200 bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-rose-900 dark:text-rose-200">
            <input
              type="checkbox"
              checked={guardianAuthorized}
              onChange={(e) => setGuardianAuthorized(e.target.checked)}
            />
            <span>Guardian authorization verified and documented</span>
          </label>
        </div>
      )}

      <label className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
        <input
          type="checkbox"
          checked={initialConsentGranted}
          onChange={(e) => setInitialConsentGranted(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          Record separate <strong>Program Participation</strong> &amp; <strong>Data Processing</strong> consents (photography &amp; public storytelling consents are never bundled here).
        </span>
      </label>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-[#087F5B] px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {submitting ? 'Registering...' : 'Register Beneficiary'}
        </button>
      </div>
    </form>
  );
}
