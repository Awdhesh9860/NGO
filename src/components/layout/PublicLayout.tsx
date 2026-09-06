import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export interface PublicLayoutProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenDonate: (projectId?: string, campaignId?: string) => void;
  onSearchClick?: () => void;
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  currentView,
  onNavigate,
  onOpenDonate,
  onSearchClick,
  children,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 font-sans antialiased">
      {/* Global Public Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={onNavigate}
        onOpenDonate={onOpenDonate}
        onSearchClick={onSearchClick}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>

      {/* Global Public Footer */}
      <Footer onNavigate={onNavigate} onOpenDonate={onOpenDonate} />
    </div>
  );
};
