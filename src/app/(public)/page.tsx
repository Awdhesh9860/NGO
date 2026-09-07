'use client';

import { HomeView } from '../../components/public/HomeView';
import { useViewNavigation } from '../../hooks/useViewNavigation';
import { useUIStore } from '../../lib/ui-store';

export default function HomePage() {
  const onNavigate = useViewNavigation();
  const openDonate = useUIStore((s) => s.openDonate);

  return <HomeView onNavigate={onNavigate} onOpenDonate={openDonate} />;
}
