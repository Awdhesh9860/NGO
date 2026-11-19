# Grant Management Foundation

**Model**: `src/server/database/models/Grant.ts`  
**Service**: `src/server/services/budget-grant-compliance.service.ts`  
**API**: `/api/v1/finance/grants`, `/api/v1/finance/grants/[id]`, `/api/v1/finance/reports/grant-utilization`  
**Admin UI**: `/dashboard/admin/finance/grants`

---

## 1. 8-State Grant Lifecycle
`DRAFT` -> `APPLIED` -> `UNDER_REVIEW` -> `APPROVED` -> `ACTIVE` -> `COMPLETED` (with `REJECTED` -> `DRAFT` re-application and `CANCELLED` transitions enforced in `GRANT_STATUS_TRANSITIONS`).

## 2. Ledger-Integrated Grant Receipts & Utilization
- Recording a grant tranche receipt (`action: 'RECORD_RECEIPT'`) validates that cumulative receipts never exceed `awardAmountMinor`, then posts a balanced double-entry journal idempotently (`GRANT_RECEIPT:<grantId>:<trancheLabel>`):
  - `DR Primary NGO Bank Account (1020)`
  - `CR Institutional Grants Income (4030)`
- Grant utilization is calculated strictly from posted `JournalLine` expense debits tagged with `grantId`.
- Reporting deadlines (`PENDING` | `SUBMITTED` | `OVERDUE`) and disbursement tranches (`SCHEDULED` | `RECEIVED` | `DELAYED`) are tracked per grant.

> [!NOTE]
> This module manages internal grant records, disbursements, restrictions, and reporting calendars. It does not integrate directly with external government grant portals.
