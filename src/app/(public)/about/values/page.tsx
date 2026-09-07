'use client';

import { OurValuesView } from '../../../../components/about';
import { useViewNavigation } from '../../../../hooks/useViewNavigation';
import { useUIStore } from '../../../../lib/ui-store';

export default function ValuesPage() {
  const onNavigate = useViewNavigation();
  const openDonate = useUIStore((s) => s.openDonate);

  return <OurValuesView onNavigate={onNavigate} onOpenDonate={() => openDonate()} />;
}
