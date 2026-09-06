# Enterprise NGO Management Platform — Architecture Blueprint

## 1. Multi-Tenant Database Architecture

All domain entities are strictly partitioned by `organizationId`. Compound unique constraints (e.g. `@@unique([organizationId, slug])` or `@@unique([organizationId, email])`) guarantee multi-tenant namespace isolation without cross-tenant collisions.

### Key Indexes:
- `@@index([organizationId])`: Fast tenant partition pruning
- `@@index([status])`: High-frequency dashboard filtering
- `@@index([createdAt])`: Chronological ledger sorting
- `@@index([donatedAt])`: Financial year tax-exemption filtering (Form 10BE)

---

## 2. Layered Architecture Pattern

```text
Client / UI Components
       ↓
Application Services (Business Rules & Workflows)
       ↓
Repositories / Data Access Layer (BaseRepository<T>)
       ↓
Prisma Client Singleton (Connection Pooling & HMR Protection)
       ↓
PostgreSQL Database
```

---

## 3. Design System & Semantic Tokens

Located in `src/lib/design-tokens.ts`:
- **Colors**: Semantic tokens for Emerald primary, Sky secondary, Amber humanitarian warmth, and Slate neutrals.
- **Typography**: Display font paired with Inter for readability.
- **Spacings & Radii**: Mathematically consistent ratios avoiding arbitrary magic numbers.
- **Elevations**: Subtle elevations with zero harsh glowing drop-shadows.

---

## 4. Statutory NGO Compliance

Integrated models for:
- Section 80G(5)(vi) tax-exemption receipt generation (Form 10BE)
- Section 12A registration verification
- FCRA (Foreign Contribution Regulation Act) fund segregation
- NITI Aayog NGO Darpan unique identification
