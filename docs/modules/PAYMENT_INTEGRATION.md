# Payment Integration Architecture

## Extensible Adapter Boundary
All providers extend `src/integrations/payment/payment.adapter.ts` (`IEnterprisePaymentGateway`), exposed via `src/integrations/payment/index.ts`.

## Supported Providers
1. **Razorpay (`razorpay.provider.ts`)**:
   - Uses official `razorpay` SDK when `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set.
   - Checkout verification: timing-safe HMAC-SHA256 of `${order_id}|${payment_id}`.
   - Webhook verification: timing-safe HMAC-SHA256 of raw body against `RAZORPAY_WEBHOOK_SECRET` (`X-Razorpay-Signature`).
   - Supports online checkout, refunds, reconciliation (`fetchOrderStatus`), and subscriptions.
2. **Stripe (`stripe.provider.ts`)**:
   - Uses native Fetch API against `https://api.stripe.com/v1` with `STRIPE_SECRET_KEY`.
   - Webhook verification: parses `Stripe-Signature` (`t=...,v1=...`), verifies 300-second replay tolerance and timing-safe HMAC-SHA256 against `STRIPE_WEBHOOK_SECRET`.
   - Supports Checkout Sessions, PaymentIntents, refunds, reconciliation, and recurring subscriptions.
3. **UPI & Bank Transfer (`manual.provider.ts`)**:
   - Manual verifiable workflows generating transfer instructions (`UPI-*` / `BANK-*`).
   - Always records donations as `PENDING` until authorized finance staff confirm settlement.

## Honest Environment Status Reporting
`GET /api/v1/payments/status?scope=providers` exposes real configuration status (`LIVE`, `TEST`, `MANUAL`, `UNCONFIGURED`). No simulated online payment capture is allowed when credentials are absent.
