# Financial Data Security & Accounting Controls

**Primary Modules**: `src/server/security/financial-crypto.ts`, `src/server/authorization/permissions.ts`, `src/server/database/transactions.ts`

---

## 1. Separation of Duties Matrix

| Control Area | Creator / Submitter | Approver | Executor / Poster |
|--------------|---------------------|----------|-------------------|
| **Journal Entries** | `finance.journals.create` (`ACCOUNTANT`, `ADMIN`) | `finance.journals.approve` (`ADMIN`, `EXECUTIVE_DIRECTOR`, `SUPER_ADMIN`) — creator blocked from self-approval | `finance.journals.post` (`ACCOUNTANT`, `EXECUTIVE_DIRECTOR`, `SUPER_ADMIN`) |
| **Expenses** | `finance.expenses.create` (`TEAM_MEMBER`+) | `finance.expenses.approve` (`MANAGER` ≤ ₹50k, `ADMIN` ≤ ₹2.5L, `EXECUTIVE_DIRECTOR` ≤ ₹10L) — self-approval blocked | `finance.expenses.pay` (`ACCOUNTANT`, `EXECUTIVE_DIRECTOR`, `SUPER_ADMIN`) |
| **Compliance** | `compliance.manage` (`ADMIN`, `ACCOUNTANT`) | N/A | `compliance.verify` (`ACCOUNTANT`, `EXECUTIVE_DIRECTOR`, `SUPER_ADMIN`) |

## 2. Sensitive Financial Data Protection
- **AES-256-GCM Encryption**: Bank account numbers (`BankAccount.accountNumberEncrypted`) and vendor bank payout numbers (`Vendor.bankAccountEncrypted`) are encrypted with per-record random 96-bit IVs and GCM authentication tags, stored in `select: false` columns.
- **Strict Masking**: `toSafeBankAccountDTO()` and `toSafeVendorDTO()` expose only last-4 masked numbers (`••••••••1234`), never plaintext or ciphertext.
- **Private Financial Documents**: `FinancialDocument` stores validated storage keys via `storageProvider` (`validateDocumentFile`, max 15 MB, MIME allowlist) — never raw binary files inside MongoDB.
- **CSV Upload & Export Defense**: `parseBankStatementCsv()` rejects binary null bytes, enforces row/size caps, and strips leading formula symbols; `escapeCsvCell()` defends spreadsheet exports against formula injection.
- **Immutable Audit Trail & Tenant Scoping**: All financial mutations log to `AuditLog`, posted journals block deletion via Mongoose pre-hooks, and every query enforces `organizationId` from the authenticated server session.
