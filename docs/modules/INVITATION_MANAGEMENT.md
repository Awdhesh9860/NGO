# Invitation Management Module

**Module Ownership:** Identity & Access Squad  
**Primary Files:** `src/server/database/models/Invitation.ts`, `src/server/repositories/invitation.repository.ts`, `src/integrations/email/templates/invitation.template.ts`, `src/app/api/v1/admin/invitations/`, `src/app/dashboard/admin/invitations/`

## 1. Workflow & Lifecycle
Invitations support secure onboarding of staff, coordinators, managers, and leadership:
- **Statuses:** `pending` | `accepted` | `expired` | `revoked` (displayed in UI via `StatusBadge`).
- **Send:** Admin enters email, permitted role, optional department, and expiry duration (1–30 days; defaults to organization `securitySettings.invitationExpiryDays`). Previous pending invitations for the same email in that tenant are revoked automatically.
- **Resend (`POST /api/v1/admin/invitations/[id]/resend`):** Rotates cryptographic token + SHA-256 hash, refreshes expiry, resets status to `pending`, dispatches a new email, and logs `INVITATION_RESEND`.
- **Revoke (`DELETE /api/v1/admin/invitations/[id]`):** Transitions pending invitation to `revoked` and logs `INVITATION_REVOKE`.

## 2. Cryptographic & Tenant Security
- Generates 32-byte (256-bit) cryptographically secure token (`generateCryptoToken(32)`).
- Stores **only** the SHA-256 hash (`tokenHash`) in MongoDB — raw tokens are never stored or logged in audit logs.
- Enforces TTL index on `expiresAt` and explicit server-side expiry check in `validateInvitationToken()`.
- Prevents unauthorized role assignment (non-`SUPER_ADMIN` cannot invite `SUPER_ADMIN`).
- Cross-tenant acceptance is strictly forbidden: `invitation.organizationId` must match target tenant.
- Dispatches emails through the existing `emailProvider` (`NodemailerProvider`) using `renderInvitationEmail`.

## 3. API Contracts
| Endpoint | Method | Permission | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/v1/admin/invitations` | `GET` | `users.manage` | List/filter tenant invitations (excludes `tokenHash`) |
| `/api/v1/admin/invitations` | `POST` | `users.manage` | Create & dispatch invitation email |
| `/api/v1/admin/invitations/[id]` | `DELETE` | `users.manage` | Revoke pending invitation |
| `/api/v1/admin/invitations/[id]/resend` | `POST` | `users.manage` | Rotate token & resend invitation email |
