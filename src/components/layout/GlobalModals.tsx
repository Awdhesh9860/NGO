'use client';

/**
 * Renders the overlay set that used to live directly in App.tsx's single
 * render tree (donate/receipt/search modals + the always-mounted auth &
 * profile modals), now driven by the shared UI store so any route can
 * trigger them without prop drilling.
 */

import React from 'react';
import { useUIStore } from '../../lib/ui-store';
import { useViewNavigation } from '../../hooks/useViewNavigation';
import { DonateModal } from '../common/DonateModal';
import { ReceiptModal } from '../common/ReceiptModal';
import { GlobalSearchModal } from '../common/GlobalSearchModal';
import { AuthModal } from '../common/AuthModal';
import { UserProfileModal } from '../common/UserProfileModal';

export function GlobalModals() {
  const onNavigate = useViewNavigation();
  const donateModalOpen = useUIStore((s) => s.donateModalOpen);
  const donateCampaignId = useUIStore((s) => s.donateCampaignId);
  const closeDonate = useUIStore((s) => s.closeDonate);
  const issuedDonationReceipt = useUIStore((s) => s.issuedDonationReceipt);
  const setIssuedDonationReceipt = useUIStore((s) => s.setIssuedDonationReceipt);
  const searchModalOpen = useUIStore((s) => s.searchModalOpen);
  const closeSearch = useUIStore((s) => s.closeSearch);

  return (
    <>
      {donateModalOpen && (
        <DonateModal
          isOpen={donateModalOpen}
          campaignId={donateCampaignId}
          onClose={closeDonate}
          onSuccess={setIssuedDonationReceipt}
        />
      )}

      {issuedDonationReceipt && (
        <ReceiptModal
          donation={issuedDonationReceipt}
          onClose={() => setIssuedDonationReceipt(null)}
        />
      )}

      {searchModalOpen && (
        <GlobalSearchModal isOpen={searchModalOpen} onClose={closeSearch} onNavigate={onNavigate} />
      )}

      <AuthModal />
      <UserProfileModal />
    </>
  );
}
