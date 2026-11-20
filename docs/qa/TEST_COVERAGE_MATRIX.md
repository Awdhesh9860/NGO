# Test Coverage Matrix — HopeHorizon / Vikas NGO Ecosystem

**Document ID**: `QA-MATRIX-001`  
**Audit Date**: 2026-11-20  
**Coverage Instrumentation Status**: `@vitest/coverage-v8` is **NOT yet installed** (`package.json`). Statement / Branch / Function / Line percentages are currently **UNMEASURED** and scheduled as the first tooling step of QA Phase 2.

---

## 1. Existing Automated Test Suite Baseline

| Test File | Suite Focus | Test Cases | Execution Tier | Status (2026-11-20) | Coverage Limitation |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `src/tests/auth.test.ts` | Password hashing, JWT sign/verify, TOTP, cookies, token hashes | 16 | T1 (Unit) | **PASS** | No HTTP route tests, no MongoDB `Session` revocation, no rate-limit/2FA login E2E |
| `src/tests/admin.test.ts` | Admin RBAC, invitations, last-admin protection, org service | 18 | T1 (Mocked) | **PASS** | Repositories mocked; custom MongoDB `Role` evaluation untested |
| `src/tests/program-project.test.ts` | Program/project workflows, approvals, budget variance, milestones | 14 | T1 (Mocked) | **PASS** | No real MongoDB queries or real file upload persistence |
| `src/tests/fundraising.test.ts` | Minor-unit money math, HMAC Razorpay/Stripe, receipts, refunds | 18 | T1 (Unit/Mocked) | **PASS** | No real MongoDB aggregations, no live Razorpay/Stripe sandbox calls |
| `src/tests/stakeholders.test.ts` | Volunteer hours, membership plans, beneficiary redaction, safeguarding | 10 | T1 (Mocked) | **PASS** | No route-level RBAC matrix tests across all 13 roles, no real DB queries |
| `src/tests/finance.test.ts` | Double-entry DR=CR, AES-256-GCM crypto, CSV parser, compliance | 12 | T1 (Unit/Mocked) | **PASS** | No live replica-set transaction rollback or concurrent posting tests |
| `src/tests/public-website.test.ts` | Public mock dataset integrity, SEO metadata helpers | 12 | T1 (Unit) | **PASS** | Tests static `mockDatabase.ts`, not live rendered Next.js pages |
| `src/tests/navigation.test.ts` | Nav config, role visibility, scroll auto-hide state machine | 12 | T1 (Unit) | **PASS** | Pure config/state tests |
| `src/tests/navigation-dom.test.tsx` | Header dropdown click, ARIA attributes, Escape close | 2 | T1 (jsdom) | **PASS** | Does not test real browser CSS layout, sticky/fixed scroll, or overflow |
| `src/tests/newsletter.test.ts` | Email format validation helper | 5 | T1 (Unit) | **PASS** | No backend newsletter API exists |
| `src/tests/utils.test.ts` | Utility helpers | 5 | T1 (Unit) | **PASS** | Minimal utility subset |
| `src/tests/security-hardening.test.ts` | Fail-closed prod secrets, security headers, CSRF proxy, rate limiting, sanitized 500s, JSON-LD XSS, Mongo recovery | 13 | T1 (Security) | **PASS** | Single-node in-memory rate-limit store (Redis adapter recommended for multi-node prod) |
| `src/tests/storage-security.test.ts` | Real disk persistence round-trip, magic-byte spoofing, path traversal, HMAC signed URLs, HTTP download route | 4 | T1/Local FS | **PASS** | Tests managed local private vault; S3/Cloudinary live bucket tests pending Phase 4 |
| `src/tests/rbac-and-tenant-isolation.test.ts` | 13-role matrix, Finance SoD, Safeguarding least-privilege, custom MongoDB `Role` evaluation, cross-tenant IDOR, session revocation | 8 | T1 (Mocked DB) | **PASS** | Mocked Mongoose models; live MongoDB integration run pending Phase 3 |
| `src/tests/api-routes-contract.test.ts` | Route-handler HTTP contracts: Login Zod+429, 2FA Zod+JWT scope, Session, Finance Income 401, Razorpay/Stripe webhooks, Certificate lookup | 6 | T1 (Route HTTP) | **PASS** | Subset of critical routes; expand to full live MongoDB API integration in Phase 3 |
| `tests/e2e/navigation.spec.ts` | Multi-viewport nav layout, drawer, scroll hide, axe-core check | 11 | T3 (Playwright) | **NOT EXECUTED** | Blocked in sandbox (host server lock & network boundary) |
| **TOTAL** | **15 Vitest Suites + 1 Playwright Spec** | **155 Unit/Sec/Route + 11 E2E** | **T1 + Local FS Verified** | **155/155 Vitest PASS · 0/11 E2E Run** | **0 Live MongoDB · 0 Live Browser · 0 Sandbox Gateway Runs** |

