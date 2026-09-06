/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DatabaseProvider, useDatabase } from './context/DatabaseContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';

// Layout
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileBottomNav } from './components/navigation/MobileBottomNav';

// Public Views
import { HomeView } from './components/public/HomeView';
import { AboutView } from './components/public/AboutView';
import { ProgramsView } from './components/public/ProgramsView';
import { ProjectsView } from './components/public/ProjectsView';
import { ProjectDetailView } from './components/public/ProjectDetailView';
import { CampaignsView } from './components/public/CampaignsView';
import { CampaignDetailView } from './components/public/CampaignDetailView';
import { TransparencyView } from './components/public/TransparencyView';
import { VolunteerView } from './components/public/VolunteerView';
import { MembershipView } from './components/public/MembershipView';
import { CSRView } from './components/public/CSRView';
import { EventsView } from './components/public/EventsView';
import { NewsBlogView } from './components/public/NewsBlogView';
import { ArticleDetailView } from './components/public/ArticleDetailView';
import { CertificateVerifierView } from './components/public/CertificateVerifierView';
import { ContactFAQView } from './components/public/ContactFAQView';
import { LegalView } from './components/public/LegalView';
import { LoginPage } from './components/public/LoginPage';
import { DonorRegisterPage } from './components/public/DonorRegisterPage';

// Additional Dedicated Public Pages
import { DonateView } from './components/public/DonateView';
import { ImpactView } from './components/public/ImpactView';
import { GalleryView } from './components/public/GalleryView';
import { SuccessStoriesView } from './components/public/SuccessStoriesView';
import { PartnersView } from './components/public/PartnersView';
import { CareersView } from './components/public/CareersView';
import { FAQView } from './components/public/FAQView';
import { ContactView } from './components/public/ContactView';
import { DocumentsView } from './components/public/DocumentsView';

// Dedicated About & Organization Views
import {
  OurStoryView,
  MissionVisionView,
  OurValuesView,
  FounderMessageView,
  LeadershipView,
  BoardMembersView,
  OurTeamView,
  AwardsView
} from './components/about';

// Dashboard Views
import { DashboardLayout } from './components/dashboard/DashboardLayout';

