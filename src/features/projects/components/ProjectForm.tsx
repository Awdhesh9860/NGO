'use client';

import React, { useState } from 'react';
import {
  CreateProjectInput,
  RISK_LEVELS,
  PRIORITY_LEVELS,
} from '../schemas/project.schema';
import { PROGRAM_CATEGORIES } from '@/features/programs/schemas/program.schema';

export interface ProjectFormProps {
  programs: Array<{ id: string; title: string; code: string }>;
  managers: Array<{ id: string; name: string; role: string }>;
  departments: Array<{ id: string; name: string }>;
  submitting?: boolean;
  onSubmit: (data: CreateProjectInput) => Promise<void> | void;
  onCancel?: () => void;
}

function toSlug(val: string) {
  return val
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function ProjectForm({
  programs,
  managers,
  departments,
  submitting = false,
  onSubmit,
  onCancel,
}: ProjectFormProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [slug, setSlug] = useState('');
  const [programId, setProgramId] = useState('');
  const [category, setCategory] = useState<string>(PROGRAM_CATEGORIES[0]);
  const [shortDescription, setShortDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [projectManagerId, setProjectManagerId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [block, setBlock] = useState('');
  const [village, setVillage] = useState('');
  const [approvedBudget, setApprovedBudget] = useState(0);
  const [targetBeneficiaries, setTargetBeneficiaries] = useState(0);
  const [riskLevel, setRiskLevel] = useState<(typeof RISK_LEVELS)[number]>('LOW');
  const [priority, setPriority] = useState<(typeof PRIORITY_LEVELS)[number]>('MEDIUM');
  const [deliverablesText, setDeliverablesText] = useState('');
  const [outcomesText, setOutcomesText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const location = [village, block, district, state].filter(Boolean).join(', ');
    await onSubmit({
      name,
      code: code.toUpperCase(),
      slug: slug || toSlug(name),
      programId: programId || null,
      category,
      shortDescription,
      detailedDescription: detailedDescription || undefined,
      projectManagerId: projectManagerId || null,
      departmentId: departmentId || null,
      startDate: startDate || null,
      endDate: endDate || null,
      location: location || undefined,
      state: state || undefined,
      district: district || undefined,
      block: block || undefined,
      village: village || undefined,
      approvedBudget: Number(approvedBudget) || 0,
      targetBeneficiaries: Number(targetBeneficiaries) || 0,
      actualBeneficiaries: 0,
      riskLevel,
      priority,
      keyDeliverables: deliverablesText.split('\n').map((s) => s.trim()).filter(Boolean),
      expectedOutcomes: outcomesText.split('\n').map((s) => s.trim()).filter(Boolean),
      images: [],
      isPublicVisible: false,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Name *</label>
          <input
            required
            minLength={3}
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSlug(toSlug(e.target.value));
            }}
            placeholder="e.g. Solar Micro-Grid Water Purification — Bundelkhand"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Code *</label>
          <input
            required
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-_]/g, ''))}
            placeholder="PRJ-2026-01"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Parent Program</label>
          <select
            value={programId}
            onChange={(e) => setProgramId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
          >
            <option value="">Independent Project</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.code})
              </option>
            ))}
          </select>
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
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Slug *</label>
          <input
            required
            type="text"
            value={slug}
            onChange={(e) => setSlug(toSlug(e.target.value))}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 font-mono"
          />
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
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Detailed Implementation Scope</label>
        <textarea
          rows={3}
          value={detailedDescription}
          onChange={(e) => setDetailedDescription(e.target.value)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Manager</label>
          <select
            value={projectManagerId}
            onChange={(e) => setProjectManagerId(e.target.value)}
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">State</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="e.g. Uttar Pradesh"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">District</label>
          <input
            type="text"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="e.g. Jhansi"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Block</label>
          <input
            type="text"
            value={block}
            onChange={(e) => setBlock(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Village</label>
          <input
            type="text"
            value={village}
            onChange={(e) => setVillage(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Approved Budget (INR)</label>
          <input
            type="number"
            min={0}
            value={approvedBudget}
            onChange={(e) => setApprovedBudget(Number(e.target.value))}
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
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as (typeof PRIORITY_LEVELS)[number])}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
          >
            {PRIORITY_LEVELS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Risk Level</label>
          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value as (typeof RISK_LEVELS)[number])}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
          >
            {RISK_LEVELS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Key Deliverables (one per line)</label>
          <textarea
            rows={2}
            value={deliverablesText}
            onChange={(e) => setDeliverablesText(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Expected Outcomes (one per line)</label>
          <textarea
            rows={2}
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
          {submitting ? 'Creating…' : 'Create Project'}
        </button>
      </div>
    </form>
  );
}
