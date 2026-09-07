'use client';

import { BoardMembersView } from '../../../../components/about';
import { useViewNavigation } from '../../../../hooks/useViewNavigation';
import { useUIStore } from '../../../../lib/ui-store';

export default function BoardMembersPage() {
  const onNavigate = useViewNavigation();
  const openDonate = useUIStore((s) => s.openDonate);

  return <BoardMembersView onNavigate={onNavigate} onOpenDonate={() => openDonate()} />;
}
