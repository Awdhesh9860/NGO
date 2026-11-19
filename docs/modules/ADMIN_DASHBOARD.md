# Admin Dashboard Module

**Module Ownership:** Platform Administration Squad (`src/features/admin/`, `src/app/dashboard/admin/`)  
**Phase:** 06 — Enterprise Admin Dashboard & Organization Management

## 1. Overview
The Executive Admin Dashboard (`/dashboard/admin`) serves as the tenant-scoped internal operations console for authorized NGO personnel. All KPIs, trend charts, department distributions, notifications, and audit streams are sourced directly from MongoDB aggregations with empty-state handling for empty datasets.

## 2. Route Architecture
| Route | Description | Minimum Permission |
| :--- | :--- | :--- |
| `/dashboard` | Role-dispatched workspace (blocks `GUEST` with sign-in prompt) | Authenticated |
| `/dashboard/admin` | Executive overview, real KPIs, registration trends & activity | `users.view` |
| `/dashboard/admin/users` | User directory, filters, sorting, creation & suspension | `users.view` / `users.manage` |
| `/dashboard/admin/users/[id]` | User profile, role/dept/manager assignment, sessions & activity | `users.view` / `users.manage` |
| `/dashboard/admin/roles` | 13 system roles, custom roles & module permission matrix | `users.view` / `roles.manage` |
| `/dashboard/admin/roles/[id]` | Role permission preview, custom role editor & deactivation | `users.view` / `roles.manage` |
| `/dashboard/admin/departments` | Department cards, budgets, heads & member counts | `departments.manage` |
| `/dashboard/admin/departments/[id]` | Department editor, member roster assignment & activity | `departments.manage` |
| `/dashboard/admin/invitations` | Email invitation tracker, send, resend & revoke | `users.manage` |
| `/dashboard/admin/organization` | Organization profile & verified identity summary | `users.view` |
| `/dashboard/admin/organization/settings` | 5-tab settings (General, Identity, Regional, Security, Notifications) | `settings.manage` |
| `/dashboard/admin/audit-logs` | Immutable security audit log center & CSV export | `audit_logs.view` |
| `/dashboard/admin/notifications` | Security alerts, expiring invites & verification notices | `notifications.manage` |

## 3. Reusable Dashboard Components (`src/features/admin/components/`)
- `DashboardSidebar` — Config-driven, permission-filtered navigation drawer (responsive 320px–desktop).
- `DashboardHeader` — Sticky top bar with global tenant-scoped search (`/api/v1/admin/search`), notifications, theme toggle, and profile.
- `OrganizationSwitcher` — Tenant status/verification card; lists platform organizations for `SUPER_ADMIN`.
- `Breadcrumbs`, `PageHeader`, `StatCard`, `DataTable`, `SearchFilterBar`, `StatusBadge`, `EmptyState`, `LoadingSkeleton`, `ConfirmDialog`, `PermissionGate`, `ActivityTimeline`, `NotificationPanel`.

## 4. API Contracts
- `GET /api/v1/admin/stats` — Requires `users.view`. Returns `userMetrics`, `organizationMetrics`, `charts.monthlyRegistrations`, `charts.departmentDistribution`, `recentActivity`.
- `GET /api/v1/admin/search?q=<query>` — Requires `users.view`. Tenant-scoped search across users, departments, invitations, and custom roles.
- `GET /api/v1/admin/notifications` — Requires `notifications.manage`. Returns live alerts derived from tenant audit logs, expiring invitations, and verification state.

## 5. Testing
Run `npm run test:run` to execute `src/tests/admin.test.ts` validating role-based navigation filtering, schema validation, and service security guards.
