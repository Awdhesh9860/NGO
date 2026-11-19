# Volunteer Certificates Module

## Certificate Types
- `PARTICIPATION`: Recognizes verified participation during a project or campaign period.
- `EXPERIENCE`: Certifies sustained verified service contribution over a defined tenure.

## Integrity & Anti-Fabrication Rules
1. **Authorized Issuance Only**: Requires `volunteers.certificates.issue` (or `certificates.issue`).
2. **Derived Strictly From Approved Hours**: `issueCertificate` queries `VolunteerAttendance` records with `approvalStatus === 'APPROVED'` and `status` in `['PRESENT', 'HALF_DAY']` within `[participationStartDate, participationEndDate]`. If verified minutes fall below `minimumRequiredMinutes`, issuance is rejected — hours are never fabricated.
3. **Unique Identifiers**: Unique `{ organizationId, certificateNumber }` (`VCERT-YYYY-XXXXXX`) and global `verificationCode` (`VRF-XXXXXXXXXX`).
4. **Privacy-Safe Public Verification**: `GET /api/v1/public/certificates/[code]` exposes recipient name, organization, period, verified hours, signatory, and status ONLY — never volunteer email, phone, DOB, or address.
