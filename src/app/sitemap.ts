import { MetadataRoute } from 'next';
import { INITIAL_PROGRAMS, INITIAL_PROJECTS, INITIAL_CAMPAIGNS } from '../data/mockDatabase';

const APP_URL = process.env.APP_URL || 'https://hopehorizon.org';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    // Core Pages
    { url: `${APP_URL}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${APP_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${APP_URL}/programs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${APP_URL}/projects`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${APP_URL}/impact`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${APP_URL}/campaigns`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${APP_URL}/donate`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${APP_URL}/volunteer`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
    { url: `${APP_URL}/membership`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${APP_URL}/events`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.75 },
    { url: `${APP_URL}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.75 },
    { url: `${APP_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.75 },
    { url: `${APP_URL}/gallery`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${APP_URL}/partners`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${APP_URL}/csr`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.75 },
    { url: `${APP_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${APP_URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${APP_URL}/transparency`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },

    // About Subpages
    { url: `${APP_URL}/about/our-story`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.75 },
    { url: `${APP_URL}/about/mission-vision`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.75 },
    { url: `${APP_URL}/about/values`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${APP_URL}/about/founder`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${APP_URL}/about/leadership`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${APP_URL}/about/board`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${APP_URL}/about/team`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${APP_URL}/about/awards`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.65 },

    // Projects Subpages
    { url: `${APP_URL}/projects/ongoing`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${APP_URL}/projects/completed`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.75 },
    { url: `${APP_URL}/projects/upcoming`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.75 },

    // Impact Subpages
    { url: `${APP_URL}/impact/success-stories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${APP_URL}/impact/beneficiary-stories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${APP_URL}/impact/annual-highlights`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },

    // Transparency Subpages
    { url: `${APP_URL}/transparency/annual-reports`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${APP_URL}/transparency/financial-reports`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${APP_URL}/transparency/audit-reports`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${APP_URL}/transparency/governance`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.75 },
    { url: `${APP_URL}/transparency/registrations`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },

    // Get Involved Subpages
    { url: `${APP_URL}/volunteer/apply`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${APP_URL}/membership/apply`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${APP_URL}/press`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.65 },
    { url: `${APP_URL}/press/media-coverage`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.65 },

    // Legal & Safeguarding Pages
    { url: `${APP_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${APP_URL}/terms-and-conditions`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${APP_URL}/refund-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${APP_URL}/donation-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${APP_URL}/child-protection-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${APP_URL}/safeguarding-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${APP_URL}/code-of-conduct`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
  ];

  // Dynamic Programs
  const programRoutes: MetadataRoute.Sitemap = INITIAL_PROGRAMS.map((prog) => ({
    url: `${APP_URL}/programs/${prog.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Dynamic Projects
  const projectRoutes: MetadataRoute.Sitemap = INITIAL_PROJECTS.map((proj) => ({
    url: `${APP_URL}/projects/${proj.slug || proj.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Dynamic Campaigns
  const campaignRoutes: MetadataRoute.Sitemap = INITIAL_CAMPAIGNS.map((camp) => ({
    url: `${APP_URL}/campaigns/${camp.slug || camp.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  return [...staticRoutes, ...programRoutes, ...projectRoutes, ...campaignRoutes];
}
