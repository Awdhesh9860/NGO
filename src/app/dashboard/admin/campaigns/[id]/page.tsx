'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader, PermissionGate } from '@/features/admin';
import {
  campaignApiService,
  CampaignDetailResponse,
  CampaignStatusBadge,
  CampaignProgress,
  CampaignUpdatesTimeline,
} from '@/features/campaigns';
import { DonationStatusBadge } from '@/features/donations';
import { formatMinorCurrency } from '@/lib/money';
import { ArrowLeft, CheckCircle2, Globe, Lock, Send, XCircle, Play, Pause } from 'lucide-react';

export default function AdminCampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = String(params?.id || '');

  const [detail, setDetail] = useState<CampaignDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [updateTitle, setUpdateTitle] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [updatePublic, setUpdatePublic] = useState(true);

  const loadDetail = useCallback(async () => {
    if (!campaignId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await campaignApiService.getById(campaignId);
      if (res.success && res.data) {
        setDetail(res.data);
      } else {
        setError(res.error?.message || 'Campaign not found');
      }
    } catch {
      setError('Failed to fetch campaign details');
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) void loadDetail();
    });
    return () => {
      active = false;
    };
  }, [loadDetail]);

  const runAction = async (fn: () => Promise<{ success: boolean; error?: { message: string } }>, msg: string) => {
    setError(null);
    setNotice(null);
    const res = await fn();
    if (!res.success) {
      setError(res.error?.message || 'Operation failed');
    } else {
      setNotice(msg);
      await loadDetail();
    }
  };

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateTitle.trim() || !updateContent.trim()) return;
    await runAction(
      () =>
        campaignApiService.addUpdate(campaignId, {
          title: updateTitle.trim(),
          content: updateContent.trim(),
          isPublicVisible: updatePublic,
        }),
      'Campaign update posted'
    );
    setUpdateTitle('');
    setUpdateContent('');
  };

  if (loading) {
    return <div className="h-64 rounded-2xl bg-slate-100 dark:bg-[#162720] animate-pulse" />;
  }

  if (!detail) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => router.push('/dashboard/admin/campaigns')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Campaigns
        </button>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          {error || 'Campaign not found'}
        </div>
      </div>
    );
  }

  const { campaign, metrics, updates, recentDonations } = detail;

  return (
    <div className="space-y-6">
      <PageHeader
        title={campaign.title}
        description={`${campaign.code} • ${campaign.category} • Public Slug: /campaigns/${campaign.slug}`}
        actions={
          <button
            type="button"
            onClick={() => router.push('/dashboard/admin/campaigns')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Campaigns
          </button>
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
          {notice}
        </div>
      )}

      {/* Status & Lifecycle Controls */}
      <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CampaignStatusBadge status={campaign.status} />
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
              {campaign.isPublicVisible ? <Globe className="h-3 w-3 text-emerald-600" /> : <Lock className="h-3 w-3" />}
              {campaign.isPublicVisible ? 'Published on Public Portal' : 'Internal Only'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {campaign.status === 'DRAFT' && (
              <button
                type="button"
                onClick={() =>
                  runAction(
                    () => campaignApiService.approvalAction(campaignId, { action: 'SUBMIT' }),
                    'Submitted campaign for approval'
                  )
                }
                className="inline-flex items-center gap-1 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700"
              >
                <Send className="h-3.5 w-3.5" /> Submit for Approval
              </button>
            )}

            {campaign.status === 'PENDING_APPROVAL' && (
              <PermissionGate permission="campaigns.approve">
                <button
                  type="button"
                  onClick={() =>
                    runAction(
                      () => campaignApiService.approvalAction(campaignId, { action: 'APPROVE' }),
                      'Campaign approved'
                    )
                  }
                  className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const reason = window.prompt('Enter rejection reason:');
                    if (reason) {
                      runAction(
                        () =>
                          campaignApiService.approvalAction(campaignId, {
                            action: 'REJECT',
                            rejectionReason: reason,
                          }),
                        'Campaign returned to draft'
                      );
                    }
                  }}
                  className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
                >
                  <XCircle className="h-3.5 w-3.5" /> Reject
                </button>
              </PermissionGate>
            )}

            {['APPROVED', 'PAUSED'].includes(campaign.status) && (
              <button
                type="button"
                onClick={() =>
                  runAction(
                    () => campaignApiService.update(campaignId, { status: 'ACTIVE' }),
                    'Campaign activated'
                  )
                }
                className="inline-flex items-center gap-1 rounded-xl bg-[#087F5B] px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
              >
                <Play className="h-3.5 w-3.5" /> Activate
              </button>
            )}

            {campaign.status === 'ACTIVE' && (
              <button
                type="button"
                onClick={() =>
                  runAction(
                    () => campaignApiService.update(campaignId, { status: 'PAUSED' }),
                    'Campaign paused'
                  )
                }
                className="inline-flex items-center gap-1 rounded-xl border border-amber-300 px-3 py-1.5 text-xs font-bold text-amber-700"
              >
                <Pause className="h-3.5 w-3.5" /> Pause
              </button>
            )}

            {['APPROVED', 'ACTIVE', 'GOAL_REACHED', 'COMPLETED'].includes(campaign.status) && (
              <PermissionGate permission="campaigns.publish">
                <button
                  type="button"
                  onClick={() =>
                    runAction(
                      () =>
                        campaignApiService.update(campaignId, {
                          isPublicVisible: !campaign.isPublicVisible,
                        }),
                      campaign.isPublicVisible ? 'Unpublished from public site' : 'Published to public site'
                    )
                  }
                  className="inline-flex items-center gap-1 rounded-xl border border-emerald-400 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {campaign.isPublicVisible ? 'Unpublish' : 'Publish Publicly'}
                </button>
              </PermissionGate>
            )}
          </div>
        </div>

        <CampaignProgress
          raisedAmountMinor={metrics.netRaisedMinor}
          targetAmountMinor={metrics.targetAmountMinor}
          currency={campaign.currency}
          donorCount={metrics.donorCount}
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-2 text-xs">
          <div className="rounded-xl bg-slate-50 dark:bg-[#162720] p-3">
            <div className="text-[10px] font-bold uppercase text-slate-400">Gross Verified</div>
            <div className="mt-1 font-black text-slate-900 dark:text-white">
              {formatMinorCurrency(metrics.grossMinor, campaign.currency)}
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-[#162720] p-3">
            <div className="text-[10px] font-bold uppercase text-slate-400">Refunded</div>
            <div className="mt-1 font-black text-rose-600">
              {formatMinorCurrency(metrics.refundedMinor, campaign.currency)}
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-[#162720] p-3">
            <div className="text-[10px] font-bold uppercase text-slate-400">Net Raised</div>
            <div className="mt-1 font-black text-emerald-700 dark:text-emerald-400">
              {formatMinorCurrency(metrics.netRaisedMinor, campaign.currency)}
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-[#162720] p-3">
            <div className="text-[10px] font-bold uppercase text-slate-400">Verified Donations</div>
            <div className="mt-1 font-black text-slate-900 dark:text-white">{metrics.donationCount}</div>
          </div>
        </div>
      </div>

      {/* Campaign Updates & Recent Donations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Campaign Updates</h3>

          <PermissionGate permission="campaigns.update">
            <form onSubmit={handleAddUpdate} className="space-y-2.5 pb-4 border-b border-slate-100 dark:border-[#1d332b]">
              <input
                type="text"
                required
                placeholder="Update headline..."
                value={updateTitle}
                onChange={(e) => setUpdateTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
              <textarea
                rows={2}
                required
                placeholder="Share field progress or milestone..."
                value={updateContent}
                onChange={(e) => setUpdateContent(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={updatePublic}
                    onChange={(e) => setUpdatePublic(e.target.checked)}
                  />
                  Visible on public campaign page
                </label>
                <button
                  type="submit"
                  className="rounded-xl bg-[#087F5B] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  Post Update
                </button>
              </div>
            </form>
          </PermissionGate>

          <CampaignUpdatesTimeline updates={updates} showVisibilityBadge />
        </div>

        <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Recent Donations</h3>
          {recentDonations.length === 0 ? (
            <p className="text-xs text-slate-500">No donations recorded for this campaign yet.</p>
          ) : (
            <div className="space-y-2.5">
              {recentDonations.map((d) => (
                <div
                  key={d._id}
                  onClick={() => router.push(`/dashboard/admin/donations/${d._id}`)}
                  className="cursor-pointer rounded-xl border border-slate-100 dark:border-[#1d332b] p-3 hover:border-emerald-400 transition flex items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {d.donorSnapshot.name}{' '}
                      <span className="font-mono text-[10px] text-slate-400">({d.donationCode})</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {d.paymentProvider} • {new Date(d.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-black text-slate-900 dark:text-white">
                      {formatMinorCurrency(d.amountMinor, d.currency)}
                    </div>
                    <DonationStatusBadge status={d.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
