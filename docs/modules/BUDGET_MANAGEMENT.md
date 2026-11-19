# Multi-Level Budget Management & Phase 07 Bridge

**Model**: `Budget.ts` (bridged to Phase 07 `ProjectBudgetEntry.ts`)  
**Service**: `src/server/services/budget-grant-compliance.service.ts`  
**API**: `/api/v1/finance/budgets`, `/api/v1/finance/budgets/[id]`, `/api/v1/finance/reports/budget-vs-actual`  
**Admin UI**: `/dashboard/admin/finance/budgets`

---

## 1. Authoritative Source Definition
- **Planned / Approved Budgets**: Multi-level `Budget` records (`ORGANIZATION`, `DEPARTMENT`, `PROGRAM`, `PROJECT`) coexist cleanly with Phase 07 `ProjectBudgetEntry` records via `linkedProjectBudgetEntryId` and the `projectBudgetBridge` view — no competing project budget system is created.
- **Actual Expenditure**: Calculated **strictly from posted `JournalLine` (`accountTypeSnapshot: 'EXPENSE'`, `isPosted: true`) entries**, never from manually typed dashboard counters.

## 2. Workflow & Utilization Controls
- Status flow: `DRAFT` -> `SUBMITTED` -> `APPROVED` / `REJECTED` / `REVISED`.
- Budget approval requires `finance.budgets.approve`; creators cannot self-approve their own budgets.
- Revisions append an auditable entry to `revisionHistory`.
- `computeBudgetUtilization()` calculates integer-safe `remainingAmountMinor`, `varianceMinor`, `utilizationPercent`, `isAlertTriggered` (default 85%), and `isOverBudget`.
