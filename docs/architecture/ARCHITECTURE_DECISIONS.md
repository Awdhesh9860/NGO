# Enterprise NGO Platform — Architectural Decision Records (ADR)
**Platform**: HopeHorizon / Vikas NGO Ecosystem  
**Standards**: Michael Nygard ADR Format  

---

## ADR-001: Adoption of Hybrid Feature-Based Architecture
- **Context**: The existing project contained scattered components and shared contexts. Expanding to 10–20 developers would cause merge conflicts and unclear module ownership.
- **Decision**: Adopt a Hybrid Feature-Based Architecture (`src/features/*`) where each business domain owns its components, hooks, services, schemas, and tests, while generic infrastructure lives in `src/shared/`, `src/components/`, and `src/server/`.
- **Consequences**: High modularity, zero circular dependencies, clear developer ownership, and simplified onboarding.

---

## ADR-002: Next.js 16 App Router as Thin Routing Shell
- **Context**: Embedding complex state and business logic inside App Router `page.tsx` makes code difficult to test and violates separation of concerns.
- **Decision**: Treat `src/app/` strictly as a routing, layout, and metadata shell. `page.tsx` files only extract route parameters and delegate immediately to feature components.
- **Consequences**: Route files stay under 40 lines of code; features remain easily portable and testable.

---

## ADR-003: Multi-Tenancy via Tenant Discriminator (`organizationId`)
- **Context**: Multiple NGOs and charitable entities need isolation without the operational complexity and cost of spinning up separate physical databases per tenant.
- **Decision**: Enforce logical multi-tenancy using an `organizationId` index on all collections, automated by Mongoose query pre-hooks.
- **Consequences**: Robust data isolation, cost-effective scalability, and unified maintenance.

---

## ADR-004: Dual-Layer RBAC Architecture
- **Context**: Checking permissions only on the client allows malicious users to bypass UI gates and invoke endpoints directly.
- **Decision**: Implement client-side role rendering for UX (`<PermissionGate>`) and enforce mandatory server-side authorization guards (`authorizeRequest`) on every API Route Handler.
- **Consequences**: Complete protection against unauthorized access and privilege escalation.

---

## ADR-005: Pluggable Third-Party Integration Adapters
- **Context**: NGOs operate in diverse regulatory jurisdictions requiring different payment gateways (Razorpay in India, Stripe internationally) and email providers.
- **Decision**: Wrap third-party services behind strict TypeScript interfaces (`IPaymentGateway`, `IEmailProvider`, `IStorageProvider`) under `src/integrations/`.
- **Consequences**: Vendor lock-in is eliminated; changing a provider requires zero modifications to core business features.

---

## ADR-006: Phased Migration of Mock Data
- **Context**: Tearing down the mock database prematurely would break the working UI before the persistent Mongoose models and APIs are fully operational.
- **Decision**: Establish the folder architecture and contracts first (Prompt 02). Wire Mongoose persistence incrementally feature by feature in subsequent phases without disrupting working front-end screens.
- **Consequences**: Zero downtime or broken workflows during progressive modernization.
