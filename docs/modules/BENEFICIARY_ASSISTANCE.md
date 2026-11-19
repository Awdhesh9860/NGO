# Beneficiary Assistance Tracking Module

**Platform**: HopeHorizon / Vikas NGO Ecosystem  
**Phase**: 09 — Volunteer, Member & Beneficiary Management  
**Feature Root**: `src/features/beneficiary-assistance/` · `src/features/beneficiaries/`  
**Service Layer**: `src/server/services/beneficiary.service.ts`

---

## 1. Purpose & Core Financial Separation Invariant

The Beneficiary Assistance module records actual humanitarian services, goods, scholarships, rations, medical support, shelter aid, or livelihood assistance delivered to enrolled beneficiaries.

### Critical Integrity Separation
- **Strict Separation from Donations & Budgets**: `AssistanceRecord` is an independent operational service-delivery ledger.
  - Receiving a donation (`Donation`) does **not** constitute proof of assistance delivery.
  - Planning or spending a project budget (`ProjectBudget`) does **not** fabricate beneficiary assistance records.
  - Each delivered service must be explicitly recorded by authorized staff with actual delivery dates and outcomes.
- **No Unfunded Auto-Distribution**: Assistance records are never auto-generated on enrollment or donation settlement.

---

## 2. Data Model (`AssistanceRecord`)

Defined in `src/server/database/models/AssistanceRecord.ts` (collection: `assistancerecords`):

| Field | Type | Notes |
|-------|------|-------|
| `organizationId` | `ObjectId` | Mandatory tenant discriminator |
| `beneficiaryId` | `ObjectId` | Linked beneficiary within the same tenant |
| `enrollmentId` | `ObjectId?` | Optional link to specific `BeneficiaryEnrollment` |
| `programId` / `projectId` | `ObjectId?` | Validated against the caller's tenant |
| `assistanceCategory` | `string` | Configurable per organization (e.g., `EDUCATION`, `FOOD_NUTRITION`, `HEALTHCARE_SUPPORT`, `LIVELIHOOD`, `SHELTER`, `DISASTER_RELIEF`, or custom categories) |
| `description` | `string` | Operational description of aid provided |
| `quantityOrUnit` | `string?` | E.g., `"2 Ration Kits"`, `"1 Semester Stipend"` |
| `deliveryStatus` | Enum | `PLANNED`, `APPROVED`, `SCHEDULED`, `DELIVERED`, `FOLLOW_UP_DUE`, `COMPLETED`, `CANCELLED` |
| `scheduledDate` | `Date?` | Planned service delivery date |
| `deliveryDate` | `Date?` | **Mandatory** when `deliveryStatus === 'DELIVERED'` |
| `followUpDate` | `Date?` | Next scheduled field follow-up date |
| `outcomeNotes` | `string?` | Operational delivery outcome note |
| `approvedBy` / `deliveredBy` / `recordedBy` | `ObjectId` | Staff accountability references |

---

## 3. Validation & Operational Controls

1. **Permission Gate**: Recording assistance requires `beneficiaries.assistance.manage`.
2. **Delivery Date Enforcement**: `beneficiaryService.recordAssistance()` throws `ValidationError` if `deliveryStatus === 'DELIVERED'` is submitted without an actual `deliveryDate`.
3. **Tenant Boundary**: Linked `projectId` is verified against `organizationId` before writing.
4. **Consent Independence**: Withdrawing optional consents (`PHOTOGRAPHY_MEDIA`, `PUBLIC_STORYTELLING`, `COMMUNICATION`, `RESEARCH_EVALUATION`) **never** pauses, cancels, or blocks assistance delivery.
5. **Privacy-Safe Operational Notices**: If a beneficiary has an email and `communicationPreferences.allowOperationalSmsOrEmail === true`, scheduling assistance or setting a follow-up sends `renderBeneficiaryOperationalEmail(...)` containing only the `beneficiaryCode` and scheduled date — **never** sensitive case or vulnerability details.

---

## 4. API, Analytics & UI

- **API Route**: `POST /api/v1/beneficiaries/[id]/assistance`
- **Aggregated Analytics**: `GET /api/v1/stakeholders/analytics` returns anonymized counts (`assistanceDeliveredCount`, `followUpsDueCount`) with zero beneficiary names or PII.
- **UI Component**: `AssistanceHistoryTimeline` (`src/features/beneficiaries/components/AssistanceHistoryTimeline.tsx`) rendered on `/dashboard/admin/beneficiaries/[id]`.
