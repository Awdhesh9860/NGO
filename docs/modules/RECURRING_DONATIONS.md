# Recurring Donations Module

## Design Principles
Recurring charitable giving is supported **exclusively** via provider-managed mandates and subscriptions (`RAZORPAY` and `STRIPE`). Custom cron loops or simulated background charging are strictly prohibited.

## Plan Intervals & States
- **Intervals**: `MONTHLY`, `QUARTERLY`, `YEARLY`
- **Statuses**: `CREATED`, `ACTIVE`, `PAUSED`, `CANCELLED`, `FAILED`, `COMPLETED`

## Workflow
1. Donor or staff initiates a mandate via `POST /api/v1/recurring-donations` with integer minor-unit installment amount.
2. If the chosen provider (`RAZORPAY` / `STRIPE`) is unconfigured, the API explicitly rejects creation with a transparent configuration error rather than creating fake recurring charges.
3. Administrators with `donations.manage` can `PAUSE`, `RESUME`, or `CANCEL` plans via `PATCH /api/v1/recurring-donations/[id]`, invoking provider cancellation when configured and recalculating donor recurring flags.
4. Cycle notifications use `renderRecurringConfirmationEmail` and `renderRecurringFailureEmail`.
