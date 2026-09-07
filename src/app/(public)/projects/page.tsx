'use client';

import { ProjectsView } from '../../../components/public/ProjectsView';
import { useViewNavigation } from '../../../hooks/useViewNavigation';
import { useUIStore } from '../../../lib/ui-store';

export default function ProjectsPage() {
  const onNavigate = useViewNavigation();
  const openDonate = useUIStore((s) => s.openDonate);

  return <ProjectsView onNavigate={onNavigate} onOpenDonate={openDonate} />;
}
