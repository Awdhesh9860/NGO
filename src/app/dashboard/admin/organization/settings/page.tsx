'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  adminApiService,
  AdminOrganization,
  ORGANIZATION_STATUS_ARRAY,
  PageHeader,
  LoadingSkeleton,
  PermissionGate,
} from '@/features/admin';
import { useAuth } from '@/context/AuthContext';
import {
  Save,
  ArrowLeft,
  Building,
  FileCheck,
  Globe,
  Shield,
  Bell,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

type SettingsTab = 'general' | 'identity' | 'regional' | 'security' | 'notifications';

export default function AdminOrganizationSettingsPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const [tab, setTab] = useState<SettingsTab>('general');
  const [org, setOrg] = useState<AdminOrganization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    adminApiService
      .getOrganization()
      .then((res) => {
        if (res.success && res.data) {
          setOrg(res.data);
        } else {
          setError(res.error?.message || 'Failed to load organization settings');
        }
      })
      .catch(() => setError('Unable to reach organization settings API'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const payload: Parameters<typeof adminApiService.updateOrganization>[0] = {
        name: org.name,
        legalName: org.legalName || null,
        logo: org.logo || '',
        description: org.description || null,
        website: org.website || '',
        contactEmail: org.contactEmail,
        contactPhone: org.contactPhone || null,
        headquartersAddress: org.headquartersAddress || null,
        identity: {
          registrationType: org.identity?.registrationType || null,
          registrationNumber: org.identity?.registrationNumber || null,
          registeredAddress: org.identity?.registeredAddress || null,
          establishmentDate: org.identity?.establishmentDate || null,
        },
        statutory: {
          panNumber: org.statutory?.panNumber || null,
          section80GNumber: org.statutory?.section80GNumber || null,
          section12ANumber: org.statutory?.section12ANumber || null,
          fcraNumber: org.statutory?.fcraNumber || null,
          darpanId: org.statutory?.darpanId || null,
          taxExemptionPercentage: Number(org.statutory?.taxExemptionPercentage ?? 50),
        },
        regional: org.regional,
        securitySettings: org.securitySettings,
        notificationSettings: org.notificationSettings,
        settings: {
          ...org.settings,
          currencyCode: org.regional.currencyCode,
          currencySymbol: org.regional.currencySymbol,
          defaultLocale: org.regional.language,
        },
      };

      if (isSuperAdmin) {
        payload.status = org.status;
        payload.verificationStatus = org.verificationStatus;
      }

      const res = await adminApiService.updateOrganization(payload);
      if (!res.success || !res.data) {
        setError(res.error?.message || 'Failed to save organization settings');
        return;
      }

      setOrg(res.data);
      setSuccess('Organization settings persisted securely and recorded in audit logs.');
    } catch {
      setError('Error persisting organization settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSkeleton variant="form" rows={6} />;

  if (!org) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-xs text-rose-700">
        {error || 'Unable to load organization settings'}
      </div>
    );
  }

  const tabs: Array<{ id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'general', label: 'General', icon: Building },
    { id: 'identity', label: 'Identity & Statutory', icon: FileCheck },
    { id: 'regional', label: 'Regional', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization Settings"
        description="Configure tenant identity, India/INR or global regional defaults, security policies, and notification preferences."
        actions={
          <button
            type="button"
            onClick={() => router.push('/dashboard/admin/organization')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>View Profile</span>
          </button>
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Settings Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-[#e2ece6] dark:border-[#1d332b] pb-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                active
                  ? 'bg-[#087F5B] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#172b22]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 shadow-xs space-y-5 text-xs"
      >
        {tab === 'general' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Organization Name *</label>
              <input
                required
                type="text"
                value={org.name}
                onChange={(e) => setOrg({ ...org, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Legal Name</label>
              <input
                type="text"
                value={org.legalName || ''}
                onChange={(e) => setOrg({ ...org, legalName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Email *</label>
              <input
                required
                type="email"
                value={org.contactEmail}
                onChange={(e) => setOrg({ ...org, contactEmail: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
              <input
                type="text"
                value={org.contactPhone || ''}
                onChange={(e) => setOrg({ ...org, contactPhone: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Website URL</label>
              <input
                type="url"
                placeholder="https://example.org"
                value={org.website || ''}
                onChange={(e) => setOrg({ ...org, website: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Logo URL</label>
              <input
                type="url"
                placeholder="https://example.org/logo.png"
                value={org.logo || ''}
                onChange={(e) => setOrg({ ...org, logo: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={org.description || ''}
                onChange={(e) => setOrg({ ...org, description: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Headquarters Address</label>
              <input
                type="text"
                value={org.headquartersAddress || ''}
                onChange={(e) => setOrg({ ...org, headquartersAddress: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              />
            </div>

            {isSuperAdmin && (
              <>
                <div>
                  <label className="block font-semibold text-purple-700 dark:text-purple-300 mb-1">
                    Tenant Status (Super Admin)
                  </label>
                  <select
                    value={org.status}
                    onChange={(e) =>
                      setOrg({ ...org, status: e.target.value as AdminOrganization['status'] })
                    }
                    className="w-full rounded-xl border border-purple-200 dark:border-purple-800 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
                  >
                    {ORGANIZATION_STATUS_ARRAY.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-purple-700 dark:text-purple-300 mb-1">
                    Verification Status (Super Admin)
                  </label>
                  <select
                    value={org.verificationStatus}
                    onChange={(e) =>
                      setOrg({
                        ...org,
                        verificationStatus: e.target.value as AdminOrganization['verificationStatus'],
                      })
                    }
                    className="w-full rounded-xl border border-purple-200 dark:border-purple-800 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
                  >
                    <option value="unverified">Unverified</option>
                    <option value="pending">Pending Verification</option>
                    <option value="verified">Verified</option>
                  </select>
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'identity' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Registration Type</label>
              <input
                type="text"
                placeholder="Trust / Society / Section 8 Company"
                value={org.identity?.registrationType || ''}
                onChange={(e) =>
                  setOrg({ ...org, identity: { ...org.identity, registrationType: e.target.value } })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Registration Number</label>
              <input
                type="text"
                value={org.identity?.registrationNumber || ''}
                onChange={(e) =>
                  setOrg({ ...org, identity: { ...org.identity, registrationNumber: e.target.value } })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Establishment Date</label>
              <input
                type="date"
                value={org.identity?.establishmentDate || ''}
                onChange={(e) =>
                  setOrg({ ...org, identity: { ...org.identity, establishmentDate: e.target.value } })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Registered Address</label>
              <input
                type="text"
                value={org.identity?.registeredAddress || ''}
                onChange={(e) =>
                  setOrg({ ...org, identity: { ...org.identity, registeredAddress: e.target.value } })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">PAN Number</label>
              <input
                type="text"
                value={org.statutory?.panNumber || ''}
                onChange={(e) =>
                  setOrg({ ...org, statutory: { ...org.statutory, panNumber: e.target.value } })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">80G Certificate No.</label>
              <input
                type="text"
                value={org.statutory?.section80GNumber || ''}
                onChange={(e) =>
                  setOrg({ ...org, statutory: { ...org.statutory, section80GNumber: e.target.value } })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">12A Registration No.</label>
              <input
                type="text"
                value={org.statutory?.section12ANumber || ''}
                onChange={(e) =>
                  setOrg({ ...org, statutory: { ...org.statutory, section12ANumber: e.target.value } })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">NGO Darpan ID / FCRA</label>
              <input
                type="text"
                value={org.statutory?.darpanId || ''}
                onChange={(e) =>
                  setOrg({ ...org, statutory: { ...org.statutory, darpanId: e.target.value } })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 font-mono"
              />
            </div>
          </div>
        )}

        {tab === 'regional' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Country</label>
              <input
                type="text"
                value={org.regional.country}
                onChange={(e) => setOrg({ ...org, regional: { ...org.regional, country: e.target.value } })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">State / Province</label>
              <input
                type="text"
                value={org.regional.state || ''}
                onChange={(e) => setOrg({ ...org, regional: { ...org.regional, state: e.target.value } })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">District / City</label>
              <input
                type="text"
                value={org.regional.district || ''}
                onChange={(e) => setOrg({ ...org, regional: { ...org.regional, district: e.target.value } })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Timezone</label>
              <select
                value={org.regional.timezone}
                onChange={(e) => setOrg({ ...org, regional: { ...org.regional, timezone: e.target.value } })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Currency Code</label>
              <select
                value={org.regional.currencyCode}
                onChange={(e) => {
                  const map: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
                  setOrg({
                    ...org,
                    regional: {
                      ...org.regional,
                      currencyCode: e.target.value,
                      currencySymbol: map[e.target.value] || e.target.value,
                    },
                  });
                }}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Date Format</label>
              <select
                value={org.regional.dateFormat}
                onChange={(e) => setOrg({ ...org, regional: { ...org.regional, dateFormat: e.target.value } })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Language Preference</label>
              <select
                value={org.regional.language}
                onChange={(e) => setOrg({ ...org, regional: { ...org.regional, language: e.target.value } })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              >
                <option value="en">English (en)</option>
                <option value="hi">Hindi (hi)</option>
              </select>
            </div>
          </div>
        )}

        {tab === 'security' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Session Timeout (Minutes)
              </label>
              <input
                type="number"
                min={15}
                max={43200}
                value={org.securitySettings.sessionTimeoutMinutes}
                onChange={(e) =>
                  setOrg({
                    ...org,
                    securitySettings: { ...org.securitySettings, sessionTimeoutMinutes: Number(e.target.value) },
                  })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Minimum Password Length
              </label>
              <input
                type="number"
                min={8}
                max={64}
                value={org.securitySettings.minPasswordLength}
                onChange={(e) =>
                  setOrg({
                    ...org,
                    securitySettings: { ...org.securitySettings, minPasswordLength: Number(e.target.value) },
                  })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Max Failed Login Attempts
              </label>
              <input
                type="number"
                min={3}
                max={20}
                value={org.securitySettings.maxFailedLoginAttempts}
                onChange={(e) =>
                  setOrg({
                    ...org,
                    securitySettings: { ...org.securitySettings, maxFailedLoginAttempts: Number(e.target.value) },
                  })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Invitation Expiry (Days)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={org.securitySettings.invitationExpiryDays}
                onChange={(e) =>
                  setOrg({
                    ...org,
                    securitySettings: { ...org.securitySettings, invitationExpiryDays: Number(e.target.value) },
                  })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Two-Factor Authentication Policy
              </label>
              <select
                value={org.securitySettings.twoFactorPolicy}
                onChange={(e) =>
                  setOrg({
                    ...org,
                    securitySettings: {
                      ...org.securitySettings,
                      twoFactorPolicy: e.target.value as AdminOrganization['securitySettings']['twoFactorPolicy'],
                    },
                  })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              >
                <option value="optional">Optional for all users</option>
                <option value="recommended">Recommended for staff</option>
                <option value="required_for_admins">Required for Administrators</option>
              </select>
            </div>
            <label className="flex items-center gap-2.5 pt-5 cursor-pointer">
              <input
                type="checkbox"
                checked={org.securitySettings.requireStrongPassword}
                onChange={(e) =>
                  setOrg({
                    ...org,
                    securitySettings: { ...org.securitySettings, requireStrongPassword: e.target.checked },
                  })
                }
                className="rounded border-slate-300 text-[#087F5B]"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Require strong passwords (uppercase, numbers, symbols)
              </span>
            </label>
          </div>
        )}

        {tab === 'notifications' && (
          <div className="space-y-3.5">
            {[
              {
                key: 'emailNotifications' as const,
                title: 'Email Notifications',
                desc: 'Send automated notifications on role updates, account activation, and suspension.',
              },
              {
                key: 'adminAlerts' as const,
                title: 'Administrative Security Alerts',
                desc: 'Alert administrators on privileged actions and security events.',
              },
              {
                key: 'invitationNotifications' as const,
                title: 'Invitation Lifecycle Notifications',
                desc: 'Notify inviters when recipients accept invitations or when links near expiry.',
              },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-start justify-between gap-4 rounded-xl border border-slate-100 dark:border-[#1d332b] bg-slate-50/50 dark:bg-[#162920]/40 p-4 cursor-pointer"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{item.title}</p>
                  <p className="text-[11px] text-slate-500">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={org.notificationSettings[item.key]}
                  onChange={(e) =>
                    setOrg({
                      ...org,
                      notificationSettings: { ...org.notificationSettings, [item.key]: e.target.checked },
                    })
                  }
                  className="mt-1 rounded border-slate-300 text-[#087F5B]"
                />
              </label>
            ))}

            <label className="flex items-start justify-between gap-4 rounded-xl border border-slate-100 dark:border-[#1d332b] bg-slate-50/50 dark:bg-[#162920]/40 p-4 cursor-pointer">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Automatic Donation Receipts</p>
                <p className="text-[11px] text-slate-500">Dispatch electronic receipt emails when payments confirm.</p>
              </div>
              <input
                type="checkbox"
                checked={org.settings?.autoSendReceipts ?? true}
                onChange={(e) =>
                  setOrg({
                    ...org,
                    settings: { ...org.settings, autoSendReceipts: e.target.checked },
                  })
                }
                className="mt-1 rounded border-slate-300 text-[#087F5B]"
              />
            </label>
          </div>
        )}

        <PermissionGate anyPermissions={['settings.manage', 'organizations.manage']}>
          <div className="pt-4 border-t border-slate-100 dark:border-[#1d332b] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#087F5B] px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-xs"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? 'Saving Settings…' : 'Save Organization Settings'}</span>
            </button>
          </div>
        </PermissionGate>
      </form>
    </div>
  );
}
