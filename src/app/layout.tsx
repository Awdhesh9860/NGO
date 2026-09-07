import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { SITE_CONFIG } from '../config/site';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.title,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    'NGO',
    'donate for child education',
    '80G tax exemption donation',
    'clean water charity',
    'hunger relief India',
    'volunteer NGO',
    'donate online India',
    'registered non profit organization',
    'transparent charity',
  ],
  authors: [{ name: SITE_CONFIG.name }],
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.ogImage],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=no',
  },
};

export const viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'NGO',
  name: SITE_CONFIG.name,
  url: SITE_CONFIG.url,
  logo: SITE_CONFIG.ogImage,
  description: SITE_CONFIG.description,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: SITE_CONFIG.contact.phone,
    email: SITE_CONFIG.contact.email,
    contactType: 'customer service',
    availableLanguage: ['English', 'Hindi', 'Bengali'],
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: SITE_CONFIG.contact.headquarters,
    addressCountry: 'IN',
  },
  potentialAction: {
    '@type': 'DonateAction',
    target: `${SITE_CONFIG.url}/donate`,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="overflow-x-hidden antialiased bg-slate-50 text-slate-900">
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
