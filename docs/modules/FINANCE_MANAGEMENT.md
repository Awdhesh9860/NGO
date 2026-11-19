# Enterprise Finance Management Architecture

**Platform**: HopeHorizon / Vikas NGO Ecosystem  
**Phase**: 10 — Finance, Accounting, Expense & Compliance Management  
**Primary Modules**: `src/features/finance/`, `src/features/compliance/`, `src/server/services/accounting.service.ts`, `expense-vendor.service.ts`, `budget-grant-compliance.service.ts`, `financial-reports.service.ts`

---

## 1. Architecture Overview

Phase 10 connects existing Phase 07 project budgets (`ProjectBudgetEntry`) and Phase 08 fundraising transactions (`Donation`, `Refund`) into an enterprise double-entry accounting, treasury, budget, restricted-fund, grant, and statutory compliance platform.

### Authoritative Integration Boundaries
- **Zero Duplicate Donations or Payments**: Verified `SUCCESSFUL` donations and `SUCCESSFUL` refunds from Phase 08 are bridged into the General Ledger via idempotent accounting events (`DONATION:<id>`, `REFUND:<id>`) — never manually duplicated. Pending, failed, or cancelled donations cannot be recognized as income.
- **Zero Duplicate Project Budgets**: Multi-level `Budget` records bridge Phase 07 `ProjectBudgetEntry` records without overwriting them, while actual expenditure is strictly calculated from posted `JournalLine` (`EXPENSE`) entries.
- **Integer Minor-Unit Precision**: Every monetary column and calculation uses integer minor currency units (`src/lib/money.ts`) — zero JavaScript floating-point arithmetic.
- **Multi-Tenant Isolation**: Every collection requires `organizationId` derived strictly from the authenticated server session.

---

## 2. 16 Tenant-Scoped Collections

`ChartOfAccount`, `AccountingPeriod`, `JournalEntry`, `JournalLine`, `Expense`, `ExpenseApproval`, `Vendor`, `VendorBill`, `BankAccount`, `BankTransaction`, `BankReconciliation`, `Budget`, `FundAllocation`, `Grant`, `ComplianceRecord`, and `FinancialDocument`.

---

## 3. Honest Scope & Legal Boundary

> [!NOTE]
> Phase 10 establishes auditable double-entry financial records, role-separated approvals, masked bank controls, and compliance tracking. It does **not** perform automated government statutory filing (12A/80G/FCRA/ITR), direct live bank API sync, or replace independent Chartered Accountant certification.
