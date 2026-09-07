'use client';

import { CampaignsView } from '../../../components/public/CampaignsView';
import { useViewNavigation } from '../../../hooks/useViewNavigation';
import { useUIStore } from '../../../lib/ui-store';

export default function CampaignsPage() {
  const onNavigate = useViewNavigation();
  const openDonate = useUIStore((s) => s.openDonate);

  return <CampaignsView onNavigate={onNavigate} onOpenDonate={openDonate} />;
}
