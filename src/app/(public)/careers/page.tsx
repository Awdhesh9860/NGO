'use client';

import { CareersView } from '../../../components/public/CareersView';
import { useViewNavigation } from '../../../hooks/useViewNavigation';

export default function CareersPage() {
  const onNavigate = useViewNavigation();

  return <CareersView onNavigate={onNavigate} />;
}
