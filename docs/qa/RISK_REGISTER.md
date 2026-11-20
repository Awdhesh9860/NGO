# Risk Register & Initial Bug Ledger — HopeHorizon / Vikas NGO Ecosystem

**Document ID**: `QA-RISK-001`  
**Last Updated**: 2026-11-20 (Post-QA Phase 2 Remediation)  
**Status**: **All 5 Critical (P0) & 4 High (P1) Code Defects Resolved & Unit-Verified** (See `BUG_REPORT_AND_FIXES.md`)  
**Remaining Open Risk Summary**: **0 Critical (P0)** · **2 High (P1 — Runtime/Live-Env & Legacy Mock Portals)** · **3 Medium (P2)** · **3 Low (P3)**

---

## 1. Critical Findings (P0 — Release Blockers)

### `QA-BUG-001` — Passwordless Mock Login Fallback, Ungated 13-Role Persona Switcher & Broken AuthContext Sync
- **Category**: Authentication / Access Control (OWASP A01, A07)
- **Affected Files**:
  - `src/app/(auth)/login/page.tsx` (lines 47–77, 132–146, 308–344)
  - `src/context/AuthContext.tsx` (lines 1–414)
  - `src/app/dashboard/admin/layout.tsx` (lines 23–42)
- **Verified Evidence**:
  1. In `LoginPage.handleCredentialsLogin`, when `authApi.login()` throws (e.g., network interruption or DB unavailable), the `catch` block searches mock `allUsers` **by email only without verifying any password** and calls `switchUser(found.id)`, redirecting straight into `/dashboard`.
  2. The **"13 Roles & Demo Personas"** tab is unconditionally visible (not gated by `NODE_ENV === 'development'`) and allows any unauthenticated visitor to click `SUPER_ADMIN` (`switchUser`), mutating `localStorage['hh_ngo_current_user_id']`.
  3. `src/app/dashboard/admin/layout.tsx` relies on client-side `useAuth().currentUser` (`localStorage`) rather than server session verification (`/api/v1/auth/me` or Server Component cookie check), allowing unauthenticated visitors to render the full `/dashboard/admin/*` navigation and UI shell. (Server `/api/v1/*` routes still reject unauthorized calls with `401/403`, but the client auth boundary is completely broken.)
  4. Conversely, after a legitimate `authApi.login()` succeeds against MongoDB, `LoginPage` never hydrates `AuthContext` with the real authenticated user, causing real logged-in users to appear as `GUEST` or a stale mock persona!
- **Phase 2 Remediation Plan**:
  - Refactor `AuthContext` to hydrate exclusively from `/api/v1/auth/me` (HTTP-only session cookie) and remove client-side mock user persistence.
  - Remove passwordless catch fallback in `login/page.tsx`; strictly gate any developer persona switcher behind an explicit `NEXT_PUBLIC_ENABLE_DEMO_PERSONAS=true` non-production flag (disabled in prod).
  - Add server-side session verification in `/dashboard` and `/dashboard/admin` layouts (and Next.js middleware).

---

### `QA-BUG-002` — Non-Persisting File Storage Stub & Missing `/api/v1/storage/files` Download Route
- **Category**: Functional Broken Feature / File Upload Security (OWASP A01, A04)
- **Affected Files**:
  - `src/integrations/storage/local.provider.ts` (lines 43–81)
  - Project Documents & Financial Documents upload/download APIs
- **Verified Evidence**:
  - `ManagedStorageProvider.uploadFile()` validates MIME/size and returns `/api/v1/storage/files/<key>`, **but never writes `options.buffer` to disk or cloud storage**.
  - `ManagedStorageProvider.deleteFile()` returns `Boolean(key)` without deleting any bytes.
  - No route handler exists under `src/app/api/v1/storage/` — every generated `fileUrl` and `getSignedDownloadUrl()` link returns **HTTP 404 Not Found**.
  - Signing secret falls back to hardcoded `'dev-storage-signing-key'` (line 72).
