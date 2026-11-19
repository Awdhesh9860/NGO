# Chart of Accounts Module

**Model**: `src/server/database/models/ChartOfAccount.ts`  
**Service**: `src/server/services/accounting.service.ts`  
**API**: `/api/v1/finance/accounts`, `/api/v1/finance/accounts/[id]`  
**Admin UI**: `/dashboard/admin/finance/accounts`

---

## 1. Account Types & Normal Balances

| Account Type | Normal Balance | Example Categories |
|--------------|----------------|--------------------|
| `ASSET` | `DEBIT` | Cash, Bank Accounts, Accounts Receivable, Fixed Assets |
| `LIABILITY` | `CREDIT` | Accounts Payable, Outstanding Accrued Expenses, Unspent Restricted Grant Liability |
| `EQUITY` | `CREDIT` | General Unrestricted Fund Balance, Restricted Program Fund Balance |
| `INCOME` | `CREDIT` | Individual Donations, Corporate Donations, Institutional Grants, Membership Fees, Fundraising Income, Donation Refunds Contra-Income |
| `EXPENSE` | `DEBIT` | Program Expenses, Field Project Expenses, Salaries & Personnel, Administrative, Travel, Training, Infrastructure, Communication & Utilities |

## 2. Integrity Controls
- **Tenant-Scoped Uniqueness**: Compound unique index on `{ organizationId, code }`.
- **Hierarchy**: Optional `parentAccountId` validated to exist in the same tenant and share the same `accountType`.
- **System Account Protection**: Protected system accounts (`isSystemAccount: true`) cannot be deactivated or deleted.
- **Posted Usage Protection**: `accountingService.deleteAccount()` counts posted `JournalLine` references (`countPostedLinesForAccount`) and blocks deletion with `409 Conflict` if referenced by any posted transaction.
- **One-Click Standard NGO Seeding**: `POST /api/v1/finance/accounts` with `{ action: "SEED_DEFAULTS" }` idempotently seeds 24 standard NGO accounts (`DEFAULT_NGO_COA_SEED`).
