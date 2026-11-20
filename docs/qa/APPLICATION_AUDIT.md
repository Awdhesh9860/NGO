# Complete Application Audit Report — HopeHorizon / Vikas NGO Ecosystem

**Document ID**: `QA-AUDIT-001`  
**Audit Date**: 2026-11-20  
**Scope**: Non-Destructive Full-Stack Codebase, Security, Architecture & Verification Baseline Audit (QA Phase 1)  
**Repository**: `S:\Project\NGO` (`hopehorizon-ngo-platform@0.1.0`)

---

## 1. Verified Repository & Architectural Inventory

All counts below were programmatically verified directly from the workspace filesystem on 2026-11-20 (zero estimates).

| Asset Category | Exact Count | Breakdown & Notes |
| :--- | :---: | :--- |
| **Next.js App Router Pages** | **125** | `68` Public (`src/app/(public)`) · `5` Auth (`src/app/(auth)`) · `52` Dashboard (`1` `/dashboard` + `51` `/dashboard/admin/*`) |
| **API Route Handlers (`route.ts`)** | **139** | `139 / 139` under `/api/v1/*` (`0` legacy non-v1 routes) across 22 API domains |
| **Mongoose Database Models** | **61** | `57` tenant-scoped (`organizationId`) · `4` global/token models (`Organization`, `EmailOTP`, `EmailVerificationToken`, `PasswordResetToken`) |
| **Server Domain Services** | **14** | `accounting`, `admin`, `auth`, `beneficiary`, `budget-grant-compliance`, `campaign`, `donation-payment`, `donor`, `expense-vendor`, `financial-reports`, `membership`, `program`, `project`, `volunteer` |
| **Data Repositories** | **15** | Dedicated repository modules under `src/server/repositories/` |
| **Feature Folders (`src/features/*`)** | **62** | `45` populated feature modules · `17` empty scaffolding directories |
| **Integration Adapters** | **4** | Email (Nodemailer + 11 templates), Payment (Razorpay, Stripe, Manual), Storage (`ManagedStorageProvider` stub), Notification (interface only) |
| **Vitest Test Suites** | **11** | `124 / 124` passing tests in `8.20s` (all unit/mocked/jsdom; 0 live DB/network tests) |
| **Playwright E2E Specs** | **1** | `tests/e2e/navigation.spec.ts` (`11` specs discovered; 0 live browser runs completed inside sandbox) |
| **Documentation Files (`docs/`)** | **55+** | Architecture (10), Design (8), Phase 6 Admin (9), Phase 7 Programs (9), Phase 8 Fundraising (12), Phase 9 Stakeholders (14), Phase 10 Finance (14) |

### 1.1 API Domain Distribution (`139` Route Handlers under `/api/v1/`)

| API Domain | Routes | Auth / Signature Guard | Zod Validation | Rate Limiting |
| :--- | :---: | :---: | :---: | :---: |
| `finance` | 33 | 33 / 33 | 31 / 33 | 0 / 33 |
| `admin` | 17 | 17 / 17 | 16 / 17 | 0 / 17 |
| `auth` | 16 | 9 guarded + 7 public/pre-2FA | 13 / 16 | **0 / 16** |
| `projects` | 10 | 10 / 10 | 10 / 10 | 0 / 10 |
| `beneficiaries` | 8 | 8 / 8 | 8 / 8 | 0 / 8 |
| `volunteers` | 8 | 8 / 8 | 8 / 8 | 0 / 8 |
| `public` | 7 | 0 (intentionally public read/verify) | 0 / 7 | **0 / 7** |
| `membership` | 6 | 6 / 6 | 6 / 6 | 0 / 6 |
| `campaigns` | 4 | 4 / 4 | 4 / 4 | 0 / 4 |
| `payments` | 4 | 4 / 4 | 4 / 4 | **0 / 4** |
| `programs` | 4 | 4 / 4 | 4 / 4 | 0 / 4 |
| `compliance` | 3 | 3 / 3 | 3 / 3 | 0 / 3 |
| `donations` | 3 | 3 / 3 | 2 / 3 | 0 / 3 |
| `donors` | 3 | 3 / 3 | 3 / 3 | 0 / 3 |
| `refunds` | 3 | 3 / 3 | 2 / 3 | 0 / 3 |
| `recurring-donations` | 2 | 2 / 2 | 2 / 2 | 0 / 2 |
| `tasks` | 2 | 2 / 2 | 2 / 2 | 0 / 2 |
| `webhooks` | 2 | 2 / 2 (HMAC signature verified) | 0 / 2 (raw body) | 0 / 2 |
| `fundraising`, `milestones`, `receipts`, `stakeholders` | 4 (1 each) | 4 / 4 | 4 / 4 | 0 / 4 |
| **TOTAL** | **139** | **122 guarded + 16 public + 1 pre-2FA JWT** | **90 / 139 total (10 mutating without Zod)** | **0 / 139** |

