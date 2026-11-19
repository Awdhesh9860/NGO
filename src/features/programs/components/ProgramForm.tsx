'use client';

import React, { useState } from 'react';
import { CreateProgramInput, PROGRAM_CATEGORIES } from '../schemas/program.schema';

export interface ProgramFormProps {
  managers: Array<{ id: string; name: string; role: string }>;
  departments: Array<{ id: string; name: string }>;
  initialValues?: Partial<CreateProgramInput>;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (data: CreateProgramInput) => Promise<void> | void;
  onCancel?: () => void;
}

function toSlug(val: string) {
  return val
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function ProgramForm({
  managers,
  departments,
  initialValues,
  submitting = false,
  submitLabel = 'Create Program',
  onSubmit,
  onCancel,
}: ProgramFormProps) {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [slug, setSlug] = useState(initialValues?.slug || '');
  const [code, setCode] = useState(initialValues?.code || '');
  const [category, setCategory] = useState(initialValues?.category || PROGRAM_CATEGORIES[0]);
  const [focusArea, setFocusArea] = useState(initialValues?.focusArea || '');
  const [targetAudience, setTargetAudience] = useState(initialValues?.targetAudience || '');
  const [shortDescription, setShortDescription] = useState(initialValues?.shortDescription || '');
  const [detailedDescription, setDetailedDescription] = useState(initialValues?.detailedDescription || '');
  const [objectivesText, setObjectivesText] = useState((initialValues?.objectives || []).join('\n'));
  const [outcomesText, setOutcomesText] = useState((initialValues?.expectedOutcomes || []).join('\n'));
  const [coverageText, setCoverageText] = useState((initialValues?.geographicCoverage || []).join(', '));
  const [programManagerId, setProgramManagerId] = useState(initialValues?.programManagerId || '');
  const [departmentId, setDepartmentId] = useState(initialValues?.departmentId || '');
  const [budget, setBudget] = useState(initialValues?.budget ?? 0);
  const [targetBeneficiaries, setTargetBeneficiaries] = useState(initialValues?.targetBeneficiaries ?? 0);
  const [startDate, setStartDate] = useState(initialValues?.startDate || '');
  const [endDate, setEndDate] = useState(initialValues?.endDate || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      title,
      slug: slug || toSlug(title),
      code: code.toUpperCase(),
      category,
      focusArea: focusArea || undefined,
      targetAudience: targetAudience || undefined,
      shortDescription,
      detailedDescription: detailedDescription || undefined,
      objectives: objectivesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      expectedOutcomes: outcomesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      geographicCoverage: coverageText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      programManagerId: programManagerId || null,
      departmentId: departmentId || null,
      budget: Number(budget) || 0,
      targetBeneficiaries: Number(targetBeneficiaries) || 0,
      actualBeneficiaries: initialValues?.actualBeneficiaries || 0,
      startDate: startDate || null,
      endDate: endDate || null,
      gallery: initialValues?.gallery || [],
      kpis: initialValues?.kpis || [],
      isPublicVisible: false,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Program Title *</label>
          <input
            required
            minLength={3}
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!initialValues?.slug) setSlug(toSlug(e.target.value));
            }}
            placeholder="e.g. Education & Digital Literacy Mission"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Program Code *</label>
          <input
            required
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-_]/g, ''))}
            placeholder="PRG-EDU-01"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">URL Slug *</label>
          <input
            required
            type="text"
            value={slug}
            onChange={(e) => setSlug(toSlug(e.target.value))}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 font-mono"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
          >
            {PROGRAM_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Short Description *</label>
        <textarea
          required
          minLength={10}
          rows={2}
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          placeholder="Concise mission summary (min 10 characters)"
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Detailed Description</label>
        <textarea
          rows={3}
          value={detailedDescription}
          onChange={(e) => setDetailedDescription(e.target.value)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Program Manager</label>
          <select
            value={programManagerId}
            onChange={(e) => setProgramManagerId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
          >
            <option value="">Unassigned</option>
            {managers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.role})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Department</label>
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
          >
            <option value="">Unassigned</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Budget (INR)</label>
          <input
            type="number"
            min={0}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Beneficiaries</label>
          <input
            type="number"
            min={0}
            value={targetBeneficiaries}
            onChange={(e) => setTargetBeneficiaries(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Focus Area</label>
          <input
            type="text"
            value={focusArea}
            onChange={(e) => setFocusArea(e.target.value)}
            placeholder="e.g. Rural STEM"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Audience</label>
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="e.g. Rural youth & women"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Geographic Coverage (comma-separated)
          </label>
          <input
            type="text"
            value={coverageText}
            onChange={(e) => setCoverageText(e.target.value)}
            placeholder="Uttar Pradesh, Bihar, Madhya Pradesh"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Objectives (one per line)
          </label>
          <textarea
            rows={3}
            value={objectivesText}
            onChange={(e) => setObjectivesText(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Expected Outcomes (one per line)
          </label>
          <textarea
            rows={3}
            value={outcomesText}
            onChange={(e) => setOutcomesText(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
          />
        </div>
      </div>

      <div className="pt-2 flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-[#087F5B] px-5 py-2 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
