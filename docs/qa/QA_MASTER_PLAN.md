# QA Master Plan — HopeHorizon / Vikas NGO Ecosystem

**Document ID**: `QA-PLAN-001`  
**Phase**: QA Phase 1 — Audit & Test Strategy Baseline  
**Platform**: HopeHorizon / Vikas NGO Ecosystem (`hopehorizon-ngo-platform@0.1.0`)  
**Stack**: Next.js 16.2.10 (App Router) · React 19.2.4 · TypeScript 5 · Tailwind CSS v4 · MongoDB / Mongoose 9.7.4 · Zod 4.4.3 · Vitest 4.1.11 · Playwright 1.62.0 · `@axe-core/playwright` 4.12.1  
**Status**: Active Baseline (Pending User Sign-Off for QA Phase 2 Execution)

---

## 1. Quality Assurance Objective & Governing Principles

This QA Master Plan defines the enterprise testing architecture, quality gates, environments, test data rules, and phased execution roadmap required to validate the HopeHorizon / Vikas NGO Ecosystem across **20 standard application testing layers** and **10 NGO-enterprise specialized testing layers** (30 verification disciplines total).

### Core QA Governance Rules

1. **Honesty Over Optimism**: A check is marked `PASSED` only when executed against its real required runtime target. Mocked unit tests are never reported as live database, payment, email, or browser verification.
2. **Non-Destructive Safety**: Production databases, live payment gateways, real personal data (PII), and real beneficiary/child identities are strictly prohibited in all automated and manual QA runs.
3. **Money & Ledger Precision**: Every donation, refund, membership fee, budget line, grant tranche, vendor bill, expense, and double-entry journal must be validated in **integer minor currency units** (`paise`/`cents`) with zero floating-point drift and strict `Total Debits === Total Credits`.
4. **Child & Vulnerable Person Safeguarding First**: Any leakage of child/minor identities, restricted case notes, unmasked bank account numbers, or donor PAN/tax IDs is classified as a **Critical (P0) release blocker**.
5. **Tenant Isolation Zero-Tolerance**: Cross-organization reads, writes, approvals, exports, or IDOR lookups between Tenant A and Tenant B are **Critical (P0) release blockers**.

---

## 2. Scope: 30 Verification Disciplines (20 Standard + 10 Specialized)

### 2.1 Core 20 Application Testing Types

