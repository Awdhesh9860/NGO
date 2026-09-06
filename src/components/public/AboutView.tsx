import React from 'react';
import {
  AboutSubNav,
  AboutHero,
  WhoWeAreSection,
  StoryTimeline,
  WhyWeExistSection,
  MissionSection,
  VisionSection,
  ValuesGrid,
  ApproachSteps,
  WhereWeWorkSection,
  AboutImpactPreview,
  FounderCard,
  LeadershipGrid,
  TeamGrid,
  AwardsGrid,
  AboutTransparencySection,
  AboutFinalCta
} from '../about';

interface AboutViewProps {
  initialTab?: string;
  onNavigate: (view: string, id?: string) => void;
  onOpenDonate?: (campaignId?: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  initialTab = 'overview',
  onNavigate,
  onOpenDonate
}) => {
  return (
    <div className="space-y-6 sm:space-y-10 pb-12">
      {/* Top Subnavigation for About Section */}
      <AboutSubNav currentSubPage="overview" onNavigate={onNavigate} />

      {/* 1. Header / Hero */}
      <AboutHero />

      {/* 2. Who We Are */}
      <WhoWeAreSection onNavigate={onNavigate} />

      {/* 3. Our Story Timeline */}
      <StoryTimeline onNavigate={onNavigate} showFullCta={true} />

      {/* 4. Why We Exist */}
      <WhyWeExistSection onNavigate={onNavigate} />

      {/* 5. Our Mission */}
      <MissionSection onNavigate={onNavigate} />

      {/* 6. Our Vision */}
      <VisionSection />

      {/* 7. Our Values */}
      <ValuesGrid onNavigate={onNavigate} showDetails={false} />

      {/* 8. Our Approach (How We Work) */}
      <ApproachSteps />

      {/* 9. Where We Work */}
      <WhereWeWorkSection onNavigate={onNavigate} />

      {/* 10. Our Impact Preview */}
      <AboutImpactPreview onNavigate={onNavigate} />

      {/* 11. Founder Message Preview */}
      <FounderCard onNavigate={onNavigate} />

      {/* 12. Leadership Preview */}
      <LeadershipGrid onNavigate={onNavigate} showAll={false} />

      {/* 13. Our Team Preview */}
      <TeamGrid onNavigate={onNavigate} showAll={false} />

      {/* 14. Awards & Recognition */}
      <AwardsGrid onNavigate={onNavigate} showAll={false} />

      {/* 15. Transparency */}
      <AboutTransparencySection onNavigate={onNavigate} />

      {/* 16. Final CTA */}
      <AboutFinalCta onOpenDonate={onOpenDonate} onNavigate={onNavigate} />
    </div>
  );
};
