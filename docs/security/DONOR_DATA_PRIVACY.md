# Donor Data Privacy & Protection

## Data Minimization & Role-Based Field Gating
- **Sensitive Donor Permission (`donors.view_sensitive`)**: Restricted to `SUPER_ADMIN`, `ADMIN`, `EXECUTIVE_DIRECTOR`, and `ACCOUNTANT`.
- **Automatic Masking**: When a user without `donors.view_sensitive` reads `/api/v1/donors` or `/api/v1/donors/[id]`:
  - `taxDetails.panNumber` is masked (`AB******4F`).
  - `phone` is hidden behind `'Restricted'`.
  - Full street address is restricted to `{ city, state }`.
  - `internalNotes` are stripped completely.

## Public Endpoint Privacy Guarantees
- `/api/v1/public/campaigns` and `/api/v1/public/campaigns/[slug]` NEVER expose donor emails, phone numbers, PANs, addresses, internal notes, or internal payment references.
- When `donation.isAnonymous === true`, recent supporter lists render `'Anonymous Supporter'` instead of the donor's name.

## Communication Consent & Export Accountability
- Transactional emails respect `donor.communicationPreferences` and guard against duplicate delivery using `confirmationEmailSentAt` and `receiptEmailSentAt`.
- Donor exports require `donors.export` and record an immutable `DONOR_EXPORT` audit log entry noting record count and whether sensitive fields were included.
