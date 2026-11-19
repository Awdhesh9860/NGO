'use client';

import React, { useState } from 'react';
import {
  BeneficiaryDetailResponse,
  beneficiaryApiService,
} from '../services/beneficiary-api.service';
import { Briefcase, Lock } from 'lucide-react';

export function CaseManagementPanel({
  beneficiaryId,
  cases,
  caseNotes,
  canManageCases,
  onUpdated,
}: {
  beneficiaryId: string;
  cases: BeneficiaryDetailResponse['cases'];
  caseNotes: BeneficiaryDetailResponse['caseNotes'];
  canManageCases: boolean;
  onUpdated?: () => void;
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Case Support');
  const [initialNote, setInitialNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canManageCases) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/30 p-5 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
        <Lock className="h-4 w-4 shrink-0" />
        <span>
          Case management records and confidential case notes require <code>beneficiaries.case.manage</code> authorization.
        </span>
      </div>
    );
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setSubmitting(true);
      const res = await beneficiaryApiService.createCase(beneficiaryId, {
        title: title.trim(),
        category: category.trim(),
        priority: 'MEDIUM',
        isSafeguardingCase: false,
        initialNote: initialNote.trim() || undefined,
      });
      if (!res.success) {
        setError(res.error?.message || 'Unable to open case');
        return;
      }
      setTitle('');
      setInitialNote('');
      onUpdated?.();
    } catch {
      setError('Network error creating beneficiary case');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs space-y-4">
      <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
        <Briefcase className="h-4 w-4 text-emerald-600" /> Restricted Case Management
      </h3>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleCreate} className="space-y-2.5 pb-4 border-b border-slate-100 dark:border-[#1d332b]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="text"
            required
            placeholder="Case Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs"
          />
          <input
            type="text"
            required
            placeholder="Case Category *"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs"
          />
        </div>
        <textarea
          rows={2}
          placeholder="Confidential initial case note (never sent in emails or public APIs)"
          value={initialNote}
          onChange={(e) => setInitialNote(e.target.value)}
          className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-[#087F5B] px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {submitting ? 'Opening Case...' : 'Open Case'}
        </button>
      </form>

      {cases.length === 0 ? (
        <p className="text-xs text-slate-500">No support cases opened for this beneficiary.</p>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => {
            const notes = caseNotes.filter((n) => n.caseId === c._id);
            return (
              <div key={c._id} className="rounded-xl border border-slate-100 dark:border-[#1d332b] p-3.5 text-xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-slate-500 mr-1.5">{c.caseNumber}</span>
                    <span className="font-black text-slate-900 dark:text-white">{c.title}</span>
                  </div>
                  <span className="rounded-full bg-sky-100 text-sky-800 px-2 py-0.5 text-[10px] font-bold">
                    {c.status}
                  </span>
                </div>
                {notes.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-[#1d332b]">
                    {notes.map((n) => (
                      <div key={n._id} className="rounded-lg bg-slate-50 dark:bg-[#162720] p-2">
                        <p className="text-slate-700 dark:text-slate-200">{n.content}</p>
                        <span className="text-[10px] text-slate-400">
                          {n.authorName} ({n.authorRole}) • {new Date(n.createdAt).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
