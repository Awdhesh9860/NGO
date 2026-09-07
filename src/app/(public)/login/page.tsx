'use client';

import { LoginPage as LoginView } from '../../../components/public/LoginPage';
import { useViewNavigation } from '../../../hooks/useViewNavigation';
import { useUIStore } from '../../../lib/ui-store';

export default function LoginPage() {
  const onNavigate = useViewNavigation();
  const openDonate = useUIStore((s) => s.openDonate);

  return <LoginView onNavigate={onNavigate} onOpenDonate={() => openDonate()} />;
}
