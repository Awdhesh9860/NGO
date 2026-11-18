# Authentication REST API Reference

## HopeHorizon / Vikas NGO Ecosystem — Phase 4

Base URL: `/api/v1/auth`

---

### Endpoints Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Register new donor, volunteer, or member | No |
| `POST` | `/login` | Authenticate email and password | No |
| `POST` | `/logout` | Terminate session and clear cookie | Yes |
| `GET` | `/session` | Retrieve active user profile & permissions | Optional |
| `POST` | `/verify-email` | Verify email with token | No |
| `POST` | `/send-otp` | Request numeric OTP | No |
| `POST` | `/verify-otp` | Verify numeric OTP | No |
| `POST` | `/forgot-password` | Request password reset email | No |
| `POST` | `/reset-password` | Reset password using token | No |
| `POST` | `/change-password` | Change password from settings | Yes |
| `GET` | `/sessions` | List all active sessions for current user | Yes |
| `DELETE`| `/sessions` | Terminate all other sessions | Yes |
| `DELETE`| `/sessions/:sessionId` | Terminate specific session | Yes |
| `POST` | `/two-factor/setup` | Generate TOTP secret and QR URI | Yes |
| `POST` | `/two-factor/verify`| Confirm code and enable 2FA | Yes |
| `POST` | `/two-factor/disable`| Disable 2FA using current password | Yes |
| `POST` | `/two-factor/login` | Complete login with 2FA code | No (Temp Token) |

---

### Request & Response Examples

#### 1. User Registration
`POST /api/v1/auth/register`

**Request:**
```json
{
  "name": "Aarav Sharma",
  "email": "aarav@example.com",
  "password": "StrongP@ssw0rd!2026",
  "role": "DONOR",
  "phone": "+91 9876543210",
  "panNumber": "ABCDE1234F"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "65f123456789012345678901",
      "name": "Aarav Sharma",
      "email": "aarav@example.com",
      "role": "DONOR",
      "phone": "+91 9876543210",
      "isEmailVerified": false,
      "organizationId": "65f123456789012345678900"
    },
    "sessionId": "65f123456789012345678902"
  },
  "meta": {
    "timestamp": "2026-11-19T00:00:00.000Z",
    "organizationId": "65f123456789012345678900"
  }
}
```
*Note: Sets `hh_ngo_session` HTTP-only cookie.*

---

#### 2. User Login
`POST /api/v1/auth/login`

**Request:**
```json
{
  "email": "aarav@example.com",
  "password": "StrongP@ssw0rd!2026"
}
```

**Response (200 OK — Standard):**
```json
{
  "success": true,
  "data": {
    "requires2FA": false,
    "user": {
      "id": "65f123456789012345678901",
      "name": "Aarav Sharma",
      "email": "aarav@example.com",
      "role": "DONOR",
      "isEmailVerified": true,
      "organizationId": "65f123456789012345678900"
    },
    "sessionId": "65f123456789012345678902"
  }
}
```

**Response (200 OK — 2FA Required):**
```json
{
  "success": true,
  "data": {
    "requires2FA": true,
    "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
