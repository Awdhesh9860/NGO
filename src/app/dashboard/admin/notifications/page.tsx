'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  adminApiService,
  AdminNotification,
  PageHeader,
  StatusBadge,
  EmptyState,
  LoadingSkeleton,
} from '@/features/admin';
import {
  Bell,
  ShieldAlert,
  AlertTriangle,
  Info,
  RefreshCw,
  ArrowUpRight,
  AlertCircle,
} from 'lucide-react';

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApiService.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
      } else {
        setError(res.error?.message || 'Failed to load administrative notifications');
      }
    } catch {
      setError('Unable to reach administrative notifications API');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      void loadNotifications();
    }, 0);
    return () => clearTimeout(id);
  }, [loadNotifications]);

  const filtered =
    severityFilter === 'all'
      ? notifications
      : notifications.filter((n) => n.severity === severityFilter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administrative Notifications"
        description="Real-time alerts generated from security events, expiring invitations, and organization verification checks."
        actions={
          <button
            type="button"
            onClick={loadNotifications}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: 'all', label: `All (${notifications.length})` },
          {
            key: 'critical',
            label: `Critical (${notifications.filter((n) => n.severity === 'critical').length})`,
          },
          {
            key: 'warning',
            label: `Warnings (${notifications.filter((n) => n.severity === 'warning').length})`,
          },
          {
            key: 'info',
            label: `Informational (${notifications.filter((n) => n.severity === 'info').length})`,
          },
        ].map((pill) => (
          <button
            key={pill.key}
            type="button"
            onClick={() => setSeverityFilter(pill.key)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              severityFilter === pill.key
                ? 'bg-[#087F5B] text-white shadow-xs'
                : 'border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#12221b] text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton variant="table" rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No active administrative alerts"
          description="Your organization currently has no pending security or compliance alerts matching this filter."
          icon={<Bell className="h-6 w-6" />}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <div
              key={n.id}
              className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-4 shadow-xs flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div
                  className={`mt-0.5 rounded-xl p-2 shrink-0 ${
                    n.severity === 'critical'
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300'
                      : n.severity === 'warning'
                      ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300'
                  }`}
                >
                  {n.severity === 'critical' ? (
                    <ShieldAlert className="h-4 w-4" />
                  ) : n.severity === 'warning' ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <Info className="h-4 w-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</h3>
                    <StatusBadge status={n.severity} />
                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                      {n.type}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{n.message}</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {new Date(n.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              {n.actionUrl && (
                <button
                  type="button"
                  onClick={() => router.push(n.actionUrl!)}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:border-emerald-500 shrink-0 transition"
                >
                  <span>Inspect</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
