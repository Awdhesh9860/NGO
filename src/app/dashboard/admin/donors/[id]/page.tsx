'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/features/admin';
import {
  donorApiService,
  DonorProfileResponse,
  DonorProfileCard,
  DonorDonationHistory,
} from '@/features/donors';
import { ArrowLeft } from 'lucide-react';

export default function AdminDonorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const donorId = String(params?.id || '');

  const [profile, setProfile] = useState<DonorProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!donorId) return;
    donorApiService
      .getById(donorId)
      .then((res) => {
        if (res.success && res.data) setProfile(res.data);
        else setError(res.error?.message || 'Donor not found');
      })
      .catch(() => setError('Failed to load donor profile'))
      .finally(() => setLoading(false));
  }, [donorId]);

  if (loading) {
    return <div className="h-56 rounded-2xl bg-slate-100 dark:bg-[#162720] animate-pulse" />;
  }

  if (!profile) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => router.push('/dashboard/admin/donors')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Donors
        </button>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          {error || 'Donor not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Donor Profile: ${profile.donor.name}`}
        description="Complete contribution history, segments, communication preferences, and sensitive field controls."
        actions={
          <button
            type="button"
            onClick={() => router.push('/dashboard/admin/donors')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-semibold"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All Donors
          </button>
        }
      />

      <DonorProfileCard donor={profile.donor} />

      <div className="space-y-3">
        <h3 className="text-sm font-black text-slate-900 dark:text-white">Donation History</h3>
        <DonorDonationHistory
          donations={profile.donations}
          onSelectDonation={(id) => router.push(`/dashboard/admin/donations/${id}`)}
        />
      </div>
    </div>
  );
}
