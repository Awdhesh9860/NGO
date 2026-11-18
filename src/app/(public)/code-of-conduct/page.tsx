'use client';

import React from 'react';
import { LegalView } from '@/components/public/LegalView';
import { BreadcrumbJsonLd } from '@/components/common/JsonLd';

export default function CodeOfConductPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://hopehorizon.org' },
          { name: 'Code of Conduct', url: 'https://hopehorizon.org/code-of-conduct' },
        ]}
      />
      <LegalView initialTab="volunteer-code" />
    </div>
  );
}