---

## 2. 23-Area Enterprise Functional & Technical Audit Matrix

Each of the 23 audit domains was inspected at code level to distinguish **Backend-Backed (MongoDB API)** vs **Mock-Backed (`DatabaseContext` / `localStorage`)** vs **Placeholder / Incomplete**.

| # | Audit Area | Code Implementation Status | Data Backing | Automated Tests | Key Audit Findings & Gaps |
| :-: | :--- | :--- | :--- | :--- | :--- |
| 1 | **Public Website & Storytelling (68 pages)** | Implemented | **Mostly Mock** (`mockDatabase` / `DatabaseContext` in 35+ public views) + partial live `/api/v1/public/*` | `public-website.test.ts` (12), `newsletter.test.ts` (5) | High reliance on static `mockDatabase.ts` (54 files repo-wide); `ImpactTracker.tsx` uses `@ts-nocheck`; legacy `<img>` warnings. |
| 2 | **Navigation & Responsive Layout** | Implemented (Redesigned) | Static typed config + role filtering | `navigation.test.ts` (12), `navigation-dom.test.tsx` (2), `navigation.spec.ts` (11 discovered) | Auto-hide header, mobile drawer, breadcrumbs & keyboard ESC tested in jsdom; **0 live Playwright browser executions**. |
| 3 | **Authentication & Session Security** | Split Architecture (**CRITICAL**) | Backend: MongoDB JWT/Session/TOTP/OTP (`/api/v1/auth/*`) · Frontend: **Mock `AuthContext` (`localStorage`)** | `auth.test.ts` (16) | **P0 Bug**: `(auth)/login/page.tsx` falls back to email-only mock login on error, exposes ungated 13-role Demo Persona Switcher, and never syncs real JWT sessions into `AuthContext`. Zero rate limiting. Hardcoded JWT secret fallback. |
| 4 | **Multi-Tenant Isolation** | Backend Implemented | `57 / 61` models have `organizationId` | Mocked unit checks across Phase 6–10 tests | **No live MongoDB cross-tenant IDOR integration tests**; `resolveTenant` trusts `x-organization-id` header for public tenant resolution (must audit all callers). |
| 5 | **RBAC & Permissions (13 Roles + Custom)** | Partially Wired (**HIGH**) | Static `ROLE_PERMISSIONS` map + `Role` MongoDB collection | `admin.test.ts` (18) | **P0/P1 Gap**: `src/server/authorization/guards.ts` (`requirePermission`) checks ONLY the static `checkRolePermission` map and ignores custom organization `Role` documents in MongoDB! Also `/dashboard/admin/layout.tsx` gates UI via client `localStorage` `AuthContext`. |
| 6 | **Admin Dashboard & Org Management (Phase 6)** | Implemented (17 API routes, 10+ UI pages) | MongoDB API (`/api/v1/admin/*`) | `admin.test.ts` (18) | Last-admin protection & token-hashed invites exist in service; several Phase 6 admin pages have `react-hooks/set-state-in-effect` ESLint errors. |
| 7 | **Program & Project Management (Phase 7)** | Implemented (17 API routes, 7 UI pages) | MongoDB API (`/api/v1/programs`, `/projects`, `/tasks`, `/milestones`) | `program-project.test.ts` (14) | No-self-approval workflow & budget variance logic present; public program/project pages still mix `mockDatabase` fallbacks; document uploads rely on stub storage. |
| 8 | **Campaigns, Donations & Payments (Phase 8)** | Implemented (22 API routes, 8 UI pages) | MongoDB API (`/api/v1/campaigns`, `/donations`, `/payments`, `/webhooks`, `/refunds`, `/receipts`) | `fundraising.test.ts` (18) | Strong integer minor-unit math & timing-safe HMAC verification for Razorpay & Stripe; **zero live sandbox payment/webhook runs**; legacy `DonateModal.tsx` / `DonorPortal.tsx` still write to `DatabaseContext` mock state! |
| 9 | **Volunteers, Members & Beneficiaries (Phase 9)** | Implemented (23 API routes, 9 UI pages) | MongoDB API (`/api/v1/volunteers`, `/membership`, `/beneficiaries`, `/stakeholders`) | `stakeholders.test.ts` (10) | Strong safeguarding design (redacted child listings, restricted `CaseNote`, consent tracking); **legacy `/dashboard` `VolunteerPortal` & `MemberPortal` still use mock `DatabaseContext`**. |
| 10 | **Finance, Accounting & Compliance (Phase 10)** | Implemented (36 API routes, 11 UI pages) | MongoDB API (`/api/v1/finance/*`, `/api/v1/compliance/*`) | `finance.test.ts` (12) | Solid DR=CR double-entry, AES-256-GCM bank crypto, CSV formula escaping; **hardcoded fallback encryption key in `financial-crypto.ts`**, unverified replica-set transactions on real MongoDB. |
| 11 | **Legacy Role Portals (`/dashboard`)** | Legacy Mock State | **Mock `DatabaseContext` + `AuthContext` (`localStorage`)** | 0 dedicated tests | `AdminDashboard.tsx`, `DonorPortal.tsx`, `VolunteerPortal.tsx`, `MemberPortal.tsx`, `StaffPortal.tsx`, `SecurityAuditCenter.tsx` operate on browser `localStorage` mocks instead of live `/api/v1/*` APIs! |
| 12 | **CMS, Media, Events, Staff, Contact, Newsletter Backend** | **Placeholder / Incomplete** | Static `mockDatabase.ts` only | `newsletter.test.ts` (5 — util only) | `12` empty feature directories (`cms`, `media`, `events`, `staff`, `attendance`, `analytics`, `contact`, `documents`, `email`, `newsletter`, `notifications`, `reports`) have **no backend API routes or Mongoose models**. |
| 13 | **File Storage & Document Security** | **Broken / Stub (`CRITICAL`)** | `ManagedStorageProvider` (`src/integrations/storage/local.provider.ts`) | Indirect MIME unit checks | `uploadFile()` **never persists bytes** to disk/cloud; `deleteFile()` is a no-op; `/api/v1/storage/files` download route **does not exist (404)**; uses hardcoded `'dev-storage-signing-key'` fallback! |
| 14 | **Email & Notifications** | Adapter Implemented (Simulated) | Nodemailer SMTP + 11 HTML templates | Mocked in tests | Logs simulated emails locally because no SMTP env vars exist; `notification.adapter.ts` is interface-only (no push/SMS/in-app DB collection). |
| 15 | **Database Layer & Connection Pooling** | Implemented (`61` models) | `src/lib/mongodb.ts` + `src/server/database/transactions.ts` | 0 live MongoDB tests | **Bug in `src/lib/mongodb.ts:22-24`**: caches rejected connection promise forever on transient startup failure; lacks `maxPoolSize`/`serverSelectionTimeoutMS`. Replica-set transactions untested against live MongoDB. |
| 16 | **API Validation, Error Handling & Envelopes** | Mostly Implemented | Zod + `handleRouteError` (`src/server/errors/index.ts`) | Partial unit coverage | `10` mutating routes lack Zod schemas (including `two-factor/login`, `finance/income`, `refunds/[id]`); **`handleRouteError` leaks raw `error.message` on HTTP 500** in production; Mongo `CastError`/`11000` not mapped to `400`/`409`. |
| 17 | **HTTP Security, Middleware & Rate Limiting** | **Missing (`CRITICAL`)** | `next.config.ts` (no headers), no `middleware.ts`/`proxy.ts` | 0 tests | Zero HTTP security headers (`CSP`, `HSTS`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`); **0 / 139 routes rate-limited**; no CSRF origin validation middleware. |
| 18 | **Secrets & Configuration Hygiene** | **Vulnerable (`CRITICAL`)** | `.env.example`, `environment.ts`, `firebase-applet-config.json` | 0 tests | Committed `firebase-applet-config.json` with real Firebase API key & OAuth Client ID; hardcoded dev secret fallbacks in `jwt.ts`, `financial-crypto.ts`, `local.provider.ts`, `environment.ts` do not fail closed in production; `.env.example` missing 5 Phase 8–10 variables. |
| 19 | **Frontend Code Quality (TS & ESLint)** | **Degraded on Legacy Files** | TypeScript 5 + ESLint 9 (`eslint-config-next`) | Baseline run executed | `tsc --noEmit` = 0 errors (1 `@ts-nocheck` in `ImpactTracker.tsx`); **full-repo `npm run lint` FAILS with 116 errors & 418 warnings**, including 2 **runtime React Rules-of-Hooks violations** (`Checkbox.tsx`, `Switch.tsx`) and 1 temporal-dead-zone bug (`GoogleSheetsHub.tsx`). |
| 20 | **SEO, Sitemap, Robots & JSON-LD** | Implemented | `src/app/sitemap.ts`, `robots.ts`, `JsonLd.tsx`, `layout.tsx` | `public-website.test.ts` | `sitemap.ts` reads static `mockDatabase.ts` (not live MongoDB campaigns/programs/projects); `dangerouslySetInnerHTML` used in 4 places for `JSON.stringify` JSON-LD without escaping `</script>` (`\u003c`). |
| 21 | **Accessibility (WCAG 2.2 AA)** | Partially Verified | `@axe-core/playwright` installed | 2 jsdom ARIA tests + 11 unexecuted Playwright specs | Keyboard/ARIA attributes implemented in Navigation & Radix UI primitives; **zero live browser `axe-core` audit runs** across pages/forms/dashboards. |
| 22 | **Performance & Core Web Vitals** | Unverified | `@vercel/analytics`, `@vercel/speed-insights` installed | 0 benchmarks | Many public pages use raw `<img>` tags (ESLint warnings); zero Lighthouse, bundle analyzer, or load tests run; `next build` unverified. |
| 23 | **CI/CD & Production Build Readiness** | **Incomplete (`HIGH`)** | `.github/workflows/ci.yml` | N/A | CI workflow runs **only `npm run test:run`** — completely missing `tsc --noEmit`, `npm run lint`, `npm run build`, `npm audit`, and Playwright E2E! Production build has never been verified cleanly. |

---

## 3. Exact Static & Automated Verification Baseline (As of 2026-11-20)

| Check Command | Exact Result | Verified Details |
| :--- | :---: | :--- |
| `npx tsc --noEmit` | **PASS (Exit 0)** | `0` TypeScript errors — **caveat**: `src/components/public/ImpactTracker.tsx:1` bypasses typechecking with `// @ts-nocheck`. |
| `npm run lint` | **FAIL (Exit 1)** | **534 problems (`116` errors, `418` warnings)**. Errors: `54` `react/no-unescaped-entities`, `32` `@typescript-eslint/no-explicit-any`, `23` `react-hooks/set-state-in-effect`, `2` `react-hooks/rules-of-hooks` (`Checkbox.tsx:13`, `Switch.tsx:27`), `2` `@typescript-eslint/no-unnecessary-type-constraint` (`d3.d.ts`), `1` `@typescript-eslint/no-empty-object-type`, `1` `@typescript-eslint/ban-ts-comment` (`ImpactTracker.tsx`), `1` use-before-declaration (`GoogleSheetsHub.tsx:127`). |
| `npm run test:run` | **PASS (Exit 0)** | **11 / 11 Vitest suites · 124 / 124 tests passing** in `8.20s` (all mocked/jsdom). Code coverage plugin (`@vitest/coverage-v8`) is **not installed**. |
| `npx playwright test --list` | **DISCOVERED ONLY** | **11 specs** in `tests/e2e/navigation.spec.ts` — **0 live browser executions completed** (sandbox isolated from host `localhost:3000`; host `next dev` holds `.next/dev/lock`). |
| `npm run build` | **NOT VERIFIED** | Fails inside Windows sandbox due to Next.js 16 Turbopack PostCSS child-process IPC panic; requires host terminal or Linux CI verification. |
| Live MongoDB / Razorpay / Stripe / SMTP | **NOT VERIFIED** | No `.env` or `.env.local` exists in workspace; zero live database, payment gateway, or SMTP integration runs have ever been executed. |

---

## 4. Confirmed Real Codebase Defects Summary (See `RISK_REGISTER.md` for Full Details)

1. **`QA-BUG-001` (Critical)**: `src/app/(auth)/login/page.tsx` passwordless mock login fallback + ungated 13-role Demo Persona Switcher + broken sync between real JWT auth and client `AuthContext`.
2. **`QA-BUG-002` (Critical)**: `src/integrations/storage/local.provider.ts` never persists uploaded files & `/api/v1/storage/files` download route does not exist (404).
3. **`QA-BUG-003` (Critical)**: Committed `firebase-applet-config.json` containing Firebase API key & OAuth Client ID + non-fail-closed dev fallback secrets in `jwt.ts`, `financial-crypto.ts`, `local.provider.ts`, `environment.ts`.
4. **`QA-BUG-004` (Critical)**: Custom MongoDB `Role` permissions ignored by `src/server/authorization/guards.ts` (`requirePermission` checks static map only).
5. **`QA-BUG-005` (Critical)**: Zero API rate limiting (`0 / 139` routes) + missing HTTP security headers (`next.config.ts`) + no Next.js middleware (`src/middleware.ts`).
6. **`QA-BUG-006` (High)**: Runtime React Rules-of-Hooks bugs (`React.useId` called conditionally) in `src/components/ui/Checkbox.tsx:13` and `src/components/ui/Switch.tsx:27`, plus temporal-dead-zone bug in `src/components/sheets/GoogleSheetsHub.tsx:127`.
7. **`QA-BUG-007` (High)**: Split-brain persistence — 54 files (including `/dashboard` portals and public modals) still read/write browser `localStorage` `mockDatabase.ts` instead of live `/api/v1/*` MongoDB APIs.
8. **`QA-BUG-008` (High)**: `src/lib/mongodb.ts:22-24` permanently caches rejected `mongoose.connect()` promises on transient startup failure.
9. **`QA-BUG-009` (High)**: `src/server/errors/index.ts:30-34` leaks raw internal error messages in production HTTP `500` responses and does not normalize Mongoose `CastError`/`11000` errors.
10. **`QA-BUG-010` (High)**: Full-repository ESLint fails (`116` errors, `418` warnings), `ImpactTracker.tsx` uses `@ts-nocheck`, and `.github/workflows/ci.yml` skips lint, typecheck, build, and audit.
11. **`QA-BUG-011` (Medium)**: `src/components/common/JsonLd.tsx` and `src/app/layout.tsx` inject raw `JSON.stringify(...)` via `dangerouslySetInnerHTML` without escaping `<` (`\u003c`), and `sitemap.ts` reads static `mockDatabase` instead of live DB slugs.
12. **`QA-BUG-012` (Medium)**: `10` mutating API routes lack Zod request validation (notably `two-factor/login`, `finance/income`, `refunds/[id]`, `donations/[id]/receipt`), and `.env.example` is missing 5 Phase 8–10 secrets/URLs.
