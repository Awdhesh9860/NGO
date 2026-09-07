'use client';

/**
 * Global UI state for cross-page overlays (donate/search modals, mobile menu,
 * issued receipt). Replaces the useState calls that used to live directly on
 * the single-page App.tsx shell, now that each route is its own page.tsx.
 */

import { create } from 'zustand';
import type { Donation } from '../types';

interface UIState {
  donateModalOpen: boolean;
  donateCampaignId?: string;
  openDonate: (campaignId?: string) => void;
  closeDonate: () => void;

  issuedDonationReceipt: Donation | null;
  setIssuedDonationReceipt: (donation: Donation | null) => void;

  searchModalOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;

  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  donateModalOpen: false,
  donateCampaignId: undefined,
  openDonate: (campaignId) => set({ donateModalOpen: true, donateCampaignId: campaignId }),
  closeDonate: () => set({ donateModalOpen: false }),

  issuedDonationReceipt: null,
  setIssuedDonationReceipt: (donation) => set({ issuedDonationReceipt: donation }),

  searchModalOpen: false,
  openSearch: () => set({ searchModalOpen: true }),
  closeSearch: () => set({ searchModalOpen: false }),

  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
}));
