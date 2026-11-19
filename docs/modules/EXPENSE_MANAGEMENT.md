# Expense Management & Approval Workflow

**Models**: `Expense.ts`, `ExpenseApproval.ts`  
**Service**: `src/server/services/expense-vendor.service.ts`  
**API**: `/api/v1/finance/expenses`, `/[id]`, `/[id]/approve`, `/[id]/pay`  
**Admin UI**: `/dashboard/admin/finance/expenses`

---

## 1. 8-State Expense Lifecycle

`DRAFT` -> `SUBMITTED` -> `UNDER_REVIEW` -> `APPROVED` -> `PAYMENT_PENDING` -> `PAID` (with `REJECTED` and `CANCELLED` paths).

## 2. Separation of Duties & Threshold Controls

| Role | Submit (`create`) | Approve (`approve`) | Role Monetary Limit | Pay (`pay`) |
|------|-------------------|---------------------|---------------------|-------------|
| `TEAM_MEMBER` | Yes (sees own) | No | ₹0 | No |
| `PROJECT_MANAGER` | Yes | No | ₹0 | No |
| `MANAGER` | Yes | Yes | ₹50,000 (`5,000,000` paise) | No |
| `ADMIN` | Yes | Yes | ₹2,50,000 (`25,000,000` paise) | No |
| `ACCOUNTANT` | Yes | No | ₹0 | **Yes** |
| `EXECUTIVE_DIRECTOR` | Yes | Yes | ₹10,00,000 (`100,000,000` paise) | Yes |
| `SUPER_ADMIN` | Yes | Yes | Unlimited | Yes |

### Non-Negotiable Rules
1. **No Self-Approval**: Submitter cannot approve their own expense unless explicitly permitted by policy and holding `SUPER_ADMIN`.
2. **Threshold Enforcement**: Attempts to approve an expense above the role's threshold throw `AuthorizationError` instructing escalation.
3. **Immutable Approval History**: Every decision persists an `ExpenseApproval` document capturing stage, approver, role threshold, decision, and comment.
4. **Automatic Balanced Ledger Posting on Payment**: `payApprovedExpense()` requires `finance.expenses.pay`, posts an idempotent double-entry journal (`EXPENSE_PAY:<expenseId>` — `DR Expense Account` / `CR Bank or Cash`), and updates linked `FundAllocation` utilization.
