# Membership Renewals & Expiry Workflows

## Deterministic Expiry & Grace Period Calculation
`calculateMembershipExpiry(startDate, validityDays, isLifetime, gracePeriodDays)` computes:
- `expiryDate`: `null` for `LIFETIME` plans; `startDate + validityDays` otherwise.
- `graceUntilDate`: `expiryDate + gracePeriodDays`.

## Renewal Eligibility (`isRenewalEligible`)
- **Blocked**: `LIFETIME` memberships, `SUSPENDED` or `CANCELLED` memberships, and active memberships with more than 90 days remaining.
- **Eligible**: `EXPIRED` memberships and `ACTIVE` memberships within 90 days of expiry.

## Fee Payment Validation
- Paid renewals (`feeAmountMinor > 0`) CANNOT be completed (`approveAndComplete: true`) while `paymentStatus === 'PENDING'`. Payment must be confirmed (`PAID`) or explicitly `WAIVED`.
- Reminder deduplication is tracked per renewal period in `remindersSentForPeriod` to prevent duplicate renewal notices.
