'use client';

import { DocumentsView } from '../../../components/public/DocumentsView';
import { useViewNavigation } from '../../../hooks/useViewNavigation';

export default function DocumentsPage() {
  const onNavigate = useViewNavigation();

  return <DocumentsView onNavigate={onNavigate} />;
}
