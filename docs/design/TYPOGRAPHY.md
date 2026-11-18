# Enterprise NGO Design System — Typography System
**Platform**: HopeHorizon / Vikas NGO Ecosystem  
**Primary Font**: Inter (Optimized via `next/font/google`)  

---

## 1. Typographic Hierarchy & Scale

The typography scale balances editorial warmth for public storytelling with compact legibility for operational dashboards:

| Scale Level | Desktop Size / Leading | Mobile Size / Leading | Weight | Tracking | Recommended Usage |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Display** | `3.5rem` (56px) / `1.15` | `2.5rem` (40px) / `1.2` | 900 (Black) | `-0.025em` | Public Hero headlines, impact milestones |
| **Heading 1** | `2.5rem` (40px) / `1.2` | `2rem` (32px) / `1.25` | 800 (ExtraBold) | `-0.02em` | Main page titles, portal greetings |
| **Heading 2** | `2rem` (32px) / `1.25` | `1.5rem` (24px) / `1.3` | 700 (Bold) | `-0.015em` | Major section headers, dashboard card groups |
| **Heading 3** | `1.5rem` (24px) / `1.3` | `1.25rem` (20px) / `1.35`| 700 (Bold) | `-0.01em` | Card titles, modal titles, campaign titles |
| **Heading 4** | `1.25rem` (20px) / `1.4` | `1.125rem` (18px) / `1.4`| 600 (SemiBold) | `normal` | Sub-section headings, table column headers |
| **Body Large**| `1.125rem` (18px) / `1.6` | `1rem` (16px) / `1.6` | 400 (Regular) | `normal` | Lead article paragraphs, campaign excerpts |
| **Body** | `1rem` (16px) / `1.6` | `0.9375rem` (15px) / `1.55`| 400 (Regular) | `normal` | Standard body text, descriptions, modal copy |
| **Body Small**| `0.875rem` (14px) / `1.5` | `0.875rem` (14px) / `1.5`| 400 (Regular) | `normal` | Table rows, input fields, form descriptions |
| **Caption** | `0.75rem` (12px) / `1.4` | `0.75rem` (12px) / `1.4` | 500 (Medium) | `normal` | Timestamps, metadata, helper text |
| **Label** | `0.75rem` (12px) / `1.0` | `0.6875rem` (11px) / `1.0`| 700 (Bold) | `+0.05em` | Status badges, category pills (UPPERCASE) |
| **Data Metric**| `2rem` (32px) / `1.1` | `1.5rem` (24px) / `1.1` | 800 (ExtraBold) | `-0.02em` | KPI numbers, donation currency amounts |

---

## 2. Standardized Component Classes

```html
<!-- Display Heading Example -->
<h1 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
  Empowering Grassroots Communities
</h1>

<!-- Body Lead Example -->
<p class="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
  Verifiable 80G tax-exempt donations directly deployed to rural clean water and education programs.
</p>
```
