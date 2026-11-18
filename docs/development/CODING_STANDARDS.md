# Enterprise NGO Platform — Coding Standards & Style Guide
**Platform**: HopeHorizon / Vikas NGO Ecosystem  
**Quality Rule**: Clean Code, Strict Typing & Predictable Architecture  

---

## 1. Naming Conventions

| Artifact | Convention | Example |
| :--- | :--- | :--- |
| **Components** | `PascalCase.tsx` | `DonationForm.tsx`, `ReceiptModal.tsx` |
| **Custom Hooks** | `camelCase.ts` (prefixed with `use`) | `useDonationFilters.ts`, `useAuth.ts` |
| **Domain Services** | `kebab-case.service.ts` | `donation.service.ts`, `auth.service.ts` |
| **Repositories** | `kebab-case.repository.ts` | `donation.repository.ts` |
| **Zod Schemas** | `kebab-case.schema.ts` | `newsletter.schema.ts`, `donation.schema.ts` |
| **Types / Interfaces** | `kebab-case.types.ts` | `donation.types.ts`, `volunteer.types.ts` |
| **Constants** | `kebab-case.constants.ts` | `donation.constants.ts` |
| **Utility Functions** | `kebab-case.utils.ts` | `formatters.utils.ts` |
| **App Router Pages** | `page.tsx` | `src/app/(public)/donate/page.tsx` |
| **App Router Layouts** | `layout.tsx` | `src/app/dashboard/layout.tsx` |
| **Route Handlers** | `route.ts` | `src/app/api/v1/donations/route.ts` |
| **Unit Tests** | `*.test.ts` / `*.test.tsx` | `newsletter.test.ts`, `utils.test.ts` |

---

## 2. TypeScript & Strict Typing Rules

1. **No `any` Types**: The use of `any` is strictly prohibited in production code. Use `unknown`, generic parameters, or explicit interfaces.
2. **Strict Null Checks**: Always handle `null` and `undefined` using optional chaining (`?.`) and nullish coalescing (`??`).
3. **Zod Inference**: Derive TypeScript types directly from Zod validation schemas to maintain a single source of truth:
   ```typescript
   export const DonationSchema = z.object({ ... });
   export type DonationInput = z.infer<typeof DonationSchema>;
   ```

---

## 3. Clean Code & Component Design Rules

1. **Maximum File Size**: Keep components under 300 lines of code. Extract complex sub-trees into co-located child components.
2. **Single Responsibility**: Each function or hook must execute exactly one clear task.
3. **Accessibility**: All interactive elements must have visible focus rings, proper `aria-label` attributes, and full keyboard navigability.
4. **Structured Logging**: Use `logger.info()`, `logger.warn()`, and `logger.error()` from `@/server/logging` instead of `console.log`.
