'use client';

import { FounderMessageView } from '../../../../components/about';
import { useViewNavigation } from '../../../../hooks/useViewNavigation';
import { useUIStore } from '../../../../lib/ui-store';

export default function FounderMessagePage() {
  const onNavigate = useViewNavigation();
  const openDonate = useUIStore((s) => s.openDonate);

  return <FounderMessageView onNavigate={onNavigate} onOpenDonate={() => openDonate()} />;
}