// Common Modals
import { DonateModal } from './components/common/DonateModal';
import { ReceiptModal } from './components/common/ReceiptModal';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { AuthModal } from './components/common/AuthModal';
import { UserProfileModal } from './components/common/UserProfileModal';
import { Donation } from './types';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  // Global Modals State
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [donateCampaignId, setDonateCampaignId] = useState<string | undefined>(undefined);
  const [issuedDonationReceipt, setIssuedDonationReceipt] = useState<Donation | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (view: string, id?: string) => {
    setCurrentView(view);
    if (id) {
      setSelectedEntityId(id);
    } else {
      setSelectedEntityId(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDonate = (campaignId?: string) => {
    setDonateCampaignId(campaignId);
    setDonateModalOpen(true);
  };

  const handleDonationSuccess = (donation: Donation) => {
    setIssuedDonationReceipt(donation);
  };

  const isDashboardView = currentView === 'dashboard';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Global Navigation Header (hidden inside full dashboard mode for immersive focus) */}
      {!isDashboardView && (
        <Navbar
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenDonate={handleOpenDonate}
          onOpenSearch={() => setSearchModalOpen(true)}
          mobileMenuOpen={mobileMenuOpen}
          onMobileMenuToggle={setMobileMenuOpen}
        />
      )}

      {/* Main Viewport with bottom clearance for Android bottom nav on mobile */}
      <main className="flex-1 pb-20 lg:pb-0">
        {/* PUBLIC VIEWS */}
        {currentView === 'home' && (
          <HomeView onNavigate={handleNavigate} onOpenDonate={handleOpenDonate} />
        )}

        {currentView === 'about' && (
          <AboutView onNavigate={handleNavigate} onOpenDonate={handleOpenDonate} />
        )}

        {currentView === 'about-story' && (
          <OurStoryView onNavigate={handleNavigate} onOpenDonate={handleOpenDonate} />
        )}

        {currentView === 'about-mission-vision' && (
          <MissionVisionView onNavigate={handleNavigate} onOpenDonate={handleOpenDonate} />
        )}

        {currentView === 'about-values' && (
          <OurValuesView onNavigate={handleNavigate} onOpenDonate={handleOpenDonate} />
        )}

        {currentView === 'about-founder' && (
          <FounderMessageView onNavigate={handleNavigate} onOpenDonate={handleOpenDonate} />
        )}

        {currentView === 'about-leadership' && (
          <LeadershipView onNavigate={handleNavigate} onOpenDonate={handleOpenDonate} />
        )}

        {currentView === 'about-board' && (
          <BoardMembersView onNavigate={handleNavigate} onOpenDonate={handleOpenDonate} />
        )}

        {currentView === 'about-team' && (
          <OurTeamView onNavigate={handleNavigate} onOpenDonate={handleOpenDonate} />
        )}

        {currentView === 'about-awards' && (
          <AwardsView onNavigate={handleNavigate} onOpenDonate={handleOpenDonate} />
        )}

        {currentView === 'programs' && (
          <ProgramsView onNavigate={handleNavigate} onOpenDonate={handleOpenDonate} />
        )}

        {currentView === 'projects' && (
          <ProjectsView onNavigate={handleNavigate} onOpenDonate={handleOpenDonate} />
        )}

        {currentView === 'project-detail' && selectedEntityId && (
          <ProjectDetailView
            projectId={selectedEntityId}
            onBack={() => handleNavigate('projects')}
            onOpenDonate={handleOpenDonate}
          />
        )}

        {currentView === 'campaigns' && (
          <CampaignsView onNavigate={handleNavigate} onOpenDonate={handleOpenDonate} />
        )}

        {currentView === 'campaign-detail' && selectedEntityId && (
          <CampaignDetailView
            campaignId={selectedEntityId}
            onBack={() => handleNavigate('campaigns')}
            onOpenDonate={handleOpenDonate}
          />
        )}

        {currentView === 'transparency' && <TransparencyView />}

        {currentView === 'volunteers' && <VolunteerView />}

        {currentView === 'membership' && (
          <MembershipView onOpenDonate={handleOpenDonate} />
        )}

        {currentView === 'csr' && <CSRView />}

        {currentView === 'events' && <EventsView />}

        {currentView === 'news' && <NewsBlogView onNavigate={handleNavigate} />}

        {currentView === 'article-detail' && selectedEntityId && (
          <ArticleDetailView
            articleId={selectedEntityId}
            onBack={() => handleNavigate('news')}
            onOpenDonate={() => handleOpenDonate()}
          />
        )}

        {currentView === 'verify-certificate' && <CertificateVerifierView />}

        {currentView === 'donate' && (
          <DonateView
            onNavigate={handleNavigate}
            onDonationSuccess={handleDonationSuccess}
          />
        )}

        {currentView === 'impact' && (
          <ImpactView
            onNavigate={handleNavigate}
            onOpenDonate={handleOpenDonate}
          />
        )}

        {currentView === 'gallery' && (
          <GalleryView onNavigate={handleNavigate} />
        )}

        {currentView === 'stories' && (
          <SuccessStoriesView
            onNavigate={handleNavigate}
            onOpenDonate={handleOpenDonate}
          />
        )}

        {currentView === 'partners' && (
          <PartnersView onNavigate={handleNavigate} />
        )}

        {currentView === 'careers' && (
          <CareersView onNavigate={handleNavigate} />
        )}

        {currentView === 'faq' && (
          <FAQView onNavigate={handleNavigate} />
        )}

        {currentView === 'documents' && (
          <DocumentsView onNavigate={handleNavigate} />
        )}

        {currentView === 'contact' && <ContactView onNavigate={handleNavigate} />}

        {currentView === 'legal' && <LegalView />}

        {/* DEDICATED FULL-PAGE AUTHENTICATION & ONBOARDING */}
        {currentView === 'login' && (
          <LoginPage onNavigate={handleNavigate} onOpenDonate={() => handleOpenDonate()} />
        )}

        {currentView === 'donor-register' && (
          <DonorRegisterPage onNavigate={handleNavigate} onOpenDonate={handleOpenDonate} />
        )}

        {/* AUTHENTICATED ROLE-BASED DASHBOARDS */}
        {currentView === 'dashboard' && (
          <DashboardLayout
            onBackToPublic={() => handleNavigate('home')}
            onOpenDonate={handleOpenDonate}
          />
        )}
      </main>

      {/* Global Footer (only on public portal) */}
      {!isDashboardView && (
        <Footer
          onNavigate={handleNavigate}
          onOpenDonate={() => handleOpenDonate()}
        />
      )}

      {/* GLOBAL MODALS */}
      {donateModalOpen && (
        <DonateModal
          isOpen={donateModalOpen}
          campaignId={donateCampaignId}
          onClose={() => setDonateModalOpen(false)}
          onSuccess={handleDonationSuccess}
        />
      )}

      {issuedDonationReceipt && (
        <ReceiptModal
          donation={issuedDonationReceipt}
          onClose={() => setIssuedDonationReceipt(null)}
        />
      )}

      {searchModalOpen && (
        <GlobalSearchModal
          isOpen={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          onNavigate={handleNavigate}
        />
      )}

      {/* Global Auth & User Profile Modals */}
      <AuthModal />
      <UserProfileModal />

      {/* Android-first Mobile Bottom Navigation */}
      {!isDashboardView && (
        <MobileBottomNav
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenDonate={() => handleOpenDonate()}
          onOpenMenu={() => setMobileMenuOpen(true)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <DatabaseProvider>
        <AuthProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </AuthProvider>
      </DatabaseProvider>
    </LanguageProvider>
  );
}
