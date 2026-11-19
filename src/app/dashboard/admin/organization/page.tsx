'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  adminApiService,
  AdminOrganization,
  PageHeader,
  StatusBadge,
  LoadingSkeleton,
  PermissionGate,
} from '@/features/admin';
import {
  Building,
  Settings,
  Globe,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';

export default function AdminOrganizationProfilePage() {
  const router = useRouter();
  const [org, setOrg] = useState<AdminOrganization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApiService
      .getOrganization()
      .then((res) => {
        if (res.success && res.data) {
          setOrg(res.data);
        } else {
          setError(res.error?.message || 'Failed to load organization profile');
        }
      })
      .catch(() => setError('Unable to reach organization API'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton variant="form" rows={6} />;

  if (!org) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-xs text-rose-700 flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        <span>{error || 'Organization profile unavailable'}</span>
      </div>
    );
  }

  const isVerified = org.verificationStatus === 'verified';

  return (
    <div className="space-y-6">
      <PageHeader
        title={org.name}
        description={org.legalName ? `Legal Entity: ${org.legalName}` : `Tenant Slug: /${org.slug}`}
        badge={
          <div className="flex items-center gap-1.5">
            <StatusBadge status={org.status} />
            <StatusBadge status={org.verificationStatus} />
          </div>
        }
        actions={
          <PermissionGate anyPermissions={['settings.manage', 'organizations.manage']}>
            <button
              type="button"
              onClick={() => router.push('/dashboard/admin/organization/settings')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#087F5B] px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Edit Settings</span>
            </button>
          </PermissionGate>
        }
      />

      {!isVerified && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-950/30 p-4 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Verification Status: {org.verificationStatus.toUpperCase()}</p>
            <p className="mt-0.5">
              Unverified registration numbers and statutory credentials are hidden from public compliance displays until verified by a Super Administrator against official documents.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* General Overview */}
        <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Building className="h-4 w-4 text-emerald-600" />
            <span>General Profile</span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {org.description || 'No organization description configured yet. Update this in Organization Settings.'}
          </p>

          <dl className="space-y-2.5 text-xs pt-2 border-t border-slate-100 dark:border-[#1d332b]">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>{org.contactEmail}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              <span>{org.contactPhone || 'Not provided'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Globe className="h-3.5 w-3.5 text-slate-400" />
              <span>{org.website || org.customDomain || 'Not provided'}</span>
            </div>
            <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
              <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
              <span>{org.headquartersAddress || 'Not provided'}</span>
            </div>
          </dl>
        </div>

        {/* Legal Identity & Verification */}
        <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Legal Identity & Statutory Records</span>
            </div>
            <StatusBadge status={org.verificationStatus} />
          </div>

          {isVerified ? (
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
              <div>
                <dt className="text-[10px] font-bold uppercase text-slate-400">Registration Type</dt>
                <dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                  {org.identity?.registrationType || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase text-slate-400">Registration Number</dt>
                <dd className="mt-0.5 font-mono font-semibold text-slate-900 dark:text-white">
                  {org.identity?.registrationNumber || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase text-slate-400">80G Certificate</dt>
                <dd className="mt-0.5 font-mono font-semibold text-slate-900 dark:text-white">
                  {org.statutory?.section80GNumber || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase text-slate-400">12A Registration</dt>
                <dd className="mt-0.5 font-mono font-semibold text-slate-900 dark:text-white">
                  {org.statutory?.section12ANumber || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase text-slate-400">NGO Darpan ID</dt>
                <dd className="mt-0.5 font-mono font-semibold text-slate-900 dark:text-white">
                  {org.statutory?.darpanId || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase text-slate-400">Establishment Date</dt>
                <dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                  {org.identity?.establishmentDate || '—'}
                </dd>
              </div>
            </dl>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-4 text-xs text-slate-500">
              Registration credentials are only displayed here once verified. Configure your legal registration details in Organization Settings and complete verification.
            </div>
          )}
        </div>

        {/* Regional Configuration */}
        <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Regional Defaults</h3>
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-[10px] font-bold uppercase text-slate-400">Country</dt>
              <dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">{org.regional.country}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase text-slate-400">Timezone</dt>
              <dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">{org.regional.timezone}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase text-slate-400">Currency</dt>
              <dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                {org.regional.currencyCode} ({org.regional.currencySymbol})
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase text-slate-400">Date Format / Locale</dt>
              <dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                {org.regional.dateFormat} • {org.regional.language.toUpperCase()}
              </dd>
            </div>
          </dl>
        </div>

        {/* Security Policy Summary */}
        <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Active Security Policy</h3>
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-[10px] font-bold uppercase text-slate-400">2FA Policy</dt>
              <dd className="mt-0.5 font-semibold capitalize text-slate-900 dark:text-white">
                {org.securitySettings.twoFactorPolicy.replace(/_/g, ' ')}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase text-slate-400">Min Password Length</dt>
              <dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                {org.securitySettings.minPasswordLength} characters
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase text-slate-400">Invitation Expiry</dt>
              <dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                {org.securitySettings.invitationExpiryDays} days
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase text-slate-400">Session Timeout</dt>
              <dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                {Math.round(org.securitySettings.sessionTimeoutMinutes / 60)} hours
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
