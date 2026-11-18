# Enterprise NGO Design System — Accessibility Guidelines
**Platform**: HopeHorizon / Vikas NGO Ecosystem  
**Target Standard**: WCAG 2.2 Level AA Compliance  

---

## 1. Core Accessibility Principles (POUR)

The platform is designed to be **Perceivable, Operable, Understandable, and Robust**:

1. **Sufficient Contrast**:
   - All body text achieves at least **4.5:1** contrast ratio against its background.
   - Large headings (24px+) achieve at least **3.0:1** contrast ratio.
   - UI component boundaries and focus rings achieve at least **3.0:1** contrast ratio.
2. **Keyboard Navigability**:
   - Every interactive element (buttons, links, inputs, tabs, dropdowns, modal dismiss triggers) is reachable and operable via the `Tab`, `Enter`, `Space`, and `Escape` keys.
3. **Visible Focus Rings**:
   - Focus states use `focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2` to guarantee high visibility across both light and dark modes.

---

## 2. ARIA & Screen Reader Standards

- **Icon Buttons**: Must always declare `aria-label`:
  ```tsx
  <IconButton aria-label="Close dialog window">
    <X className="h-4 w-4" />
  </IconButton>
  ```
- **Modal Dialogs**: Built with Radix UI `Dialog.Root`, enforcing `aria-modal="true"`, focus trapping within the dialog, and automatic return of focus to the trigger upon closing.
- **Form Error States**: Linked directly to input fields:
  ```tsx
  <Input
    id="donor-pan"
    aria-invalid={!!error}
    aria-describedby={error ? "donor-pan-error" : undefined}
  />
  {error && <p id="donor-pan-error" role="alert" className="text-xs text-rose-600">{error}</p>}
  ```
- **Automated Testing**: Continuous automated regression tests using `@axe-core/playwright` in end-to-end CI suites.
