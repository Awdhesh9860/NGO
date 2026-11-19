# Membership Management Module

## Configurable Membership Plans
Organizations configure their own plans (`GENERAL`, `ANNUAL`, `LIFETIME`, `SUPPORTING`, `INSTITUTIONAL`) via `/api/v1/membership/plans` with integer minor-unit fees (`feeAmountMinor`), validity days, grace period days, voting rights, and public visibility. Membership fees are never hardcoded.

## Membership Lifecycle (9 States)
`DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `ACTIVE`, `EXPIRED`, `SUSPENDED`, `CANCELLED`.

## Governance Rules
1. **No Auto-Approval**: Public applications submitted via `/membership` enter `SUBMITTED` and require `members.approve` review.
2. **Unique Member Numbers**: Approval generates a unique org-scoped `membershipNumber` (`MBR-YYYY-XXXXXX`).
3. **Distinct From Donations**: Membership fees are tracked separately (`feeAmountMinor`, `feePaymentStatus`) and are NEVER conflated with charitable donations or 80G tax-exemption receipts.
4. **Suspension & Cancellation**: Requires explicit `members.suspend` permission and records audited `statusHistory`.
