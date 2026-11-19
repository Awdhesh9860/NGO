# NGO Compliance & Statutory Deadline Management

**Model**: `src/server/database/models/ComplianceRecord.ts`  
**Service**: `src/server/services/budget-grant-compliance.service.ts`  
**API**: `/api/v1/compliance/records`, `/api/v1/compliance/records/[id]`, `/api/v1/compliance/deadlines`  
**Admin UI**: `/dashboard/admin/compliance`

---

## 1. Configurable Statutory & Governance Types
Supports configurable, jurisdiction-aware tracking (no registration assumed mandatory for every NGO):
`12A`, `80G`, `PAN`, `TAN`, `NGO_DARPAN`, `CSR_1`, `FCRA`, `ANNUAL_AUDIT`, `FINANCIAL_STATEMENTS`, `BOARD_RESOLUTION`, `ANNUAL_RETURN`, `STATUTORY_FILING`, and `CUSTOM`.

## 2. Honest Verification Boundary
- **No Auto-Verification on Upload**: Creating a compliance record with a registration number or document sets `validityStatus = 'DOCUMENT_RECORDED'` (or `'DRAFT'`), **never** `'INDEPENDENTLY_VERIFIED'`.
- **Privileged Verification Gate**: Transitioning to `INDEPENDENTLY_VERIFIED` strictly requires `compliance.verify` (held by `ACCOUNTANT`, `EXECUTIVE_DIRECTOR`, `SUPER_ADMIN`, withheld from general `ADMIN` and `MANAGER`) plus supporting registration/document reference and verification notes.
- **Renewal Reset**: Recording a renewal (`action: 'RENEW'`) updates `expiryDate`, appends to `renewalHistory`, and resets status to `DOCUMENT_RECORDED` pending independent re-verification.
- **Deadline Evaluation**: `evaluateComplianceDeadline()` classifies obligations as `OVERDUE`, `DUE_SOON` (≤ 45 days), `UPCOMING`, `NO_DEADLINE`, or `NOT_APPLICABLE`.

> [!IMPORTANT]
> This module does **not** fabricate statutory registration numbers, does **not** perform automated government portal filings, and does **not** replace Chartered Accountant or legal counsel verification.
