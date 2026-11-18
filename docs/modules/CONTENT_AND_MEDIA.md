# Content, Media & Storytelling Architecture

## HopeHorizon / Vikas NGO Ecosystem — Phase 5

### 1. Overview
The Content and Media system manages published journalism, news releases, field photography, community event listings, and media kits.

---

### 2. Module Specifications

1. **News & Field Articles (`/news`, `/blog`, `/news/[slug]`, `/blog/[slug]`)**:
   - Categorized by strategic pillar: `WATER_SECURITY`, `GIRLS_EDUCATION`, `DISASTER_RELIEF`, `TRANSPARENCY`.
   - Dynamic reading-time estimation, publication timestamps, and author bios.
   - Social sharing triggers (Twitter, LinkedIn, WhatsApp).
   - Structured JSON-LD `Article` metadata.

2. **Ground Photography & Video Gallery (`/gallery`, `/gallery/[slug]`)**:
   - Responsive multi-column masonry grid.
   - Categories: `Projects`, `Events`, `Community`, `Volunteers`, `Campaigns`, `Videos`.
   - Accessible lightbox viewer with descriptive alt tags and location coordinates.
   - YouTube video embed support for verified documentary shorts.

3. **Events Center (`/events`, `/events/[slug]`)**:
   - Community townhalls, volunteer induction webinars, and disaster response camps.
   - Automatic dynamic ticket generation (`TKT-XXXXXX`) with canvas confetti confirmation.

4. **Press & Media Center (`/press`, `/press/media-coverage`)**:
   - Downloadable media kit (.ZIP containing vector logos and verified fact sheets).
   - Press office contact details (`press@hopehorizon.org`).
   - Third-party journalistic reviews and independent development features.
