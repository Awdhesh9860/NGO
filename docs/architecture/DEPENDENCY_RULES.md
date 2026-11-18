# Enterprise NGO Platform — Dependency & Import Rules
**Platform**: HopeHorizon / Vikas NGO Ecosystem  
**Goal**: Zero Circular Dependencies, Strict Layer Separation & Anti-Corruption Boundaries  

---

## 1. Permitted Dependency Matrix

```text
┌─────────────────┐
│    App Layer    │ ───► Can import Features, Components, Shared, Server (Routes only)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Feature Layer  │ ───► Can import Shared, Components, Config, Other Feature (index.ts only)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Server Layer   │ ───► Can import Integrations, Shared, Database (Server-only context)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Shared Layer   │ ───► Self-contained; cannot import App, Features, or Server
└─────────────────┘
```

---

## 2. Strict Architectural Invariants

### 1. The Client/Server Wall:
- Components marked with `'use client'` must **never** import from `src/server/*`, `src/lib/mongodb.ts`, or any file referencing database models, secrets, or server APIs.
- Violations will trigger Next.js compile errors and ESLint rule failures.

### 2. Feature Encapsulation Rule:
- Cross-feature imports must target the feature root:
  - ✅ `import { DonateModal } from '@/features/donations';`
  - ❌ `import { DonateModal } from '@/features/donations/components/DonateModal';`
  - ❌ `import { formatCard } from '@/features/donations/internal/card';`

### 3. Thin App Shell Rule:
- Files under `src/app/` (`page.tsx`, `layout.tsx`, `route.ts`) must never contain inline business calculations, SQL/MongoDB queries, or raw API integrations. They simply mount feature components or call feature services.

### 4. Zero Circular Dependencies:
- Module A must never import Module B if Module B directly or indirectly imports Module A.
- Circular dependencies are prevented by placing shared contracts and interfaces in `src/shared/`.

---

## 3. TypeScript Path Aliases

Configured in `tsconfig.json`:
- `@/*` → `./src/*`
- `@/features/*` → `./src/features/*`
- `@/components/*` → `./src/components/*`
- `@/server/*` → `./src/server/*`
- `@/integrations/*` → `./src/integrations/*`
- `@/shared/*` → `./src/shared/*`
- `@/config/*` → `./src/config/*`
