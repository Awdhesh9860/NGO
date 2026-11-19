# Admin Module Development Guidelines

**Applies To:** All squads contributing to `/dashboard/admin/*`, `src/features/admin/`, and `/api/v1/admin/*`

## 1. Hybrid Architecture & Module Ownership
Multiple developers can work concurrently without merge conflicts by honoring these strict module boundaries:

| Domain | Squad / Owner | Frontend UI | API Route | Repository / Model |
| :--- | :--- | :--- | :--- | :--- |
| Executive Dashboard & Search | Platform Admin Squad | `src/app/dashboard/admin/page.tsx` | `/api/v1/admin/stats`, `/search`, `/notifications` | Aggregated via `AdminService` |
| User Management | Identity & Access Squad | `src/app/dashboard/admin/users/*` | `/api/v1/admin/users/*` | `user.repository.ts`, `User.ts`, `Session.ts` |
| Roles & Permissions | Identity & Access Squad | `src/app/dashboard/admin/roles/*` | `/api/v1/admin/roles/*` | `role.repository.ts`, `Role.ts`, `permissions.ts` |
| Invitations | Identity & Access Squad | `src/app/dashboard/admin/invitations/` | `/api/v1/admin/invitations/*` | `invitation.repository.ts`, `Invitation.ts` |
| Departments | Org Structure Squad | `src/app/dashboard/admin/departments/*` | `/api/v1/admin/departments/*` | `department.repository.ts`, `Department.ts` |
| Organization & Settings | Multi-Tenant Core Squad | `src/app/dashboard/admin/organization/*` | `/api/v1/admin/organization`, `/organizations` | `organization.repository.ts`, `Organization.ts` |
| Audit Logs | Security & Compliance Squad | `src/app/dashboard/admin/audit-logs/` | `/api/v1/admin/audit-logs` | `audit.repository.ts`, `AuditLog.ts` |

## 2. Coding Standards & Boundary Rules
1. **No Direct DB Access from Client Components:** UI components only communicate through `adminApiService` (`src/features/admin/services/admin-api.service.ts`) or TanStack Query wrappers.
2. **Validate Every Input with Zod:** Place all request schemas in `src/features/admin/schemas/admin.schema.ts` and parse inside route handlers before invoking `adminService`.
3. **Never Trust Client `organizationId`:** Always derive `orgId` from `authContext.user.organizationId` returned by `requirePermission()`.
4. **Audit Every Mutation:** Every state-changing administrative operation must call `adminService.logAudit()` with sanitized metadata.
5. **Reusable UI Primitives:** Reuse `PageHeader`, `StatCard`, `DataTable`, `SearchFilterBar`, `StatusBadge`, `EmptyState`, `LoadingSkeleton`, `ConfirmDialog`, `PermissionGate`, and `ActivityTimeline` from `@/features/admin`.
6. **Zero Fake Data:** Display real database counts or `EmptyState`; never hardcode metrics or fabricated verification badges.

## 3. Running Verification Locally
```bash
# 1. TypeScript strict check
npx tsc --noEmit

# 2. Unit & security test suite (Vitest)
npm run test:run

# 3. Production build check
npm run build
```
