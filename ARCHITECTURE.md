# Enterprise NGO Management Platform — Architecture Blueprint

## 1. Current State: Next.js Front End on Mock Data

The site is a Next.js 16 (App Router) port of the original single-page view tree — real routes, per-page SEO metadata, and SSR — but `DatabaseContext` and `AuthContext` still run entirely on the mock dataset in `src/data/mockDatabase.ts`, persisted to `localStorage` per browser. There is no live backend yet.

## 2. Planned Multi-Tenant Database Architecture

The next phase wires each domain (donations, volunteers, campaigns, certificates, etc.) over to MongoDB via Mongoose (`src/lib/mongodb.ts` has the connection singleton), one entity at a time, replacing its slice of the mock data. All domain documents should be scoped by `organizationId` for multi-tenant isolation, with compound indexes mirroring the current per-entity lookups (status filtering, chronological ledger sorting, financial-year tax-exemption filtering for Form 10BE).

---

## 3. Layered Architecture Pattern (target)

```text
Client / UI Components
       ↓
Application Services (Business Rules & Workflows)
       ↓
Mongoose Models (Data Access Layer)
       ↓
Mongoose Connection Singleton (src/lib/mongodb.ts)
       ↓
MongoDB
```

---

## 4. Design System & Semantic Tokens

Located in `src/lib/design-tokens.ts`:
- **Colors**: Semantic tokens for Emerald primary, Sky secondary, Amber humanitarian warmth, and Slate neutrals.
- **Typography**: Display font paired with Inter for readability.
- **Spacings & Radii**: Mathematically consistent ratios avoiding arbitrary magic numbers.
- **Elevations**: Subtle elevations with zero harsh glowing drop-shadows.

---

## 5. Statutory NGO Compliance

Integrated models for:
- Section 80G(5)(vi) tax-exemption receipt generation (Form 10BE)
- Section 12A registration verification
- FCRA (Foreign Contribution Regulation Act) fund segregation
- NITI Aayog NGO Darpan unique identification
