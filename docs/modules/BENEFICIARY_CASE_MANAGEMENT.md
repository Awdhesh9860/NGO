# Beneficiary Case Management Module

**Platform**: HopeHorizon / Vikas NGO Ecosystem  
**Phase**: 09 — Volunteer, Member & Beneficiary Management  
**Feature Root**: `src/features/beneficiary-cases/` · `src/features/beneficiaries/`  
**Service Layer**: `src/server/services/beneficiary.service.ts`

---

## 1. Overview

The Beneficiary Case Management module provides foundational, privacy-protected case tracking for social workers, field coordinators, and safeguarding officers. Case records and restricted case notes are stored in separate collections (`beneficiarycases` and `casenotes`) so sensitive operational notes are never leaked into general beneficiary listings or non-authorized views.

---

## 2. Data Models

### `BeneficiaryCase` (`src/server/database/models/BeneficiaryCase.ts`)
- Tenant discriminator: `organizationId` (required, indexed)
- Identifiers: `caseNumber` (`CASE-YYYY-XXXXXX`), `beneficiaryId`, optional `projectId`
- Ownership: `assignedCaseWorkerId` (validated as an active user within the same tenant)
- Metadata: `title`, `category`, `priority` (`LOW` | `MEDIUM` | `HIGH` | `URGENT`), `status`
- Safeguarding flag: `isSafeguardingCase`, optional `escalationReference`
- Follow-up & lifecycle: `nextFollowUpDate`, `referralHistory[]` (`referredTo`, `reason`, `referredBy`, `referredAt`), `closureSummary`, `closedBy`, `closedAt`, `reopenedCount`

### `CaseNote` (`src/server/database/models/CaseNote.ts`)
- Stored in a dedicated restricted collection (`casenotes`) linked via `organizationId`, `caseId`, `beneficiaryId`.
- Fields: `noteType` (`PROGRESS` | `ASSESSMENT` | `REFERRAL` | `SAFEGUARDING` | `CLOSURE`), `content`, `isRestrictedSafeguardingNote`, `authorId`, `authorName`, `authorRole`, `createdAt`.
- Query isolation: `stakeholderRepository.findCaseNotes(organizationId, beneficiaryId, includeRestricted)` filters out `isRestrictedSafeguardingNote: true` unless the caller possesses `safeguarding.manage` (or `SUPER_ADMIN`).

---

## 3. 6-State Case Lifecycle

Enforced via `BENEFICIARY_CASE_TRANSITIONS`:

```text
OPEN ──────────────► IN_PROGRESS ◄──────► WAITING_FOR_INFORMATION
  │                      │                         │
  ├──────────────────────┼─────────────────────────┼──► REFERRED ──► IN_PROGRESS / RESOLVED / CLOSED
  │                      └──► RESOLVED ────────────┴──► CLOSED
  └──────────────────────────► CLOSED                      │
                                 ▲                         │
                                 └───────── REOPEN ────────┘ (increments reopenedCount)
```

Allowed transitions:
- `OPEN` -> `IN_PROGRESS`, `WAITING_FOR_INFORMATION`, `REFERRED`, `RESOLVED`, `CLOSED`
- `IN_PROGRESS` -> `WAITING_FOR_INFORMATION`, `REFERRED`, `RESOLVED`, `CLOSED`
- `WAITING_FOR_INFORMATION` -> `IN_PROGRESS`, `REFERRED`, `RESOLVED`, `CLOSED`
- `REFERRED` -> `IN_PROGRESS`, `RESOLVED`, `CLOSED`
- `RESOLVED` -> `CLOSED`, `IN_PROGRESS`
- `CLOSED` -> `OPEN` (authorized reopen; increments `reopenedCount`)

---

## 4. Access Control & Safeguarding Escalation

| Action | Required Permission | Additional Safeguarding Check |
|--------|---------------------|-------------------------------|
| View standard cases & progress notes | `beneficiaries.case.manage` | Safeguarding cases (`isSafeguardingCase: true`) and restricted notes (`isRestrictedSafeguardingNote: true`) are filtered out unless caller also has `safeguarding.manage` |
| Open standard case | `beneficiaries.case.manage` | Case worker must be an active user in the same tenant |
| Open safeguarding escalation case | `beneficiaries.case.manage` **AND** `safeguarding.manage` | Automatically marks initial note with `noteType: 'SAFEGUARDING'` and `isRestrictedSafeguardingNote: true` |
| Add note / refer / close / reopen | `beneficiaries.case.manage` | Modifying or noting a safeguarding case additionally requires `safeguarding.manage` |

---

## 5. API Endpoint & UI Integration

- **Endpoint**: `POST /api/v1/beneficiaries/[id]/cases` (create case), `PATCH /api/v1/beneficiaries/[id]/cases` (actions: `ADD_NOTE`, `UPDATE_STATUS`, `REFER`, `CLOSE`, `REOPEN`)
- **Audit Logging**: Emits `BENEFICIARY_CASE_CREATED` and `BENEFICIARY_CASE_<ACTION>` audit entries (logging only case number and action, never private note contents).
- **UI Component**: `CaseManagementPanel` (`src/features/beneficiaries/components/CaseManagementPanel.tsx`), rendered inside `/dashboard/admin/beneficiaries/[id]` only when `clearance.canManageCases` is true.
