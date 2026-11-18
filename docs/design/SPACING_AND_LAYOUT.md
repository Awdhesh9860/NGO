# Enterprise NGO Design System — Spacing, Layout & Grid
**Platform**: HopeHorizon / Vikas NGO Ecosystem  
**Grid Model**: 4px Base Grid with Responsive Padding & Container Envelopes  

---

## 1. 4px Baseline Spacing Scale

All spatial relationships (margins, paddings, gaps) adhere to the 4px mathematical ratio:

| Token | Pixels | Rem Equivalent | Tailwind Class | Recommended Usage |
| :--- | :--- | :--- | :--- | :--- |
| `space-1` | 4px | `0.25rem` | `p-1`, `gap-1` | Icon-to-text gaps, tight tag padding |
| `space-2` | 8px | `0.5rem` | `p-2`, `gap-2` | Compact button padding, badge padding |
| `space-3` | 12px | `0.75rem` | `p-3`, `gap-3` | Input field padding, list item spacing |
| `space-4` | 16px | `1rem` | `p-4`, `gap-4` | Standard card internal padding, form row gap |
| `space-6` | 24px | `1.5rem` | `p-6`, `gap-6` | Dashboard card padding, grid gap on desktop |
| `space-8` | 32px | `2rem` | `p-8`, `gap-8` | Modal body padding, large card padding |
| `space-12`| 48px | `3rem` | `py-12` | Public website compact section padding |
| `space-16`| 64px | `4rem` | `py-16` | Standard public section vertical rhythm |
| `space-20`| 80px | `5rem` | `py-20` | Hero section vertical spacing |

---

## 2. Container & Layout Standards

### Public Website Container:
- Default container uses `max-w-7xl` (`1280px`) centered with `mx-auto px-4 sm:px-6 lg:px-8`.
- Prevents horizontal overflow across small mobile devices (`320px`) through ultra-wide 4K monitors.

### Dashboard Layout Grid:
- **Desktop Sidebar**: Fixed `280px` width (or `76px` collapsed icon mode).
- **Sticky Top Bar**: `72px` height (`h-[72px]`) with backdrop blur (`backdrop-blur-md`).
- **Dashboard Workspace**: `max-w-7xl` (`1280px`) with `py-8 px-4 sm:px-6` padding.

---

## 3. Radii & Elevation Tokens

### Border Radii:
- Buttons & Badges: `rounded-xl` (`12px` / `0.75rem`)
- Cards & Content Blocks: `rounded-2xl` (`16px` / `1rem`) or `rounded-3xl` (`24px` / `1.5rem`)
- Modals & Banners: `rounded-3xl` (`24px` / `1.5rem`)
- Full Pills: `rounded-full` (`9999px`)

### Elevation (Shadows):
- `subtle`: `0 1px 2px 0 rgba(23, 43, 36, 0.05)` (Table rows, inputs)
- `card`: `0 1px 3px 0 rgba(23, 43, 36, 0.08)` (Dashboard cards, action tiles)
- `elevated`: `0 4px 6px -1px rgba(23, 43, 36, 0.08)` (Dropdown menus, sticky headers)
- `modal`: `0 20px 25px -5px rgba(23, 43, 36, 0.1)` (Overlay dialogs, receipt modals)
