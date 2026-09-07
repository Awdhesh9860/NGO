# Enterprise Multi-Tenant NGO Management & Digital Platform

A production-grade, enterprise digital ecosystem engineered for non-governmental organizations (NGOs), non-profits, and charitable trusts. Features statutory 80G tax-exemption management, multi-tenant isolation, 9-tier role-based access control (RBAC), donor lifecycle automation, volunteer field operations, and verifiable public transparency ledgers.

---

## 🚀 Technology Stack

- **Runtime & Framework**: Next.js 16 (App Router) / React 19 + TypeScript (Strict Mode)
- **Database & ORM (planned)**: MongoDB + Mongoose — see [Data Layer](#-data-layer) below
- **Styling & Tokens**: Tailwind CSS v4 with enterprise semantic design tokens
- **State**: React Context (auth, database, language, toast) + Zustand for cross-page UI state
- **Validation**: Zod schema-first data contracts
- **Icons & Motion**: Lucide React + `motion/react`
- **Testing**: Vitest (unit) + Playwright (e2e)
- **Developer Tooling**: ESLint (`eslint-config-next`), TypeScript Compiler (`tsc`)

---

## 📁 Project Structure

```text
├── src/
│   ├── app/                          # Next.js App Router routes
│   │   ├── (public)/                 # Public site: shares Navbar/Footer/MobileBottomNav layout
│   │   └── dashboard/                # Immersive, role-switched authenticated workspace
│   ├── components/
│   │   ├── ui/                       # 25+ accessible, reusable design system components
│   │   ├── layout/                   # Public, Admin, Team, Volunteer, Donor, Member layouts
│   │   ├── common/                   # ErrorBoundary, LoadingScreen, NotFoundView, modals
│   │   ├── dashboard/                # Operational dashboard panels & summaries
│   │   └── public/                   # Public transparency & storytelling views
│   ├── hooks/
│   │   └── useViewNavigation.ts      # Legacy view-name → Next.js route bridge
│   ├── config/
│   │   ├── app.ts                    # Branding, statutory registrations & locales
│   │   ├── navigation.ts             # Configuration-driven navigation trees
│   │   ├── site.ts                   # SEO defaults and contact information
│   │   ├── constants.ts              # Global status enums, limits & 80G thresholds
│   │   └── environment.ts            # Type-safe grouped environment configuration
│   ├── lib/
│   │   ├── navigation.ts             # view-name <-> URL path mapping for ported components
│   │   ├── ui-store.ts               # Zustand store for cross-route modals (donate/search/etc.)
│   │   ├── mongodb.ts                # Mongoose connection singleton (not yet wired into the UI)
│   │   ├── design-tokens.ts          # Centralized color, typography, radius & elevation tokens
│   │   ├── api-response.ts           # Standardized ApiResponse<T> & pagination contracts
│   │   ├── error-handler.ts          # Enterprise AppError, ValidationError & hierarchy
│   │   ├── logger.ts                 # Structured logger with automatic secret redactions
│   │   └── utils.ts                  # cn(), formatCurrency(), formatDate()
│   ├── integrations/                 # Pluggable adapter boundaries (Payment, Email, Storage, Notification)
│   ├── validations/                  # Centralized Zod validation schemas
│   ├── tests/                        # Vitest unit tests
│   ├── context/                      # Client-side global context (Auth, Database, Language, Toast)
│   └── types/                        # Core TypeScript interfaces & domain models
└── .env.example                      # Production environment template
```

---

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+

### 1. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### 2. Install & Run

```bash
npm install
npm run dev
```

The site runs at `http://localhost:3000`. It currently runs entirely on the mock dataset in `src/data/mockDatabase.ts` (persisted to `localStorage` in the browser) — no database connection is required for local development.

### 3. Code Quality & Testing

```bash
npm run lint       # ESLint (eslint-config-next)
npm run test:run   # Vitest unit tests
npm run test:e2e   # Playwright end-to-end tests
```

### 4. Production Build

```bash
npm run build
npm run start
```

---

## 🗄️ Data Layer

The UI currently runs entirely on the mock dataset in `src/data/mockDatabase.ts`, surfaced through `DatabaseContext`/`AuthContext` and persisted to `localStorage` per browser — there is no live backend yet. `src/lib/mongodb.ts` provides a ready Mongoose connection singleton (set `MONGODB_URI` in `.env`) for the next phase of wiring each domain (donations, volunteers, campaigns, certificates, etc.) over to real persistence, replacing the mock data one entity at a time.