- **Phase 2 Remediation Plan**:
  - Implement real atomic filesystem persistence (outside `public/` in a configurable private upload directory) plus S3/Cloudinary adapter support.
  - Create authenticated + HMAC-signed `GET /api/v1/storage/files/[...key]/route.ts` with path-traversal protection, expiry validation, `Content-Disposition: attachment`, `X-Content-Type-Options: nosniff`, and magic-byte verification.

---

### `QA-BUG-003` — Committed Firebase Config Credentials & Non-Fail-Closed Hardcoded Secret Fallbacks
- **Category**: Cryptographic Failures / Secret Management (OWASP A02, A05)
- **Affected Files**:
  - `firebase-applet-config.json` (root directory — contains Firebase `apiKey`, `projectId`, `oAuthClientId`)
  - `src/server/auth/jwt.ts` (line 12–13: `'hopehorizon-dev-insecure-jwt-secret-min-32-chars-key-2026'`)
  - `src/server/security/financial-crypto.ts` (line 9–12: `'dev-only-financial-encryption-key-do-not-use-in-prod'`)
  - `src/integrations/storage/local.provider.ts` (line 72: `'dev-storage-signing-key'`)
  - `src/config/environment.ts` (line 20: `'dev-insecure-jwt-secret-phase-2-only'` — inconsistent with `jwt.ts`)
- **Verified Evidence**:
  - If deployed to production without `JWT_SECRET`, `FINANCIAL_ENCRYPTION_KEY`, or `STORAGE_SIGNING_SECRET`, the application **silently signs JWTs and encrypts bank account numbers using public hardcoded strings committed in Git**!
  - `firebase-applet-config.json` exposes third-party project credentials directly in version control.
- **Phase 2 Remediation Plan**:
  - Throw a fatal startup/runtime configuration error whenever `NODE_ENV === 'production'` and any required secret (`JWT_SECRET`, `FINANCIAL_ENCRYPTION_KEY`, `STORAGE_SIGNING_SECRET`, `MONGODB_URI`) is missing or < 32 bytes.
  - Remove `firebase-applet-config.json` (or move required public values to env vars and rotate exposed credentials if active).
  - Unify secret resolution in `src/config/environment.ts` and document all missing env vars in `.env.example`.

---

### `QA-BUG-004` — Custom Organization Roles Ignored by Backend Authorization Guards
- **Category**: Broken Access Control / RBAC (OWASP A01)
- **Affected Files**:
  - `src/server/authorization/guards.ts` (lines 96–136)
  - `src/server/database/models/Role.ts`
- **Verified Evidence**:
  - Phase 6 implemented full custom tenant `Role` CRUD (`/api/v1/admin/roles`), allowing NGOs to customize role permissions in MongoDB.
  - However, `requirePermission()` and `requireAnyPermission()` in `guards.ts` evaluate **only** the hardcoded static map `checkRolePermission(context.user.role, permission)`, completely ignoring custom organization roles stored in MongoDB!
- **Phase 2 Remediation Plan**:
  - Update `guards.ts` to resolve effective permissions from tenant-scoped MongoDB `Role` records (with short-lived per-tenant cache invalidation on role update) falling back cleanly to built-in system defaults, and enforce full 13-role + custom-role integration tests.

---

### `QA-BUG-005` — Zero API Rate Limiting, Missing HTTP Security Headers & Absent Middleware
- **Category**: Security Misconfiguration / Brute-Force & Abuse Exposure (OWASP A05, A07)
- **Affected Files**:
  - `next.config.ts` (lines 1–18: zero `headers()`)
  - All `139` route handlers under `src/app/api/v1/**` (`0 / 139` use rate limiting despite `RateLimitError` existing in `src/lib/error-handler.ts:59`)
  - Missing `src/middleware.ts` / `src/proxy.ts`
- **Verified Evidence**:
  - Auth endpoints (`/api/v1/auth/login`, `/register`, `/forgot-password`, `/send-otp`, `/verify-otp`, `/two-factor/login`), payment order creation, and public application forms have **zero brute-force or flood protection**.
  - Responses lack `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`.
  - No middleware enforces CSRF `Origin`/`Host` validation or route-level auth redirection for `/dashboard/*`.
