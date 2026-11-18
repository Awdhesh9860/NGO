# Enterprise Multi-Tenant NGO Management & Digital Platform
**Platform Name**: HopeHorizon / Vikas NGO Ecosystem  
**Target Architecture**: Enterprise Hybrid Feature-Based Architecture (Next.js 16 App Router / React 19)  
**Version**: 2.0.0-foundation  

---

## 1. Project Overview

A production-grade, enterprise digital ecosystem engineered for non-governmental organizations (NGOs), non-profits, and charitable trusts. Features statutory Section 80G tax-exemption management, multi-tenant isolation, 13-tier role-based access control (RBAC), donor lifecycle automation, volunteer field operations, and verifiable public transparency ledgers.

---

## 2. Technology Stack

- **Runtime & Framework**: Next.js 16.2 (App Router, Turbopack) / React 19.2 + TypeScript (Strict Mode)
- **Database & ORM**: MongoDB + Mongoose (Connection singleton in `src/server/database/connection/`)
- **Styling & Tokens**: Tailwind CSS v4 with semantic tokens (`src/styles/tokens.css`, `src/lib/design-tokens.ts`)
- **State Management**: React Context (`AuthContext`, `DatabaseContext`, `LanguageContext`, `ToastContext`) + Zustand (`src/lib/ui-store.ts`) + `@tanstack/react-query`
- **Validation**: Zod schema-first data contracts (`@/shared/schemas`)
- **Icons & Motion**: Lucide React + `motion/react` + Canvas Confetti
- **Integrations**: Google Workspace (Firebase Auth + Sheets/Drive API), Razorpay & Stripe adapters, Nodemailer SMTP
- **Testing**: Vitest (unit/DOM tests) + Playwright (end-to-end tests)
- **Developer Tooling**: ESLint, TypeScript Compiler (`tsc`)

---

## 3. Enterprise Hybrid Feature-Based Architecture

The repository combines **Domain-Driven Design (DDD)** and **Layered Architecture** principles:

```text
├── src/
│   ├── app/                          # Next.js App Router (Thin routing & layout shell)
│   │   ├── (public)/                 # 24+ Public routes (Home, About, Causes, 80G Giving)
│   │   ├── (auth)/                   # Dedicated auth routes (Login, Register, 2FA)
│   │   ├── dashboard/                # Role-switched authenticated workspace
│   │   └── api/                      # RESTful Next.js 16 Route Handlers (/api/v1/*)
│   │
│   ├── features/                     # Self-Contained Business Modules
│   │   ├── authentication/           # Identity, 2FA, session management, persona switcher
│   │   ├── organizations/            # Multi-tenant profile & statutory IDs
│   │   ├── users/                    # User accounts & department assignments
│   │   ├── roles-permissions/        # 13 roles & 36 granular permissions
│   │   ├── programs/                 # Thematic NGO causes (Water, Education, Health)
│   │   ├── projects/                 # Field deployments & milestone tracking
│   │   ├── campaigns/                # Urgent fundraising appeals & live updates
│   │   ├── donations/                # Section 80G giving & Form 10BE receipts
│   │   ├── donors/                   # Donor CRM & giving portfolios
│   │   ├── volunteers/               # Volunteer applications & hour logging
│   │   ├── members/                  # General assembly & digital QR cards
│   │   ├── certificates/             # Credential issuance & public verification
│   │   ├── finance/                  # Financial ledger, expenses & refund desk
│   │   ├── compliance/               # Section 80G, 12A, FCRA & Darpan governance
│   │   ├── email/                    # Transactional email dispatcher & logs
│   │   ├── notifications/            # In-app toasts & alerts
│   │   ├── cms/                      # News articles, blog & success stories
│   │   ├── media/                    # Gallery assets & document vault
│   │   ├── newsletter/               # Zod-validated lead capturing
│   │   ├── google-workspace/         # Firebase Auth + Drive & Sheets live sync
│   │   └── audit-logs/               # Immutable administrative security ledger
│   │
│   ├── components/                   # Reusable Design System Primitives
│   │   ├── ui/                       # 25+ base components (Button, Modal, DataTable)
│   │   ├── layout/                   # PublicLayout, AdminLayout, Footer, Navbar
│   │   ├── navigation/               # Header, MegaMenu, MobileBottomNav, LangSelector
│   │   └── common/                   # GlobalModals, PersonaSwitcher, ErrorBoundary
│   │
│   ├── server/                       # Server-Only Infrastructure
│   │   ├── database/                 # Connection singleton, Mongoose models, seeds
│   │   ├── auth/                     # Server-side JWT session verifier
│   │   ├── authorization/            # Server-side RBAC permission guards
│   │   ├── tenant/                   # Tenant resolver (Host / Subdomain / Header)
│   │   ├── security/                 # Rate limiting, CSRF & hashing utils
│   │   ├── logging/                  # Pino structured logger with PII redaction
│   │   └── errors/                   # AppError, ValidationError, UnauthorizedError
│   │
│   ├── integrations/                 # Pluggable Third-Party Service Adapters
│   │   ├── payment/                  # Razorpay & Stripe interfaces
│   │   ├── email/                    # Nodemailer, Resend & SendGrid interfaces
│   │   ├── storage/                  # Local, S3 & Cloudinary interfaces
│   │   └── google-workspace/         # Google Drive & Sheets REST API drivers
│   │
│   ├── shared/                       # Cross-Cutting Shared Utilities
│   │   ├── types/                    # Domain interfaces re-exported
│   │   ├── constants/                # Global limits, thresholds & enums
│   │   ├── schemas/                  # Shared Zod validation schemas
│   │   ├── utils/                    # cn(), formatters, string helpers
│   │   └── contracts/                # ApiResponse<T> & pagination contracts
│   │
│   ├── config/                       # Centralized System Configuration
│   │   ├── app.config.ts             # Statutory registration IDs, locales, currency
│   │   ├── site.config.ts            # Global SEO, metadata & social links
│   │   ├── navigation.config.ts      # Navigation tree hierarchy
│   │   ├── permissions.config.ts     # Role-permission baseline matrix
│   │   └── feature-flags.config.ts   # System feature toggles
│   │
│   └── styles/                       # Centralized Design Tokens & Styles
│       ├── tokens.css                # CSS variables for colors, spacing, radii
│       ├── themes.css                # Multi-tenant theme overrides
│       └── utilities.css             # Print stylesheets & utility classes
```

