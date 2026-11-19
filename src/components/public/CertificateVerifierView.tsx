'use client';

import React, { useState } from 'react';
import {
  volunteerApiService,
  VolunteerCertificateItem,
} from '@/features/volunteers/services/volunteer-api.service';
import { VolunteerCertificateViewer } from '@/features/volunteers/components/VolunteerCertificateViewer';
import { Award, Search, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

export const CertificateVerifierView: React.FC = () => {
  const [certInput, setCertInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [matchedCert, setMatchedCert] = useState<VolunteerCertificateItem | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = certInput.trim().toUpperCase();
    if (!query) return;

    try {
      setSearching(true);
      setSearched(false);
      const res = await volunteerApiService.verifyCertificatePublic(query);
      if (res.success && res.data) setMatchedCert(res.data);
      else setMatchedCert(null);
    } catch {
      setMatchedCert(null);
    } finally {
      setSearching(false);
      setSearched(true);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 space-y-10">
      <div className="rounded-3xl bg-gradient-to-r from-amber-700 to-amber-900 p-8 sm:p-12 text-white shadow-xl text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-md">
          <Award className="h-8 w-8 text-amber-200" />
        </div>
        <span className="inline-block rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold text-amber-200 uppercase tracking-wider">
          Public Certificate Verification Ledger
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
          Verify Official Volunteer Certificates
        </h1>
        <p className="mx-auto max-w-xl text-xs sm:text-sm text-amber-100 leading-relaxed">
          Authenticate volunteer participation and experience certificates directly from our server registry without exposing private volunteer contact data.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md">
        <form onSubmit={handleVerify} className="space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Enter Certificate Number or Verification Code
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. VCERT-2026-XXXXXX or VRF-XXXXXXXXXX"
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 py-3 pl-10 pr-4 text-sm font-mono text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="flex items-center justify-center gap-2 rounded-2xl bg-amber-700 px-7 py-3 text-xs font-bold text-white shadow-md hover:bg-amber-800 disabled:opacity-50 transition shrink-0"
            >
              <ShieldCheck className="h-4 w-4" />
              {searching ? 'Verifying...' : 'Verify Certificate'}
            </button>
          </div>
        </form>
      </div>

      {searched && (
        <div className="space-y-4">
          {matchedCert ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 flex items-center gap-3 text-emerald-900 text-xs">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-black text-sm">Certificate Authenticated ({matchedCert.status})</div>
                  <div>Verified against official server records. Private contact details remain hidden.</div>
                </div>
              </div>
              <VolunteerCertificateViewer certificate={matchedCert} onPrint={() => window.print()} />
            </div>
          ) : (
            <div className="rounded-3xl border-2 border-rose-200 bg-rose-50/50 p-6 sm:p-8 text-center space-y-2">
              <XCircle className="mx-auto h-10 w-10 text-rose-500" />
              <h3 className="text-lg font-bold text-rose-950">Certificate Not Found</h3>
              <p className="text-xs text-rose-700 max-w-md mx-auto">
                No verified certificate matches &quot;{certInput}&quot;. Verify the code or contact the issuing organization.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
