# Enterprise NGO Management Platform — Architecture Documentation Index
**Platform**: HopeHorizon / Vikas NGO Ecosystem  
**Version**: 2.0.0-foundation  

---

This directory contains the complete technical architecture, security specifications, role models, and development roadmap for the Enterprise Multi-Tenant NGO Management Application.

### 📚 Master Architectural Documentation Suite

1. **[01. Project Audit](file:///s:/Project/NGO/docs/PROJECT_AUDIT.md)**  
   *Current state analysis, codebase asset inventory, runtime dependencies, implementation status matrix, and identified technical gaps.*

2. **[02. Product Requirements Document (PRD)](file:///s:/Project/NGO/docs/PRODUCT_REQUIREMENTS.md)**  
   *Core vision, stakeholder personas, comprehensive functional requirements across all modules, and non-functional specifications (performance, accessibility, security).*

3. **[03. Master Technical Architecture Blueprint](file:///s:/Project/NGO/docs/MASTER_ARCHITECTURE.md)**  
   *Layered clean architecture, Next.js 16 App Router presentation layer, service layer, Mongoose data access layer, integration adapter boundaries, and request flow.*

4. **[04. User Roles & RBAC System Planning](file:///s:/Project/NGO/docs/USER_ROLES_AND_PERMISSIONS.md)**  
   *13 user roles (Super Admin to Guest), 36 granular permissions, 13x36 permission matrix, least privilege rules, and server-side authorization enforcement.*

5. **[05. Master Module Inventory](file:///s:/Project/NGO/docs/MODULE_INVENTORY.md)**  
   *Exhaustive catalog of all 24+ public website routes, 10 administration dashboard tabs, and 4 dedicated user portals (Donor, Volunteer, Member, Staff).*

6. **[06. Database Architecture & Data Models](file:///s:/Project/NGO/docs/DATABASE_ARCHITECTURE.md)**  
   *MongoDB / Mongoose schema specifications, entity-relationship diagrams, compound indexing strategy, and tenant-scoped collection boundaries.*

7. **[07. Authentication & Email Architecture](file:///s:/Project/NGO/docs/AUTHENTICATION_AND_EMAIL_ARCHITECTURE.md)**  
   *Cryptographic authentication lifecycle, HTTP-only JWT sessions, TOTP 2FA, session revocation, pluggable email adapters, and branded transactional templates.*

8. **[08. API Architecture & Route Handlers](file:///s:/Project/NGO/docs/API_ARCHITECTURE.md)**  
   *RESTful Next.js 16 Route Handlers under `/api/v1/*`, 5-stage middleware pipeline, standardized `ApiResponse<T>` envelopes, and complete endpoint catalog.*

9. **[09. Multi-Tenant Architecture](file:///s:/Project/NGO/docs/MULTI_TENANT_ARCHITECTURE.md)**  
   *Logical multi-tenancy model, `organizationId` discriminator, Mongoose pre-hook query filters, tenant-specific branding, and statutory data isolation.*

10. **[10. 16-Phase Development Roadmap](file:///s:/Project/NGO/docs/DEVELOPMENT_ROADMAP.md)**  
    *Dependency-aware implementation roadmap detailing deliverables, acceptance criteria, and sequence from Phase 1 through Phase 16.*

---

### 🎨 Design System & UI/UX Foundation Suite (Phase 3)

1. **[Design System Overview](file:///s:/Project/NGO/docs/design/DESIGN_SYSTEM.md)**: Visual philosophy, multi-surface design consistency, and architecture.
2. **[Color Tokens](file:///s:/Project/NGO/docs/design/COLOR_TOKENS.md)**: Nature-inspired palette (Emerald, Sky, Amber), semantic tokens, and WCAG AA contrast.
3. **[Typography System](file:///s:/Project/NGO/docs/design/TYPOGRAPHY.md)**: Responsive type scale, font pairings, line heights, and usage guidelines.
4. **[Spacing & Layout Grid](file:///s:/Project/NGO/docs/design/SPACING_AND_LAYOUT.md)**: 4px baseline grid, layout containers, breakpoints, and elevation tokens.
5. **[Component Library](file:///s:/Project/NGO/docs/design/COMPONENT_LIBRARY.md)**: Reusable UI component catalog, prop contracts, and code examples.
6. **[Accessibility Guidelines](file:///s:/Project/NGO/docs/design/ACCESSIBILITY_GUIDELINES.md)**: WCAG 2.2 AA standards, screen reader attributes, and focus states.
7. **[Animation Guidelines](file:///s:/Project/NGO/docs/design/ANIMATION_GUIDELINES.md)**: Motion tokens, timing scales, and reduced motion compliance.
8. **[Theme & Dark Mode Guidelines](file:///s:/Project/NGO/docs/design/THEME_GUIDELINES.md)**: Light/dark mode variables, ThemeProvider, and tenant themes.

---

### 🛡️ Admin Dashboard & Organization Management Suite (Phase 6)

1. **[Admin Dashboard Module](file:///s:/Project/NGO/docs/modules/ADMIN_DASHBOARD.md)**: Executive KPIs, route map, global search, and 15 reusable dashboard components.
2. **[User Management Module](file:///s:/Project/NGO/docs/modules/USER_MANAGEMENT.md)**: Tenant user CRUD, role/dept/manager assignments, active sessions, and last-admin protection.
3. **[Role & Permission Management](file:///s:/Project/NGO/docs/modules/ROLE_PERMISSION_MANAGEMENT.md)**: 13 built-in system roles, custom organization roles, and module-wise permission matrix.
4. **[Department Management](file:///s:/Project/NGO/docs/modules/DEPARTMENT_MANAGEMENT.md)**: Operational departments, department heads, budgets, duplicate slug prevention, and rosters.
5. **[Organization Management & Settings](file:///s:/Project/NGO/docs/modules/ORGANIZATION_MANAGEMENT.md)**: Tenant lifecycle, verification status, regional/security/notification settings.
6. **[Invitation Management](file:///s:/Project/NGO/docs/modules/INVITATION_MANAGEMENT.md)**: Token-hashed email invitations, expiry, resend, revoke, and cross-tenant isolation.
7. **[Audit Logs & Admin Activity](file:///s:/Project/NGO/docs/modules/AUDIT_LOGS.md)**: Immutable append-only audit trail, correlation IDs, metadata sanitization, and CSV export.
8. **[Administrative Security Architecture](file:///s:/Project/NGO/docs/security/ADMIN_SECURITY.md)**: Server-side guards, privilege escalation defense, and tenant isolation.
9. **[Admin Module Development Guidelines](file:///s:/Project/NGO/docs/development/ADMIN_MODULE_GUIDELINES.md)**: Multi-developer squad ownership, boundaries, and local verification commands.

---

### 📋 Program & Project Operations Suite (Phase 7)

1. **[Program Management Module](file:///s:/Project/NGO/docs/modules/PROGRAM_MANAGEMENT.md)**: Multi-year programs, lifecycle state machine, KPIs, and budget rollups.
2. **[Project Management Module](file:///s:/Project/NGO/docs/modules/PROJECT_MANAGEMENT.md)**: Grassroots field projects, team workload, geolocation, risks, and beneficiary safeguarding.
3. **[Task Management Module](file:///s:/Project/NGO/docs/modules/TASK_MANAGEMENT.md)**: Kanban boards, priority tracking, assignee permissions, and overdue alerts.
4. **[Milestone Management Module](file:///s:/Project/NGO/docs/modules/MILESTONE_MANAGEMENT.md)**: Deliverables, target dates, and automatic project progress recalculation.
5. **[Project & Program Approval Workflow](file:///s:/Project/NGO/docs/modules/PROJECT_APPROVAL_WORKFLOW.md)**: Multi-stage approvals, no-self-approval rule, rejection/resubmission history.
6. **[Project Budget Planning & Tracking](file:///s:/Project/NGO/docs/modules/PROJECT_BUDGET.md)**: Category-level planned vs actual expenditure calculations and variance alerts.
7. **[Project Documents & Media](file:///s:/Project/NGO/docs/modules/PROJECT_DOCUMENTS.md)**: Storage adapter, MIME/size validation, visibility rules, and signed URLs.
8. **[Project Access Control & Safeguarding](file:///s:/Project/NGO/docs/security/PROJECT_ACCESS_CONTROL.md)**: 13-role operational matrix, tenant boundaries, and public/private separation.
9. **[Program & Project Development Guidelines](file:///s:/Project/NGO/docs/development/PROGRAM_PROJECT_MODULE_GUIDELINES.md)**: Feature-based squad ownership and verification rules.

---

### 💛 Campaign, Fundraising & Donation Suite (Phase 8)

1. **[Fundraising Architecture Overview](file:///s:/Project/NGO/docs/modules/FUNDRAISING.md)**: Integer minor-unit precision, 10 tenant-scoped collections, and end-to-end invariants.
2. **[Campaign Management Module](file:///s:/Project/NGO/docs/modules/CAMPAIGN_MANAGEMENT.md)**: 9-state campaign lifecycle, approval workflow, updates, and public visibility.
3. **[Donor Management (CRM) Module](file:///s:/Project/NGO/docs/modules/DONOR_MANAGEMENT.md)**: Verified lifetime giving, deterministic donor segmentation, and export audit.
4. **[Donation Management Module](file:///s:/Project/NGO/docs/modules/DONATION_MANAGEMENT.md)**: 7-state donation ledger, idempotency keys, and manual UPI/Bank Transfer verification.
5. **[Payment Integration Architecture](file:///s:/Project/NGO/docs/modules/PAYMENT_INTEGRATION.md)**: Razorpay, Stripe, UPI, and Bank Transfer adapters with honest status reporting.
6. **[Recurring Donations Module](file:///s:/Project/NGO/docs/modules/RECURRING_DONATIONS.md)**: Provider-mandated subscriptions (`MONTHLY`/`QUARTERLY`/`YEARLY`) without simulated billing.
7. **[Donation Receipts & 80G/12A Compliance](file:///s:/Project/NGO/docs/modules/DONATION_RECEIPTS.md)**: Sequential receipt numbering, duplicate prevention, and strict verified 80G/12A gating.
8. **[Refund Management Module](file:///s:/Project/NGO/docs/modules/REFUND_MANAGEMENT.md)**: Two-stage separation of duties, no self-approval, and remaining refundable balance caps.
9. **[Fundraising Analytics & Reporting](file:///s:/Project/NGO/docs/modules/FUNDRAISING_ANALYTICS.md)**: Real MongoDB integer aggregations for gross, pending, refunded, net totals, and retention.
10. **[Payment & Financial Security](file:///s:/Project/NGO/docs/security/PAYMENT_SECURITY.md)**: Timing-safe HMAC verification, replay protection, webhook idempotency, and out-of-order defense.
11. **[Donor Data Privacy & Protection](file:///s:/Project/NGO/docs/security/DONOR_DATA_PRIVACY.md)**: `donors.view_sensitive` field masking, anonymity enforcement, and export auditing.
12. **[Fundraising Module Development Guidelines](file:///s:/Project/NGO/docs/development/FUNDRAISING_MODULE_GUIDELINES.md)**: Squad ownership, money precision standards, and PR verification checklist.

---

### 🤝 Volunteer, Member & Beneficiary Management Suite (Phase 9)

1. **[Volunteer Management Module](file:///s:/Project/NGO/docs/modules/VOLUNTEER_MANAGEMENT.md)**: Volunteer profiles, configurable verification checklists, and lifecycle controls.
2. **[Volunteer Applications Workflow](file:///s:/Project/NGO/docs/modules/VOLUNTEER_APPLICATIONS.md)**: Public intake, Zod validation, duplicate prevention, and 7-state human review.
3. **[Volunteer Assignments Module](file:///s:/Project/NGO/docs/modules/VOLUNTEER_ASSIGNMENTS.md)**: Program/project allocation, verification gates, and schedule overlap validation.
4. **[Volunteer Attendance & Hours](file:///s:/Project/NGO/docs/modules/VOLUNTEER_ATTENDANCE.md)**: 5-state attendance approval, zero GPS surveillance, and strictly approved hour totals.
5. **[Volunteer Certificates Module](file:///s:/Project/NGO/docs/modules/VOLUNTEER_CERTIFICATES.md)**: Verifiable certificates derived from approved hours and PII-safe public lookup.
6. **[Membership Management Module](file:///s:/Project/NGO/docs/modules/MEMBERSHIP_MANAGEMENT.md)**: Configurable per-tenant plans, integer minor-unit fees, and 9-state membership lifecycle.
7. **[Membership Renewals Workflow](file:///s:/Project/NGO/docs/modules/MEMBERSHIP_RENEWALS.md)**: Expiry and grace period tracking, paid renewal confirmation gates, and reminder dedupe.
8. **[Beneficiary Management Module](file:///s:/Project/NGO/docs/modules/BENEFICIARY_MANAGEMENT.md)**: Purpose-limited individual/household intake, human eligibility verification, and enrollment.
9. **[Beneficiary Case Management](file:///s:/Project/NGO/docs/modules/BENEFICIARY_CASE_MANAGEMENT.md)**: 6-state case lifecycle, restricted `CaseNote` collection, and safeguarding escalations.
10. **[Beneficiary Assistance Tracking](file:///s:/Project/NGO/docs/modules/BENEFICIARY_ASSISTANCE.md)**: Actual service delivery ledger strictly separated from donations and project budgets.
11. **[Beneficiary Data Privacy & Protection](file:///s:/Project/NGO/docs/security/BENEFICIARY_DATA_PRIVACY.md)**: Least-privilege RBAC, redacted listings, field-gated profiles, and export audit trails.
12. **[Child & Vulnerable Person Safeguarding](file:///s:/Project/NGO/docs/security/CHILD_SAFEGUARDING.md)**: Guardian verification, child identity redaction, restricted notes, and zero public exposure.
13. **[Consent Management & Data Retention](file:///s:/Project/NGO/docs/security/CONSENT_MANAGEMENT.md)**: Purpose-specific consent, non-bundled media/storytelling rules, withdrawal safety, and anonymization.
14. **[Stakeholder Module Development Guidelines](file:///s:/Project/NGO/docs/development/STAKEHOLDER_MODULE_GUIDELINES.md)**: Multi-developer squad ownership, invariants, and verification standards.

---

### 💰 Finance, Accounting, Expense & Compliance Suite (Phase 10)

1. **[Finance Management Architecture](file:///s:/Project/NGO/docs/modules/FINANCE_MANAGEMENT.md)**: 16 tenant-scoped collections, Phase 07/08 integration boundaries, and integer minor-unit precision.
2. **[Chart of Accounts Module](file:///s:/Project/NGO/docs/modules/CHART_OF_ACCOUNTS.md)**: Hierarchical NGO CoA, system account protection, posted-usage deletion guard, and default seeding.
3. **[Double-Entry Accounting & Periods](file:///s:/Project/NGO/docs/modules/DOUBLE_ENTRY_ACCOUNTING.md)**: Mandatory DR = CR validation, immutable posted journals, reversals, period locks, and MongoDB transactions.
4. **[General Ledger & Income Integration](file:///s:/Project/NGO/docs/modules/GENERAL_LEDGER.md)**: Posted-only ledger registers and idempotent Phase 08 verified donation & refund sync.
5. **[Expense Management & Approvals](file:///s:/Project/NGO/docs/modules/EXPENSE_MANAGEMENT.md)**: 8-state expense lifecycle, role approval thresholds, no-self-approval, and automatic payment posting.
6. **[Vendor & Bill Management](file:///s:/Project/NGO/docs/modules/VENDOR_MANAGEMENT.md)**: Encrypted vendor payout info, masked display, duplicate bill prevention, and payable balances.
7. **[Bank Accounts & Reconciliation](file:///s:/Project/NGO/docs/modules/BANK_RECONCILIATION.md)**: AES-256-GCM bank registry, CSV import with duplicate detection, and manual reconciliation sessions.
8. **[Multi-Level Budget Management](file:///s:/Project/NGO/docs/modules/BUDGET_MANAGEMENT.md)**: Org/department/program/project budgets bridged to Phase 07 `ProjectBudgetEntry` with ledger-derived actuals.
9. **[Fund Allocation & Restricted Funds](file:///s:/Project/NGO/docs/modules/FUND_ALLOCATION.md)**: Donor/grant restriction enforcement, source-to-use traceability, and utilization caps.
10. **[Grant Management Foundation](file:///s:/Project/NGO/docs/modules/GRANT_MANAGEMENT.md)**: 8-state grant lifecycle, ledger-posted tranche receipts, and reporting deadlines.
11. **[Financial Reporting & Statements](file:///s:/Project/NGO/docs/modules/FINANCIAL_REPORTING.md)**: Ledger-derived Trial Balance, Income & Expense, Balance Sheet, Cash Flow, and CSV export defense.
12. **[NGO Compliance & Deadlines](file:///s:/Project/NGO/docs/modules/NGO_COMPLIANCE.md)**: Configurable 12A/80G/FCRA/Audit registry separating recorded documents from independently verified compliance.
13. **[Financial Data Security](file:///s:/Project/NGO/docs/security/FINANCIAL_DATA_SECURITY.md)**: Separation of duties matrix, AES-256-GCM encryption, masking, and CSV/document security.
14. **[Finance Module Development Guidelines](file:///s:/Project/NGO/docs/development/FINANCE_MODULE_GUIDELINES.md)**: Multi-developer squad ownership, engineering invariants, and verification commands.





