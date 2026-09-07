'use client';

import { MembershipView } from '../../../components/public/MembershipView';
import { useUIStore } from '../../../lib/ui-store';

export default function MembershipPage() {
  const openDonate = useUIStore((s) => s.openDonate);

  return <MembershipView onOpenDonate={openDonate} />;
}
