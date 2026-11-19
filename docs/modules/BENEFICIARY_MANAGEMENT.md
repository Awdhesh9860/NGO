# Beneficiary Management Module

**Platform**: HopeHorizon / Vikas NGO Ecosystem  
**Phase**: 09 — Volunteer, Member & Beneficiary Management  
**Feature Root**: `src/features/beneficiaries/` · `src/features/beneficiary-enrollment/`  
**Service Layer**: `src/server/services/beneficiary.service.ts`

---

## 1. Purpose & Design Philosophy

The Beneficiary Management module provides privacy-first, safeguarding-compliant beneficiary registration, household linking, human eligibility verification, and project enrollment across multi-tenant NGO organizations.

### Core Data Minimization Rules
- **Purpose-Limited Intake**: Only operational fields strictly needed for humanitarian assistance (name, age/age-range, district/village/state, assistance category, registration source) are captured by default.
- **No Unnecessary High-Risk Fields**: The default schema explicitly excludes Aadhaar / government ID numbers, bank credentials, and clinical hospital records.
- **Separation of Sensitive Profile**: Optional demographic or vulnerability context lives inside a separate `sensitiveProfile` sub-object and is strictly withheld from general listings and unauthorized roles.
- **Zero Public Beneficiary Routes**: Beneficiaries are never exposed on public URLs, public search, or unauthenticated API endpoints.

---

## 2. Data Models

| Model | Collection | Scope | Key Fields |
|-------|------------|-------|------------|
| `BeneficiaryHousehold` | `beneficiaryhouseholds` | Tenant (`organizationId`) | `householdCode` (`HH-YYYY-XXXXXX`), `headOfHouseholdName`, `memberCount`, `district`, `village`, `state`, `primaryProgramId` |
| `Beneficiary` | `beneficiaries` | Tenant (`organizationId`) | `beneficiaryCode` (`BEN-YYYY-XXXXXX`), `fullName`, `ageOrRange`, `assistanceCategory`, `status`, `eligibilityStatus`, `verificationStatus`, `isMinorOrVulnerable`, `requiresSafeguarding`, `guardianDetails`, `sensitiveProfile`, `documentRefs`, `isAnonymized`, `statusHistory` |
| `BeneficiaryVerification` | `beneficiaryverifications` | Tenant (`organizationId`) | `beneficiaryId`, `checklist[]`, `supportingDocumentRefsReviewed[]`, `decision` (`VERIFIED`/`REJECTED`/`MORE_INFO_REQUIRED`), `decisionReason`, `humanReviewed: true`, `reviewedBy`, `reassessmentDueDate` |
| `BeneficiaryEnrollment` | `beneficiaryenrollments` | Tenant (`organizationId`) | `beneficiaryId`, `programId`, `projectId`, `assistanceCategory`, `caseWorkerId`, `enrollmentDate`, `expectedCompletionDate`, `status` (`ACTIVE`/`COMPLETED`/`ON_HOLD`/`WITHDRAWN`) |

---

## 3. 9-State Beneficiary Lifecycle

State transitions are strictly enforced in `BENEFICIARY_STATUS_TRANSITIONS` (`src/server/services/beneficiary.service.ts`):

```text
DRAFT ────────► SUBMITTED ────────► UNDER_REVIEW ────────► APPROVED ────────► ACTIVE ────────► COMPLETED
  │                 │                    │                    │                  │
  └──► WITHDRAWN    ├──► APPROVED        ├──► APPROVED        ├──► ON_HOLD ◄─────┤
                    ├──► REJECTED ◄──────┤                    └──► WITHDRAWN     └──► WITHDRAWN
                    └──► WITHDRAWN       ├──► ON_HOLD
                                         └──► WITHDRAWN
(REJECTED ──► UNDER_REVIEW permitted for formal reassessment)
```

Every transition appends an immutable entry to `statusHistory` recording `status`, `actorId`, `actorName`, `reason`, and `timestamp`, and emits an audit log event (`BENEFICIARY_STATUS_UPDATE`).

---

## 4. Human Eligibility Verification

- Beneficiaries are registered with `status: 'SUBMITTED'`, `eligibilityStatus: 'PENDING'`, and `verificationStatus: 'UNVERIFIED'`.
- **No Auto-Approval**: Eligibility decisions require explicit human review via `POST /api/v1/beneficiaries/[id]/verification` by an actor with `beneficiaries.verify`.
- **Mandatory Decision Reason**: Every `VERIFIED`, `REJECTED`, or `MORE_INFO_REQUIRED` verdict requires a written `decisionReason` and persists `humanReviewed: true`, `reviewedBy`, and `reviewedAt`.
- **Reassessment Tracking**: Optional `reassessmentDueDate` supports periodic eligibility re-verification.

---

## 5. Project Enrollment Rules

- Enrollment (`POST /api/v1/beneficiaries/[id]/enrollments`) requires `beneficiaries.enroll`.
- **Verification Gate**: Only beneficiaries whose status is `APPROVED`/`ACTIVE` or `verificationStatus === 'VERIFIED'` can be enrolled in projects.
- **Tenant Consistency**: Linked `householdId`, `programId`, `projectId`, and `assignedCaseWorkerId` are all validated against the caller's `organizationId`.
- **Duplicate Enrollment Prevention**: Compound unique index on `(organizationId, beneficiaryId, projectId, assistanceCategory)` prevents duplicate active enrollments in the same category and returns `409 Conflict`.
- **Auto-Activation on First Enrollment**: An `APPROVED` beneficiary transitions to `ACTIVE` upon enrollment.

---

## 6. API Endpoints & Admin UI

### Endpoints
- `GET /api/v1/beneficiaries` — Non-sensitive paginated beneficiary directory (`toListBeneficiaryDTO`) or authorized export (`?export=true`, requires `beneficiaries.export`)
- `POST /api/v1/beneficiaries` — Register beneficiary (validates guardian requirement for minors)
- `GET /api/v1/beneficiaries/households` / `POST /api/v1/beneficiaries/households` — Household registry
- `GET /api/v1/beneficiaries/[id]` — Field-gated beneficiary profile (`toDetailedBeneficiaryDTO`) with automatic sensitive access audit logging
- `PATCH /api/v1/beneficiaries/[id]` — Validated lifecycle status update & case worker assignment
- `POST /api/v1/beneficiaries/[id]/verification` — Human eligibility review decision
- `POST /api/v1/beneficiaries/[id]/enrollments` — Project enrollment

### Admin Pages & Reusable Components
- Pages: `/dashboard/admin/beneficiaries`, `/dashboard/admin/beneficiaries/[id]`
- Components: `BeneficiaryStatusBadge`, `BeneficiaryRegistrationForm`, `BeneficiaryProfileCard`, `BeneficiaryVerificationPanel`, `BeneficiaryEnrollmentPanel`
