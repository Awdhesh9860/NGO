'use client';

import { NewsBlogView } from '../../../components/public/NewsBlogView';
import { useViewNavigation } from '../../../hooks/useViewNavigation';

export default function BlogPage() {
  const onNavigate = useViewNavigation();

  return <NewsBlogView onNavigate={onNavigate} />;
}
