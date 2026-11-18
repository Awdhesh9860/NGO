# Authentication & Identity Feature Module
**Module Path**: `src/features/authentication`  
**Domain**: Identity, Session Management, RBAC & Two-Factor Authentication  

## Responsibilities
- User registration and account verification.
- Secure email/password login and active session handling.
- Role switching and persona emulation for development/demo.
- 2FA TOTP configuration and enforcement.
- Password change and session termination.

## Public Exports (`index.ts`)
- `useAuth`: React hook for authentication context.
- `AuthProvider`: Client context provider wrapping session state.
- `AuthModal`: Accessible modal containing Login, Register, Forgot Password, and 2FA tabs.
- `PersonaSwitcher`: Active role/user persona pill switcher.
- `UserProfileModal`: User account settings and multi-device session manager.

## Permissions Required
- Public: Login, Register, Verify Email, Forgot Password.
- Authenticated: Profile update, 2FA toggle, session revocation.
