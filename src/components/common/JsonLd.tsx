import React from 'react';

/**
 * Serializes JSON-LD safely for embedding inside `<script type="application/ld+json">`,
 * escaping `<`, `>`, and `&` so untrusted strings can never break out of the script tag.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export interface OrganizationJsonLdProps {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
}

export function OrganizationJsonLd({
  name = 'HopeHorizon Foundation',
  url = 'https://hopehorizon.org',
  logo = 'https://hopehorizon.org/images/logo.png',
  description = 'Empowering communities through education, clean water, healthcare, and sustainable livelihood programs across India.',
  sameAs = [
    'https://twitter.com/hopehorizon_ngo',
    'https://linkedin.com/company/hopehorizon-ngo',
    'https://facebook.com/hopehorizon.ngo',
    'https://instagram.com/hopehorizon_ngo',
  ],
}: OrganizationJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name,
    url,
    logo,
    description,
    sameAs,
    taxID: 'DL/2023/0342918',
    nonprofitStatus: 'Nonprofit501c3',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'New Delhi',
      addressRegion: 'Delhi',
      postalCode: '110001',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-11-2345-6789',
      contactType: 'donor service',
      email: 'contact@hopehorizon.org',
      availableLanguage: ['English', 'Hindi'],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
    />
  );
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
    />
  );
}

export interface ArticleJsonLdProps {
  headline: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
}

export function ArticleJsonLd({
  headline,
  description,
  url,
  image,
  datePublished,
  dateModified,
  authorName = 'HopeHorizon Editorial Team',
}: ArticleJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    url,
    image,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'HopeHorizon Foundation',
      logo: {
        '@type': 'ImageObject',
        url: 'https://hopehorizon.org/images/logo.png',
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
    />
  );
}
