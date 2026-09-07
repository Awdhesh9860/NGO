'use client';

import { ContactView } from '../../../components/public/ContactView';
import { useViewNavigation } from '../../../hooks/useViewNavigation';

export default function ContactPage() {
  const onNavigate = useViewNavigation();

  return <ContactView onNavigate={onNavigate} />;
}
