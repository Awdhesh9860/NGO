# Authentication System Architecture

## HopeHorizon / Vikas NGO Ecosystem — Phase 4

### 1. Overview
The HopeHorizon Authentication System provides a production-grade, multi-tenant authentication and identity management solution built on Next.js 16 App Router, Jose JWTs, MongoDB/Mongoose, and Nodemailer.

The system is designed with a **server-first security model**, ensuring that role-based permissions, organization isolation, and session validity are strictly validated on the server for every incoming request.

---

### 2. Core Architectural Components

```
+---------------------------------------------------------------------------------+
|                                 Client Layer                                    |
|   /login  |  /register  |  /forgot-password  |  /reset-password  |  /verify-email  |
+---------------------------------------+-----------------------------------------+
                                        | HTTP / JSON (Credentials / Cookies)
+---------------------------------------v-----------------------------------------+
|                               API Route Layer                                   |
|   /api/v1/auth/register    |  /api/v1/auth/login        |  /api/v1/auth/session |
|   /api/v1/auth/verify-email|  /api/v1/auth/send-otp     |  /api/v1/auth/verify-otp |
|   /api/v1/auth/two-factor/*|  /api/v1/auth/sessions     |  /api/v1/auth/logout  |
+---------------------------------------+-----------------------------------------+
                                        |
+---------------------------------------v-----------------------------------------+
|                          Server Authentication Service                          |
|   - AuthService (Registration, Login, Verification, Password Reset, 2FA)       |
|   - Authorization Guards (requireAuthentication, requireRole, requirePermission)|
|   - Tenant Resolver (Multi-tenant domain & ID scoping)                          |
+-------------------+-------------------+-------------------+---------------------+
                    |                   |                   |
+-------------------v---+   +-----------v-------+   +-------v---------------------+
|   Database Layer      |   |   Security Layer  |   |   Email Integration Layer   |
|   - User              |   |   - bcrypt (c=12) |   |   - Nodemailer Provider     |
|   - Organization      |   |   - Jose HS256 JWT|   |   - Responsive Templates    |
|   - Session (TTL)     |   |   - SHA-256 Tokens|   |   - Dev Console Fallback    |
|   - EmailOTP (TTL)    |   |   - otplib TOTP   |   +-----------------------------+
|   - Tokens (TTL)      |   +-------------------+
|   - AuditLog          |
+-----------------------+
```

---

### 3. Authentication & Session Flow

1. **Registration**:
   - Self-registration is restricted to non-privileged roles: `DONOR`, `VOLUNTEER`, and `MEMBER`.
   - Administrative roles (`SUPER_ADMIN`, `ADMIN`, `EXECUTIVE_DIRECTOR`, `ACCOUNTANT`, `PROJECT_MANAGER`, etc.) require staff invitation.
   - Passwords are validated using strict Zod rules (min 8 chars, uppercase, lowercase, numeric, symbol) and hashed with `bcryptjs` (salt rounds: 12).
   - Generates a crypto-random SHA-256 email verification token (24-hour TTL) and sends verification email.
   - Emits branded HTML welcome email.
   - Sets secure HTTP-only cookie (`hh_ngo_session`) holding the signed Jose JWT.

2. **Login**:
   - Authenticates credentials against MongoDB `User` model.
   - Verifies active status (`status === 'active'`).
   - If user has Two-Factor Authentication (TOTP) enabled, returns `{ requires2FA: true, tempToken }`.
   - Once validated, issues a database `Session` and signs a JWT containing `{ userId, sessionId, email, role, organizationId }`.
   - Records structured `AuditLog` entry.

3. **Session Management**:
   - Hybrid JWT + Database Session model:
     - Client holds JWT in `hh_ngo_session` cookie (`httpOnly: true`, `secure: prod`, `sameSite: 'lax'`).
     - Server checks JWT signature via Jose and verifies the active session status in MongoDB `Session`.
     - Enables immediate server-side revocation of lost/compromised sessions while keeping claim verification fast.
   - Automatic TTL index cleans up expired sessions from MongoDB automatically.

4. **Multi-Tenancy**:
   - Every user belongs to an `organizationId`.
   - Unique compound index `{ organizationId: 1, email: 1 }` prevents email collisions across different NGO entities.
   - Server-side tenant resolver guarantees cross-organization data leakage cannot occur.