---

## 2. Coverage Matrix Across All 30 Testing Types (20 Core + 10 Specialized)

| # | Testing Type | Planned Scope | Currently Implemented | Verified Today | Gap Level | Target Phase |
| :-: | :--- | :--- | :--- | :---: | :---: | :---: |
| 1 | **Unit Testing** | All utilities, crypto, money, validators, services, React hooks | 124 tests across 11 Vitest files | **Partial (T1)** | Medium (no coverage report) | Phase 2 |
| 2 | **Integration Testing** | Service ↔ Repository ↔ Real MongoDB + Transactions | 0 live DB integration tests | **None** | **Critical** | Phase 2 |
| 3 | **API Testing** | All 139 `/api/v1/*` handlers (happy + error + malformed + auth) | 0 HTTP route-handler tests | **None** | **Critical** | Phase 2 |
| 4 | **Functional Testing** | All 10 phases + NGO workflows end-to-end | Mocked service tests only | **Partial (T1)** | High | Phase 2–3 |
| 5 | **Regression Testing** | Full automated Vitest + Playwright CI gate | Only 124 unit tests in CI | **Partial** | High | Phase 2–5 |
| 6 | **End-to-End (E2E) Testing** | Auth, Admin, Programs, Donate, Volunteer, Member, Beneficiary, Finance | 1 nav spec (unexecuted) | **None** | **Critical** | Phase 3 |
| 7 | **UI / Visual Testing** | Layout geometry, modals, tables, light/dark modes, zero clipping | 0 visual regression tests | **None** | High | Phase 3 |
| 8 | **Responsive Testing** | `375px` to `1920px` (7 breakpoints) across public & admin | Nav spec written (unexecuted) | **None** | High | Phase 3 |
| 9 | **Cross-Browser Testing** | Chromium, Firefox, WebKit | Playwright configured for Chromium only | **None** | Medium | Phase 3 |
| 10 | **Performance Testing** | Lighthouse, LCP/CLS/INP, bundle budget, DB query latency | 0 benchmarks | **None** | High | Phase 4 |
| 11 | **Load & Stress Testing** | Concurrent API bursts, auth brute-force, reporting aggregations | 0 load scripts | **None** | Medium | Phase 4 |
| 12 | **Security Testing** | OWASP Top 10, headers, rate-limit, XSS, NoSQLi, CSRF, secrets | Partial HMAC/crypto unit checks | **Low** | **Critical** | Phase 2 & 4 |
| 13 | **Accessibility Testing (WCAG 2.2 AA)** | `@axe-core/playwright` + keyboard focus across all core pages | 2 jsdom ARIA tests + 1 unrun axe spec | **Low** | High | Phase 3 |
| 14 | **Usability Testing** | Form ergonomics, validation states, error recovery, empty states | 0 structured usability checks | **None** | Medium | Phase 3 |
| 15 | **Database Testing** | Real MongoDB schema rules, 61 models, unique/TTL/compound indexes, transactions | 0 live DB tests | **None** | **Critical** | Phase 2 |
| 16 | **Payment & Webhook Testing** | Razorpay & Stripe test checkouts, webhooks, replay, out-of-order, refunds | HMAC unit tests only (mocked) | **Partial (T1)** | **Critical** | Phase 2–3 |
| 17 | **Email & Notification Testing** | Real SMTP (Mailpit/Ethereal), 11 templates, OTP/invite/reset/receipt | Simulated console log only | **None** | High | Phase 2–3 |
| 18 | **File Upload & Document Security** | Real storage write/read/delete, MIME/size/path traversal, signed URLs | Validation helper only (storage is stub) | **Broken** | **Critical** | Phase 2–3 |
| 19 | **Compatibility & Env Testing** | Windows host + Linux CI, production env validation, `next build` | `next build` unverified | **None** | **Critical** | Phase 4 |
| 20 | **Smoke & Sanity Testing** | Fast post-build `@smoke` health check across public, auth, admin, API | 0 automated smoke suites | **None** | High | Phase 3 & 5 |
| 21 | **Multi-Tenant Isolation** | Tenant A vs Tenant B IDOR tests across all 57 tenant models & APIs | Mocked checks only | **Partial (T1)** | **Critical** | Phase 2 |
| 22 | **RBAC & 13-Role Matrix** | All 13 built-in roles + custom `Role` DB permissions on every route | Static map checks only (custom DB roles broken) | **Partial / Broken** | **Critical** | Phase 2 |
| 23 | **Approval & Separation of Duties** | Self-approval blocks across Projects, Campaigns, Refunds, Expenses | Unit/mocked checks in Phases 7, 8, 10 | **Partial (T1)** | Medium | Phase 2–3 |
| 24 | **Financial Accounting Integrity** | DR=CR, immutable journals, reversals, period lock, grant caps, concurrency | 12 mocked unit tests | **Partial (T1)** | High | Phase 2 |
| 25 | **Child Safeguarding & Privacy** | Minor redaction, guardian consent, restricted `CaseNote`, zero public PII | 10 mocked unit tests | **Partial (T1)** | **Critical** | Phase 2–3 |
| 26 | **Compliance & 80G/12A/FCRA** | Verified registration gating for 80G receipts; recorded vs verified status | Mocked unit checks | **Partial (T1)** | Medium | Phase 2 |
| 27 | **SEO, Sitemap & JSON-LD** | Live DB sitemap, `robots.txt`, escaped JSON-LD, meta tags | Static mock checks only | **Low** | Medium | Phase 3 |
| 28 | **Navigation & Routing Integrity** | All 125 routes HTTP status, zero dead links, auto-hide & breadcrumbs | 14 unit/jsdom tests; 0 live route crawl | **Low** | High | Phase 3 |
| 29 | **Audit Logs & Error Handling** | Append-only audit trail, secret redaction, sanitized `500` responses | Unit checks only (`500` currently leaks message) | **Low** | High | Phase 2 |
| 30 | **CI/CD & Production Readiness** | GitHub Actions running `tsc`, `lint`, `test`, `build`, `audit`, E2E | CI runs `test:run` only | **Failed** | **Critical** | Phase 2 & 4 |

