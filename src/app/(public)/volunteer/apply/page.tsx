'use client';

import React from 'react';
import Link from 'next/link';
import { VolunteerView } from '@/components/public/VolunteerView';
import { ArrowLeft } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/common/JsonLd';

export default function VolunteerApplyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://hopehorizon.org' },
          { name: 'Volunteer', url: 'https://hopehorizon.org/volunteer' },
          { name: 'Application', url: 'https://hopehorizon.org/volunteer/apply' },
        ]}
      />
      <div className="bg-slate-900 text-white py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/volunteer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volunteer Program Overview
          </Link>
        </div>
      </div>
      <VolunteerView />
    </div>
  );
}
