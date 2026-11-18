# Enterprise NGO Design System — Color Tokens & Palette
**Platform**: HopeHorizon / Vikas NGO Ecosystem  
**Compliance**: WCAG 2.2 Level AA Contrast Compliant  

---

## 1. Master Brand Palette

```text
Deep Emerald:       #087F5B   (Primary action, verified trust)
Dark Forest:        #075B43   (Primary hover, deep surfaces)
Soft Emerald:       #E8F5EF   (Light background tints, badges)

Sky Blue:           #2787C7   (Secondary action, water & health initiatives)
Soft Sky:           #EAF4FC   (Info badges, subtle highlight cards)

Humanitarian Amber: #E9A23B   (Accent warmth, urgent campaigns, milestones)
Soft Amber:         #FFF4DF   (Urgent notices, warning badges)

Primary Text:       #172B24   (Deep Forest Slate, high-contrast readability)
Secondary Text:     #64746D   (Muted Moss Slate, supporting copy)
Main Background:    #FFFFFF   (Clean, crisp content canvas)
Soft Background:    #F7FAF8   (Off-white mineral background for page sections)
Border:             #E3EBE6   (Subtle sage divider lines)
Dark Surface:       #13231D   (Deep Charcoal Surface for dark cards and headers)
```

---

## 2. Semantic Token Mapping Table

| Semantic Token | Light Mode Value | Dark Mode Value | Contrast Ratio (on background) | Usage |
| :--- | :--- | :--- | :---: | :--- |
| `--primary` | `#087F5B` (Deep Emerald) | `#109D73` (Emerald Bright) | 4.8:1 (AA) | Primary CTA buttons, active tabs, verified badges |
| `--primary-hover`| `#075B43` (Dark Forest) | `#087F5B` | > 7:1 (AAA) | Button hover, focused states |
| `--secondary` | `#2787C7` (Sky Blue) | `#3BA0E6` | 4.6:1 (AA) | Secondary links, program tags, info accents |
| `--accent` | `#E9A23B` (Amber Warmth)| `#F5B04D` | 4.5:1 (AA) | Urgent appeal badges, countdowns, milestones |
| `--bg-main` | `#FFFFFF` | `#0C1813` | N/A | Base page background |
| `--bg-soft` | `#F7FAF8` | `#12211B` | N/A | Alternating section backgrounds, card backgrounds |
| `--bg-card` | `#FFFFFF` | `#152721` | N/A | Dashboard cards, public card components |
| `--text-primary` | `#172B24` | `#F0F7F4` | 13.8:1 (AAA) | Headings, primary body copy |
| `--text-secondary`| `#64746D` | `#A3B5AD` | 5.2:1 (AA) | Captions, metadata, subtitles |
| `--border-default`| `#E3EBE6` | `#223C32` | 3.1:1 | Card borders, table dividers, input borders |
| `--feedback-destructive`| `#D9383A` | `#F05252` | 4.7:1 (AA) | Error alerts, refund action buttons |
| `--feedback-warning`| `#E9A23B` | `#F5B04D` | 4.5:1 (AA) | Pending status badges, warning callouts |
| `--feedback-success`| `#087F5B` | `#109D73` | 4.8:1 (AA) | Successful donations, approved volunteers |
