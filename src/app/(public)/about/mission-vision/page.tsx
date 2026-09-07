'use client';

import { MissionVisionView } from '../../../../components/about';
import { useViewNavigation } from '../../../../hooks/useViewNavigation';
import { useUIStore } from '../../../../lib/ui-store';

export default function MissionVisionPage() {
  const onNavigate = useViewNavigation();
  const openDonate = useUIStore((s) => s.openDonate);

  return <MissionVisionView onNavigate={onNavigate} onOpenDonate={() => openDonate()} />;
}
