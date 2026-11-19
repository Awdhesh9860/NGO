# Audit Logs & Admin Activity Module

**Module Ownership:** Security & Compliance Squad  
**Primary Files:** `src/server/database/models/AuditLog.ts`, `src/server/repositories/audit.repository.ts`, `src/app/api/v1/admin/audit-logs/route.ts`, `src/app/dashboard/admin/audit-logs/page.tsx`

## 1. Immutability Design
Audit logs are append-only:
- `AuditRepository` only exposes `create`, `findMany`, and `count` — no update or delete methods exist.
- `/api/v1/admin/audit-logs` only exposes `GET` (protected by `requirePermission(req, 'audit_logs.view')`).
- Indexed by `{ organizationId: 1, timestamp: -1 }`, `actorId`, `action`, `resource`, `resourceId`, and `correlationId`.

## 2. Recorded Fields
- `organizationId`: Server-resolved tenant ObjectId.
- `actorId`, `actorName`, `actorRole`: Authenticated actor executing the command.
- `action`: Event identifier (`USER_CREATE`, `USER_UPDATE`, `USER_SUSPEND`, `ROLE_CHANGE`, `ROLE_CREATE`, `ROLE_UPDATE`, `DEPARTMENT_CREATE`, `DEPARTMENT_UPDATE`, `DEPARTMENT_DELETE`, `DEPARTMENT_MEMBER_ASSIGN`, `DEPARTMENT_MEMBER_REMOVE`, `INVITATION_SEND`, `INVITATION_RESEND`, `INVITATION_REVOKE`, `ORGANIZATION_UPDATE`, `USER_SESSION_REVOKE`, `USER_SESSIONS_REVOKE_ALL`).
- `resource` & `resourceId`: Entity type and affected record ID.
- `details` & `metadata`: Human-readable description and sanitized structured metadata.
- `correlationId`: Extracted from `x-request-id` header or generated via `crypto.randomUUID()`.
- `ipAddress`, `userAgent`, `timestamp`.

## 3. Sensitive Data Sanitization
`sanitizeAuditMetadata()` recursively strips keys matching `password`, `passwordHash`, `otp`, `otpHash`, `token`, `rawToken`, `tokenHash`, `secret`, `backupCodes`, `apiKey`, `authorization`, `cookie`, `paymentSecret`, and `panNumber` prior to persistence.

## 4. Query & Export
`GET /api/v1/admin/audit-logs` supports filtering by `actorId`, `action`, `resource`, `startDate`, `endDate`, `search`, and pagination (`page`, `limit`). The Admin UI includes client-side CSV export for statutory and internal audit reviews.
