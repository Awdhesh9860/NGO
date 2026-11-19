# Beneficiary Data Privacy & Protection Architecture

**Platform**: HopeHorizon / Vikas NGO Ecosystem  
**Phase**: 09 — Volunteer, Member & Beneficiary Management  
**Primary Enforcement**: `src/server/authorization/permissions.ts` · `src/server/services/beneficiary.service.ts`

---

## 1. Security Principle: Least-Privilege Beneficiary Privacy

Beneficiary data represents some of the highest-risk humanitarian information an NGO holds. The platform enforces strict field-level minimization, role separation, non-sensitive default listings, and auditable access controls.

### Explicit Restriction on Default Admin & Manager Roles
High-sensitivity permissions are **not** granted automatically to `ADMIN` or `MANAGER` roles:

| Sensitive Permission | `SUPER_ADMIN` | `EXECUTIVE_DIRECTOR` | `ADMIN` | `MANAGER` | `PROJECT_MANAGER` | `TEAM_MEMBER` |
|----------------------|---------------|----------------------|---------|-----------|-------------------|---------------|
| `beneficiaries.sensitive.view` | Yes | Yes | **No** | **No** | No | No |
| `beneficiaries.documents.view` | Yes | Yes | **No** | **No** | No | No |
| `beneficiaries.export` | Yes | Yes | **No** | **No** | No | No |
| `safeguarding.manage` | Yes | Yes | **No** | **No** | No | No |
| `privacy.reports.view` | Yes | Yes | **No** | **No** | No | No |

Organizations that designate a dedicated Safeguarding Officer or Data Protection Officer assign these permissions explicitly via custom roles (`roles.manage`).

---

## 2. Two-Tier DTO Projection & Redaction

All beneficiary reads pass through deterministic DTO mappers in `src/server/services/beneficiary.service.ts`:

### A. General Listing DTO (`toListBeneficiaryDTO`)
Used by `GET /api/v1/beneficiaries`:
- **Never includes**: `contactPhone`, `contactEmail`, `address`, `gender`, `guardianDetails`, `sensitiveProfile`, `documentRefs`, `safeguardingEscalationRef`, or `caseNotes`.
- **Redacts Minor/Vulnerable Names**: When `isMinorOrVulnerable || requiresSafeguarding` is true and the viewer lacks both `beneficiaries.sensitive.view` and (`safeguarding.view` or `safeguarding.manage`), `displayName` is returned as `Protected Record (<beneficiaryCode>)`.
- **Anonymized Records**: Returned as `Anonymized (<beneficiaryCode>)`.

### B. Detailed Profile DTO (`toDetailedBeneficiaryDTO`)
Used by `GET /api/v1/beneficiaries/[id]`:
- `contactPhone`, `contactEmail`, `address`, `sensitiveProfile`: returned **only** when `clearance.canViewSensitive && canRevealProtected && !isAnonymized`.
- `gender`: returned **only** when `clearance.canViewSensitive`.
- `guardianDetails`: returned **only** when `clearance.canViewSensitive && (clearance.canViewSafeguarding || clearance.canManageSafeguarding) && !isAnonymized`.
- `documentRefs`: returned **only** when `clearance.canViewDocuments`; otherwise returns `[]` along with `documentCount` and `documentsRestricted: true`.
- `sensitiveFieldsRedacted`: explicit boolean indicator consumed by the UI (`BeneficiaryProfileCard`, `SafeguardingAccessPanel`) to inform authorized staff transparently.

---

## 3. Sensitive Access & Export Auditing

1. **Profile Access Logging**: Every detail fetch by a user with `beneficiaries.sensitive.view` writes an immutable `BENEFICIARY_SENSITIVE_ACCESS` audit entry recording actor, `beneficiaryCode`, `isMinorOrVulnerable`, and `documentsAccessed`.
2. **Export Gate & Audit**: Exporting beneficiaries (`GET /api/v1/beneficiaries?export=true`) requires `beneficiaries.export` and records a `BENEFICIARY_EXPORT` audit event with record count and whether sensitive fields were accessible.
3. **Aggregated Analytics**: `GET /api/v1/stakeholders/analytics` returns strictly aggregated numeric counts (`totalBeneficiaries`, `activeBeneficiaries`, `safeguardedCount`, `anonymizedCount`, etc.) with zero individual PII.

---

## 4. Communication & Channel Hygiene

- **No Sensitive Details in Emails**: `renderBeneficiaryOperationalEmail()` (`src/integrations/email/templates/stakeholder.template.ts`) never includes vulnerability notes, medical details, case summaries, guardian disputes, or safeguarding escalation details. It sends only the `beneficiaryCode` and operational appointment/status notice.
- **No Public Beneficiary Routes**: There is zero public API or SSR route exposing individual beneficiary records or downloadable files.
- **Multi-Tenant Isolation**: Every query across all 8 beneficiary collections scopes strictly by `organizationId` derived from the verified server session — never from client-supplied tenant headers or body fields.
