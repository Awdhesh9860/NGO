# Role & Permission Management Module

**Module Ownership:** Identity & Access Squad  
**Primary Files:** `src/server/authorization/permissions.ts`, `src/server/database/models/Role.ts`, `src/server/repositories/role.repository.ts`, `src/app/api/v1/admin/roles/`, `src/app/dashboard/admin/roles/`

## 1. 13-Role System Hierarchy
The platform enforces 13 immutable built-in system roles defined in `ROLE_PERMISSIONS`:
1. `SUPER_ADMIN` — Full platform-wide access (`organizations.manage` + all 26 permissions).
2. `ADMIN` — Full organization-scoped administration (`settings.manage`, `users.manage`, `roles.manage`, `departments.manage`, `audit_logs.view`, etc.).
3. `EXECUTIVE_DIRECTOR` — Organization governance, operations, compliance, and approvals.
4. `MANAGER` — Departmental operations, projects, programs, volunteers, members, and audit visibility.
5. `PROJECT_MANAGER` — Project execution, task assignment, and certificate issuance.
6. `ACCOUNTANT` — Financial ledgers, donation refunds, Form 10BD/80G exports, compliance, and audit logs.
7. `COMMUNICATIONS` — Content publishing, notifications, and certificates.
8. `CONTENT_EDITOR` — Content publishing and personal donation history.
9. `TEAM_MEMBER` — Assigned projects and assigned task updates.
10. `VOLUNTEER` — Assigned field projects and volunteer hour updates.
11. `DONOR` — Personal donation receipts and history (`donations.view_own`).
12. `MEMBER` — Assembly membership portal and personal giving history.
13. `GUEST` — Unauthenticated public visitor (**0 permissions**; blocked from `/dashboard` and `/dashboard/admin`).

## 2. Permission Catalog & Module Grouping
Permissions are grouped into 6 modules (`Users`, `Organization`, `Operations`, `Finance`, `Community`, `Security`) via `ALL_PERMISSIONS`.
- **Platform-Protected Permissions:** `PLATFORM_PROTECTED_PERMISSIONS = ['organizations.manage']`. Non-`SUPER_ADMIN` actors cannot grant platform-protected permissions in custom roles.

## 3. Custom Organization Roles
- Stored in MongoDB (`Role` model) with unique compound index `{ organizationId, key }`.
- Clear separation: `isSystemRole: false` for organization custom roles; built-in system role keys cannot be overwritten or mutated.
- Custom roles can be created, updated, previewed, and deactivated (`status: 'inactive'`).

## 4. API Contracts
| Endpoint | Method | Permission | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/v1/admin/roles` | `GET` | `users.view` | System roles, custom roles & permission catalog |
| `/api/v1/admin/roles` | `POST` | `roles.manage` | Create custom role (Zod validated) |
| `/api/v1/admin/roles/[id]` | `GET` | `users.view` | Role details (system key or custom ObjectId) & assigned user count |
| `/api/v1/admin/roles/[id]` | `PATCH` | `roles.manage` | Update or deactivate custom role |
