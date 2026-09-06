/**
 * Site Metadata & Global SEO Configuration
 */

export const SITE_CONFIG = {
  name: 'Vikas NGO Ecosystem',
  title: 'Vikas Foundation — Empowering Communities with Transparent Impact',
  description:
    'Dedicated to health, education, sustainable livelihoods, and water security. 80G tax-exempt donations with verifiable public ledger tracking.',
  url: 'https://vikas-ngo.org',
  ogImage: '/og-preview.png',
  links: {
    twitter: 'https://twitter.com/vikasngo',
    facebook: 'https://facebook.com/vikasngo',
    instagram: 'https://instagram.com/vikasngo',
    linkedin: 'https://linkedin.com/company/vikasngo',
    youtube: 'https://youtube.com/@vikasngo',
  },
  contact: {
    phone: '+91 11 2345 6789',
    email: 'contact@vikas-ngo.org',
    headquarters: '14, Institutional Area, Lodhi Road, New Delhi, Delhi 110003',
  },
} as const;

export default SITE_CONFIG;
