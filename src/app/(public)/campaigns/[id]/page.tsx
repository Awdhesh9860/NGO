'use client';

import { useParams, useRouter } from 'next/navigation';
import { CampaignDetailView } from '../../../../components/public/CampaignDetailView';
import { useUIStore } from '../../../../lib/ui-store';

export default function CampaignDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const openDonate = useUIStore((s) => s.openDonate);

  return (
    <CampaignDetailView
      campaignId={id}
      onBack={() => router.push('/campaigns')}
      onOpenDonate={openDonate}
    />
  );
}
