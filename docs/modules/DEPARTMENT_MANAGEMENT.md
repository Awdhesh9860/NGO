# Department Management Module

**Module Ownership:** Organization Structure Squad  
**Primary Files:** `src/server/database/models/Department.ts`, `src/server/repositories/department.repository.ts`, `src/app/api/v1/admin/departments/`, `src/app/dashboard/admin/departments/`

## 1. Capabilities
- Create, edit, deactivate, and delete tenant departments (e.g., Administration, Finance & Accounts, Programs, Project Management, Human Resources, Volunteer Management, Communications, Fundraising, Monitoring & Evaluation, IT & Technology).
- Designate a Department Head (`headUserId` — verified to belong to the same `organizationId`).
- Track optional annual department budget (`budget` non-negative number).
- Assign and remove staff members on `/dashboard/admin/departments/[id]` with live member counts computed via MongoDB aggregation.
- Department-specific audit activity stream (`DEPARTMENT_CREATE`, `DEPARTMENT_UPDATE`, `DEPARTMENT_DELETE`, `DEPARTMENT_MEMBER_ASSIGN`, `DEPARTMENT_MEMBER_REMOVE`).

## 2. Duplicate Prevention & Data Integrity
- Compound unique MongoDB index `{ organizationId: 1, slug: 1 }` prevents duplicate departments per organization.
- Service layer validates slug uniqueness before creation/update and throws `ConflictError` (HTTP 409) on collisions.
- Deleting a department cleanly unassigns (`$unset: { departmentId: 1 }`) all linked users inside the same organization without deleting user records.

## 3. API Contracts
| Endpoint | Method | Permission | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/v1/admin/departments` | `GET` | `departments.manage` | List departments with real `memberCount` |
| `/api/v1/admin/departments` | `POST` | `departments.manage` | Create department (slug unique per tenant) |
| `/api/v1/admin/departments/[id]` | `GET` | `departments.manage` | Department details, member roster & activity |
| `/api/v1/admin/departments/[id]` | `PATCH` | `departments.manage` | Update name, head, budget, description, status |
| `/api/v1/admin/departments/[id]` | `DELETE` | `departments.manage` | Delete department & unassign members |
| `/api/v1/admin/departments/[id]/members` | `GET`/`POST`/`DELETE` | `departments.manage` | Manage department member roster |
