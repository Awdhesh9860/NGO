# Enterprise Multi-Tenant NGO Management & Digital Platform

A production-grade, enterprise digital ecosystem engineered for non-governmental organizations (NGOs), non-profits, and charitable trusts. Features statutory 80G tax-exemption management, multi-tenant isolation, 9-tier role-based access control (RBAC), donor lifecycle automation, volunteer field operations, and verifiable public transparency ledgers.

---

## 🚀 Technology Stack

- **Runtime & Framework**: Next.js / React 19 + TypeScript (Strict Mode)
- **Database & ORM**: PostgreSQL + Prisma ORM
- **Styling & Tokens**: Tailwind CSS with enterprise semantic design tokens
- **Validation**: Zod schema-first data contracts
- **Icons & Motion**: Lucide React + Motion (`motion/react`)
- **Developer Tooling**: ESLint, Prettier, TypeScript Compiler (`tsc`)

---

## 📁 Project Structure

```text
├── prisma/
│   └── schema.prisma                 # Multi-tenant schema (33+ entities, scoped indexes)
├── src/
│   ├── components/
│   │   ├── ui/                       # 25+ accessible, reusable design system components
│   │   ├── layout/                   # Public, Admin, Team, Volunteer, Donor, Member, Auth layouts
│   │   ├── common/                   # ErrorBoundary, LoadingScreen, NotFoundView, modals
│   │   ├── dashboard/                # Operational dashboard panels & summaries
│   │   └── public/                   # Public transparency & storytelling views
│   ├── config/
│   │   ├── app.ts                    # Branding, statutory registrations & locales
│   │   ├── navigation.ts             # Configuration-driven navigation trees
│   │   ├── site.ts                   # SEO defaults and contact information
│   │   ├── constants.ts              # Global status enums, limits & 80G thresholds
│   │   └── environment.ts            # Type-safe grouped environment configuration
│   ├── database/
│   │   └── client.ts                 # Singleton Prisma client with HMR protection
│   ├── repositories/
│   │   └── base.repository.ts        # Abstract multi-tenant scoped data access layer
│   ├── integrations/                 # Pluggable adapter boundaries (Payment, Email, Storage, Notification)
│   ├── validations/                  # Centralized Zod validation schemas
│   ├── lib/
│   │   ├── design-tokens.ts          # Centralized color, typography, radius & elevation tokens
│   │   ├── api-response.ts           # Standardized ApiResponse<T> & pagination contracts
│   │   ├── error-handler.ts          # Enterprise AppError, ValidationError & hierarchy
│   │   ├── logger.ts                 # Structured logger with automatic secret redactions
│   │   └── utils.ts                  # cn(), formatCurrency(), formatDate()
│   ├── tests/                        # Foundational unit and validation test suites
│   ├── context/                      # Client-side global context (Auth, etc.)
│   ├── types/                        # Core TypeScript interfaces & domain models
│   └── App.tsx                       # Root view orchestrator
└── .env.example                      # Production environment template
```

---

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ or 20+
- PostgreSQL instance (or local Docker container)

### 1. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your PostgreSQL connection string:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ngo_platform?schema=public"
```

### 2. Database Migration

Generate Prisma client:
```bash
npx prisma generate
```

Push schema to PostgreSQL:
```bash
npx prisma db push
```

### 3. Development Mode

Run the development server on port 3000:
```bash
npm run dev
```

### 4. Code Quality & Testing

Run TypeScript strict checks:
```bash
npm run lint
```

Build for production:
```bash
npm run build
```
