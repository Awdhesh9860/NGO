# Fundraising Module Development Guidelines

## Multi-Developer Ownership & Module Boundaries
- **Campaigns Squad**: `src/features/campaigns/*`, `src/server/services/campaign.service.ts`, `/api/v1/campaigns/*`, `/api/v1/public/campaigns/*`, `/dashboard/admin/campaigns/*`.
- **Donor CRM Squad**: `src/features/donors/*`, `src/server/services/donor.service.ts`, `/api/v1/donors/*`, `/dashboard/admin/donors/*`.
- **Payments, Receipts & Refunds Squad**: `src/features/donations/*`, `src/integrations/payment/*`, `src/server/services/donation-payment.service.ts`, `/api/v1/donations/*`, `/api/v1/payments/*`, `/api/v1/webhooks/*`, `/api/v1/receipts`, `/api/v1/refunds/*`, `/api/v1/recurring-donations/*`, `/api/v1/fundraising/analytics`.

## Mandatory Coding Standards
1. **Integer Minor Units Only**: Always import helpers from `@/lib/money` (`toMinorUnits`, `fromMinorUnits`, `sumMinorUnits`, `subtractMinorUnits`, `calculateMinorPercentage`, `formatMinorCurrency`). Never use floating-point arithmetic for monetary totals.
2. **Tenant Scoping**: Every repository query MUST include `organizationId`. Never query fundraising collections globally without explicit public-safe filtering.
3. **Never Bypass Verification**: Never write code that transitions a donation to `SUCCESSFUL` from frontend submission alone or issues 80G tax text without calling `evaluateTaxReceiptEligibility`.
4. **Testing Checklist**: Run `npx tsc --noEmit`, `npm run test:run`, and `npm run build` before submitting PRs. Add regression tests in `src/tests/fundraising.test.ts` for any state machine, RBAC, or financial calculation change.
