# Consent Management & Data Retention Framework

**Platform**: HopeHorizon / Vikas NGO Ecosystem  
**Phase**: 09 — Volunteer, Member & Beneficiary Management  
**Feature Root**: `src/features/consent-management/` · `src/features/beneficiaries/`  
**Model**: `src/server/database/models/ConsentRecord.ts`

---

## 1. Purpose-Specific Consent Architecture

The platform tracks granular, versioned, auditable consent records across volunteers, members, and beneficiaries using the `ConsentRecord` collection (`consentrecords`).

### Supported Consent Purposes
| Purpose | Category | Required for Essential NGO Aid? |
|---------|----------|---------------------------------|
| `PROGRAM_PARTICIPATION` | Essential / Operational | Supports program enrollment |
| `DATA_PROCESSING` | Essential / Operational | Supports lawful operational record keeping |
| `COMMUNICATION` | Optional (`OPTIONAL_CONSENT_PURPOSES`) | **No** |
| `PHOTOGRAPHY_MEDIA` | Optional (`OPTIONAL_CONSENT_PURPOSES`) | **No** |
| `PUBLIC_STORYTELLING` | Optional (`OPTIONAL_CONSENT_PURPOSES`) | **No** |
| `RESEARCH_EVALUATION` | Optional (`OPTIONAL_CONSENT_PURPOSES`) | **No** |

---

## 2. Core Ethical & Technical Invariants

### 1. No Bundled Media or Storytelling Consent
- During initial beneficiary registration (`initialConsentGranted: true`), the system records **only** `PROGRAM_PARTICIPATION` and `DATA_PROCESSING`.
- `PHOTOGRAPHY_MEDIA` and `PUBLIC_STORYTELLING` are **never** bundled into intake consent; they must be recorded independently via `POST /api/v1/beneficiaries/[id]/consent` with version metadata and (for minors/vulnerable persons) documented guardian authorization (`grantedByGuardian: true`, `guardianName`, `guardianRelation`, optional `evidenceRef`).

### 2. Withdrawal Never Cancels Essential Assistance
- Calling `POST /api/v1/beneficiaries/[id]/consent` with `action: 'WITHDRAW'` updates the specific `ConsentRecord` to `status: 'WITHDRAWN'`, recording `withdrawnAt`, `withdrawalReason`, and `withdrawnBy`.
- Withdrawing `PHOTOGRAPHY_MEDIA`, `PUBLIC_STORYTELLING`, `COMMUNICATION`, or `RESEARCH_EVALUATION` **never** changes the beneficiary's eligibility, active enrollment, or assistance delivery status (`essentialAssistanceUnaffected: true`).

### 3. Retention & Anonymization Workflow
- Authorized staff (`consent.manage`, plus `safeguarding.manage` for safeguarded records) can trigger `action: 'ANONYMIZE_RECORD'` on `/api/v1/beneficiaries/[id]/consent`.
- Anonymization:
  - Replaces `fullName` with `Anonymized (<beneficiaryCode>)`
  - Clears `contactPhone`, `contactEmail`, `address`, `guardianDetails`, and `sensitiveProfile`
  - Sets `isAnonymized: true` and `anonymizedAt`
  - Preserves non-identifying statistical counts (`assistanceCategory`, `district`, assistance delivery metrics) for accurate NGO impact reporting
  - Logs an immutable `BENEFICIARY_ANONYMIZED` audit entry

---

## 3. Honest Compliance Notice

> [!NOTE]
> The platform implements technical privacy and consent-tracking foundations (purpose limitation, versioned consent logs, withdrawal tracking, least-privilege RBAC, sensitive-access audit trails, and anonymization workflows). Technical tooling alone does not constitute formal legal certification under DPDP, GDPR, or local child-protection statutes; each tenant NGO remains responsible for legal counsel review, physical consent notices, and organizational safeguarding policies.
