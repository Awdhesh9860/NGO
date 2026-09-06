import React from 'react';
import {
  HeroSection,
  TrustStatsBar,
  AboutPreviewSection,
  MissionVisionSection,
  ValuesSection,
  ActionAreasSection,
  FeaturedProgramsSection,
  FeaturedProjectsSection,
  UrgentCampaignSection,
  WhySupportUsSection,
  ImpactMetricsSection,
  FounderSection,
  SuccessStoriesSection,
  VolunteerCtaSection,
  UpcomingEventsSection,
  NewsBlogSection,
  FieldGallerySection,
  PartnersSection,
  CsrSection,
  TransparencySection,
  TestimonialsSection,
  FaqSection,
  NewsletterSection,
  FinalCtaSection
} from '../home';

interface HomeViewProps {
  onOpenDonate: (campaignId?: string, presetAmount?: number) => void;
  onNavigate: (view: string, id?: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onOpenDonate, onNavigate }) => {
  return (
    <div id="ngo-homepage" className="space-y-16 sm:space-y-24 pb-4">
      {/* 1. HERO SECTION */}
      <HeroSection onOpenDonate={onOpenDonate} onNavigate={onNavigate} />

      {/* 2. TRUST & PROOF BAR */}
      <TrustStatsBar />

      {/* 3. ABOUT US / WHO WE ARE */}
      <AboutPreviewSection onNavigate={onNavigate} />

      {/* 4. MISSION & VISION */}
      <MissionVisionSection />

      {/* 5. CORE VALUES */}
      <ValuesSection />

      {/* 6. WHAT WE DO (AREAS OF ACTION) */}
      <ActionAreasSection onNavigate={onNavigate} />

      {/* 7. FEATURED PROGRAMS */}
      <FeaturedProgramsSection onNavigate={onNavigate} />

      {/* 8. FEATURED PROJECTS */}
      <FeaturedProjectsSection onNavigate={onNavigate} />

      {/* 9. URGENT CAMPAIGN / PRIORITY APPEAL */}
      <UrgentCampaignSection onOpenDonate={onOpenDonate} onNavigate={onNavigate} />

      {/* 10. WHY SUPPORT US / WHY TRUST US */}
      <WhySupportUsSection onNavigate={onNavigate} />

      {/* 11. MEASURABLE GROUND IMPACT */}
      <ImpactMetricsSection onNavigate={onNavigate} />

      {/* 12. FOUNDER & LEADERSHIP MESSAGE */}
      <FounderSection onNavigate={onNavigate} />

      {/* 13. SUCCESS STORIES */}
      <SuccessStoriesSection onNavigate={onNavigate} />

      {/* 14. GET INVOLVED / VOLUNTEER & DONATION STRIP */}
      <VolunteerCtaSection onOpenDonate={() => onOpenDonate()} onNavigate={onNavigate} />

      {/* 15. UPCOMING COMMUNITY EVENTS */}
      <UpcomingEventsSection onNavigate={onNavigate} />

      {/* 16. LATEST NEWS & FIELD BLOG */}
      <NewsBlogSection onNavigate={onNavigate} />

      {/* 17. MOMENTS FROM THE GROUND (GALLERY) */}
      <FieldGallerySection onNavigate={onNavigate} />

      {/* 18. SUPPORTIVE PARTNERS */}
      <PartnersSection onNavigate={onNavigate} />

      {/* 19. CORPORATE SOCIAL RESPONSIBILITY (CSR) */}
      <CsrSection onNavigate={onNavigate} />

      {/* 20. RADICAL FINANCIAL TRANSPARENCY */}
      <TransparencySection onNavigate={onNavigate} />

      {/* 21. TESTIMONIALS (VOICES OF TRUST) */}
      <TestimonialsSection />

      {/* 22. FREQUENTLY ASKED QUESTIONS */}
      <FaqSection onNavigate={onNavigate} />

      {/* 23. COMMUNITY NEWSLETTER */}
      <NewsletterSection />

      {/* 24. FINAL INSPIRING CALL TO ACTION */}
      <FinalCtaSection onOpenDonate={() => onOpenDonate()} onNavigate={onNavigate} />
    </div>
  );
};
