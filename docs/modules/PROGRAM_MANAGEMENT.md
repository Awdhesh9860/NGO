# Program Management Module

**Module Ownership:** Programs Squad (`src/features/programs/`, `src/app/dashboard/admin/programs/`, `src/app/api/v1/programs/`)  
**Phase:** 07 — Enterprise Program & Project Management

## 1. Overview
The Program Management module enables multi-tenant NGOs to plan, govern, approve, execute, and evaluate multi-year humanitarian programs (Education, Healthcare, Women Empowerment, Child Welfare, Rural Development, Skill Development, Environment, Poverty Alleviation, Community & Livelihood Development).

## 2. Database Schema & Relationships (`Program` Model)
- `organizationId` (`ObjectId` → `Organization`, required, indexed)
- `programManagerId` (`ObjectId` → `User`, verified active & same tenant)
- `departmentId` (`ObjectId` → `Department`, verified same tenant)
- Compound unique indexes: `{ organizationId: 1, slug: 1 }` and `{ organizationId: 1, code: 1 }`
- Soft deletion: `isDeleted`, `deletedAt`; Public visibility: `isPublicVisible` (default `false`).

## 3. Lifecycle State Machine (`PROGRAM_STATUS_TRANSITIONS`)
```text
DRAFT ──► PENDING_APPROVAL ──► APPROVED ──► ACTIVE ──► COMPLETED ──► ARCHIVED
               │                   │           │
               ▼                   ▼           ▼
            REJECTED ──► DRAFT   ON_HOLD ◄─────┘
```
- Approving/rejecting requires `programs.approve` (or `SUPER_ADMIN`).
- Archiving requires `programs.archive` (or `SUPER_ADMIN`).
- Only `APPROVED`, `ACTIVE`, or `COMPLETED` programs may be marked `isPublicVisible: true`.

## 4. API Contracts
| Endpoint | Method | Required Permission | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/v1/programs` | `GET` | `programs.view` | Paginated, filtered tenant programs |
| `/api/v1/programs` | `POST` | `programs.create` | Create program charter (starts in `DRAFT`) |
| `/api/v1/programs/[id]` | `GET` | `programs.view` | Program detail, linked projects, KPIs & budget rollup |
| `/api/v1/programs/[id]` | `PATCH` | `programs.update` / `programs.approve` | Edit fields, KPIs, lifecycle status, public visibility |
| `/api/v1/programs/[id]` | `DELETE` | `programs.archive` | Archive program & unpublish |
| `/api/v1/programs/[id]/projects` | `GET` | `programs.view` / `projects.view` | Linked projects list |
| `/api/v1/programs/[id]/approvals` | `GET`/`POST`/`PATCH` | `programs.view` / `programs.update` / `programs.approve` | Approval workflow |
| `/api/v1/public/programs` & `/[slug]` | `GET` | Public | Approved & published programs only (**no internal budgets**) |
