# Stakeholder Module Development Guidelines

**Platform**: HopeHorizon / Vikas NGO Ecosystem  
**Phase**: 09 — Volunteer, Member & Beneficiary Management  
**Applicable Squads**: Volunteer Ops Squad · Membership Squad · Beneficiary & Safeguarding Squad

---

## 1. Hybrid Feature-Based Module Ownership

Phase 09 follows the enterprise hybrid feature-based architecture so multiple developers and squads can evolve Volunteer, Member, and Beneficiary workflows independently without circular dependencies.

| Squad / Domain | Feature Roots (`src/features/*`) | Server Services | API Prefix |
|----------------|----------------------------------|-----------------|------------|
| **Volunteer Operations** | `volunteers`, `volunteer-applications`, `volunteer-assignments`, `volunteer-attendance`, `volunteer-certificates` | `src/server/services/volunteer.service.ts` | `/api/v1/volunteers/*`, `/api/v1/public/certificates/[code]` |
| **Membership Operations** | `membership`, `membership-plans`, `membership-applications`, `membership-renewals`, `members` | `src/server/services/membership.service.ts` | `/api/v1/membership/*` |
| **Beneficiaries & Safeguarding** | `beneficiaries`, `beneficiary-enrollment`, `beneficiary-assistance`, `beneficiary-cases`, `consent-management`, `safeguarding` | `src/server/services/beneficiary.service.ts` | `/api/v1/beneficiaries/*` |
| **Shared Persistence & Analytics** | `src/server/repositories/stakeholder.repository.ts` | All three services | `/api/v1/stakeholders/analytics` |

---

## 2. Dependency Boundaries

1. **No Cross-Feature UI Imports**: Components in `src/features/volunteers/` must not directly import internal files of `src/features/beneficiaries/` or `src/features/membership/`.
2. **Client vs Server Separation**:
   - Client code (`src/features/*/components/*`, `src/features/*/*-api.service.ts`, `src/app/dashboard/admin/*`) must **never** import Mongoose models or `src/server/*` services.
   - Public pages (`src/components/public/*`) interact exclusively through versioned `/api/v1/*` endpoints.
3. **Single Persistence Gateway**: All 17 Phase 09 Mongoose models live in `src/server/database/models/` and are accessed through `stakeholderRepository` with mandatory `organizationId` scoping.
4. **Preserve Legacy Barrels**: `src/features/volunteers/index.ts` preserves legacy Phase 5 exports (`Volunteer`, `VolunteerView`, `VolunteerPortal`) alongside Phase 09 exports.

---

## 3. Non-Negotiable Domain Invariants for PR Reviews

Every pull request modifying stakeholder modules must preserve these invariants:

- **Volunteer Integrity**:
  - Never auto-approve public volunteer applications or auto-verify profiles.
  - Never record GPS/location surveillance in attendance entries.
  - Always derive certificate `totalVerifiedHours` strictly from `APPROVED` attendance entries — never accept client-fabricated hours.
  - Public `/api/v1/public/certificates/[code]` must never return volunteer phone, email, address, or verification documents.
- **Membership Integrity**:
  - Store all plan fees as integer minor units (`feeMinorUnits`) — zero hardcoded prices.
  - Never treat membership fees as donations or attach 80G tax-exemption claims to membership plans.
  - Require verified fee confirmation (`paymentStatus === 'PAID'`) before activating paid renewals.
- **Beneficiary & Safeguarding Integrity**:
  - Never auto-grant `beneficiaries.sensitive.view`, `beneficiaries.documents.view`, `beneficiaries.export`, `safeguarding.manage`, or `privacy.reports.view` to `ADMIN` or `MANAGER`.
  - Never return sensitive profile fields, guardian info, or document refs in `toListBeneficiaryDTO`.
  - Never bundle `PHOTOGRAPHY_MEDIA` or `PUBLIC_STORYTELLING` into intake consent, and never cancel assistance when optional consent is withdrawn.
  - Never treat `Donation` or `ProjectBudget` records as proof of `AssistanceRecord` delivery.

---

## 4. React 19 & Local Verification Checklist

- **React 19 Effect Hygiene**: Avoid calling synchronous `setState` directly inside `useEffect` (triggers `react-hooks/set-state-in-effect`). Schedule async loaders via `Promise.resolve().then(() => { if (active) void loadData(); })`.
- **Verification Commands**:
  ```bash
  npx tsc --noEmit
  npm run test:run
  npx eslint src/features/volunteers src/features/membership src/features/beneficiaries src/server/services/volunteer.service.ts src/server/services/membership.service.ts src/server/services/beneficiary.service.ts
  npm run build
  ```
