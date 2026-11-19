# Finance Module Development Guidelines

**Platform**: HopeHorizon / Vikas NGO Ecosystem  
**Phase**: 10 — Finance, Accounting, Expense & Compliance Management

---

## 1. Multi-Developer Squad Ownership

| Squad / Domain | Hybrid Feature Root(s) | Server Service | API Prefix |
|----------------|------------------------|----------------|------------|
| **Core Accounting & Ledger** | `chart-of-accounts`, `accounting`, `journal-entries`, `general-ledger` | `accounting.service.ts` | `/api/v1/finance/accounts*`, `/periods`, `/journals*`, `/ledger`, `/trial-balance`, `/income` |
| **Expenses, Vendors & Banking** | `expenses`, `vendors`, `bank-reconciliation` | `expense-vendor.service.ts` | `/api/v1/finance/expenses*`, `/vendors*`, `/bank-*`, `/reconciliation` |
| **Budgets, Funds & Grants** | `budgets`, `fund-allocation`, `grants` | `budget-grant-compliance.service.ts` | `/api/v1/finance/budgets*`, `/fund-allocations`, `/grants*` |
| **Financial Reporting & Compliance** | `financial-reports`, `compliance`, `finance` | `financial-reports.service.ts`, `budget-grant-compliance.service.ts` | `/api/v1/finance/reports/*`, `/dashboard`, `/api/v1/compliance/*` |

## 2. Mandatory PR Engineering Invariants
1. **Zero Floating-Point Money**: Always use integer minor currency units (`src/lib/money.ts`).
2. **Centralized Accounting Logic**: Never duplicate financial formulas in React components or API route handlers — keep calculations inside the 4 domain services.
3. **Immutable Posted Entries**: Never add PATCH/DELETE endpoints that mutate posted `JournalEntry` or `JournalLine` documents; always use traceable reversal entries.
4. **Idempotent Event Keys**: Automated ledger events (donations, refunds, expense payouts, grant receipts) must always pass a deterministic `idempotencyKey`.
5. **No Client-Server Crossing**: UI modules under `src/features/*` must never import Mongoose models or `src/server/*`.

## 3. Local Verification Commands
```bash
npx tsc --noEmit
npm run test:run
npx eslint src/server/security/financial-crypto.ts src/server/database/transactions.ts src/server/repositories/finance.repository.ts src/server/services/accounting.service.ts src/server/services/expense-vendor.service.ts src/server/services/budget-grant-compliance.service.ts src/server/services/financial-reports.service.ts src/features/finance src/features/compliance src/app/dashboard/admin/finance src/app/dashboard/admin/compliance src/tests/finance.test.ts
npm run build
```
