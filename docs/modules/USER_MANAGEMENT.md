# User Management Module

**Module Ownership:** Identity & Access Squad  
**Primary Files:** `src/app/dashboard/admin/users/`, `src/app/api/v1/admin/users/`, `src/server/repositories/user.repository.ts`, `src/server/services/admin.service.ts`

## 1. Capabilities
- Searchable, filterable (role, status, department), sortable, and paginated user directory.
- Direct user creation with Zod validation (`createUserSchema`) and bcrypt (cost 12) password hashing.
- User profile editor (`/dashboard/admin/users/[id]`): name, contact info, designation, system role, optional custom role (`customRoleId`), department (`departmentId`), reporting manager (`managerId`), and account status (`active` | `inactive` | `suspended`).
- Active session inspection and remote session revocation (single or all sessions) via `src/server/auth/session.ts`.
- User activity timeline linked to immutable `AuditLog` records.
- Automated email notifications on role changes (`renderRoleChangedEmail`) and status transitions (`renderAccountStatusEmail`).

## 2. Database Relationships (`User` Model)
- `organizationId` (`ObjectId` → `Organization`, required, indexed; compound unique index `{ organizationId, email }`)
- `departmentId` (`ObjectId` → `Department`, optional, indexed)
- `managerId` (`ObjectId` → `User`, optional; validated to belong to same `organizationId`)
- `customRoleId` (`ObjectId` → `Role`, optional; validated to belong to same `organizationId`)

## 3. API Contracts
| Endpoint | Method | Permission | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/v1/admin/users` | `GET` | `users.view` | Paginated, sorted, filtered tenant users |
| `/api/v1/admin/users` | `POST` | `users.manage` | Create user inside caller's tenant |
| `/api/v1/admin/users/[id]` | `GET` | `users.view` | User detail + recent activity |
| `/api/v1/admin/users/[id]` | `PATCH` | `users.manage` | Update profile, role, dept, manager, status |
| `/api/v1/admin/users/[id]` | `DELETE` | `users.manage` | Suspend account & terminate active sessions |
| `/api/v1/admin/users/[id]/sessions` | `GET` | `users.manage` | List active sessions |
| `/api/v1/admin/users/[id]/sessions` | `DELETE` | `users.manage` | Revoke `?sessionId=<id>` or `?all=true` |

## 4. Security Guards & Tenant Isolation
- Every query scopes strictly by `authContext.user.organizationId` resolved from the verified JWT session.
- Privilege escalation prevention: only `SUPER_ADMIN` can grant `SUPER_ADMIN` or modify another `SUPER_ADMIN`.
- Last-admin protection: `countActiveAdmins(orgId) <= 1` blocks demoting or suspending the final active organization admin (`LAST_ADMIN_PROTECTED`).
- Self-deactivation is prohibited.
- Suspending a user immediately invokes `revokeAllUserSessions(id)`.
