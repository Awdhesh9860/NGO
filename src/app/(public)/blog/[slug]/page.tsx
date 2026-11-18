'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArticleDetailView } from '../../../../components/public/ArticleDetailView';
import { useUIStore } from '../../../../lib/ui-store';

export default function BlogDetailPage() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const openDonate = useUIStore((s) => s.openDonate);

  return (
    <ArticleDetailView
      articleId={slug}
      onBack={() => router.push('/blog')}
      onOpenDonate={() => openDonate()}
    />
  );
}
