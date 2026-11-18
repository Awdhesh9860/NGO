'use client';

import React from 'react';
import { SuccessStoriesView } from '@/components/public/SuccessStoriesView';
import { useViewNavigation } from '@/hooks/useViewNavigation';
import { useUIStore } from '@/lib/ui-store';
import { BreadcrumbJsonLd } from '@/components/common/JsonLd';

export default function BeneficiaryStoriesPage() {
  const onNavigate = useViewNavigation();
  const openDonate = useUIStore((s) => s.openDonate);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://hopehorizon.org' },
          { name: 'Impact', url: 'https://hopehorizon.org/impact' },
          { name: 'Beneficiary Stories', url: 'https://hopehorizon.org/impact/beneficiary-stories' },
        ]}
      />
      <SuccessStoriesView onNavigate={onNavigate} onOpenDonate={openDonate} />
    </div>
  );
}
