'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LegalView } from '../../../components/public/LegalView';

function LegalPageContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') ?? undefined;

  return <LegalView initialTab={tab} />;
}

export default function LegalPage() {
  return (
    <Suspense fallback={null}>
      <LegalPageContent />
    </Suspense>
  );
}
