'use client';

import React from 'react';
import { LegalView } from '@/components/public/LegalView';
import { BreadcrumbJsonLd } from '@/components/common/JsonLd';

export default function ChildProtectionPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://hopehorizon.org' },
          { name: 'Child Protection Policy', url: 'https://hopehorizon.org/child-protection-policy' },
        ]}
      />
      <LegalView initialTab="volunteer-code" />
    </div>
  );
}