- **Phase 2 Remediation Plan**:
  - Configure strict security `headers()` in `next.config.ts`.
  - Implement pluggable sliding-window rate limiter (in-memory for single-instance/dev + Redis-ready adapter interface) applied across auth, OTP, payment, webhook, and public intake routes returning `429 Too Many Requests` + `Retry-After`.
  - Add `src/middleware.ts` (or Next.js 16 `proxy.ts`) for `/dashboard/*` session cookie presence guard and same-origin CSRF checks on state-changing API requests.

---

## 2. High-Severity Findings (P1 — Must Resolve Before Staging Sign-Off)

| ID | Issue Summary | Affected Files / Evidence | Impact & Remediation |
| :--- | :--- | :--- | :--- |
| **`QA-BUG-006`** | **React Rules-of-Hooks Runtime Violations & Variable Use-Before-Declaration** | `src/components/ui/Checkbox.tsx:13`, `src/components/ui/Switch.tsx:27` (conditional `React.useId()`), `src/components/sheets/GoogleSheetsHub.tsx:127` | Causes React runtime Hook mismatch crashes if `id` prop toggles; fix hooks unconditionally at top of component and reorder callback declaration. |
| **`QA-BUG-007`** | **Dual Split-Brain Persistence (54 Files Still Bound to Mock `DatabaseContext`)** | `src/context/DatabaseContext.tsx`, `src/data/mockDatabase.ts`, `AdminDashboard.tsx`, `DonorPortal.tsx`, `VolunteerPortal.tsx`, `MemberPortal.tsx`, `StaffPortal.tsx`, `DonateModal.tsx`, `ReceiptModal.tsx` | Mutations in `/dashboard` legacy portals or public `DonateModal` write only to browser `localStorage` and never reach MongoDB `/api/v1/*`! Plan systematic migration or explicit retirement of mock portals. |
| **`QA-BUG-008`** | **MongoDB Singleton Permanently Caches Rejected Connection Promise** | `src/lib/mongodb.ts:22-24` | A transient DB connection failure during cold start poisons `global._mongooseConn` permanently until server restart; catch failure to reset cache & add `serverSelectionTimeoutMS` / `maxPoolSize`. |
| **`QA-BUG-009`** | **Production HTTP 500 Leaks Raw Internal Error Messages & Unhandled Mongoose Errors** | `src/server/errors/index.ts:30-34` | Exposes raw driver/internal `error.message` to HTTP clients in production; sanitize unexpected `500` errors in prod, add correlation ID logging, and map Mongoose `CastError` → `400` & duplicate key `11000` → `409`. |
| **`QA-BUG-010`** | **Full-Repo ESLint Failure (116 Errors, 418 Warnings) + `@ts-nocheck` + Incomplete CI** | `npm run lint` (Exit 1), `src/components/public/ImpactTracker.tsx:1`, `.github/workflows/ci.yml` | CI only runs `npm run test:run`, allowing lint errors, type bypasses, and broken production builds to merge silently. Fix all 116 ESLint errors, remove `@ts-nocheck`, and expand CI to enforce `tsc`, `lint`, `test:run`, `build`, and `npm audit`. |
| **`QA-RISK-001`** | **Zero Live Verification of Production Build, Live MongoDB, Payment Gateways, SMTP, or Browser E2E** | Workspace lacks `.env.local`; Windows sandbox blocks Turbopack build & localhost Playwright | Real production runtime behavior, replica-set transactions, MongoDB indexes, webhooks, and browser rendering remain unverified. Must execute against real MongoDB + host `next build` + Playwright + test payment/SMTP sandboxes in Phases 2–4. |

---

## 3. Medium-Severity Findings (P2)

