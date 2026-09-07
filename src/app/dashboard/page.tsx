'use client';

import { useRouter } from 'next/navigation';
import { DashboardLayout as DashboardPortal } from '../../components/dashboard/DashboardLayout';
import { useUIStore } from '../../lib/ui-store';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const router = useRouter();
  const openDonate = useUIStore((s) => s.openDonate);

  return <DashboardPortal onBackToPublic={() => router.push('/')} onOpenDonate={openDonate} />;
}
