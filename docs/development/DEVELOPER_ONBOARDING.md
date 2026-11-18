# Enterprise NGO Platform — Developer Onboarding Guide
**Platform**: HopeHorizon / Vikas NGO Ecosystem  
**Target Audience**: New Engineers Joining the Development Team  

---

## 1. Welcome to the Team!

Welcome to the **HopeHorizon / Vikas NGO Ecosystem** engineering team. This platform powers statutory compliance, donor engagement, volunteer coordination, and public transparency for non-governmental organizations.

---

## 2. Fast-Track Mental Model (10-Minute Architecture Tour)

### The 5 Architectural Layers:
1. **`src/app/` (App Shell)**: Houses Next.js routes. Contains minimal logic; merely routes URLs to feature components.
2. **`src/features/` (Feature Modules)**: The heart of the application. 20+ independent domains (`donations`, `volunteers`, `projects`, `auth`, etc.). Developers work almost entirely inside their assigned feature.
3. **`src/components/ui/` & `src/shared/`**: Generic, business-agnostic building blocks (buttons, modals, tables, formatters, API contracts).
4. **`src/server/`**: Server-only infrastructure (database singleton, auth cookies, RBAC authorization, Pino logger).
5. **`src/integrations/`**: Pluggable adapters for external clouds (Razorpay, Stripe, Nodemailer, Firebase Google Workspace).

---

## 3. Team Module Ownership Map

When you join a feature squad, you collaborate with the designated module owner:

| Feature Squad | Primary Modules | Focus Areas |
| :--- | :--- | :--- |
| **Squad Alpha** | `authentication`, `users`, `roles-permissions`, `audit-logs` | Identity, 2FA, RBAC, session management |
| **Squad Beta** | `donations`, `donors`, `finance`, `compliance` | Section 80G tax receipts, payments, Form 10BE ledgers |
| **Squad Gamma** | `projects`, `programs`, `campaigns`, `tasks` | Field operations, milestone tracking, emergency appeals |
| **Squad Delta** | `volunteers`, `members`, `events`, `certificates` | Community onboarding, hour logger, credentials ledger |
| **Squad Epsilon**| `cms`, `media`, `newsletter`, `google-workspace` | Storytelling, public portal, Google Drive/Sheets sync |
| **Architecture Lead**| `src/server/*`, `src/shared/*`, `src/components/ui/*` | Cross-cutting infrastructure, security, CI/CD |

---

## 4. Your First Contribution Walkthrough

1. Check out a new branch: `git checkout -b feature/<your-domain>-<task-name> develop`.
2. Locate your feature directory in `src/features/<domain>/`.
3. Modify or add components and services within your feature folder.
4. Export public components via `src/features/<domain>/index.ts`.
5. Run unit tests locally: `npm run test:run`.
6. Commit using conventional commits: `git commit -m "feat(<domain>): description"`.
7. Push and open a Pull Request using the PR template.