---

## 3. Module-Level Coverage Gap Summary

| Platform Module | Routes / Pages | Models | Unit Tests | API Route Tests | Live DB Tests | E2E Tests | Priority |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Auth & Security** | 16 API / 5 Pages | 6 | 16 | 0 | 0 | 0 | **P0** |
| **Admin, RBAC, Tenants & Audit** | 17 API / 10 Pages | 5 | 18 | 0 | 0 | 0 | **P0** |
| **Fundraising, Donations & Payments** | 22 API / 8 Pages | 10 | 18 | 0 | 0 | 0 | **P0** |
| **Finance, Ledger, Banking & Grants** | 36 API / 11 Pages | 16 | 12 | 0 | 0 | 0 | **P0** |
| **Beneficiaries, Safeguarding & Consent** | 8 API / 3 Pages | 7 | ~4 | 0 | 0 | 0 | **P0** |
| **Volunteers & Membership** | 15 API / 6 Pages | 9 | ~6 | 0 | 0 | 0 | **P1** |
| **Programs, Projects, Tasks & Docs** | 17 API / 7 Pages | 8 | 14 | 0 | 0 | 0 | **P1** |
| **Public Website & Navigation** | 7 API / 68 Pages | 0 | 31 | 0 | 0 | 11 (unrun) | **P1** |
| **Legacy `/dashboard` Portals** | 0 API / 1 Page (6 portals) | 0 | 0 | 0 | 0 | 0 | **P1** |
| **Placeholder Modules (CMS/Events/Media/Staff)** | 0 API / Partial UI | 0 | 0 | 0 | 0 | 0 | **P2 (Scope Decision)** |
