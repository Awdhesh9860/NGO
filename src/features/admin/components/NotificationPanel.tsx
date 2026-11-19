'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, AlertTriangle, ShieldAlert, Info, ArrowRight } from 'lucide-react';
import { adminApiService, AdminNotification } from '../services/admin-api.service';

export function NotificationPanel() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  useEffect(() => {
    adminApiService
      .getNotifications()
      .then((res) => {
        if (res.success && res.data) {
          setNotifications(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const unreadCount = notifications.filter((n) => n.severity !== 'info').length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#172b22] transition"
        aria-label="Administrative notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-[#12221b]" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 z-50 w-80 sm:w-96 rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1d332b] px-4 py-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Admin Alerts ({notifications.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push('/dashboard/admin/notifications');
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
              >
                <span>View all</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-[#1d332b]">
              {notifications.length === 0 ? (
                <p className="p-6 text-center text-xs text-slate-400">
                  No active administrative alerts.
                </p>
              ) : (
                notifications.slice(0, 6).map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      if (n.actionUrl) router.push(n.actionUrl);
                    }}
                    className="flex w-full items-start gap-3 p-3.5 text-left hover:bg-slate-50 dark:hover:bg-[#162920] transition"
                  >
                    <div
                      className={`mt-0.5 rounded-lg p-1.5 shrink-0 ${
                        n.severity === 'critical'
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300'
                          : n.severity === 'warning'
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300'
                      }`}
                    >
                      {n.severity === 'critical' ? (
                        <ShieldAlert className="h-3.5 w-3.5" />
                      ) : n.severity === 'warning' ? (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      ) : (
                        <Info className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{n.title}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        {new Date(n.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
