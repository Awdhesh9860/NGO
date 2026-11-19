# Child & Vulnerable Person Safeguarding Controls

**Platform**: HopeHorizon / Vikas NGO Ecosystem  
**Phase**: 09 — Volunteer, Member & Beneficiary Management  
**Feature Root**: `src/features/safeguarding/` · `src/features/beneficiaries/`  
**Admin Workspace**: `/dashboard/admin/safeguarding`

---

## 1. Safeguarding Policy in Code

NGOs serving children, survivors, elderly individuals, or vulnerable households face severe safeguarding obligations. The platform builds safeguarding invariants directly into models, service guards, DTO redactors, and audit logs.

---

## 2. Mandatory Safeguarding Protections

### 1. Guardian Requirement at Intake
- When `isMinorOrVulnerable: true` is submitted on `POST /api/v1/beneficiaries`, `beneficiaryService.registerBeneficiary()` **rejects** the request unless `guardianDetails.name` (and relationship) is explicitly supplied.
- Any record flagged `isMinorOrVulnerable: true` automatically sets `requiresSafeguarding: true`.

### 2. Redacted Identity for Unauthorized Viewers
- Both `toListBeneficiaryDTO()` and `toDetailedBeneficiaryDTO()` enforce child/vulnerable protection:
  - If `isMinorOrVulnerable || requiresSafeguarding` is true and the viewer does **not** hold BOTH `beneficiaries.sensitive.view` AND (`safeguarding.view` or `safeguarding.manage`), the person's name is replaced with `Protected Record (<beneficiaryCode>)`.
  - `contactPhone`, `contactEmail`, `address`, `guardianDetails`, `sensitiveProfile`, and `safeguardingEscalationRef` are completely omitted.

### 3. Guardian Proof for Child Media & Public Storytelling Consent
- In `beneficiaryService.manageConsent()`, granting `PHOTOGRAPHY_MEDIA` or `PUBLIC_STORYTELLING` consent for any beneficiary with `isMinorOrVulnerable || requiresSafeguarding` **requires**:
  - `grantedByGuardian: true`
  - non-empty `guardianName`
- Requests lacking documented guardian authorization throw `ValidationError` and are blocked.

### 4. Restricted Safeguarding Cases & Notes
- Creating or updating a case with `isSafeguardingCase: true`, logging `safeguardingEscalationRef`, or adding a restricted safeguarding note requires `safeguarding.manage` (withheld by default from `ADMIN` and `MANAGER`).
- `stakeholderRepository.findCaseNotes()` excludes `isRestrictedSafeguardingNote: true` unless the caller has `safeguarding.manage`.
- `getBeneficiaryDetail()` filters out `isSafeguardingCase: true` cases unless `clearance.canManageSafeguarding` is true.

### 5. Protected Anonymization & Audit Trail
- Anonymizing a safeguarded beneficiary (`action: 'ANONYMIZE_RECORD'`) additionally requires `safeguarding.manage`.
- Accessing detailed sensitive or safeguarded beneficiary profiles writes an immutable `BENEFICIARY_SENSITIVE_ACCESS` audit event.

### 6. Zero Public Exposure
- There is **no public beneficiary page**, **no public media/document download URL**, and **no sensitive beneficiary data in operational emails**.
- Operational emails for minors address the guardian (`guardianDetails.name` or `"Parent / Guardian"`) rather than exposing the child's name or case details.

---

## 3. UI & Operational Visibility

- **Admin Safeguarding Console**: `/dashboard/admin/safeguarding` — Displays current user's safeguarding clearance matrix, safeguarded record roster (redacted when unauthorized), and consent summary counts.
- **Profile Panel**: `SafeguardingAccessPanel` (`src/features/beneficiaries/components/SafeguardingAccessPanel.tsx`) — Explicitly surfaces whether a record is safeguarded, whether sensitive fields/documents are redacted, and whether `safeguarding.manage` is active.
