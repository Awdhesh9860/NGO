'use client';

import { PartnersView } from '../../../components/public/PartnersView';
import { useViewNavigation } from '../../../hooks/useViewNavigation';

export default function PartnersPage() {
  const onNavigate = useViewNavigation();

  return <PartnersView onNavigate={onNavigate} />;
}
