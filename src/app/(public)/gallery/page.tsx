'use client';

import { GalleryView } from '../../../components/public/GalleryView';
import { useViewNavigation } from '../../../hooks/useViewNavigation';

export default function GalleryPage() {
  const onNavigate = useViewNavigation();

  return <GalleryView onNavigate={onNavigate} />;
}
