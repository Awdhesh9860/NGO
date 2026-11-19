'use client';

import React, { useState } from 'react';
import { VolunteerApplicationForm } from '@/features/volunteers/components/VolunteerApplicationForm';
import { CheckCircle2, Award, ShieldCheck, Globe } from 'lucide-react';

export const VolunteerView: React.FC = () => {
  const [submittedInfo, setSubmittedInfo] = useState<{
    applicationCode: string;
    fullName: string;
  } | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 space-y-12">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 p-8 sm:p-14 text-white shadow-xl">
        <span className="inline-block rounded-full bg-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-200 uppercase tracking-wider">
          Volunteer Engagement &amp; Onboarding
        </span>
        <h1 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight">
          Lend Your Skills, Strengthen Communities
        </h1>
        <p className="mt-3 text-sm sm:text-base text-emerald-100 max-w-2xl leading-relaxed">
          Apply to join our structured volunteer program across education, healthcare outreach, clean water, and community resilience. All applications undergo coordinator review and safeguarding verification prior to restricted field placements.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-md">
          {submittedInfo ? (
            <div className="text-center py-10 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Application Submitted for Review</h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-slate-900">{submittedInfo.fullName}</strong>. Your application reference is{' '}
                <span className="font-mono font-bold text-emerald-700">{submittedInfo.applicationCode}</span>. Our Volunteer Coordination Team will review your profile and notify you of interview or onboarding steps.
              </p>
              <button
                type="button"
                onClick={() => setSubmittedInfo(null)}
                className="mt-4 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
              >
                Submit Another Application
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900">Volunteer Registration Application</h2>
                <p className="text-xs text-slate-500">
                  Validated server-side with duplicate active application protection and explicit consent.
                </p>
              </div>
              <VolunteerApplicationForm onSuccess={(res) => setSubmittedInfo(res)} />
            </div>
          )}
        </div>

        {/* Right: Program Standards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-slate-900">Transparent Volunteer Standards</h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800 shrink-0">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Verified Service Certificates</h4>
                  <p className="mt-0.5">
                    Service certificates reflect only supervisor-approved volunteer attendance hours and are publicly verifiable via unique code without exposing private contact details.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Safeguarding &amp; Verification</h4>
                  <p className="mt-0.5">
                    Restricted field assignments require verified volunteer status and adherence to our child &amp; vulnerable person safeguarding policy.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-800 shrink-0">
                  <Globe className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Privacy-Respecting Attendance</h4>
                  <p className="mt-0.5">
                    We track session check-ins and approved hours without continuous GPS tracking or location surveillance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
