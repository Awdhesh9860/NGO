# Payment & Financial Security Architecture

## Cryptographic Verification Controls
1. **Razorpay**:
   - Checkout callback signature verified server-side via timing-safe HMAC-SHA256 (`crypto.timingSafeEqual`) over `${order_id}|${payment_id}`.
   - Webhook endpoint `/api/v1/webhooks/razorpay` reads raw request text (`req.text()`) and verifies `X-Razorpay-Signature` before parsing or mutating state.
2. **Stripe**:
   - Webhook endpoint `/api/v1/webhooks/stripe` parses `Stripe-Signature` (`t=...,v1=...`), verifies 300-second timestamp replay window, and validates timing-safe HMAC-SHA256 over `${t}.${rawBody}`.
   - Online verification queries Stripe's authoritative session/PaymentIntent status directly over HTTPS.

## Replay, Duplicate & Out-of-Order Defenses
- **Order Idempotency**: Unique `{ organizationId, idempotencyKey }` on `Donation`.
- **Webhook Idempotency Lock**: Unique `{ provider, providerEventId }` on `PaymentWebhookEvent`; duplicate webhook deliveries return `duplicate: true` without duplicating transactions, receipts, or emails.
- **Out-of-Order Guard**: Settled donations (`SUCCESSFUL`, `PARTIALLY_REFUNDED`, `REFUNDED`) can never be downgraded by late-arriving failure or pending events (`IGNORED_OUT_OF_ORDER`).
- **Manual Payment Tamper Defense**: UPI and Bank Transfer submissions cannot invoke online self-verification (`verifyOnlinePayment` rejects manual methods). Only authorized staff holding `donations.verify` can settle or reject manual transfers.
- **Audit Trail**: All approvals, manual verifications, receipt cancellations, and refunds write immutable entries to `AuditLog` with sanitized metadata.
