# Donation Receipts & 80G/12A Eligibility Compliance

## Receipt Issuance Invariants
1. **Verified Donations Only**: Receipts are issued strictly for `SUCCESSFUL` or `PARTIALLY_REFUNDED` donations. Attempting to issue a receipt for `INITIATED`, `PENDING`, `FAILED`, `CANCELLED`, or fully `REFUNDED` donations throws a validation error.
2. **Unique & Non-Duplicate**:
   - Unique compound index `{ organizationId, receiptNumber }`.
   - Partial unique index `{ organizationId, donationId }` where `status: 'ISSUED'` prevents duplicate active receipts per donation.
3. **Immutable Snapshots**: Organization identity, donor snapshot, verified payment reference, and verified statutory snapshot are frozen on issuance.

## Strict 80G / 12A Tax Benefit Gate
Evaluated via `evaluateTaxReceiptEligibility(org, donationDate)` (`src/server/services/donation-payment.service.ts`):
- `taxBenefitEligible` is `true` **ONLY** when:
  1. `org.verificationStatus === 'verified'`
  2. `org.statutory.is80GVerified === true` and `org.statutory.section80GNumber` is non-empty
  3. `section80GValidFrom` and `section80GValidTo` are configured and `donationDate` falls inclusively inside that window.
- Otherwise, `taxBenefitEligible` is `false` and the receipt clearly labels itself a standard charitable acknowledgment receipt without claiming tax-exemption eligibility.

## Cancellation & Reissuance
Authorized users with `receipts.cancel` may cancel a receipt with a mandatory audited reason and optionally reissue a superseding receipt linked via `supersededByReceiptId`.
