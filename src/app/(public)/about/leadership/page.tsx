'use client';

import { LeadershipView } from '../../../../components/about';
import { useViewNavigation } from '../../../../hooks/useViewNavigation';
import { useUIStore } from '../../../../lib/ui-store';

export default function LeadershipPage() {
  const onNavigate = useViewNavigation();
  const openDonate = useUIStore((s) => s.openDonate);

  return <LeadershipView onNavigate={onNavigate} onOpenDonate={() => openDonate()} />;
}
