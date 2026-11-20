'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { NAV_TOKENS } from '../config/tokens';
import { PublicPrimaryNavItem } from '../config/public-navigation';
import { MobileNavigationDrawer } from './MobileNavigationDrawer';

export interface MobileNavigationProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  items: PublicPrimaryNavItem[];
  currentView: string;
  pathname?: string | null;
  onNavigate: (view: string, subId?: string) => void;
  onOpenDonate: () => void;
  onOpenSearch?: () => void;
}

/**
 * Mobile & Tablet navigation trigger paired with slide-out MobileNavigationDrawer.
 */
export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onOpen,
  onClose,
  items,
  currentView,
  pathname,
  onNavigate,
  onOpenDonate,
  onOpenSearch,
}) => {
  return (
    <>
      <button
        type="button"
        id="mobile-nav-toggle"
        onClick={onOpen}
        aria-expanded={isOpen}
        aria-controls="mobile-nav-drawer"
        aria-label="Open navigation menu"
        className={`flex lg:hidden ${NAV_TOKENS.iconButtonClass} border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#152721] text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#1d352c] cursor-pointer`}
      >
        <Menu className="h-5 w-5" />
      </button>

      <MobileNavigationDrawer
        isOpen={isOpen}
        onClose={onClose}
        items={items}
        currentView={currentView}
        pathname={pathname}
        onNavigate={onNavigate}
        onOpenDonate={onOpenDonate}
        onOpenSearch={onOpenSearch}
      />
    </>
  );
};
