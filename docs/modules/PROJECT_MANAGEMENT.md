# Project Management Module

**Module Ownership:** Field Operations Squad (`src/features/projects/`, `src/app/dashboard/admin/projects/`, `src/app/api/v1/projects/`)  
**Phase:** 07 — Enterprise Program & Project Management

## 1. Overview
Supports end-to-end grassroots field projects linked optionally to a parent `Program` or run independently. Includes geolocation (`state`, `district`, `block`, `village`, `coordinates`), team assignments using existing `User` & `Department` relationships (no duplicate `Team` collection), milestones, tasks, budget planning, documents, approvals, risk register, and safeguarding-compliant beneficiary reach summaries.

## 2. Lifecycle State Machine (`PROJECT_STATUS_TRANSITIONS`)
```text
DRAFT ──► PENDING_APPROVAL ──► APPROVED ──► PLANNED / ACTIVE ──► COMPLETED ──► ARCHIVED
               │                                   │
               ▼ (Rejected -> DRAFT)             ON_HOLD / CANCELLED
```
- `APPROVED`, `CANCELLED`, and `COMPLETED` require `projects.approve` (or `SUPER_ADMIN`).
- `ARCHIVED` requires `projects.archive`.
- `PROJECT_MANAGER` can create projects, submit for approval, and activate `APPROVED`/`PLANNED` projects, but cannot self-approve or cancel.

## 3. Team Assignment & Workload
- Stored as `teamMembers` subdocuments on `Project` (`userId`, `responsibility`, `accessLevel: LEAD | CONTRIBUTOR | VIEWER`).
- Validates target user is `status === 'active'` and belongs to the exact same `organizationId`.
- Real open-task workload counts are aggregated live from the `Task` collection.

## 4. Beneficiary Privacy & Safeguarding
- `assertSafeBeneficiarySummary()` blocks personal identifiers (email, phone, PAN, 12-digit ID numbers) in summary notes or demographic group labels.
- Child safeguarding indicator (`includesMinorBeneficiaries`, `safeguardingVerified`) restricts exposure; public projections (`toPublicProjectDTO`) strip internal budgets, internal/restricted docs, risk register, and granular demographics.

## 5. API Contracts
- `GET`/`POST` `/api/v1/projects`, `GET`/`PATCH`/`DELETE` `/api/v1/projects/[id]`
- `GET`/`POST`/`DELETE` `/api/v1/projects/[id]/team`
- `GET`/`POST`/`PATCH`/`DELETE` `/api/v1/projects/[id]/risks`
- `GET` `/api/v1/projects/analytics` (real MongoDB operational dashboard aggregations)
- `GET` `/api/v1/public/projects` & `/api/v1/public/projects/[slug]` (strictly sanitized public view)
