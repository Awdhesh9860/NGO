# General Ledger & Phase 08 Income/Refund Integration

**Model**: `src/server/database/models/JournalLine.ts`  
**API**: `/api/v1/finance/ledger`, `/api/v1/finance/trial-balance`, `/api/v1/finance/income`  
**Admin UI**: `/dashboard/admin/finance/ledger`

---

## 1. Posted-Only General Ledger

- General Ledger queries filter strictly by `{ organizationId, isPosted: true }`.
- Draft, pending-approval, and unposted lines never appear in General Ledger registers, Trial Balance, or Financial Statements.
- Running balances follow normal balance convention (`ASSET`/`EXPENSE`: Debit − Credit; `LIABILITY`/`EQUITY`/`INCOME`: Credit − Debit) computed in integer minor units.
- Dimensions (`programId`, `projectId`, `departmentId`, `campaignId`, `grantId`, `fundAllocationId`, `vendorId`) are persisted directly on each `JournalLine` for accurate dimensional NGO reporting.

## 2. Idempotent Phase 08 Donation & Refund Sync

- **Donations (`syncVerifiedDonationToLedger`)**:
  - Reads existing Phase 08 `Donation` records (zero duplicate donation collection).
  - Strictly rejects `INITIATED`, `PENDING`, `FAILED`, and `CANCELLED` donations.
  - Uses deterministic `idempotencyKey = "DONATION:<donationId>"` so repeated sync requests return `idempotentReplay: true` without duplicating income.
  - Posts `DR Primary NGO Bank Account (1020)` / `CR Individual Donations Income (4010)`.
- **Refunds (`syncProcessedRefundToLedger`)**:
  - Strictly accepts only `SUCCESSFUL` Phase 08 `Refund` records.
  - Uses deterministic `idempotencyKey = "REFUND:<refundId>"`.
  - Posts `DR Donation Refunds Contra-Income (4090)` / `CR Primary NGO Bank Account (1020)`.
