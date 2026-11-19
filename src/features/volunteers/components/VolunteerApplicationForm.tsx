'use client';

import React, { useState } from 'react';
import { volunteerApiService } from '../services/volunteer-api.service';
import { Send, ShieldCheck } from 'lucide-react';

export interface VolunteerApplicationFormProps {
  onSuccess?: (result: { applicationCode: string; fullName: string }) => void;
}

export function VolunteerApplicationForm({ onSuccess }: VolunteerApplicationFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [education, setEducation] = useState('');
  const [occupation, setOccupation] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [interestsText, setInterestsText] = useState('');
  const [languagesText, setLanguagesText] = useState('English, Hindi');
  const [availability, setAvailability] = useState('Weekends (4-8 hrs/week)');
  const [preferredWorkingHours, setPreferredWorkingHours] = useState('Mornings');
  const [previousExperience, setPreviousExperience] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!consentAccepted) {
      setError('Please accept the volunteer consent and safeguarding declaration to proceed.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await volunteerApiService.submitApplication({
        fullName: fullName.trim(),
        email: email.trim(),
        mobileNumber: mobileNumber.trim(),
        city: city.trim() || undefined,
        district: district.trim() || undefined,
        state: state.trim() || undefined,
        country: 'India',
        education: education.trim() || undefined,
        occupation: occupation.trim() || undefined,
        skills: skillsText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        areasOfInterest: interestsText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        preferredActivities: [],
        availability,
        preferredWorkingDays: [],
        preferredWorkingHours: preferredWorkingHours.trim() || undefined,
        languagesKnown: languagesText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        previousExperience: previousExperience.trim() || undefined,
        documentUrls: [],
        consentAccepted: true,
        consentVersion: '1.0',
      });

      if (!res.success || !res.data) {
        setError(res.error?.message || 'Unable to submit volunteer application');
        return;
      }

      onSuccess?.({
        applicationCode: res.data.applicationCode,
        fullName: fullName.trim(),
      });
    } catch {
      setError('Network error submitting volunteer application');
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          type="text"
          required
          placeholder="Full Name *"
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
        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
        >
          <option value="Weekends (4-8 hrs/week)">Weekends (4-8 hrs/week)</option>
          <option value="Weekdays (Part-time)">Weekdays (Part-time)</option>
          <option value="Full-time Field Deployment">Full-time Field Deployment</option>
          <option value="Remote / Virtual Support">Remote / Virtual Support</option>
          <option value="Emergency On-Call">Emergency On-Call</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
        />
        <input
          type="text"
          placeholder="District"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
        />
        <input
          type="text"
          placeholder="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          type="text"
          placeholder="Education (Optional)"
          value={education}
          onChange={(e) => setEducation(e.target.value)}
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

      <input
        type="text"
        placeholder="Skills (comma-separated, e.g. Teaching, First Aid, Community Outreach)"
        value={skillsText}
        onChange={(e) => setSkillsText(e.target.value)}
        className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          type="text"
          placeholder="Areas of Interest (e.g. Education, Clean Water)"
          value={interestsText}
          onChange={(e) => setInterestsText(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
        />
        <input
          type="text"
          placeholder="Languages Known (e.g. English, Hindi)"
          value={languagesText}
          onChange={(e) => setLanguagesText(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
        />
      </div>

      <input
        type="text"
        placeholder="Preferred Working Hours (e.g. 9 AM - 1 PM)"
        value={preferredWorkingHours}
        onChange={(e) => setPreferredWorkingHours(e.target.value)}
        className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
      />

      <textarea
        rows={3}
        placeholder="Previous volunteering experience and motivation (Optional)"
        value={previousExperience}
        onChange={(e) => setPreviousExperience(e.target.value)}
        className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
      />

      <label className="flex items-start gap-2.5 rounded-xl bg-slate-50 dark:bg-[#162720] border border-slate-200 dark:border-[#1d332b] p-3 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          checked={consentAccepted}
          onChange={(e) => setConsentAccepted(e.target.checked)}
          className="mt-0.5 rounded border-slate-300"
        />
        <span>
          <strong>Consent &amp; Declaration:</strong> I confirm the information provided is accurate and consent to review by the NGO volunteer team. I understand applications require coordinator review and restricted field placements require verification.
        </span>
      </label>

      <div className="flex items-center gap-2 text-[11px] text-slate-500">
        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
        <span>We practice data minimization and never collect Aadhaar or unnecessary sensitive IDs on registration.</span>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#087F5B] py-3.5 text-xs font-black text-white hover:bg-emerald-700 disabled:opacity-50 transition"
      >
        <Send className="h-4 w-4" />
        <span>{submitting ? 'Submitting Application...' : 'Submit Volunteer Application'}</span>
      </button>
    </form>
  );
}