---

## 4. Documentation Suite

Exhaustive blueprints and guidelines are available in [`docs/`](file:///s:/Project/NGO/docs/README.md):

- **Architecture**:
  - [`docs/architecture/FOLDER_STRUCTURE.md`](file:///s:/Project/NGO/docs/architecture/FOLDER_STRUCTURE.md)
  - [`docs/architecture/SYSTEM_ARCHITECTURE.md`](file:///s:/Project/NGO/docs/architecture/SYSTEM_ARCHITECTURE.md)
  - [`docs/architecture/MODULE_BOUNDARIES.md`](file:///s:/Project/NGO/docs/architecture/MODULE_BOUNDARIES.md)
  - [`docs/architecture/DEPENDENCY_RULES.md`](file:///s:/Project/NGO/docs/architecture/DEPENDENCY_RULES.md)
  - [`docs/architecture/ARCHITECTURE_DECISIONS.md`](file:///s:/Project/NGO/docs/architecture/ARCHITECTURE_DECISIONS.md)
- **Development**:
  - [`docs/development/DEVELOPMENT_GUIDELINES.md`](file:///s:/Project/NGO/docs/development/DEVELOPMENT_GUIDELINES.md)
  - [`docs/development/CODING_STANDARDS.md`](file:///s:/Project/NGO/docs/development/CODING_STANDARDS.md)
  - [`docs/development/GIT_WORKFLOW.md`](file:///s:/Project/NGO/docs/development/GIT_WORKFLOW.md)
  - [`docs/development/PULL_REQUEST_GUIDELINES.md`](file:///s:/Project/NGO/docs/development/PULL_REQUEST_GUIDELINES.md)
  - [`docs/development/DEVELOPER_ONBOARDING.md`](file:///s:/Project/NGO/docs/development/DEVELOPER_ONBOARDING.md)

---

## 5. Getting Started & Development Commands

### Prerequisites:
- Node.js 20+

### Setup:
```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Start local development server (Turbopack)
npm run dev
```

### Verification & Testing:
```bash
npm run test:run   # Run Vitest unit tests
npm run lint       # Run ESLint validation
npm run test:e2e   # Run Playwright end-to-end tests
npm run build      # Production build
```
