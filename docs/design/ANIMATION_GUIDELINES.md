# Enterprise NGO Design System — Animation & Motion Guidelines
**Platform**: HopeHorizon / Vikas NGO Ecosystem  
**Motion Library**: `motion/react` + Tailwind CSS Transitions  

---

## 1. Motion Philosophy

Animations in the NGO platform exist to **guide attention, provide tactile feedback, and reinforce trust**:
- **Subtle & Purposeful**: Animations must never delay interaction or distract from mission-critical content.
- **Fast Durations**: Micro-interactions last between `150ms` and `250ms`. Complex page transitions never exceed `350ms`.
- **No Heavy Loops**: Avoid distracting continuous floating animations or heavy background particles.

---

## 2. Standard Motion Timing & Curves

| Token | Duration | Cubic Bezier Curve | Usage |
| :--- | :--- | :--- | :--- |
| **Fast** | `150ms` | `cubic-bezier(0.4, 0, 0.2, 1)` | Button press feedback, icon toggles, checkbox checks |
| **Normal** | `250ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Dropdown menus, modal popovers, accordion expansions |
| **Smooth Reveal**| `350ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Public section reveals, page tab transitions |

---

## 3. Reduced Motion Support (`prefers-reduced-motion`)

All motion components must respect user operating system preferences:

```tsx
// Using CSS media query
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

// In Motion components
import { motion, useReducedMotion } from 'motion/react';

export const FadeInCard = ({ children }) => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
};
```
