# Double-Entry Accounting & Accounting Periods

**Models**: `AccountingPeriod.ts`, `JournalEntry.ts`, `JournalLine.ts`  
**Service**: `src/server/services/accounting.service.ts`  
**Transaction Helper**: `src/server/database/transactions.ts`  
**API**: `/api/v1/finance/periods`, `/api/v1/finance/journals`, `/api/v1/finance/journals/[id]`, `/approve`, `/post`

---

## 1. Mandatory Accounting Rule

Every journal entry must satisfy:
- At least 2 lines
- Integer minor currency units (`debitMinor`, `creditMinor`) — fractional or negative values rejected
- Each line carries strictly either debit > 0 OR credit > 0 (never both)
- `sum(debitMinor) === sum(creditMinor) > 0` (`assertBalancedJournalLines`)

## 2. Journal Lifecycle & Separation of Duties

```text
DRAFT ──► PENDING_APPROVAL ──► APPROVED ──► POSTED ──► REVERSED (via counter-journal)
```

- **Create**: Requires `finance.journals.create`.
- **Approve**: Requires `finance.journals.approve`. Creators cannot approve their own manual journal entries (unless `SUPER_ADMIN`).
- **Post**: Requires `finance.journals.post`. Re-validates period status (`OPEN`) and line balance before marking `JournalEntry.status = 'POSTED'` and `JournalLine.isPosted = true`.
- **Immutability**: `JournalEntrySchema` blocks `deleteOne` and `findOneAndDelete` via Mongoose pre-hooks, and posted entries cannot be edited through application workflows.
- **Traceable Reversal**: `POST /api/v1/finance/journals/[id]` swaps every line's debit and credit into a counter-journal posted inside an open period, links `reversedByJournalId` / `reversalOfJournalId`, and marks the original `REVERSED`.

## 3. Accounting Periods

- Configurable financial years per organization (e.g., `FY 2026-27` April–March or calendar year `2026`).
- Statuses: `OPEN`, `CLOSED`, `LOCKED`.
- Posting into `CLOSED` or `LOCKED` periods is strictly blocked (`resolveOpenPeriod`).
- Reopening a closed/locked period requires `SUPER_ADMIN` or `EXECUTIVE_DIRECTOR` with a mandatory audit reason.

## 4. MongoDB Transaction Support & Honest Standalone Behavior

`runInFinancialTransaction()` executes multi-document journal posting inside a MongoDB `ClientSession.withTransaction(...)` on Replica Sets / Atlas. When connected to a standalone MongoDB instance that does not support replica-set transactions, it falls back cleanly with idempotency guards and persists `transactionalPost: false` + `transactionNote` on the `JournalEntry` so atomicity is never falsely claimed.
