/**
 * Application Metadata & Platform Branding Configuration
 */

export const APP_CONFIG = {
  name: 'Vikas NGO Ecosystem',
  legalName: 'Vikas Foundation for Human Development',
  shortName: 'Vikas',
  description:
    'Enterprise NGO Digital Ecosystem — Transparent Public Portal, 80G Tax-Exempt Giving, Field Operations, and Multi-Tenant Management.',
  version: '2.0.0-foundation',
  supportEmail: 'support@vikas-ngo.org',
  statutory: {
    pan: 'AABTV1234F',
    darpanId: 'DL/2021/0284910',
    fcraNumber: '231660144',
    section80G: 'AAATV1234FF20214',
    section12A: 'AAATV1234FE20210',
    taxExemptionPercent: 50,
  },
  locales: [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  ],
  defaultLocale: 'en',
  defaultCurrency: 'INR',
} as const;

export default APP_CONFIG;
