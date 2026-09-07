'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArticleDetailView } from '../../../../components/public/ArticleDetailView';
import { useUIStore } from '../../../../lib/ui-store';

export default function ArticleDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const openDonate = useUIStore((s) => s.openDonate);

  return (
    <ArticleDetailView
      articleId={id}
      onBack={() => router.push('/news')}
      onOpenDonate={() => openDonate()}
    />
  );
}
