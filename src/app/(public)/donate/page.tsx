'use client';

import { DonateView } from '../../../components/public/DonateView';
import { useViewNavigation } from '../../../hooks/useViewNavigation';
import { useUIStore } from '../../../lib/ui-store';

export default function DonatePage() {
  const onNavigate = useViewNavigation();
  const setIssuedDonationReceipt = useUIStore((s) => s.setIssuedDonationReceipt);

  return <DonateView onNavigate={onNavigate} onDonationSuccess={setIssuedDonationReceipt} />;
}
