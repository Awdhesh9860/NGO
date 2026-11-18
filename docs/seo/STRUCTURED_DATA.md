# Structured Data & JSON-LD Schemas

## HopeHorizon / Vikas NGO Ecosystem — Phase 5

### 1. JSON-LD Implementation (`src/components/common/JsonLd.tsx`)
HopeHorizon embeds semantic Schema.org JSON-LD microdata directly into server and client renders to enable Google Rich Snippets, Knowledge Graph cards, and breadcrumb trails.

---

### 2. Supported Schemas

1. **Organization / NGO Schema (`OrganizationJsonLd`)**:
```json
{
  "@context": "https://schema.org",
  "@type": "NGO",
  "name": "HopeHorizon Foundation",
  "url": "https://hopehorizon.org",
  "logo": "https://hopehorizon.org/images/logo.png",
  "description": "Empowering communities through education, clean water, healthcare, and sustainable livelihood programs across India.",
  "taxID": "DL/2023/0342918",
  "nonprofitStatus": "Nonprofit501c3",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "New Delhi",
    "addressRegion": "Delhi",
    "postalCode": "110001",
    "addressCountry": "IN"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-11-2345-6789",
    "contactType": "donor service",
    "email": "contact@hopehorizon.org",
    "availableLanguage": ["English", "Hindi"]
  }
}
```

2. **Breadcrumb List Schema (`BreadcrumbJsonLd`)**:
   - Injected on all subpages (`/about/*`, `/programs/*`, `/projects/*`, `/transparency/*`) to render hierarchical site navigation in search engine results.

3. **Article Schema (`ArticleJsonLd`)**:
   - Injected on field stories and news posts (`/news/[slug]`, `/blog/[slug]`), enabling Google News and mobile Discover card qualification.
