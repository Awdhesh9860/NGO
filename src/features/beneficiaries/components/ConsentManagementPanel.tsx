'use client';

import React, { useState } from 'react';
import {
  BeneficiaryDetailResponse,
  beneficiaryApiService,
} from '../services/beneficiary-api.service';
import { ShieldCheck, XCircle } from 'lucide-react';

const PURPOSES = [
  'PROGRAM_PARTICIPATION',
  'DATA_PROCESSING',
  'COMMUNICATION',
  'PHOTOGRAPHY_MEDIA',
  'PUBLIC_STORYTELLING',
  'RESEARCH_EVALUATION',
] as const;

export function ConsentManagementPanel({
  beneficiaryId,
  consents,
  canManageConsent = false,
  onUpdated,
}: {
  beneficiaryId: string;
  consents: BeneficiaryDetailResponse['consents'];
  canManageConsent?: boolean;
  onUpdated?: () => void;
}) {
  const [purpose, setPurpose] = useState<(typeof PURPOSES)[number]>('COMMUNICATION');
  const [grantedByGuardian, setGrantedByGuardian] = useState(false);
  const [guardianName, setGuardianName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await beneficiaryApiService.manageConsent(beneficiaryId, {
      action: 'GRANT',
      purpose,
      consentVersion: '1.0',
      grantedByGuardian,
      guardianName: guardianName.trim() || undefined,
    });
    if (!res.success) setError(res.error?.message || 'Unable to record consent');
    else onUpdated?.();
  };

  const handleWithdraw = async (consentId: string) => {
    setError(null);
    const reason = window.prompt('Optional reason for consent withdrawal:') || 'Withdrawn on request';
    const res = await beneficiaryApiService.manageConsent(beneficiaryId, {
      action: 'WITHDRAW',
      consentId,
      withdrawalReason: reason,
      consentVersion: '1.0',
      grantedByGuardian: false,
    });
    if (!res.success) setError(res.error?.message || 'Unable to withdraw consent');
    else onUpdated?.();
  };

  return (
    <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs space-y-4">
      <div>
        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" /> Purpose-Specific Consent Registry
        </h3>
        <p className="text-[11px] text-slate-500">
          Photography &amp; storytelling consents are strictly separate from essential assistance. Withdrawing optional consent never cancels essential support.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      {canManageConsent && (
        <form onSubmit={handleGrant} className="space-y-2.5 pb-4 border-b border-slate-100 dark:border-[#1d332b]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value as typeof purpose)}
              className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs"
            >
              {PURPOSES.map((p) => (
                <option key={p} value={p}>
                  {p.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Guardian Name (required for minor media consent)"
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={grantedByGuardian}
                onChange={(e) => setGrantedByGuardian(e.target.checked)}
              />
              Granted by documented parent / legal guardian
            </label>
            <button
              type="submit"
              className="rounded-xl bg-[#087F5B] px-3.5 py-1.5 text-xs font-bold text-white"
            >
              Record Consent
            </button>
          </div>
        </form>
      )}

      {consents.length === 0 ? (
        <p className="text-xs text-slate-500">No consent records logged yet.</p>
      ) : (
        <div className="space-y-2">
          {consents.map((c) => (
            <div
              key={c._id}
              className="rounded-xl border border-slate-100 dark:border-[#1d332b] p-3 text-xs flex flex-wrap items-center justify-between gap-2"
            >
              <div>
                <div className="font-bold text-slate-900 dark:text-white">
                  {c.purpose.replace(/_/g, ' ')} (v{c.consentVersion})
                </div>
                <div className="text-[11px] text-slate-500">
                  Granted {new Date(c.grantedAt).toLocaleDateString('en-IN')}
                  {c.grantedByGuardian && c.guardianName ? ` • Guardian: ${c.guardianName}` : ''}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    c.status === 'GRANTED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {c.status}
                </span>
                {canManageConsent && c.status === 'GRANTED' && (
                  <button
                    type="button"
                    onClick={() => handleWithdraw(c._id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-300 px-2 py-1 text-[10px] font-bold text-rose-700"
                  >
                    <XCircle className="h-3 w-3" /> Withdraw
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
