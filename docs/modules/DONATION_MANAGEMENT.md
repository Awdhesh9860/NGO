# Donation Management Module

## Donation Lifecycle (7 States)
- `INITIATED`: Online checkout order created, awaiting payment completion.
- `PENDING`: Manual UPI/Bank Transfer submitted or asynchronous gateway settlement pending.
- `SUCCESSFUL`: Verified via cryptographic gateway check, verified webhook, reconciliation, or authorized finance staff manual verification (`donations.verify`).
- `FAILED`: Payment declined or manual transfer rejected with audited `rejectionReason`.
- `CANCELLED`: Checkout expired or cancelled prior to capture.
- `PARTIALLY_REFUNDED`: One or more refunds processed with remaining net principal > 0.
- `REFUNDED`: Cumulative processed refunds equal principal `amountMinor`.

## Integrity Controls
- **Idempotency**: Unique `{ organizationId, idempotencyKey }` index prevents duplicate donations from double clicks or network retries.
- **Monotonic Transitions**: `assertValidDonationTransition` forbids downgrading `SUCCESSFUL`, `PARTIALLY_REFUNDED`, or `REFUNDED` records back to `INITIATED`, `PENDING`, or `FAILED`.
- **Immutable Ledger**: Every payment state event appends an immutable `PaymentTransaction` record and logs checkout `PaymentAttempt` telemetry.
- **Manual UPI / Bank Transfer Rule**: Donor submission NEVER marks a donation `SUCCESSFUL`. Only `PATCH /api/v1/donations/[id]` by staff holding `donations.verify` can verify or reject manual transfers.
