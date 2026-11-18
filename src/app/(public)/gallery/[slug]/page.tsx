'use client';

import React from 'react';
import { GalleryView } from '@/components/public/GalleryView';
import { useViewNavigation } from '@/hooks/useViewNavigation';
import { BreadcrumbJsonLd } from '@/components/common/JsonLd';

export default function GalleryCategoryPage() {
  const onNavigate = useViewNavigation();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://hopehorizon.org' },
          { name: 'Gallery', url: 'https://hopehorizon.org/gallery' },
          { name: 'Photo Collection', url: 'https://hopehorizon.org/gallery' },
        ]}
      />
      <GalleryView onNavigate={onNavigate} />
    </div>
  );
}
