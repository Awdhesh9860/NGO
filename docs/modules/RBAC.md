# Role-Based Access Control (RBAC) Specification

## HopeHorizon / Vikas NGO Ecosystem — Phase 4

### 1. 13-Role Hierarchy Overview
HopeHorizon implements a strict Role-Based Access Control architecture covering 13 distinct roles across 4 functional tiers:

| Tier | Role | Description |
| :--- | :--- | :--- |
| **Executive & Admin** | `SUPER_ADMIN` | Root system owner; cross-tenant management, security settings |
| | `ADMIN` | Organizational administrator; manages users, projects, and settings |
| | `EXECUTIVE_DIRECTOR` | NGO Director; strategic oversight, approvals, financial audit |
| **Operational Staff** | `MANAGER` | Department head; oversees projects, campaigns, and team members |
| | `PROJECT_MANAGER` | Leads individual field initiatives, assigns volunteer tasks |
| | `ACCOUNTANT` | Financial controller; 80G receipts, refunds, statutory reports |
| | `COMMUNICATIONS` | Media & PR manager; publishes press releases and certificates |
| | `CONTENT_EDITOR` | Web content editor; blogs, stories, photo galleries |
| | `TEAM_MEMBER` | Field/office staff member; executes assigned operational tasks |
| **Community & Public** | `VOLUNTEER` | Registered volunteer; logs service hours, task execution |
| | `DONOR` | Financial contributor; tax receipts, campaign subscriptions |
| | `MEMBER` | Annual/Lifetime foundation member; voting & general meetings |
| | `GUEST` | Unauthenticated public visitor |

---

### 2. Comprehensive Permission Matrix

| Permission Key | Description | Roles Possessing Permission |
| :--- | :--- | :--- |
| `users.view` | View user roster | `SUPER_ADMIN`, `ADMIN`, `EXECUTIVE_DIRECTOR`, `MANAGER` |
| `users.manage` | Invite, edit, suspend users | `SUPER_ADMIN`, `ADMIN`, `EXECUTIVE_DIRECTOR` |
| `roles.manage` | Assign roles & clearances | `SUPER_ADMIN`, `ADMIN`, `EXECUTIVE_DIRECTOR` |
| `projects.view` | View all internal projects | `SUPER_ADMIN`, `ADMIN`, `EXECUTIVE_DIRECTOR`, `MANAGER`, `PROJECT_MANAGER` |
| `projects.manage` | Create, update, budget projects | `SUPER_ADMIN`, `ADMIN`, `EXECUTIVE_DIRECTOR`, `MANAGER`, `PROJECT_MANAGER` |
| `projects.view_assigned`| View assigned projects | `...`, `TEAM_MEMBER`, `VOLUNTEER` |
| `tasks.assign_manage` | Assign tasks to staff/volunteers | `SUPER_ADMIN`, `ADMIN`, `EXECUTIVE_DIRECTOR`, `MANAGER`, `PROJECT_MANAGER` |
| `tasks.update_assigned` | Mark task completion & submit logs | `...`, `TEAM_MEMBER`, `VOLUNTEER` |
| `donations.view_all` | View all organization donations | `SUPER_ADMIN`, `ADMIN`, `EXECUTIVE_DIRECTOR`, `MANAGER`, `ACCOUNTANT` |
| `donations.refund` | Issue refunds & re-issue receipts | `SUPER_ADMIN`, `ADMIN`, `EXECUTIVE_DIRECTOR`, `ACCOUNTANT` |
| `donations.view_own` | View personal donation history | All authenticated roles (`SUPER_ADMIN` down to `MEMBER`) |
| `content.publish` | Publish stories, blogs, news | `SUPER_ADMIN`, `ADMIN`, `EXECUTIVE_DIRECTOR`, `MANAGER`, `COMMUNICATIONS`, `CONTENT_EDITOR` |
| `certificates.issue` | Issue volunteer/80G certificates | `SUPER_ADMIN`, `ADMIN`, `EXECUTIVE_DIRECTOR`, `MANAGER`, `PROJECT_MANAGER`, `COMMUNICATIONS` |
| `reports.export_financial`| Export Form 10BD, 80G ledger | `SUPER_ADMIN`, `ADMIN`, `EXECUTIVE_DIRECTOR`, `ACCOUNTANT` |
| `audit_logs.view` | View immutable audit logs | `SUPER_ADMIN`, `ADMIN`, `EXECUTIVE_DIRECTOR`, `MANAGER`, `ACCOUNTANT` |
| `settings.manage` | Update NGO statutory & gateway configs | `SUPER_ADMIN`, `ADMIN`, `EXECUTIVE_DIRECTOR` |

---

### 3. Server Guards (`src/server/authorization/guards.ts`)
1. `requireAuthentication(req)`: Asserts valid JWT and active session in database.
2. `requireRole(req, allowedRoles)`: Asserts user role belongs to `allowedRoles` (bypassed for `SUPER_ADMIN`).
3. `requirePermission(req, permission)`: Validates role against the RBAC matrix.
4. `requireOrganizationAccess(req, targetOrgId)`: Enforces multi-tenant data isolation.
