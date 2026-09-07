'use client';

import { useParams, useRouter } from 'next/navigation';
import { ProjectDetailView } from '../../../../components/public/ProjectDetailView';
import { useUIStore } from '../../../../lib/ui-store';

export default function ProjectDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const openDonate = useUIStore((s) => s.openDonate);

  return (
    <ProjectDetailView
      projectId={id}
      onBack={() => router.push('/projects')}
      onOpenDonate={openDonate}
    />
  );
}
