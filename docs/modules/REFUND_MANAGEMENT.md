# Refund Management Module

## 7-State Refund Lifecycle
`REQUESTED` → `PENDING_APPROVAL` → `APPROVED` → `PROCESSING` → `SUCCESSFUL` | `FAILED` (or `REJECTED` at approval stage).

## Financial Governance Controls
1. **Separation of Duties**:
   - Requesting requires `refunds.request` (e.g., `MANAGER`).
   - Approving/rejecting requires `refunds.approve` (e.g., `ACCOUNTANT`, `ADMIN`, `EXECUTIVE_DIRECTOR`).
   - Processing requires `refunds.process`.
   - **No Self-Approval**: The user who submitted a refund request can NEVER approve or reject it, even if they possess `refunds.approve`.
2. **Remaining Refundable Cap**:
   - Every request and execution enforces `amountMinor <= donation.amountMinor - donation.refundedAmountMinor - pendingInFlightRefundsMinor`.
3. **Idempotency**: Unique `{ organizationId, idempotencyKey }` prevents duplicate refunds on repeated clicks or retries.
4. **Partial & Full Refunds**:
   - Successful partial refunds transition donations to `PARTIALLY_REFUNDED`.
   - When `refundedAmountMinor >= amountMinor`, the donation transitions to `REFUNDED`.
   - Donor lifetime totals and campaign net progress automatically deduct refunded amounts.
