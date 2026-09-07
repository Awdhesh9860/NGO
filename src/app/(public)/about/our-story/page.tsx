'use client';

import { OurStoryView } from '../../../../components/about';
import { useViewNavigation } from '../../../../hooks/useViewNavigation';
import { useUIStore } from '../../../../lib/ui-store';

export default function OurStoryPage() {
  const onNavigate = useViewNavigation();
  const openDonate = useUIStore((s) => s.openDonate);

  return <OurStoryView onNavigate={onNavigate} onOpenDonate={() => openDonate()} />;
}
