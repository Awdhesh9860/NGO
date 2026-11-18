# Enterprise Feature-Based Hybrid Folder Architecture
**Platform**: HopeHorizon / Vikas NGO Ecosystem  
**Pattern**: Domain-Driven Feature Modules + Layered Shared Infrastructure  

---

## 1. Master Directory Tree

```text
S:/Project/NGO/
├── .github/
│   ├── workflows/                    # GitHub Actions CI/CD pipelines
│   │   └── ci.yml
│   ├── ISSUE_TEMPLATE/               # Bug & feature request templates
│   └── PULL_REQUEST_TEMPLATE.md      # Multi-developer review checklist
│
├── docs/                             # Comprehensive system documentation
│   ├── architecture/                 # Architecture blueprints & decisions
│   │   ├── SYSTEM_ARCHITECTURE.md
│   │   ├── FOLDER_STRUCTURE.md
│   │   ├── MODULE_BOUNDARIES.md
│   │   ├── DEPENDENCY_RULES.md
│   │   └── ARCHITECTURE_DECISIONS.md
│   ├── development/                  # Engineering processes & guidelines
│   │   ├── DEVELOPMENT_GUIDELINES.md
│   │   ├── CODING_STANDARDS.md
│   │   ├── GIT_WORKFLOW.md
│   │   ├── PULL_REQUEST_GUIDELINES.md
│   │   └── DEVELOPER_ONBOARDING.md
│   ├── modules/                      # Domain specifications
│   │   ├── AUTHENTICATION.md
│   │   ├── USER_MANAGEMENT.md
│   │   ├── DONATIONS.md
│   │   ├── PROJECTS.md
│   │   ├── VOLUNTEERS.md
│   │   ├── FINANCE.md
│   │   └── EMAIL_SYSTEM.md
│   └── api/
│       └── API_CONVENTIONS.md
│
├── public/                           # Static public assets
│   ├── images/
│   ├── logos/
│   ├── icons/
│   └── documents/
│
├── scripts/                          # DevOps & Maintenance utilities
│   ├── database/                     # Seeds and migrations
│   ├── maintenance/                  # Ledger checks and session cleanup
│   ├── development/                  # Local dev helpers
│   └── deployment/                   # Docker & release scripts
│
├── tests/                            # Global test suites
│   ├── e2e/                          # Playwright end-to-end tests
│   ├── integration/                  # Cross-feature integration tests
│   ├── fixtures/                     # Test mock fixtures
│   ├── helpers/                      # Test helper utilities
│   └── setup/                        # Jest-DOM & environment configuration
│
└── src/
    ├── app/                          # Next.js 16 App Router (Routing Shell)
    │   ├── (public)/                 # Public marketing & storytelling routes
    │   │   ├── layout.tsx            # Public layout (Header, Footer, MobileNav)
    │   │   ├── page.tsx              # Homepage
    │   │   ├── about/                # Story, Mission, Team, Leadership, Awards
    │   │   ├── campaigns/            # Urgent appeals list & [id] detail
    │   │   ├── projects/             # Projects list & [id] detail
    │   │   ├── programs/             # Causes & thematic programs
    │   │   ├── donate/               # 80G tax-exempt donation page
    │   │   ├── donor-register/       # 4-step comprehensive donor onboarding
    │   │   ├── volunteer/            # Volunteer application form
    │   │   ├── verify-certificate/   # Public verification ledger
    │   │   ├── transparency/         # Audit reports archive
    │   │   ├── impact/               # KPI & impact tracker
    │   │   ├── google-sheets/        # Google Workspace live sync
    │   │   └── ... (csr, partners, news, stories, events, careers, faq, contact, legal)
    │   │
    │   ├── (auth)/                   # Dedicated auth routes (Phase 4 target)
    │   │   ├── login/
    │   │   ├── register/
    │   │   ├── verify-email/
    │   │   ├── forgot-password/
    │   │   └── reset-password/
    │   │
    │   ├── dashboard/                # Role-switched authenticated workspace
    │   │   ├── layout.tsx            # Authenticated workspace header & shell
    │   │   ├── page.tsx              # Dynamic role-switched portal router
    │   │   └── ... (admin, volunteer, donor, member, staff role groups)
    │   │
    │   ├── api/                      # Next.js 16 Route Handlers (/api/v1/*)
    │   ├── layout.tsx                # Root HTML document shell
    │   ├── providers.tsx             # Global React Context & Query providers
    │   └── globals.css               # Tailwind v4 theme & print styles
    │
    ├── features/                     # Self-Contained Business Modules
    │   ├── authentication/           # Identity, sessions, 2FA, persona switcher
    │   ├── organizations/            # Multi-tenant profile & statutory IDs
    │   ├── users/                    # User accounts & department assignments
    │   ├── roles-permissions/        # 13 roles & 36 permission evaluation
    │   ├── programs/                 # Thematic areas (Education, Water, Health)
    │   ├── projects/                 # Field deployments & milestone tracking
    │   ├── campaigns/                # Urgent fundraising appeals & live updates
    │   ├── donations/                # Section 80G giving & Form 10BE receipts
    │   ├── donors/                   # Donor CRM & giving portfolios
    │   ├── volunteers/               # Volunteer applications & hour logging
    │   ├── members/                  # General assembly & digital QR cards
    │   ├── certificates/             # Credential issuance & public verification
    │   ├── finance/                  # Financial ledger, expenses & refund desk
    │   ├── compliance/               # Section 80G, 12A, FCRA & Darpan governance
    │   ├── email/                    # Transactional email dispatcher & logs
    │   ├── notifications/            # In-app toasts & alerts
    │   ├── cms/                      # News articles, blog & success stories
    │   ├── media/                    # Gallery assets & document vault
    │   ├── newsletter/               # Zod-validated lead capturing
    │   ├── google-workspace/         # Firebase Auth + Drive & Sheets live sync
    │   └── audit-logs/               # Immutable administrative security ledger
    │
    ├── components/                   # Reusable Design System Primitives
    │   ├── ui/                       # 25+ base components (Button, Modal, DataTable)
    │   ├── layout/                   # PublicLayout, AdminLayout, Footer, Navbar
    │   ├── navigation/               # Header, MegaMenu, MobileBottomNav, LangSelector
    │   └── common/                   # GlobalModals, PersonaSwitcher, ErrorBoundary
    │
    ├── server/                       # Server-Only Infrastructure & Architecture
    │   ├── database/
    │   │   ├── connection/           # Mongoose pool singleton (src/lib/mongodb.ts)
    │   │   ├── models/               # Multi-tenant Mongoose schemas (Phase 2+)
    │   │   ├── migrations/           # Data migration scripts
    │   │   └── seeds/                # Initial seed automation
    │   ├── auth/                     # Server-side JWT & cookie session verifier
    │   ├── authorization/            # Server-side RBAC permission guards
    │   ├── tenant/                   # Request tenant resolver (Host / Subdomain / Header)
    │   ├── middleware/               # Composable API pipeline middleware
    │   ├── security/                 # Rate limiting, CSRF & hashing utils
    │   ├── logging/                  # Pino structured logger with PII redaction
    │   └── errors/                   # AppError, ValidationError, UnauthorizedError
    │
    ├── integrations/                 # Pluggable Third-Party Service Adapters
    │   ├── payment/                  # IPaymentGateway (Razorpay, Stripe)
    │   ├── email/                    # IEmailProvider (Nodemailer, Resend, SendGrid)
    │   ├── storage/                  # IStorageProvider (Local, S3, Cloudinary)
    │   ├── notification/             # SMS & Push interfaces
    │   └── google-workspace/         # Google Drive & Sheets REST API drivers
    │
    ├── shared/                       # Business-Agnostic Cross-Cutting Utilities
    │   ├── types/                    # System-wide shared TypeScript interfaces
    │   ├── constants/                # Global limits, thresholds & enums
    │   ├── schemas/                  # Shared Zod validation schemas
    │   ├── hooks/                    # Reusable utility hooks
    │   ├── utils/                    # cn(), formatters, string helpers
    │   └── contracts/                # ApiResponse<T> & pagination contracts
    │
    ├── config/                       # Centralized System Configuration
    │   ├── app.config.ts             # Statutory registration IDs, locales, currency
    │   ├── site.config.ts            # Global SEO, metadata & social links
    │   ├── navigation.config.ts      # Navigation tree hierarchy
    │   ├── permissions.config.ts     # Role-permission baseline matrix
    │   ├── feature-flags.config.ts   # System feature toggles
    │   └── environment.ts            # Type-safe environment variable parsing
    │
    └── styles/                       # Centralized Design Tokens & Styles
        ├── tokens.css                # CSS variables for colors, spacing, radii
        ├── themes.css                # Multi-tenant theme overrides
        └── utilities.css             # Print stylesheets & utility classes
```

---

## 2. Standard Feature Directory Convention

Every business module under `src/features/<feature-name>/` strictly implements the following structure:

```text
src/features/donations/
├── components/                       # Feature-specific presentation components
│   ├── DonationForm.tsx
│   ├── DonationTable.tsx
│   └── DonationStatusBadge.tsx
├── hooks/                            # Feature-specific stateful hooks
│   ├── useDonations.ts
│   └── use80GReceipt.ts
├── services/                         # Business workflows & calculations
│   └── donation.service.ts
├── schemas/                          # Zod request validation schemas
│   └── donation.schema.ts
├── types/                            # Domain-specific TypeScript models
│   └── donation.types.ts
├── index.ts                          # Explicit public exports boundary
└── README.md                         # Feature documentation & ownership
```

### Rule of Encapsulation:
Files outside `src/features/donations/` may **only import from `src/features/donations/index.ts`** or `@/features/donations`. Importing internal files directly (e.g. `@/features/donations/components/DonationForm.tsx`) is strictly forbidden by ESLint and architectural boundary rules.
