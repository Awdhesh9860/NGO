# Donations & 80G Giving Module Specification
**Module**: `src/features/donations`  
**Owner Squad**: Squad Beta (Giving & Compliance)  

---

## 1. Scope & Domain Responsibilities
- Processing public and registered donor contributions across multiple currencies (`INR`, `USD`).
- Mandatory Indian Section 80G(5)(vi) tax-exemption validation and automated receipt numbering (`HH-80G-YYYY-XXXXX`).
- Integration with payment gateway adapters (`Razorpay`, `Stripe`, wire transfer).
- Reconciliation, refund management, and export of statutory Form 10BE ledgers.

## 2. Public API & Component Boundaries
- `DonateView`: Standalone high-conversion giving page.
- `DonateModal`: Cross-route quick giving modal.
- `ReceiptModal`: Printable, PDF-exportable statutory receipt viewer with PAN details.
- `DonorPortal`: Authenticated self-service portal for donor giving history.

## 3. Data Contracts
- Input: `DonationInput` (amount, currency, donor details, PAN, campaign ID).
- Entity: `Donation` (status, receiptNumber, transactionId, taxExemptionEligible).
