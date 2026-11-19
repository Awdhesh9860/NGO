# Fund Allocation & Restricted Funds Tracking

**Model**: `src/server/database/models/FundAllocation.ts`  
**Service**: `src/server/services/budget-grant-compliance.service.ts`  
**API**: `/api/v1/finance/fund-allocations`  
**Admin UI**: `/dashboard/admin/finance/grants`

---

## 1. Restricted vs Unrestricted Classification
- Every allocation records `fundSource` (`DONATION`, `GRANT`, `CAMPAIGN`, `GENERAL_RESERVE`), `sourceReferenceId`, `restrictionType` (`UNRESTRICTED` | `RESTRICTED`), `allocatedAmountMinor`, `utilizedAmountMinor`, and `history[]`.
- Donations and grants are never assumed unrestricted by default.

## 2. Enforcement Rules
- **Restricted Fund Compliance Guard (`assertRestrictedFundCompliance`)**:
  - Blocks allocating restricted funds to a program other than `permittedProgramId`.
  - Blocks allocating restricted funds to a project other than `permittedProjectId`.
  - Blocks allocating restricted funds when `purpose` does not match the grant/donor `permittedPurposes`.
- **Grant Restriction Inheritance**: Allocations sourced from a restricted `Grant` automatically inherit `restrictionType: 'RESTRICTED'` and the grant's program, project, and purpose restrictions.
- **Expense Utilization Cap**: Creating an expense linked to a `fundAllocationId` validates that the expense amount does not exceed `allocatedAmountMinor - utilizedAmountMinor`, and paying the expense automatically increments `utilizedAmountMinor` and appends an audit history entry.
- **Duplicate Prevention**: Compound unique index prevents duplicate allocation records for the same source, target, and purpose.
