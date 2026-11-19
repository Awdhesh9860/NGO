# Fundraising Architecture Overview

## End-to-End Fundraising Ecosystem
HopeHorizon / Vikas NGO Ecosystem unifies public donor appeals, multi-gateway checkout orchestration, donor CRM, immutable payment transactions, webhook idempotency, official 80G/12A compliance receipts, two-stage refund workflows, and executive financial analytics.

## Core Engineering Invariants
1. **Precision-Safe Integer Minor Currency Units**: Every financial value is stored and aggregated in integer minor currency units (`amountMinor`, `targetAmountMinor`, `refundedAmountMinor`, `lifetimeAmountMinor`) using `src/lib/money.ts`. Floating-point arithmetic is prohibited in financial calculations.
2. **Multi-Tenant Strictness**: All 10 fundraising MongoDB collections scope every query and unique index by `organizationId`.
3. **Zero Fabricated Financial States**:
   - Unconfigured gateways report `UNCONFIGURED` status honestly.
   - Manual UPI and Bank Transfer pledges remain `PENDING` until authorized finance staff verify settlement.
   - Receipts are never issued for unverified/pending/failed donations.
   - Section 80G tax-exemption text is printed only when organization verification and statutory validity windows are actively verified.

## Collections Summary
`Campaign`, `CampaignUpdate`, `Donor`, `Donation`, `PaymentTransaction`, `PaymentAttempt`, `PaymentWebhookEvent`, `RecurringDonation`, `DonationReceipt`, `Refund`.

## RBAC Integration
23 granular fundraising permissions mapped across the 13-role RBAC matrix (`src/server/authorization/permissions.ts`) and reflected in the `Fundraising` admin sidebar group (`src/features/admin/config/navigation.ts`).
