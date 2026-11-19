# Administrative Security Architecture

**Owner:** Security Engineering  
**Scope:** Phase 06 — Admin Dashboard, Organization Management, RBAC & Multi-Tenancy

## 1. Server-Side Authorization (Defense in Depth)
Frontend menu filtering (`getAuthorizedAdminNav`, `PermissionGate`) is purely UX convenience. Every `/api/v1/admin/*` route enforces authentication and authorization server-side via `requirePermission()` from `src/server/authorization/guards.ts`:
1. Extracts HTTP-only cookie (`hh_ngo_session`) or `Authorization: Bearer` JWT.
2. Verifies HS256 JWT signature (`verifyAuthToken`).
3. Validates non-revoked, non-expired `Session` document in MongoDB (`validateSession`).
4. Loads active `User` document (`status === 'active'`).
5. Evaluates `checkRolePermission(user.role, requiredPermission)` (with `SUPER_ADMIN` override).

## 2. Multi-Tenant Isolation Rules
- `organizationId` is **always** read from `authContext.user.organizationId` on the server — client query params or request bodies cannot override tenant scope.
- Cross-tenant reads and mutations return `404 Not Found` or `403 Forbidden` (tested in `src/tests/admin.test.ts`).
- Related entity assignments (`departmentId`, `managerId`, `customRoleId`, `headUserId`) verify that the referenced entity belongs to the exact same `organizationId`.
- Invitation acceptance validates `invitation.organizationId === targetOrganizationId` before allowing redemption.

## 3. Privilege Escalation & Lockout Prevention
- **SUPER_ADMIN Protection:** Only `SUPER_ADMIN` can assign `SUPER_ADMIN`, invite `SUPER_ADMIN`, modify a `SUPER_ADMIN` user, list all platform tenants, or change tenant `status`/`verificationStatus`.
- **Platform-Protected Permissions:** Custom organization roles cannot include `organizations.manage` unless created by a `SUPER_ADMIN`. Built-in system roles (`isSystemRole: true`) are immutable.
- **Last Active Admin Protection:** Before demoting or suspending an `ADMIN`/`SUPER_ADMIN`, `userRepository.countActiveAdmins(orgId)` is checked; if `<= 1`, the operation fails with HTTP 400 `LAST_ADMIN_PROTECTED`.
- **Self-Deactivation Guard:** Administrators cannot suspend/deactivate their own active account.
- **GUEST Isolation:** Both `/dashboard` (`DashboardLayout.tsx`) and `/dashboard/admin` (`AdminLayout`) explicitly block `GUEST` users; backend APIs reject unauthenticated requests with `401 UNAUTHENTICATED`.

## 4. Session Revocation & Secret Hygiene
- Suspending or deactivating a user immediately calls `revokeAllUserSessions(userId)`.
- Administrators with `users.manage` can inspect and terminate individual or all active sessions for users within their tenant.
- Passwords, OTPs, raw invitation tokens, TOTP secrets, and payment secrets are never logged in `AuditLog` (`sanitizeAuditMetadata`) or exposed in API responses.
