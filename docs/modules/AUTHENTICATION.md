# Authentication & Identity Module Specification
**Module**: `src/features/authentication`  
**Owner Squad**: Squad Alpha (Identity & Governance)  

---

## 1. Scope & Domain Responsibilities
- User registration, cryptographic email verification, and secure password recovery.
- Dual-token session authentication (short-lived access JWT + HttpOnly refresh cookies).
- RFC 6238 TOTP two-factor authentication setup and verification.
- Active multi-device session management and remote revocation.
- Development persona switching for cross-role testing.

## 2. Public API & Component Boundaries
- `useAuth`: Global client authentication hook.
- `AuthModal`: Accessible modal containing Login, Register, Forgot Password, and 2FA tabs.
- `PersonaSwitcher`: Fast-switching UI widget for testing 13 roles.
- `UserProfileModal`: Security settings and session viewer.
