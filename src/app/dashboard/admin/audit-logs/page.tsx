'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  adminApiService,
  AdminAuditLog,
  PageHeader,
  SearchFilterBar,
  DataTable,
  DataTableColumn,
} from '@/features/admin';
import { Download, RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react';

const ACTION_OPTIONS = [
  'USER_CREATE',
  'USER_UPDATE',
  'USER_SUSPEND',
  'USER_STATUS_CHANGE',
  'ROLE_CHANGE',
  'ROLE_CREATE',
  'ROLE_UPDATE',
  'DEPARTMENT_CREATE',
  'DEPARTMENT_UPDATE',
  'DEPARTMENT_DELETE',
  'DEPARTMENT_MEMBER_ASSIGN',
  'DEPARTMENT_MEMBER_REMOVE',
  'INVITATION_SEND',
  'INVITATION_RESEND',
  'INVITATION_REVOKE',
  'ORGANIZATION_UPDATE',
  'USER_SESSION_REVOKE',
  'USER_SESSIONS_REVOKE_ALL',
];

const RESOURCE_OPTIONS = ['User', 'Role', 'Department', 'Invitation', 'Organization', 'Session'];

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [resource, setResource] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApiService.getAuditLogs({
        page,
        limit: 25,
        search: search || undefined,
        action: action || undefined,
        resource: resource || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      if (res.success && res.data) {
        setLogs(res.data);
        setTotalPages(res.meta?.pagination?.totalPages || 1);
        setTotalCount(res.meta?.pagination?.totalCount || res.data.length);
      } else {
        setError(res.error?.message || 'Failed to retrieve audit logs');
      }
    } catch {
      setError('Unable to reach audit log service');
    } finally {
      setLoading(false);
    }
  }, [page, search, action, resource, startDate, endDate]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleExportCsv = () => {
    const headers = ['Timestamp', 'Actor', 'Role', 'Action', 'Resource', 'Resource ID', 'Details', 'IP', 'Correlation ID'];
    const rows = logs.map((l) => [
      new Date(l.timestamp).toISOString(),
      l.actorName,
      l.actorRole,
      l.action,
      l.resource,
      l.resourceId || '',
      (l.details || '').replace(/"/g, '""'),
      l.ipAddress || '',
      l.correlationId || '',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns: DataTableColumn<AdminAuditLog>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (l) => (
        <span className="whitespace-nowrap font-mono text-[11px] text-slate-600 dark:text-slate-300">
          {new Date(l.timestamp).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actor',
      header: 'Actor',
      render: (l) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{l.actorName}</p>
          <p className="text-[10px] text-slate-400">{l.actorRole}</p>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (l) => (
        <span className="inline-block rounded-lg bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
          {l.action}
        </span>
      ),
    },
    {
      key: 'resource',
      header: 'Entity',
      render: (l) => (
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-200">{l.resource}</p>
          {l.resourceId && <p className="font-mono text-[10px] text-slate-400">{l.resourceId.slice(0, 12)}…</p>}
        </div>
      ),
    },
    {
      key: 'details',
      header: 'Details',
      render: (l) => (
        <div className="max-w-sm">
          <p className="text-slate-700 dark:text-slate-300">{l.details || '—'}</p>
          {l.correlationId && (
            <p className="mt-0.5 font-mono text-[10px] text-slate-400">
              Corr: {l.correlationId.slice(0, 14)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'ip',
      header: 'IP Address',
      render: (l) => <span className="font-mono text-[11px] text-slate-500">{l.ipAddress || '—'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs & Admin Activity"
        description="Immutable tenant-scoped record of administrative changes. Sensitive credentials and tokens are never logged."
        badge={
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="h-3 w-3" /> Read-Only Ledger
          </span>
        }
        actions={
          <>
            <button
              type="button"
              onClick={loadLogs}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              disabled={logs.length === 0}
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#087F5B] px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-40 transition"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
          </>
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <SearchFilterBar
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search by actor name, action, or details…"
        filters={[
          {
            id: 'action',
            label: 'All Actions',
            value: action,
            onChange: (val) => {
              setAction(val);
              setPage(1);
            },
            options: ACTION_OPTIONS.map((a) => ({ label: a.replace(/_/g, ' '), value: a })),
          },
          {
            id: 'resource',
            label: 'All Entities',
            value: resource,
            onChange: (val) => {
              setResource(val);
              setPage(1);
            },
            options: RESOURCE_OPTIONS.map((r) => ({ label: r, value: r })),
          },
        ]}
        rightSlot={
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <input
              type="date"
              aria-label="Start date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f1d17] px-2.5 py-1.5 text-xs"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              aria-label="End date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f1d17] px-2.5 py-1.5 text-xs"
            />
          </div>
        }
        onReset={() => {
          setSearch('');
          setAction('');
          setResource('');
          setStartDate('');
          setEndDate('');
          setPage(1);
        }}
      />

      <DataTable
        columns={columns}
        data={logs}
        rowKey={(l) => l.id}
        loading={loading}
        emptyTitle="No audit events match your filter"
        emptyDescription="Administrative operations such as user creation, role changes, and settings updates will appear here automatically."
        pagination={{
          page,
          totalPages,
          totalCount,
          pageSize: 25,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
