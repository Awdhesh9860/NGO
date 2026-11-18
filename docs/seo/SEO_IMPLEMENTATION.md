# Technical SEO Implementation Guide

## HopeHorizon / Vikas NGO Ecosystem — Phase 5

### 1. Overview
The SEO architecture is optimized for organic search discoverability, social sharing fidelity (Open Graph and Twitter Cards), and semantic accessibility across Google, Bing, and humanitarian registries.

---

### 2. Sitemaps & Crawler Policies

- **XML Sitemap (`src/app/sitemap.ts`)**:
  - Dynamically constructs a standards-compliant XML sitemap.
  - Automatically incorporates all static public routes (Home, About, Transparency, Legal, Volunteer, Donate).
  - Dynamically loops through active Programs (`/programs/[slug]`), Projects (`/projects/[slug]`), and Campaigns (`/campaigns/[slug]`).
  - Sets accurate `changeFrequency` (`daily` for campaigns and homepage, `weekly` for projects/programs, `monthly` for reports) and `priority` scores (0.5 to 1.0).

- **Robots Policy (`src/app/robots.ts`)**:
  - Permits public indexation across all marketing, program, and transparency pages (`Allow: /`).
  - Strictly disallows administrative, user dashboard, authentication, and API endpoints (`Disallow: /dashboard/`, `/api/`, `/(auth)/`).
  - Points crawlers directly to the canonical sitemap (`sitemap: https://hopehorizon.org/sitemap.xml`).

---

### 3. Metadata Standards
- **Title Formatting**: Descriptive, keyword-rich template: `<Page Name> | HopeHorizon Foundation — NGO Platform`.
- **Meta Descriptions**: Compelling humanitarian summaries under 160 characters.
- **Canonical URLs**: Avoid duplicate content penalties across aliases.
- **Open Graph & Twitter**: Preview cards featuring verified field photography and campaign progress.