| # | Testing Type | Primary Tooling | Execution Layer | Target Phase |
| :-: | :--- | :--- | :--- | :--- |
| 1 | **Unit Testing** | Vitest + `@vitest/coverage-v8` | Pure utilities, money math, crypto, validators, services, RBAC helpers | Phase 2 |
| 2 | **Integration Testing** | Vitest + `mongodb-memory-server` / local MongoDB | Service ↔ Repository ↔ Mongoose schema + transactions + email/payment adapters | Phase 2 |
| 3 | **API Testing** | Vitest route-handler harness / Supertest / `fetch` against Next.js | All 139 `/api/v1/*` handlers: status codes, `ApiResponse<T>` envelope, Zod errors, auth/RBAC | Phase 2 |
| 4 | **Functional Testing** | Vitest + Playwright | End-to-end NGO business workflows across Phases 1–10 | Phase 2–3 |
| 5 | **Regression Testing** | Vitest + Playwright CI suite | Automated guardrails preventing breakages across existing modules & navigation | Phase 2–5 |
| 6 | **End-to-End (E2E) Testing** | Playwright (`chromium`, `firefox`, `webkit`) | Multi-step browser flows (Auth → Dashboard → CRUD → Public Donate/Apply → Receipt/Verify) | Phase 3 |
| 7 | **UI / Visual Testing** | Playwright screenshot assertions + layout geometry checks | Zero overflow, header auto-hide, dropdown layering, dark/light contrast, modals | Phase 3 |
| 8 | **Responsive Testing** | Playwright device matrix (`375`, `390`, `768`, `1024`, `1280`, `1440`, `1920`) | Mobile drawer, tablet overflow, laptop nav wrapping, admin sidebar collapse | Phase 3 |
| 9 | **Cross-Browser Testing** | Playwright Chromium, Firefox, WebKit | Rendering, cookies, CSS transitions, focus rings, form submission parity | Phase 3 |
| 10 | **Performance Testing** | Lighthouse CI / Web Vitals / API latency timing benchmarks | LCP, CLS, INP, bundle size, MongoDB query latency with indexes | Phase 4 |
| 11 | **Load & Stress Testing** | k6 / Autocannon (local staging target) | Concurrent donations, admin dashboard aggregations, auth login bursts, rate-limit `429` enforcement | Phase 4 |
| 12 | **Security Testing** | OWASP Top 10 automated tests + static audit + `npm audit` | Auth bypass, NoSQL injection, XSS, CSRF, HMAC tampering, formula injection, headers, secrets | Phase 2 & 4 |
| 13 | **Accessibility Testing (WCAG 2.2 AA)** | `@axe-core/playwright` + keyboard focus traversal tests | 0 critical/serious axe violations, semantic landmarks, ARIA menus, focus traps, color contrast | Phase 3 |
| 14 | **Usability Testing** | Structured heuristic walkthroughs + Playwright user journeys | Form clarity, validation feedback, empty/error/loading states, 2FA & donation ergonomics | Phase 3 |
| 15 | **Database Testing** | Live MongoDB (Replica Set) + Mongoose schema/index verifier | Schema constraints, unique/TTL/compound indexes, atomic transactions, rollback & soft-delete | Phase 2–3 |
| 16 | **Payment & Webhook Testing** | Razorpay Test Mode + Stripe Test Mode + HMAC test suite | Signature verification, replay rejection, idempotency keys, out-of-order events, refund caps | Phase 2–3 |
| 17 | **Email & Notification Testing** | Nodemailer Ethereal / Mailpit / MailHog + template unit tests | Real SMTP delivery, OTP/reset/invite/receipt templates, no plaintext secret logging | Phase 2–3 |
| 18 | **File Upload & Document Security Testing** | Vitest + Playwright multipart/storage tests | Real disk/object persistence, MIME/magic-byte check, 15 MB cap, path traversal block, signed URL expiry | Phase 2–3 |
| 19 | **Compatibility & Environment Testing** | Windows host + Linux CI (`ubuntu-latest`) Node 20/22 | `.env` validation, fail-closed prod secrets, `next build` & `next start` parity | Phase 4 |
| 20 | **Smoke & Sanity Testing** | Playwright `@smoke` + API `/health` & core route probe | Post-build / post-deploy fast health verification (< 2 minutes) | Phase 3 & 5 |

### 2.2 Enterprise NGO Specialized Testing Types (10 Layers)

| # | Specialized Discipline | Core Invariants Tested |
| :-: | :--- | :--- |
| 21 | **Multi-Tenant Isolation Testing** | Every query, mutation, detail view, approval, export, and certificate lookup scoped to `organizationId`; cross-tenant IDOR returns `403`/`404`. |
| 22 | **RBAC & Permission Matrix Testing** | All 13 built-in roles + custom tenant `Role` documents enforced server-side (`401` unauth, `403` unauthorized); no privilege escalation or last-admin lockout. |
| 23 | **Approval Workflow & Separation of Duties Testing** | Project, campaign, refund, and expense approvals enforce `submittedBy !== approvedBy`, threshold gates, and valid state transitions. |
| 24 | **Financial Accounting Integrity Testing** | Double-entry `DR === CR`, immutable posted journals, reversal-only corrections, closed accounting period locks, budget/grant restriction caps, zero float math. |
| 25 | **Child Safeguarding & Beneficiary Privacy Testing** | Minor/child records masked in listings, guardian consent mandatory, `CaseNote` restricted from non-authorized roles, zero public API exposure of beneficiary PII. |
| 26 | **Compliance & Legal Verification Testing** | 80G/12A receipt gating requires verified org registration; FCRA/compliance records distinguish `RECORDED` vs independently `VERIFIED`. |
| 27 | **SEO, Structured Data & Metadata Testing** | Canonical URLs, OpenGraph, `robots.txt`, `sitemap.xml`, valid JSON-LD schemas (XSS-escaped), unique `<h1>` and metadata across public routes. |
| 28 | **Navigation & Routing Integrity Testing** | All 125 App Router pages return non-500, zero broken internal `<Link>` targets, smart auto-hide scroll threshold, mobile drawer & Escape handling. |
| 29 | **Observability, Audit Log & Error Handling Testing** | Append-only `AuditLog` entries for critical mutations/exports, secret redaction in logs, sanitized production `500` responses, correlation IDs. |
| 30 | **Deployment, CI/CD & Production Build Readiness** | Clean `tsc --noEmit`, `npm run lint` (0 errors), `npm run build`, `npm start` smoke test, `npm audit`, and full GitHub Actions CI gating. |

