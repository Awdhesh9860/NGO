# Project & Program Approval Workflow

**Module Ownership:** Governance & Compliance Squad (`src/features/project-approvals/`, `src/server/database/models/ProjectApproval.ts`)  
**Phase:** 07 — Enterprise Program & Project Management

## 1. Workflow Stages
```text
Project / Program Manager submits DRAFT (or resubmits REJECTED)
  ↓ (status → PENDING_APPROVAL, revisionCount incremented, approver notified via email)
Stage 1: DEPARTMENT_HEAD_REVIEW
  ↓
Stage 2: MANAGER_EXECUTIVE_APPROVAL
  ↓
APPROVED (status → APPROVED; PM can activate)  OR  REJECTED (requires rejectionReason; returns for revision & resubmission)
```

## 2. Security Invariants
- **No Self-Approval:** `approval.submittedBy === actor.id` always throws `AuthorizationError` (HTTP 403), even for `EXECUTIVE_DIRECTOR` or `ADMIN`.
- **Permission Gate:** Only actors with `programs.approve` / `projects.approve` (or `SUPER_ADMIN`) can approve or reject.
- **Mandatory Rejection Reason:** Rejecting without `rejectionReason` fails with HTTP 422/400.
- **Immutable History & Audit Trail:** Every submission, resubmission, approval, and rejection appends to `approval.history` and logs `PROGRAM_APPROVED`/`PROGRAM_REJECTED`/`PROJECT_APPROVED`/`PROJECT_REJECTED` in `AuditLog`.
- **Email Notifications:** Dispatches `renderApprovalRequestEmail` and `renderApprovalDecisionEmail` via `emailProvider` respecting `organization.notificationSettings.emailNotifications`.
