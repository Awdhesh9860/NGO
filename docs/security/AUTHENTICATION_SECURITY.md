# Authentication Security & Cryptography Standards

## HopeHorizon / Vikas NGO Ecosystem — Phase 4

### 1. Cryptographic Specifications

| Component | Standard / Algorithm | Parameters / Implementation |
| :--- | :--- | :--- |
| **Password Hashing** | Bcrypt | Cost factor (salt rounds): 12 via `bcryptjs` |
| **Session JWT Signing** | HMAC-SHA256 (HS256) | Encoded via `jose` with minimum 256-bit secret key |
| **Verification Tokens** | Crypto Random Hex | 32 bytes (256-bit entropy) generated via `node:crypto` |
| **Token Storage** | SHA-256 Hashed | Raw tokens are NEVER stored in plaintext in the database |
| **Numeric OTPs** | 6-digit numeric | 100,000–999,999 range; stored as SHA-256 hash |
| **2FA / MFA** | RFC 6238 TOTP | Base32 secret (160-bit), 30-second window via `otplib` |
| **2FA Backup Codes** | Alphanumeric | 8 unique one-time single-use recovery codes |

---

### 2. Password Strength Rules
Enforced on both the client (interactive strength meter) and server (Zod schema validation):
- Minimum 8 characters, maximum 128 characters.
- At least one uppercase Latin letter (`[A-Z]`).
- At least one lowercase Latin letter (`[a-z]`).
- At least one numeric digit (`[0-9]`).
- At least one non-alphanumeric special character (`[^A-Za-z0-9]`).

---

### 3. Protection Against Common Attacks

1. **Brute Force & Credential Stuffing**:
   - OTP verification restricts max attempts to 5 before permanently invalidating the token.
   - Constant-time string and hash comparisons avoid timing attacks.

2. **Enumeration Prevention**:
   - `forgotPassword` returns identical success messages regardless of whether the submitted email address exists in the database.

3. **Cross-Site Scripting (XSS) & Cookie Theft**:
   - Session tokens are stored in `HttpOnly` cookies, preventing client-side JavaScript access.
   - `SameSite=Lax` cookie flags protect against Cross-Site Request Forgery (CSRF).

4. **PII Redaction**:
   - The structured application logger (`src/lib/logger.ts`) automatically redacts passwords, tokens, API keys, PAN numbers, and secrets before outputting to log streams.
