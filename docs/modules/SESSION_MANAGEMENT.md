# Multi-Device Session Management Architecture

## HopeHorizon / Vikas NGO Ecosystem — Phase 4

### 1. Hybrid Session Architecture
HopeHorizon employs a **hybrid stateless/stateful session pattern**:
- **Stateless Verification**: The client stores a signed Jose JWT inside an `HttpOnly`, `SameSite=Lax`, `Secure` (in production) cookie (`hh_ngo_session`). The JWT carries essential identity claims (`userId`, `sessionId`, `role`, `organizationId`).
- **Stateful Control**: Every valid request verifies the `sessionId` against the active MongoDB `Session` collection. This provides instantaneous remote session revocation without needing distributed Redis blacklists.

---

### 2. Session Schema (`Session.ts`)
```typescript
interface ISessionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  tokenHash: string;
  device?: string;
  browser?: string;
  ipAddress?: string;
  lastActiveAt: Date;
  expiresAt: Date;
  isRevoked: boolean;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. Automatic TTL Expiry
The MongoDB `Session` collection includes a TTL index on `expiresAt`:
```typescript
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```
MongoDB automatically purges expired session records from the cluster in the background, keeping index size minimal.

---

### 4. Remote Session Revocation
- **Single Session Termination**: Users can view all active devices and terminate individual sessions (`DELETE /api/v1/auth/sessions/:sessionId`).
- **Terminate Other Sessions**: Users can revoke all other active sessions while keeping their current device active (`DELETE /api/v1/auth/sessions`).
- **Global Invalidation on Password Reset**: When a password is reset or changed, `authService.resetPassword` automatically terminates all active sessions across all devices to prevent unauthorized persistence.
