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


