'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { PageHeader, PermissionGate } from '@/features/admin';
import {
  financeApiService,
  FundAllocationItem,
  GrantItem,
  GrantProfileCard,
  GrantUtilizationPanel,
} from '@/features/finance';
import { toMinorUnits } from '@/lib/money';
import { Plus } from 'lucide-react';

export default function AdminGrantsFundsPage() {
  const [grants, setGrants] = useState<GrantItem[]>([]);
  const [allocations, setAllocations] = useState<FundAllocationItem[]>([]);

  const [grantRef, setGrantRef] = useState('');
  const [grantName, setGrantName] = useState('');
  const [providerName, setProviderName] = useState('');
  const [awardMajor, setAwardMajor] = useState('');
  const [permittedPurposes, setPermittedPurposes] = useState('Education, Literacy');

  const [allocSourceLabel, setAllocSourceLabel] = useState('');
  const [allocPurpose, setAllocPurpose] = useState('');
  const [allocRestriction, setAllocRestriction] = useState<'UNRESTRICTED' | 'RESTRICTED'>('RESTRICTED');
  const [allocAmountMajor, setAllocAmountMajor] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    const [gRes, aRes] = await Promise.all([
      financeApiService.listGrants(),
      financeApiService.listFundAllocations(),
    ]);
    if (gRes.success && gRes.data) setGrants(gRes.data);
    if (aRes.success && aRes.data) setAllocations(aRes.data);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) void loadAll();
    });
    return () => {
      active = false;
    };
  }, [loadAll]);

  const handleCreateGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await financeApiService.createGrant({
      grantReferenceNumber: grantRef,
      grantName,
      providerName,
      startDate: '2026-04-01',
      endDate: '2027-03-31',
      awardAmountMinor: toMinorUnits(Number(awardMajor), 'INR'),
      isRestricted: true,
      permittedPurposes: permittedPurposes
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });
    if (!res.success) setError(res.error?.message || 'Grant creation failed');
    else {
      setNotice(`Grant ${grantRef.toUpperCase()} created.`);
      setGrantRef('');
      setGrantName('');
      setProviderName('');
      setAwardMajor('');
      await loadAll();
    }
  };

  const handleGrantStatus = async (grant: GrantItem, nextStatus: string) => {
    setError(null);
    const res = await financeApiService.updateGrant(grant._id, {
      action: 'UPDATE_STATUS',
      status: nextStatus,
    });
    if (!res.success) setError(res.error?.message || 'Status update failed');
    else {
      setNotice(`Grant ${grant.grantReferenceNumber} -> ${nextStatus}.`);
      await loadAll();
    }
  };

  const handleGrantReceipt = async (grant: GrantItem) => {
    const amtStr = window.prompt('Enter tranche received amount (₹):');
    if (!amtStr?.trim()) return;
    const trancheLabel = window.prompt('Tranche label (e.g. Tranche-1):', 'Tranche-1') || 'Tranche-1';
    setError(null);
    const res = await financeApiService.updateGrant(grant._id, {
      action: 'RECORD_RECEIPT',
      receiptAmountMinor: toMinorUnits(Number(amtStr), grant.currency),
      trancheLabel,
    });
    if (!res.success) setError(res.error?.message || 'Receipt recording failed');
    else {
      setNotice(`Grant receipt recorded and posted to ledger.`);
      await loadAll();
    }
  };

  const handleCreateAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await financeApiService.createFundAllocation({
      fundSource: 'DONATION',
      sourceReferenceId: `SRC-${new Date().getFullYear()}`,
      sourceLabel: allocSourceLabel,
      restrictionType: allocRestriction,
      permittedPurposes: allocRestriction === 'RESTRICTED' ? [allocPurpose] : [],
      purpose: allocPurpose,
      allocatedAmountMinor: toMinorUnits(Number(allocAmountMajor), 'INR'),
    });
    if (!res.success) setError(res.error?.message || 'Allocation failed');
    else {
      setNotice('Fund allocation recorded.');
      setAllocSourceLabel('');
      setAllocPurpose('');
      setAllocAmountMajor('');
      await loadAll();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grants & Restricted Fund Allocations"
        description="Manage institutional grants, disbursement receipts posted to the General Ledger, reporting deadlines, and donor-restricted fund compliance."
      />

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}
      {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">{notice}</div>}

      <PermissionGate permission="finance.grants.manage">
        <form
          onSubmit={handleCreateGrant}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3"
        >
          <input
            type="text"
            required
            placeholder="Grant Ref # (e.g. GRT-26-01)"
            value={grantRef}
            onChange={(e) => setGrantRef(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs font-mono"
          />
          <input
            type="text"
            required
            placeholder="Grant Title"
            value={grantName}
            onChange={(e) => setGrantName(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
          />
          <input
            type="text"
            required
            placeholder="Grant Provider / Foundation"
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
          />
          <input
            type="number"
            step="0.01"
            min="1"
            required
            placeholder="Award Amount (₹)"
            value={awardMajor}
            onChange={(e) => setAwardMajor(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs font-mono"
          />
          <input
            type="text"
            placeholder="Permitted Purposes (comma sep)"
            value={permittedPurposes}
            onChange={(e) => setPermittedPurposes(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#087F5B] px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
          >
            <Plus className="h-3.5 w-3.5" /> Add Grant
          </button>
        </form>
      </PermissionGate>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {grants.map((g) => (
          <GrantProfileCard
            key={g._id}
            grant={g}
            onUpdateStatus={handleGrantStatus}
            onRecordReceipt={handleGrantReceipt}
          />
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Restricted & Unrestricted Fund Allocations
        </h3>
        <PermissionGate permission="finance.budgets.manage">
          <form
            onSubmit={handleCreateAllocation}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] p-4 grid grid-cols-1 sm:grid-cols-5 gap-3"
          >
            <input
              type="text"
              required
              placeholder="Fund Source Label"
              value={allocSourceLabel}
              onChange={(e) => setAllocSourceLabel(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
            />
            <select
              value={allocRestriction}
              onChange={(e) => setAllocRestriction(e.target.value as 'UNRESTRICTED' | 'RESTRICTED')}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
            >
              <option value="RESTRICTED">Restricted Fund</option>
              <option value="UNRESTRICTED">Unrestricted Fund</option>
            </select>
            <input
              type="text"
              required
              placeholder="Designated Purpose"
              value={allocPurpose}
              onChange={(e) => setAllocPurpose(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
            />
            <input
              type="number"
              step="0.01"
              min="1"
              required
              placeholder="Amount (₹)"
              value={allocAmountMajor}
              onChange={(e) => setAllocAmountMajor(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs font-mono"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#087F5B] px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
            >
              Allocate Funds
            </button>
          </form>
        </PermissionGate>

        <GrantUtilizationPanel allocations={allocations} />
      </div>
    </div>
  );
}
