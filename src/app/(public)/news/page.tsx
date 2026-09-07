'use client';

import { NewsBlogView } from '../../../components/public/NewsBlogView';
import { useViewNavigation } from '../../../hooks/useViewNavigation';

export default function NewsPage() {
  const onNavigate = useViewNavigation();

  return <NewsBlogView onNavigate={onNavigate} />;
}