---

## 3. Test Environments & Runtime Tiers

To prevent confusion between mocked checks and production-grade verification, every test result MUST declare its execution tier:

| Tier | Environment Name | Runtime Dependencies | What It Proves | Current Status (Phase 1) |
| :--- | :--- | :--- | :--- | :--- |
| **T0** | **Static Analysis** | TypeScript (`tsc`), ESLint (`eslint`), security regex audit | Type safety, React rules, lint hygiene, static vulnerability detection | `tsc`: PASS (0 errors, 1 `@ts-nocheck` bypass) · `eslint`: **FAIL (116 errors, 418 warnings)** |
| **T1** | **Unit / Mocked (Vitest)** | Vitest + jsdom + mocked repositories | Pure business logic, crypto, validators, UI DOM interactions | **PASS (11 suites, 124/124 tests)** · Coverage plugin not yet installed |
| **T2** | **Local Integration (Real MongoDB)** | MongoDB 7+ Replica Set (Docker / Atlas Dev / `mongodb-memory-server`) | Real Mongoose CRUD, unique/TTL indexes, aggregations, transactions, tenant isolation | **NOT RUN** (no `.env.local` / MongoDB URI configured) |
| **T3** | **Local Full-Stack E2E (Playwright)** | Production or dev Next.js server (`npm run build && npm start`) + Playwright browsers + axe-core | Real SSR/CSR rendering, cookies, auth flows, responsive layout, WCAG AA, navigation | **NOT RUN** (11 specs discovered; sandbox cannot access host `localhost:3000` & lock held by host PID) |
| **T4** | **Sandbox External Integrations** | Razorpay Test Mode, Stripe Test Mode, Mailpit/Ethereal SMTP, local/S3 storage | Live webhook delivery, checkout verification, real email transport, real file upload/download | **NOT RUN** (unconfigured credentials; storage provider currently non-persisting stub) |
| **T5** | **Staging / Pre-Production** | Production Next.js build (`NODE_ENV=production`), TLS, real security headers, k6 load target | Load resilience, CSP/HSTS headers, rate-limit `429`, zero fallback secrets | **NOT DEPLOYED** |

---

## 4. Test Data Management & Privacy Policy

1. **Synthetic Data Only**: All seed scripts and fixtures MUST use clearly synthetic namespaces (`qa-tenant-a.test`, `qa-tenant-b.test`, `*.example.org`, synthetic phone `+91-9000000001`, synthetic test PAN `ABCDE1234F`).
2. **Multi-Tenant Fixtures**: Every integration and E2E test suite MUST provision at least **two independent tenants** (`Org Alpha` and `Org Beta`) and all **13 user roles** plus **1 custom organization role** to prove isolation and RBAC enforcement.
3. **Zero Real Financial Transactions**: Payment verification uses **Razorpay Test Keys (`rzp_test_*`)** and **Stripe Test Keys (`sk_test_*`)** only; live keys (`rzp_live_*`, `sk_live_*`) must trigger an automated abort inside test helpers.
4. **Deterministic Teardown**: Integration tests clean up per-test collections or use isolated ephemeral databases so tests remain repeatable and order-independent.
5. **Secret Hygiene**: Never commit `.env.local`, live API keys, Firebase config secrets, or production dumps to Git. Test suites validate that production mode refuses to boot with dev fallback secrets.

---

## 5. Entry & Exit Quality Gates

