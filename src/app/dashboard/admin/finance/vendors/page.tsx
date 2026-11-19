'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { PageHeader, PermissionGate } from '@/features/admin';
import {
  financeApiService,
  VendorBillItem,
  VendorBillTable,
  VendorItem,
  VendorProfileCard,
} from '@/features/finance';
import { formatMinorCurrency, toMinorUnits } from '@/lib/money';
import { Plus } from 'lucide-react';

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<VendorItem | null>(null);
  const [bills, setBills] = useState<VendorBillItem[]>([]);
  const [outstandingMinor, setOutstandingMinor] = useState(0);

  const [vName, setVName] = useState('');
  const [vType, setVType] = useState('SUPPLIER');
  const [vEmail, setVEmail] = useState('');
  const [vBankName, setVBankName] = useState('');
  const [vBankAcct, setVBankAcct] = useState('');

  const [billNumber, setBillNumber] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDue, setBillDue] = useState(() => new Date().toISOString().slice(0, 10));
  const [billDesc, setBillDesc] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadVendors = useCallback(async () => {
    const res = await financeApiService.listVendors();
    if (res.success && res.data) setVendors(res.data);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) void loadVendors();
    });
    return () => {
      active = false;
    };
  }, [loadVendors]);

  const handleSelectVendor = async (v: VendorItem) => {
    setSelectedVendor(v);
    const res = await financeApiService.getVendorDetail(v.id);
    if (res.success && res.data) {
      setBills(res.data.bills);
      setOutstandingMinor(res.data.summary.outstandingBalanceMinor);
    }
  };

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await financeApiService.createVendor({
      name: vName,
      vendorType: vType,
      email: vEmail || undefined,
      bankName: vBankName || undefined,
      bankAccountNumber: vBankAcct || undefined,
    });
    if (!res.success) setError(res.error?.message || 'Unable to create vendor');
    else {
      setNotice(`Vendor "${vName}" registered (bank details encrypted & masked).`);
      setVName('');
      setVEmail('');
      setVBankName('');
      setVBankAcct('');
      await loadVendors();
    }
  };

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;
    setError(null);
    const amt = Number(billAmount);
    const res = await financeApiService.createVendorBill(selectedVendor.id, {
      billNumber,
      billDate: new Date().toISOString().slice(0, 10),
      dueDate: billDue,
      subtotalMinor: toMinorUnits(amt, 'INR'),
      taxAmountMinor: 0,
      description: billDesc,
    });
    if (!res.success) setError(res.error?.message || 'Bill recording failed');
    else {
      setNotice(`Bill ${billNumber.toUpperCase()} recorded.`);
      setBillNumber('');
      setBillAmount('');
      setBillDesc('');
      await handleSelectVendor(selectedVendor);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendors & Accounts Payable Bills"
        description="Encrypted vendor bank payout protection, masked display, duplicate bill number prevention, and payable balances."
      />

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}
      {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">{notice}</div>}

      <PermissionGate permission="finance.vendors.manage">
        <form
          onSubmit={handleCreateVendor}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3"
        >
          <input
            type="text"
            required
            placeholder="Vendor Name"
            value={vName}
            onChange={(e) => setVName(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
          />
          <select
            value={vType}
            onChange={(e) => setVType(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
          >
            <option value="SUPPLIER">Supplier</option>
            <option value="CONSULTANT">Consultant</option>
            <option value="SERVICE_PROVIDER">Service Provider</option>
            <option value="UTILITY">Utility</option>
          </select>
          <input
            type="email"
            placeholder="Email (optional)"
            value={vEmail}
            onChange={(e) => setVEmail(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
          />
          <input
            type="text"
            placeholder="Bank Name (optional)"
            value={vBankName}
            onChange={(e) => setVBankName(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
          />
          <input
            type="password"
            placeholder="Account # (Encrypted)"
            value={vBankAcct}
            onChange={(e) => setVBankAcct(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#087F5B] px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
          >
            <Plus className="h-3.5 w-3.5" /> Add Vendor
          </button>
        </form>
      </PermissionGate>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {vendors.map((v) => (
          <VendorProfileCard
            key={v.id}
            vendor={v}
            isSelected={selectedVendor?.id === v.id}
            onSelect={handleSelectVendor}
          />
        ))}
      </div>

      {selectedVendor && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Bills for {selectedVendor.name} ({selectedVendor.vendorCode})
            </h3>
            <span className="rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800">
              Outstanding Balance: {formatMinorCurrency(outstandingMinor)}
            </span>
          </div>

          <PermissionGate permission="finance.vendors.manage">
            <form
              onSubmit={handleCreateBill}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] p-4 grid grid-cols-1 sm:grid-cols-5 gap-3"
            >
              <input
                type="text"
                required
                placeholder="Bill Number"
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs font-mono"
              />
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="Amount (₹)"
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs font-mono"
              />
              <input
                type="date"
                required
                value={billDue}
                onChange={(e) => setBillDue(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
              />
              <input
                type="text"
                required
                placeholder="Description"
                value={billDesc}
                onChange={(e) => setBillDesc(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
              />
              <button
                type="submit"
                className="rounded-xl bg-[#087F5B] px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Record Bill
              </button>
            </form>
          </PermissionGate>

          <VendorBillTable bills={bills} />
        </div>
      )}
    </div>
  );
}
