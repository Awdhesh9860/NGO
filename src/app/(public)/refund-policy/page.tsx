'use client';

import React from 'react';
import { LegalView } from '@/components/public/LegalView';
import { BreadcrumbJsonLd } from '@/components/common/JsonLd';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://hopehorizon.org' },
          { name: 'Refund Policy', url: 'https://hopehorizon.org/refund-policy' },
        ]}
      />
      <LegalView initialTab="refund" />
    </div>
  );
}
