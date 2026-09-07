'use client';

import { ImpactView } from '../../../components/public/ImpactView';
import { useViewNavigation } from '../../../hooks/useViewNavigation';
import { useUIStore } from '../../../lib/ui-store';

export default function ImpactPage() {
  const onNavigate = useViewNavigation();
  const openDonate = useUIStore((s) => s.openDonate);

  return <ImpactView onNavigate={onNavigate} onOpenDonate={openDonate} />;
}
