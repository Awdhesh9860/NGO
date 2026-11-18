'use client';

import React from 'react';
import Link from 'next/link';
import { MembershipView } from '@/components/public/MembershipView';
import { useUIStore } from '@/lib/ui-store';
import { ArrowLeft } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/common/JsonLd';

export default function MembershipApplyPage() {
  const openDonate = useUIStore((s) => s.openDonate);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://hopehorizon.org' },
          { name: 'Membership', url: 'https://hopehorizon.org/membership' },
          { name: 'Application', url: 'https://hopehorizon.org/membership/apply' },
        ]}
      />
      <div className="bg-slate-900 text-white py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/membership"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Membership Tiers Overview
          </Link>
        </div>
      </div>
      <MembershipView onOpenDonate={openDonate} />
    </div>
  );
}
