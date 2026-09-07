'use client';

import { DonorRegisterPage as DonorRegisterView } from '../../../components/public/DonorRegisterPage';
import { useViewNavigation } from '../../../hooks/useViewNavigation';
import { useUIStore } from '../../../lib/ui-store';

export default function DonorRegisterPage() {
  const onNavigate = useViewNavigation();
  const openDonate = useUIStore((s) => s.openDonate);

  return <DonorRegisterView onNavigate={onNavigate} onOpenDonate={openDonate} />;
}
