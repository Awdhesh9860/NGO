# Donations & Fundraising Feature Module
**Module Path**: `src/features/donations`  
**Domain**: Contributions, Statutory Section 80G Receipts, Payment Gateway Interfaces  

## Responsibilities
- Processing one-time and recurring donations (INR and foreign currencies).
- Section 80G tax-exemption verification and PAN capture.
- Generating official statutory receipts conforming to Form 10BE requirements.
- Donor self-service history and tax-deduction calculation.

## Public Exports (`index.ts`)
- `DonateView`: Standalone public donation page with preset/custom tiers.
- `DonateModal`: Cross-route quick-donation modal dialog.
- `ReceiptModal`: Printable and PDF-exportable official 80G receipt modal.
- `DonorPortal`: Authenticated donor impact portfolio and tax statement center.
- `Donation`: Core TypeScript entity interface.

## Permissions Required
- `donations.view_all`: View full organizational financial ledger.
- `donations.refund`: Authorize transaction refund.
- `donations.view_own`: Access personal giving history.