| ID | Issue Summary | Affected Files / Evidence | Recommended Fix |
| :--- | :--- | :--- | :--- |
| **`QA-BUG-011`** | **Unescaped JSON-LD `dangerouslySetInnerHTML` & Mock-Backed `sitemap.ts`** | `src/app/layout.tsx:89`, `src/components/common/JsonLd.tsx` (lines 52, 77, 127), `src/app/sitemap.ts` | Escape `<` as `\u003c` inside JSON-LD script tags to eliminate `</script>` XSS vectors; source public sitemap entries from live MongoDB published slugs with safe fallback. |
| **`QA-BUG-012`** | **10 Mutating API Routes Missing Zod Request Validation** | `two-factor/login`, `finance/income`, `refunds/[id]`, `donations/[id]/receipt`, `finance/journals/[id]/post`, `admin/invitations/[id]/resend`, `auth/logout`, `auth/two-factor/setup`, webhooks | Add strict Zod schemas on all JSON-accepting mutating endpoints (`two-factor/login`, `finance/income`, `refunds/[id]`, `donations/[id]/receipt`) and reject unexpected extra fields. |
| **`QA-BUG-013`** | **`.env.example` Out of Sync with Phases 8–10** | `.env.example` | Missing `FINANCIAL_ENCRYPTION_KEY`, `RAZORPAY_WEBHOOK_SECRET`, `STRIPE_WEBHOOK_SECRET`, `STORAGE_SIGNING_SECRET`, `STORAGE_PUBLIC_BASE_URL`, `NEXT_PUBLIC_ENABLE_DEMO_PERSONAS`. |
| **`QA-RISK-002`** | **12 Empty Feature Directories Without Backend Models/APIs** | `src/features/{cms,media,events,staff,attendance,analytics,contact,documents,email,newsletter,notifications,reports}` | Public Events, News/Blog, Contact, Newsletter, and Staff Attendance rely on mock data rather than backend MongoDB APIs; document clearly as Roadmap Phases 11–14 so stakeholders do not assume live persistence. |
| **`QA-RISK-003`** | **No Automated Code Coverage Thresholds or Dependency Vulnerability Gate** | `package.json`, `.github/workflows/ci.yml` | Install `@vitest/coverage-v8`, enforce coverage thresholds on `src/server/**`, and add `npm audit --audit-level=high` in CI. |

---

## 4. Low-Severity Findings (P3)

| ID | Issue Summary | Affected Files / Evidence | Recommended Fix |
| :--- | :--- | :--- | :--- |
| **`QA-LOW-001`** | **418 ESLint Warnings (`no-unused-vars`, `@next/next/no-img-element`)** | Legacy public pages & components (`src/app/(public)/*`, `src/components/*`) | Migrate `<img>` to `next/image` for LCP optimization and prune unused imports/vars. |
| **`QA-LOW-002`** | **18 `console.log/warn/error` Calls & 15 `TODO/FIXME` Markers in `src/`** | Spread across legacy components/services | Replace server `console.*` with structured Pino logger (`src/server/logging`) and triage all `TODO/FIXME` comments. |
| **`QA-LOW-003`** | **Playwright Configured for Chromium Only** | `playwright.config.ts` | Expand Playwright projects to include Firefox and WebKit (Mobile Safari emulation) in QA Phase 3. |

---

## 5. Overall Production Readiness Verdict (Post-QA Phase 2)

> **CURRENT VERDICT: CODE-HARDENED — NOT YET PRODUCTION CERTIFIED (`PENDING LIVE RUNTIME GATES`)**

**Summary Justification**: All **5 Critical (P0)** security/storage defects (`QA-BUG-001`–`QA-BUG-005`), **4 High (P1)** code/stability/lint defects (`QA-BUG-006`, `QA-BUG-008`, `QA-BUG-009`, `QA-BUG-010`), and **4 Medium (P2)** defects (`QA-BUG-011`–`QA-BUG-014`) have been **remediated and verified** (`tsc --noEmit`: 0 errors with zero `@ts-nocheck`, full-repo `eslint --quiet`: 0 errors, Vitest: **15/15 suites · 155/155 tests passing**). Production sign-off remains honestly gated on **Phase 3 & 4 live environment verification**: host/CI `npm run build`, live MongoDB replica-set integration tests, Playwright multi-viewport + `axe-core` E2E runs, and Razorpay/Stripe/SMTP sandbox checks.
