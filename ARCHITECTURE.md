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

## 6. Master Architecture Documentation Suite

For exhaustive blueprints, schemas, and specifications created during **Phase 1 (Project Audit & Master Architecture Planning)**, consult the dedicated documentation suite in [`docs/`](file:///s:/Project/NGO/docs/README.md):

1. **[Project Audit Report](file:///s:/Project/NGO/docs/PROJECT_AUDIT.md)**: Current state analysis, code asset inventory, runtime dependencies, and implementation status matrix.
2. **[Product Requirements Document (PRD)](file:///s:/Project/NGO/docs/PRODUCT_REQUIREMENTS.md)**: Personas, functional/non-functional specs, and business requirements.
3. **[Master Technical Architecture](file:///s:/Project/NGO/docs/MASTER_ARCHITECTURE.md)**: Clean Layered Architecture, Next.js 16 App Router, service boundaries, and request flows.
4. **[User Roles & Permissions](file:///s:/Project/NGO/docs/USER_ROLES_AND_PERMISSIONS.md)**: 13-role system, 36 granular permissions, and server-side enforcement guards.
5. **[Master Module Inventory](file:///s:/Project/NGO/docs/MODULE_INVENTORY.md)**: Catalog of 24+ public routes, 10 dashboard tabs, and 4 dedicated user portals.
6. **[Database Architecture](file:///s:/Project/NGO/docs/DATABASE_ARCHITECTURE.md)**: Mongoose schemas, ERD diagrams, compound indexing, and multi-tenant scoping.
7. **[Authentication & Email Architecture](file:///s:/Project/NGO/docs/AUTHENTICATION_AND_EMAIL_ARCHITECTURE.md)**: JWT sessions, TOTP 2FA, session revocation, and branded transactional email templates.
8. **[API Architecture](file:///s:/Project/NGO/docs/API_ARCHITECTURE.md)**: Next.js 16 Route Handlers under `/api/v1/*`, middleware pipeline, and endpoint catalog.
9. **[Multi-Tenant Architecture](file:///s:/Project/NGO/docs/MULTI_TENANT_ARCHITECTURE.md)**: Tenant resolution, logical isolation, Mongoose query plugins, and tenant customization.
10. **[16-Phase Development Roadmap](file:///s:/Project/NGO/docs/DEVELOPMENT_ROADMAP.md)**: Dependency-aware implementation plan from Phase 1 through Phase 16.

