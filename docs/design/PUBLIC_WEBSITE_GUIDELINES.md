# Public Website UI/UX & Design System Guidelines

## HopeHorizon / Vikas NGO Ecosystem — Phase 5

### 1. Brand Palette & Color Tokens
- **Primary — Deep Emerald (`#087F5B`) & Dark Forest (`#075B43`)**:
  - Signifies hope, sustainability, ecology, and institutional strength.
  - Used for primary CTA buttons, hero gradients, and key navigation states.
- **Secondary — Sky Blue (`#2787C7`)**:
  - Signifies clean water, transparency, and clarity.
  - Used for healthcare tags, water project milestones, and secondary highlights.
- **Accent — Humanitarian Amber (`#E9A23B`)**:
  - Signifies urgency, community warmth, and action.
  - Used for urgent campaign appeal badges, progress bars, and high-priority alerts.
- **Neutrals**:
  - Slate-950 / Slate-900: High-contrast header/footer backdrops.
  - Slate-50 / Slate-100: Clean card backgrounds.
  - Slate-700 / Slate-800: High-readability body prose.

---

### 2. Typography & Responsive Type Scale
- **Font Family**: Inter, sans-serif.
- **Display Headings**: `font-black tracking-tight leading-tight`.
- **Section Headers**: `text-2xl sm:text-4xl font-bold text-slate-900`.
- **Body Text**: `text-xs sm:text-sm text-slate-600 leading-relaxed`.
- **Captions & Disclaimers**: `text-[11px] text-slate-400 font-medium`.

---

### 3. Responsive Breakpoint Validation
- **320px–375px (Compact Mobile)**: Single column layouts, touch-friendly 44px+ tap targets, hidden horizontal scrollbars, sticky mobile bottom navigation.
- **390px–430px (Modern Mobile)**: Full-width cards with 16px internal padding.
- **768px (Tablet / iPad)**: 2-column project and team grids.
- **1024px–1280px (Laptop / Desktop)**: 3-column project listings, sticky header with desktop mega-menu navigation, search shortcut trigger.
- **1536px (Ultra-wide)**: Maximum container constraint `max-w-7xl mx-auto` preventing visual stretching.

---

### 4. Accessibility Compliance (WCAG 2.2 AA)
- 4.5:1 minimum text contrast ratio for all body and heading elements.
- Semantic HTML tags (`<header>`, `<main>`, `<nav>`, `<article>`, `<section>`, `<footer>`).
- Form inputs accompanied by explicit labels or aria attributes.
- Interactive elements possess visible focus rings (`focus:ring-2 focus:ring-emerald-500`).
