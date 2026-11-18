'use client';

import React from 'react';
import { LegalView } from '@/components/public/LegalView';
import { BreadcrumbJsonLd } from '@/components/common/JsonLd';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://hopehorizon.org' },
          { name: 'Privacy Policy', url: 'https://hopehorizon.org/privacy-policy' },
        ]}
      />
      <LegalView initialTab="privacy" />
    </div>
  );
}