### Phase 2 Entry Criteria (Required Before Test Implementation & Bug Fixing)
- [x] Complete Phase 1 Audit (`APPLICATION_AUDIT.md`, `TEST_COVERAGE_MATRIX.md`, `RISK_REGISTER.md`, `QA_MASTER_PLAN.md`) approved by user.
- [ ] User confirms priority order for P0 security fixes (AuthContext / Demo Persona gating, Fail-closed secrets, Rate limiting, Security headers, Custom RBAC in `guards.ts`, Storage persistence).

### Release / Production Readiness Exit Gates (All Mandatory for `PRODUCTION READY`)

| Gate | Requirement | Current Baseline | Status |
| :--- | :--- | :--- | :---: |
| **G1. Static Quality** | `npx tsc --noEmit` = 0 errors (zero `@ts-nocheck`); `npm run lint` = 0 errors | 0 TS errors (1 `@ts-nocheck`), **116 ESLint errors** | **BLOCKED** |
| **G2. Build Verification** | `npm run build` succeeds cleanly in host/CI (`NODE_ENV=production`) | Not verified (sandbox Turbopack IPC error) | **BLOCKED** |
| **G3. Unit & Coverage** | 100% Vitest pass; ≥ 80% branch/line coverage on `src/server/**` & `src/lib/**` | 124/124 pass; coverage unmeasured | **PARTIAL** |
| **G4. Live DB & Tenant Isolation** | 100% pass on real MongoDB replica-set CRUD, transactions, indexes, cross-tenant IDOR tests | 0 live DB tests executed | **BLOCKED** |
| **G5. Security Hardening** | 0 Critical / 0 High open security bugs; security headers, rate limiting, fail-closed secrets, custom RBAC enforced, demo persona bypass removed | **5 Critical + 8 High findings open** | **BLOCKED** |
| **G6. E2E & Accessibility** | Playwright suite passes across Mobile/Tablet/Desktop with 0 critical/serious `axe-core` violations | 0 live Playwright runs | **BLOCKED** |
| **G7. Payments, Storage & Email** | Verified Razorpay/Stripe test webhooks, working document upload+signed download, verified SMTP delivery | Stub storage, missing download route, unverified gateways/SMTP | **BLOCKED** |
| **G8. CI/CD Pipeline** | `.github/workflows/ci.yml` enforces `tsc`, `lint`, `test:run`, `build`, and `npm audit` | Runs `test:run` only | **BLOCKED** |

---

## 6. Phased QA Execution Roadmap

| QA Phase | Objective | Key Deliverables |
| :--- | :--- | :--- |
| **Phase 1 (Current — Complete)** | Non-destructive 23-area codebase audit, risk identification, coverage mapping, QA strategy | `QA_MASTER_PLAN.md`, `APPLICATION_AUDIT.md`, `TEST_COVERAGE_MATRIX.md`, `RISK_REGISTER.md`, Phase 1 Audit Report |
| **Phase 2 (Next)** | Remediate P0/P1 security & correctness bugs + install coverage + build API, Security, RBAC, Tenant, Finance, Safeguarding & MongoDB integration tests | Fixed P0/P1 defects, `@vitest/coverage-v8`, expanded Vitest + live MongoDB integration suites, ESLint 0 errors |
| **Phase 3** | Execute full Playwright E2E, Responsive (7 viewports), Cross-Browser, Visual, SEO, Navigation & WCAG 2.2 AA Accessibility suites against a real running build | `tests/e2e/*.spec.ts` covering Auth, Admin, Programs, Fundraising, Stakeholders, Finance, Public site, Axe a11y |
| **Phase 4** | Production build verification, security headers/rate-limit verification, payment/email sandbox tests, performance/Lighthouse & load testing, CI/CD hardening | Hardened `.github/workflows/ci.yml`, Lighthouse & load benchmarks, Sandbox verification evidence |
| **Phase 5** | Full regression pass, defect closure audit, honest Production Readiness Certification | `QA_FINAL_VERIFICATION_REPORT.md`, `BUG_REPORT_AND_FIXES.md`, `PRODUCTION_READINESS_CHECKLIST.md` |
