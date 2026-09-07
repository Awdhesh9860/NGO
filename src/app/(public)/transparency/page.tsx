'use client';

import { TransparencyView } from '../../../components/public/TransparencyView';
import { useViewNavigation } from '../../../hooks/useViewNavigation';

export default function TransparencyPage() {
  const onNavigate = useViewNavigation();

  return <TransparencyView onNavigate={onNavigate} />;
}
