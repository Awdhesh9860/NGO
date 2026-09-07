'use client';

import { AboutView } from '../../../components/public/AboutView';
import { useViewNavigation } from '../../../hooks/useViewNavigation';
import { useUIStore } from '../../../lib/ui-store';

export default function AboutPage() {
  const onNavigate = useViewNavigation();
  const openDonate = useUIStore((s) => s.openDonate);

  return <AboutView onNavigate={onNavigate} onOpenDonate={openDonate} />;
}
