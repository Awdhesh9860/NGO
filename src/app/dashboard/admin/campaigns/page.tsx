'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, EmptyState, PermissionGate } from '@/features/admin';
import {
  campaignApiService,
  CampaignItem,
  CampaignCard,
  CampaignForm,
  CreateCampaignInput,
} from '@/features/campaigns';
import { PlusCircle, RefreshCw, Search, X } from 'lucide-react';

export default function AdminCampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await campaignApiService.list({
        status: statusFilter || undefined,
        search: search || undefined,
        limit: 50,
      });
      if (res.success && res.data) {
        setCampaigns(res.data);
      } else {
        setError(res.error?.message || 'Unable to load fundraising campaigns');
      }
    } catch {
      setError('Failed to connect to campaigns service');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) void loadCampaigns();
    });
    return () => {
      active = false;
    };
  }, [loadCampaigns]);

  const handleCreate = async (data: CreateCampaignInput) => {
    const res = await campaignApiService.create(data);
    if (!res.success) {
      throw new Error(res.error?.message || 'Failed to create campaign');
    }
    setShowCreate(false);
    await loadCampaigns();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fundraising Campaigns"
        description="Manage campaign creation, approval workflows, verified net fundraising progress, and public visibility."
        actions={
          <>
            <button
              type="button"
              onClick={loadCampaigns}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <PermissionGate permission="campaigns.create">
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#087F5B] px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
              >
                <PlusCircle className="h-3.5 w-3.5" /> New Campaign
              </button>
            </PermissionGate>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, code, or category..."
            className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#12221b] pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#12221b] px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
        >
          <option value="">All Active & Draft Statuses</option>
          {['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'PAUSED', 'GOAL_REACHED', 'COMPLETED', 'CANCELLED', 'ARCHIVED'].map(
            (st) => (
              <option key={st} value={st}>
                {st.replace(/_/g, ' ')}
              </option>
            )
          )}
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-52 rounded-2xl bg-slate-100 dark:bg-[#162720] animate-pulse" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <EmptyState
          title="No fundraising campaigns found"
          description="Create a draft campaign, route it through approval, and publish it to start collecting verified donations."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => (
            <CampaignCard
              key={c.id}
              campaign={c}
              showAdminBadges
              ctaLabel="Manage Campaign"
              onSelect={(item) => router.push(`/dashboard/admin/campaigns/${item.id}`)}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 overflow-y-auto backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 shadow-xl my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Create New Fundraising Campaign
              </h2>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <CampaignForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
