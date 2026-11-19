# Organization Management & Settings Module

**Module Ownership:** Multi-Tenant Core Squad  
**Primary Files:** `src/server/database/models/Organization.ts`, `src/server/repositories/organization.repository.ts`, `src/app/api/v1/admin/organization/`, `src/app/api/v1/admin/organizations/`, `src/app/dashboard/admin/organization/`

## 1. Multi-Tenant Hierarchy
```text
Platform
└── Organization / Tenant (organizationId)
    ├── Organization Profile & Legal Identity
    ├── Regional, Security & Notification Settings
    ├── Departments & Rosters
    ├── Users & Sessions
    ├── System & Custom Roles
    ├── Invitations
    └── Immutable Audit Logs
```

## 2. Organization Lifecycle & Verification
- **Statuses:** `ACTIVE`, `INACTIVE`, `SUSPENDED`, `PENDING_VERIFICATION` (synchronized with `isActive`).
- **Verification Status:** `unverified` | `pending` | `verified` with `verifiedAt` timestamp.
- **Compliance Integrity:** Legal registration and statutory credentials (PAN, 80G, 12A, FCRA, NGO Darpan) are only displayed as verified on the Organization Profile once `verificationStatus === 'verified'`.
- **Authorization Boundary:** Organization administrators with `settings.manage` can update profile, regional, security, and notification settings for their own tenant. Only `SUPER_ADMIN` (`organizations.manage`) can modify `status`, `verificationStatus`, or list all platform tenants (`/api/v1/admin/organizations`).

## 3. Settings Categories (`/dashboard/admin/organization/settings`)
1. **General:** Organization name, legal name, logo, description, website, contact email/phone, headquarters address.
2. **Identity & Statutory:** Registration type/number, registered address, establishment date, PAN, 80G, 12A, FCRA, Darpan ID, tax exemption %.
3. **Regional:** Country, state, district, timezone, currency code/symbol, date format, language preference (India / `INR` / `Asia/Kolkata` / `DD/MM/YYYY` / `en` as configurable defaults, never hardcoded globally).
4. **Security:** Session timeout policy, minimum password length, strong password enforcement, max failed login attempts, invitation expiry days, 2FA policy (`optional` | `recommended` | `required_for_admins`).
5. **Notifications:** Email notifications, administrative security alerts, invitation lifecycle notifications, automatic donation receipts.

## 4. API Contracts
| Endpoint | Method | Permission | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/v1/admin/organization` | `GET` | `users.view` | Retrieve active tenant profile & settings |
| `/api/v1/admin/organization` | `PATCH` | `settings.manage` | Persist profile/settings updates (SUPER_ADMIN required for status/verification) |
| `/api/v1/admin/organizations` | `GET` | `organizations.manage` | List all platform tenants (`SUPER_ADMIN` only) |
