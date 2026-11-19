# Financial Reporting & Ledger Statements

**Service**: `src/server/services/financial-reports.service.ts`  
**API**: `/api/v1/finance/trial-balance`, `/api/v1/finance/reports/income-expense`, `/balance-sheet`, `/cash-flow`, `/budget-vs-actual`, `/grant-utilization`, `/api/v1/finance/dashboard`  
**Admin UI**: `/dashboard/admin/finance`, `/dashboard/admin/finance/ledger`, `/dashboard/admin/finance/reports`

---

## 1. Ledger-Derived Statements (Zero Dashboard Counter Fabrication)

All core statements derive strictly from posted `JournalLine` entries (`isPosted: true`, integer minor currency units):

| Statement | Calculation Formula | Integrity Guarantee |
|-----------|---------------------|---------------------|
| **Trial Balance** | Net Debit / Net Credit per account (`computeTrialBalanceFromLines`) | Verifies `totalDebitMinor === totalCreditMinor` (`isBalanced`) |
| **Income & Expense Statement** | Income (`CR - DR`) minus Expense (`DR - CR`) (`buildIncomeAndExpenseStatement`) | Includes contra-income refund debits cleanly |
| **Balance Sheet** | Assets (`DR - CR`) vs Liabilities (`CR - DR`) + Equity (`CR - DR`) + Net Surplus (`buildBalanceSheet`) | Verifies `Assets === Liabilities + Equity + Net Surplus` (`isBalanced`) |
| **Cash Flow Summary** | Cash/Bank (`10xx`) posted inflows vs outflows + explicit `RECONCILED` vs `UNRECONCILED_PROVISIONAL` bank status | Never presents unreconciled balances as verified cash |
| **Budget vs Actual** | Multi-level `Budget` + Phase 07 `ProjectBudgetEntry` planned amounts vs posted ledger `EXPENSE` debits | Zero duplicated project budget ledgers |
| **Grant Utilization** | Grant awards & ledger-posted receipts vs posted ledger `EXPENSE` debits tagged with `grantId` | Separates restricted fund balances cleanly |

## 2. Export Authorization & CSV Injection Defense
- CSV exports (`?export=csv` on Trial Balance, Income & Expense, and Balance Sheet) strictly require `finance.reports.export`.
- Every CSV cell is passed through `escapeCsvCell()` (`src/server/security/financial-crypto.ts`), neutralizing leading `=`, `+`, `-`, `@`, `\t`, `\r` formula characters.
- Every export writes an immutable `FINANCE_REPORT_EXPORTED` audit log event.
