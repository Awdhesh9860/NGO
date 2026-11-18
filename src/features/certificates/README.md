# Certificates & Public Ledger Feature Module
**Module Path**: `src/features/certificates`  
**Domain**: Credential Issuance & Public Cryptographic Verification  

## Responsibilities
- Generation of unique certificate serial numbers and verification codes.
- Public ledger query endpoint (`/verify-certificate`).
- High-resolution modal certificate rendering with verifiable QR payload.
- Administrative issuance to volunteers, donors, and interns.

## Public Exports (`index.ts`)
- `CertificateVerifierView`: Public search & check interface.
- `CertificateViewModal`: Certificate inspection and printable dialog.
- `Certificate`: Core TypeScript entity interface.

## Permissions Required
- `certificates.issue`: Authorize credential issuance.
- `certificates.revoke`: Revoke invalid/fraudulent credentials.
- `certificates.verify`: Public verification check (Public / All Roles).
