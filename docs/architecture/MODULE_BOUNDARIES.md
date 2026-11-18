# Enterprise NGO Platform — Module Boundaries & Encapsulation
**Platform**: HopeHorizon / Vikas NGO Ecosystem  
**Principle**: High Cohesion, Low Coupling & Strict Encapsulation  

---

## 1. Boundary Rules & Encapsulation Architecture

To allow 10–20 developers to work simultaneously without code conflicts:
1. **Module Autonomy**: Each feature under `src/features/<feature-name>/` is a self-contained bounded context.
2. **Public Interface Contract (`index.ts`)**: A feature may only export components, hooks, services, and types that are intended for external consumption via its root `index.ts`.
3. **No Deep Imports**: Importing internal files of another feature (e.g. `import { helper } from '@/features/projects/internal/calc'`) is strictly prohibited.
4. **Shared Layer Independence**: Generic shared components in `src/components/ui/` and `src/shared/` must remain completely agnostic of business features.

---

## 2. Core Feature Domain Boundaries

| Feature Module | Primary Responsibility | Owns | Must NOT Own |
| :--- | :--- | :--- | :--- |
| **`authentication`** | Identity, credentials, sessions, 2FA | Login/Register modals, session cookies, password reset, persona switcher | Project roles, member badges, donation receipts |
| **`organizations`** | Tenant profile & configuration | Organization branding, statutory registration IDs (80G/12A/FCRA/Darpan) | User accounts, individual transactions |
| **`users`** | User management & accounts | User profiles, account status toggling, department links | Raw password hashing logic, login forms |
| **`roles-permissions`**| RBAC policy definitions & evaluation | 13-role permission matrix, dynamic permission evaluation | Hardcoded UI routing logic |
| **`programs`** | Thematic NGO causes | Program definitions, overarching budgets, high-level impact stats | Field task assignments, daily attendance |
| **`projects`** | Field deployments & milestones | Project CRUD, milestones, team assignments, location telemetry | Statutory tax receipts, raw payment gateway logs |
| **`campaigns`** | Fundraising appeals | Emergency appeal targets, urgent badges, live field updates | Payment webhook verifications, bank wires |
| **`donations`** | Giving lifecycle & tax exemptions | Donation forms, 80G Form 10BE generation, refund requests | Project milestone editing, volunteer applications |
| **`donors`** | Donor relationship management (CRM) | Giving history, cumulative impact, tax-saving calculators | Gateway secret keys, admin user creation |
| **`volunteers`** | Grassroots contributors | Applications, status vetting, service hour logs | Staff payroll, financial balance sheets |
| **`members`** | Assembly membership | Tiered memberships, digital QR passes, AGM voting logs | Public donation checkout modals |
| **`certificates`** | Credential issuance & verification | Serial number generation, QR verification codes, public ledger lookup | Volunteer application approvals |
| **`compliance`** | Statutory governance & filings | Annual audit archives, Form 10BE compliance ledgers, FCRA tracking | Daily blog posts, social media sharing |
| **`google-workspace`**| External Google Workspace sync | Firebase Google Auth, Drive spreadsheet listing & collection export | Core application database schemas |

---

## 3. Inter-Module Communication Patterns

### Permitted Communication:
- **Calling Public Exported Functions**: Feature A imports a documented service or component from `src/features/B/index.ts`.
- **Passing IDs over Direct Object Coupling**: Feature A references an entity from Feature B using its ID string (`projectId`), querying Feature B's public repository or API endpoint when full entity data is required.
- **Shared Event Dispatching**: For asynchronous side effects (e.g., a completed donation triggering an audit log entry), features emit events or invoke shared server utilities.
