'use client';

import React, { useState } from 'react';
import { toMinorUnits, fromMinorUnits } from '@/lib/money';
import { CreateCampaignInput } from '../schemas/campaign.schema';

export interface CampaignFormProps {
  initialValues?: Partial<CreateCampaignInput>;
  onSubmit: (data: CreateCampaignInput) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function CampaignForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Create Campaign (Draft)',
}: CampaignFormProps) {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [slug, setSlug] = useState(initialValues?.slug || '');
  const [code, setCode] = useState(initialValues?.code || '');
  const [category, setCategory] = useState(initialValues?.category || 'Education');
  const [shortSummary, setShortSummary] = useState(initialValues?.shortSummary || '');
  const [story, setStory] = useState(initialValues?.story || '');
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR' | 'GBP'>(
    initialValues?.currency || 'INR'
  );
  const [targetMajor, setTargetMajor] = useState(
    initialValues?.targetAmountMinor
      ? String(fromMinorUnits(initialValues.targetAmountMinor, initialValues.currency || 'INR'))
      : '500000'
  );
  const [minMajor, setMinMajor] = useState(
    initialValues?.minimumDonationMinor
      ? String(fromMinorUnits(initialValues.minimumDonationMinor, initialValues.currency || 'INR'))
      : '100'
  );
  const [startDate, setStartDate] = useState(
    initialValues?.startDate ? String(initialValues.startDate).slice(0, 10) : ''
  );
  const [endDate, setEndDate] = useState(
    initialValues?.endDate ? String(initialValues.endDate).slice(0, 10) : ''
  );
  const [coverImage, setCoverImage] = useState(initialValues?.coverImage || '');
  const [isFeatured, setIsFeatured] = useState(Boolean(initialValues?.isFeatured));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!initialValues?.slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 80)
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const targetAmountMinor = toMinorUnits(Number(targetMajor), currency);
      const minimumDonationMinor = toMinorUnits(Number(minMajor), currency);
      if (targetAmountMinor < 100) {
        setError('Target amount must be greater than zero');
        return;
      }
      setSubmitting(true);
      await onSubmit({
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        code: code.trim().toUpperCase(),
        category,
        shortSummary: shortSummary.trim(),
        story: story.trim() || undefined,
        currency,
        targetAmountMinor,
        minimumDonationMinor,
        suggestedAmountsMinor: [
          toMinorUnits(500, currency),
          toMinorUnits(1500, currency),
          toMinorUnits(3000, currency),
          toMinorUnits(5000, currency),
        ],
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        coverImage: coverImage.trim() || undefined,
        gallery: [],
        teamMemberIds: [],
        isFeatured,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save campaign');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
            Campaign Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Winter Education Kit Drive 2026"
            className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
              Campaign Code *
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="CMP-EDU-01"
              className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
              URL Slug *
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              placeholder="winter-education-kit-2026"
              className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
            Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
          >
            {['Education', 'Healthcare', 'Clean Water', 'Emergency Relief', 'Nutrition', 'Women Empowerment', 'Environment'].map(
              (c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
            Currency
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as 'INR' | 'USD' | 'EUR' | 'GBP')}
            className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
            Target Goal ({currency}) *
          </label>
          <input
            type="number"
            min="1"
            step="1"
            required
            value={targetMajor}
            onChange={(e) => setTargetMajor(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
            Min Donation ({currency})
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={minMajor}
            onChange={(e) => setMinMajor(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
          Short Summary *
        </label>
        <textarea
          rows={2}
          required
          value={shortSummary}
          onChange={(e) => setShortSummary(e.target.value)}
          placeholder="Concise mission statement shown on campaign listings..."
          className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
          Detailed Story & Impact Plan
        </label>
        <textarea
          rows={4}
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="Explain beneficiaries, transparent fund allocation, and expected outcomes..."
          className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
            Cover Image URL
          </label>
          <input
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
        <input
          type="checkbox"
          checked={isFeatured}
          onChange={(e) => setIsFeatured(e.target.checked)}
          className="rounded border-slate-300"
        />
        <span>Mark as featured campaign (shown prioritized after approval & publishing)</span>
      </label>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-[#087F5B] px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
        >
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
