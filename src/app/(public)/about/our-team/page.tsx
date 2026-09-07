'use client';

import { OurTeamView } from '../../../../components/about';
import { useViewNavigation } from '../../../../hooks/useViewNavigation';
import { useUIStore } from '../../../../lib/ui-store';

export default function OurTeamPage() {
  const onNavigate = useViewNavigation();
  const openDonate = useUIStore((s) => s.openDonate);

  return <OurTeamView onNavigate={onNavigate} onOpenDonate={() => openDonate()} />;
}
