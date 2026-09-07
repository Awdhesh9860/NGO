'use client';

import { AwardsView } from '../../../../components/about';
import { useViewNavigation } from '../../../../hooks/useViewNavigation';
import { useUIStore } from '../../../../lib/ui-store';

export default function AwardsPage() {
  const onNavigate = useViewNavigation();
  const openDonate = useUIStore((s) => s.openDonate);

  return <AwardsView onNavigate={onNavigate} onOpenDonate={() => openDonate()} />;
}
