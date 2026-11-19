# Bank Account Registry & Statement Reconciliation

**Models**: `BankAccount.ts`, `BankTransaction.ts`, `BankReconciliation.ts`  
**Crypto & CSV Parser**: `src/server/security/financial-crypto.ts`  
**API**: `/api/v1/finance/bank-accounts`, `/api/v1/finance/bank-transactions`, `/api/v1/finance/reconciliation`  
**Admin UI**: `/dashboard/admin/finance/banking`

---

## 1. Bank Account Registry
- Supports `SAVINGS`, `CURRENT`, `FCRA_DESIGNATED`, `PROJECT_DESIGNATED`, and `PETTY_CASH` accounts.
- Full account numbers are AES-256-GCM encrypted in `accountNumberEncrypted` (`select: false`).
- `toSafeBankAccountDTO()` exposes only `accountNumberMasked` (e.g., `••••••••8901`) and explicitly labels accounts without a completed reconciliation session as `isReconciled: false` (`Provisional`).

## 2. CSV Statement Import & Manual Reconciliation
- **No Direct Bank API Claims**: Statements are imported explicitly via validated CSV uploads (max 5 MB, max 1,000 rows per batch, binary/null-byte rejection, spreadsheet formula prefix neutralization).
- **Duplicate Row Prevention**: Every row is hashed into a deterministic SHA-256 `rowFingerprint` backed by compound unique index `{ organizationId, bankAccountId, rowFingerprint }`. Original lines are preserved in `rawRowSnapshot`.
- **Never Auto-Reconciled**: All imported rows enter as `reconciliationStatus: 'UNMATCHED'`. Authorized staff (`finance.reconciliation.manage`) manually match rows against `DONATION`, `EXPENSE`, `VENDOR_BILL`, `JOURNAL_ENTRY`, or `GRANT`, or flag `DISCREPANCY`.
- **Reconciliation Sessions**: `FINALIZE_SESSION` compares `statementClosingBalanceMinor` against the linked ledger account balance + opening balance. An account is marked `RECONCILED` only when `unmatchedCount === 0 && differenceMinor === 0`.
