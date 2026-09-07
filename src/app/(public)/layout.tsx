'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { viewForPath } from '../../lib/navigation';
import { useViewNavigation } from '../../hooks/useViewNavigation';
import { useUIStore } from '../../lib/ui-store';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { MobileBottomNav } from '../../components/navigation/MobileBottomNav';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentView = viewForPath(pathname);
  const onNavigate = useViewNavigation();

  const openDonate = useUIStore((s) => s.openDonate);
  const openSearch = useUIStore((s) => s.openSearch);
  const mobileMenuOpen = useUIStore((s) => s.mobileMenuOpen);
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      <Navbar
        currentView={currentView}
        onNavigate={onNavigate}
        onOpenDonate={openDonate}
        onOpenSearch={openSearch}
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuToggle={setMobileMenuOpen}
      />

      <main className="flex-1 pb-20 lg:pb-0">{children}</main>

      <Footer onNavigate={onNavigate} onOpenDonate={() => openDonate()} />

      <MobileBottomNav
        currentView={currentView}
        onNavigate={onNavigate}
        onOpenDonate={() => openDonate()}
        onOpenMenu={() => setMobileMenuOpen(true)}
      />
    </div>
  );
}
