# Project & Program Access Control & Safeguarding

**Owner:** Security Engineering  
**Scope:** Phase 07 — Program, Project, Task, Milestone, Budget, Document & Beneficiary Summary Security

## 1. Granular Permission Matrix (Extended from Phase 06 RBAC)
| Role | Programs | Projects | Approvals | Tasks & Milestones | Budget | Public Publish |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `SUPER_ADMIN` / `ADMIN` / `EXECUTIVE_DIRECTOR` | Full + Approve + Archive | Full + Approve + Archive | Yes (No self-approve) | Full | View + Manage | Yes |
| `MANAGER` | View, Create, Update, Approve | View, Create, Update, Approve, Assign | Yes (No self-approve) | Full | View + Manage | Yes |
| `PROJECT_MANAGER` | View | View, Create, Update, Assign | Submit only | Full | View + Manage | No |
| `ACCOUNTANT` | View | View | No | None | View + Manage | No |
| `COMMUNICATIONS` / `CONTENT_EDITOR` | View | View | No | None | None | Content only |
| `TEAM_MEMBER` | View | Assigned only | No | Own tasks only | None | No |
| `VOLUNTEER` | None | Assigned only | No | Own tasks only | None | No |
| `DONOR` / `MEMBER` / `GUEST` | Public API only | Public API only | No | None | None | No |

## 2. Tenant Isolation & Assignment Verification
- Every `/api/v1/programs/*`, `/api/v1/projects/*`, `/api/v1/tasks/*`, and `/api/v1/milestones` handler derives `organizationId` strictly from `authContext.user.organizationId`.
- All cross-references (`programId`, `departmentId`, `projectManagerId`, `teamMembers.userId`, `assignedUserId`, `assignedApproverId`, `ownerUserId`) are verified to exist in the exact same tenant and (for user assignments) to have `status === 'active'`.

## 3. Beneficiary Safeguarding & Public Separation
- `assertSafeBeneficiarySummary()` rejects PII patterns (emails, phone numbers, PAN, Aadhaar-like 12-digit IDs).
- Public endpoints (`/api/v1/public/programs`, `/api/v1/public/projects`) filter strictly to `isPublicVisible: true` and approved/active/completed statuses, stripping all internal budgets, internal/restricted documents, risk registers, approval notes, and granular minor demographics.
