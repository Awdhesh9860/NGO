'use client';

import React, { useEffect, useState } from 'react';
import { Building, ChevronDown, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { adminApiService } from '../services/admin-api.service';
import { StatusBadge } from './StatusBadge';

export interface OrganizationSwitcherProps {
  currentOrgName?: string;
  currentOrgStatus?: string;
  verificationStatus?: string;
}

export function OrganizationSwitcher({
  currentOrgName = 'HopeHorizon Foundation',
  currentOrgStatus = 'ACTIVE',
  verificationStatus = 'unverified',
}: OrganizationSwitcherProps) {
  const { currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const [open, setOpen] = useState(false);
  const [orgs, setOrgs] = useState<
    Array<{ id: string; name: string; slug: string; status: string; verificationStatus: string }>
  >([]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    adminApiService
      .listPlatformOrganizations()
      .then((res) => {
        if (res.success && res.data) {
          setOrgs(res.data);
        }
      })
      .catch(() => {
        // Non-blocking fallback
      });
  }, [isSuperAdmin]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => isSuperAdmin && setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border border-[#e2ece6] dark:border-[#1d332b] bg-slate-50 dark:bg-[#162920] p-3 text-left text-xs transition ${
          isSuperAdmin ? 'hover:border-emerald-400 cursor-pointer' : 'cursor-default'
        }`}
        aria-expanded={open}
      >
        <div className="min-w-0 flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
            <Building className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-bold text-slate-900 dark:text-white">{currentOrgName}</p>
            <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
              {verificationStatus === 'verified' ? (
                <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-semibold">
                  <ShieldAlert className="h-3 w-3" /> {verificationStatus}
                </span>
              )}
              <span>•</span>
              <span>{currentOrgStatus}</span>
            </div>
          </div>
        </div>
        {isSuperAdmin && (
          <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
        )}
      </button>

      {isSuperAdmin && open && (
        <div className="absolute bottom-full left-0 right-0 mb-2 z-50 rounded-xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-2 shadow-lg">
          <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Platform Organizations ({orgs.length || 1})
          </p>
          {orgs.length > 0 ? (
            <ul className="max-h-48 overflow-y-auto space-y-1">
              {orgs.map((org) => (
                <li
                  key={org.id}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-[#172b22]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-800 dark:text-slate-100">{org.name}</p>
                    <p className="truncate text-[10px] text-slate-400">/{org.slug}</p>
                  </div>
                  <StatusBadge status={org.status} className="text-[9px] px-1.5 py-0" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-2 py-2 text-[11px] text-slate-500">Active tenant: {currentOrgName}</p>
          )}
        </div>
      )}
    </div>
  );
}
