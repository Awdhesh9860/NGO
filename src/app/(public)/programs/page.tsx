'use client';

import { ProgramsView } from '../../../components/public/ProgramsView';
import { useViewNavigation } from '../../../hooks/useViewNavigation';
import { useUIStore } from '../../../lib/ui-store';

export default function ProgramsPage() {
  const onNavigate = useViewNavigation();
  const openDonate = useUIStore((s) => s.openDonate);

  return <ProgramsView onNavigate={onNavigate} onOpenDonate={openDonate} />;
}
