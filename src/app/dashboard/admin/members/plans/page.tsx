'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader, EmptyState, PermissionGate } from '@/features/admin';
import {
  membershipApiService,
  MembershipPlanItem,
  MembershipPlanCard,
} from '@/features/membership';
import { toMinorUnits } from '@/lib/money';
import { PlusCircle, RefreshCw } from 'lucide-react';

export default function AdminMembershipPlansPage() {
  const [plans, setPlans] = useState<MembershipPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<'GENERAL' | 'ANNUAL' | 'LIFETIME' | 'SUPPORTING' | 'INSTITUTIONAL'>('ANNUAL');
  const [feeMajor, setFeeMajor] = useState('1000');
  const [validityDays, setValidityDays] = useState('365');
  const [description, setDescription] = useState('');
  const [votingRights, setVotingRights] = useState(false);

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await membershipApiService.listPlans(false);
      if (res.success && res.data) setPlans(res.data);
      else setError(res.error?.message || 'Unable to load membership plans');
    } catch {
      setError('Failed to connect to membership plans API');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) void loadPlans();
    });
    return () => {
      active = false;
    };
  }, [loadPlans]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await membershipApiService.createPlan({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      category,
      description: description.trim(),
      feeAmountMinor: toMinorUnits(Number(feeMajor) || 0, 'INR'),
      currency: 'INR',
      validityDays: category === 'LIFETIME' ? 0 : Number(validityDays) || 365,
      isLifetime: category === 'LIFETIME',
      gracePeriodDays: 30,
      renewalReminderDaysBefore: [30, 7, 1],
      benefits: [],
      votingRights,
      requiresApproval: true,
      isPublicVisible: true,
    });
    if (!res.success) {
      setError(res.error?.message || 'Failed to create plan');
      return;
    }
    setShowForm(false);
    setName('');
    setCode('');
    setDescription('');
    await loadPlans();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurable Membership Plans"
        description="Define organization-specific membership categories, fees, validity periods, and grace periods (strictly distinct from charitable donations)."
        actions={
          <>
            <button
              type="button"
              onClick={loadPlans}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-semibold"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <PermissionGate permission="members.create">
              <button
                type="button"
                onClick={() => setShowForm((s) => !s)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#087F5B] px-3.5 py-2 text-xs font-bold text-white"
              >
                <PlusCircle className="h-3.5 w-3.5" /> New Membership Plan
              </button>
            </PermissionGate>
          </>
        }
      />

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="Plan Name (e.g. Annual General Member) *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-[#1d332b] px-3 py-2 text-xs"
            />
            <input
              type="text"
              required
              placeholder="Code (e.g. PLAN-ANNUAL) *"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="rounded-xl border border-slate-200 dark:border-[#1d332b] px-3 py-2 text-xs"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof category)}
              className="rounded-xl border border-slate-200 dark:border-[#1d332b] px-3 py-2 text-xs"
            >
              <option value="GENERAL">General Member</option>
              <option value="ANNUAL">Annual Member</option>
              <option value="LIFETIME">Lifetime Member</option>
              <option value="SUPPORTING">Supporting Member</option>
              <option value="INSTITUTIONAL">Institutional Member</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="number"
              min="0"
              placeholder="Fee (INR, 0 for free)"
              value={feeMajor}
              onChange={(e) => setFeeMajor(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-[#1d332b] px-3 py-2 text-xs"
            />
            <input
              type="number"
              min="0"
              disabled={category === 'LIFETIME'}
              placeholder="Validity (days)"
              value={validityDays}
              onChange={(e) => setValidityDays(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-[#1d332b] px-3 py-2 text-xs"
            />
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={votingRights}
                onChange={(e) => setVotingRights(e.target.checked)}
              />
              Includes AGM Voting Rights
            </label>
          </div>

          <textarea
            rows={2}
            required
            minLength={10}
            placeholder="Plan eligibility & benefits description *"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] px-3 py-2 text-xs"
          />

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border px-3 py-1.5 text-xs">
              Cancel
            </button>
            <button type="submit" className="rounded-xl bg-[#087F5B] px-4 py-1.5 text-xs font-bold text-white">
              Save Plan
            </button>
          </div>
        </form>
      )}

      {plans.length === 0 && !loading ? (
        <EmptyState
          title="No membership plans configured"
          description="Create configurable membership categories so applicants can apply via the public /membership page."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((p) => (
            <MembershipPlanCard key={p._id} plan={p} />
          ))}
        </div>
      )}
    </div>
  );
}
