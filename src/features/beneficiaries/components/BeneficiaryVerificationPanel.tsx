'use client';

import React, { useState } from 'react';
import {
  BeneficiaryDetailResponse,
  beneficiaryApiService,
} from '../services/beneficiary-api.service';
import { CheckCircle2 } from 'lucide-react';

export function BeneficiaryVerificationPanel({
  beneficiaryId,
  verifications,
  canVerify = false,
  onVerified,
}: {
  beneficiaryId: string;
  verifications: BeneficiaryDetailResponse['verifications'];
  canVerify?: boolean;
  onVerified?: () => void;
}) {
  const [criterion, setCriterion] = useState('Residency & program need verified via field visit');
  const [criterionMet, setCriterionMet] = useState(true);
  const [decision, setDecision] = useState<'VERIFIED' | 'REJECTED' | 'REASSESSMENT_REQUIRED'>('VERIFIED');
  const [decisionReason, setDecisionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setSubmitting(true);
      const res = await beneficiaryApiService.verify(beneficiaryId, {
        checklist: [{ criterion: criterion.trim(), met: criterionMet }],
        supportingDocumentRefsReviewed: [],
        decision,
        decisionReason: decisionReason.trim(),
      });
      if (!res.success) {
        setError(res.error?.message || 'Verification submission failed');
        return;
      }
      setDecisionReason('');
      onVerified?.();
    } catch {
      setError('Network error submitting verification review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs space-y-4">
      <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Human Eligibility Verification
      </h3>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      {canVerify && (
        <form onSubmit={handleSubmit} className="space-y-3 border-b border-slate-100 dark:border-[#1d332b] pb-4">
          <input
            type="text"
            required
            value={criterion}
            onChange={(e) => setCriterion(e.target.value)}
            placeholder="Eligibility criterion evaluated *"
            className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
          />
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={criterionMet}
                onChange={(e) => setCriterionMet(e.target.checked)}
              />
              Criterion Met
            </label>
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value as typeof decision)}
              className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-1.5 text-xs"
            >
              <option value="VERIFIED">Verify &amp; Approve Eligibility</option>
              <option value="REASSESSMENT_REQUIRED">Require Reassessment</option>
              <option value="REJECTED">Reject Eligibility</option>
            </select>
          </div>
          <textarea
            rows={2}
            required
            minLength={5}
            placeholder="Documented rationale for human eligibility decision *"
            value={decisionReason}
            onChange={(e) => setDecisionReason(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-[#087F5B] px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? 'Recording Decision...' : 'Submit Human Review'}
          </button>
        </form>
      )}

      {verifications.length === 0 ? (
        <p className="text-xs text-slate-500">No verification assessments recorded yet.</p>
      ) : (
        <div className="space-y-2">
          {verifications.map((v) => (
            <div key={v.id} className="rounded-xl border border-slate-100 dark:border-[#1d332b] p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="font-black text-slate-900 dark:text-white">{v.decision}</span>
                <span className="text-[10px] text-slate-400">
                  {new Date(v.reviewedAt).toLocaleDateString('en-IN')}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">{v.decisionReason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
