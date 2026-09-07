'use client';

import { FAQView } from '../../../components/public/FAQView';
import { useViewNavigation } from '../../../hooks/useViewNavigation';

export default function FaqPage() {
  const onNavigate = useViewNavigation();

  return <FAQView onNavigate={onNavigate} />;
}
