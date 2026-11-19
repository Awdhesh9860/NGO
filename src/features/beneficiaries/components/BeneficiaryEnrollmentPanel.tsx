'use client';

import React, { useState } from 'react';
import {
  BeneficiaryDetailResponse,
  beneficiaryApiService,
} from '../services/beneficiary-api.service';
import { DEFAULT_ASSISTANCE_CATEGORIES } from '../schemas/beneficiary.schema';
import { FolderKanban } from 'lucide-react';

export function BeneficiaryEnrollmentPanel({
  beneficiaryId,
  enrollments,
  canEnroll = false,
  onEnrolled,
}: {
  beneficiaryId: string;
  enrollments: BeneficiaryDetailResponse['enrollments'];
  canEnroll?: boolean;
  onEnrolled?: () => void;
}) {
  const [projectId, setProjectId] = useState('');
  const [category, setCategory] = useState<string>(DEFAULT_ASSISTANCE_CATEGORIES[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setSubmitting(true);
      const res = await beneficiaryApiService.enroll(beneficiaryId, {
        projectId: projectId.trim(),
        assistanceCategory: category,
      });
      if (!res.success) {
        setError(res.error?.message || 'Enrollment failed');
        return;
      }
      setProjectId('');
      onEnrolled?.();
    } catch {
      setError('Network error enrolling beneficiary');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs space-y-4">
      <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
        <FolderKanban className="h-4 w-4 text-emerald-600" /> Project Enrollments
      </h3>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      {canEnroll && (
        <form onSubmit={handleEnroll} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pb-4 border-b border-slate-100 dark:border-[#1d332b]">
          <input
            type="text"
            required
            placeholder="Project ID (ObjectId) *"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
          >
            {DEFAULT_ASSISTANCE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-[#087F5B] px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? 'Enrolling...' : 'Enroll in Project'}
          </button>
        </form>
      )}

      {enrollments.length === 0 ? (
        <p className="text-xs text-slate-500">Not enrolled in any field projects yet.</p>
      ) : (
        <div className="space-y-2">
          {enrollments.map((en) => {
            const proj =
              typeof en.projectId === 'object' && en.projectId
                ? `${en.projectId.name} (${en.projectId.code})`
                : String(en.projectId || 'Project');
            return (
              <div
                key={en._id}
                className="rounded-xl border border-slate-100 dark:border-[#1d332b] p-3 text-xs flex items-center justify-between gap-2"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{proj}</div>
                  <div className="text-[11px] text-slate-500">{en.assistanceCategory}</div>
                </div>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                  {en.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
