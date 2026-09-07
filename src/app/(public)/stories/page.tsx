'use client';

import { SuccessStoriesView } from '../../../components/public/SuccessStoriesView';
import { useViewNavigation } from '../../../hooks/useViewNavigation';
import { useUIStore } from '../../../lib/ui-store';

export default function StoriesPage() {
  const onNavigate = useViewNavigation();
  const openDonate = useUIStore((s) => s.openDonate);

  return <SuccessStoriesView onNavigate={onNavigate} onOpenDonate={openDonate} />;
}
