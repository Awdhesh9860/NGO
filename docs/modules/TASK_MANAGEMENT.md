# Task Management Module

**Module Ownership:** Delivery & Execution Squad (`src/features/tasks/`, `src/app/dashboard/admin/tasks/`, `src/app/api/v1/tasks/`)  
**Phase:** 07 — Enterprise Program & Project Management

## 1. Overview
Provides Kanban (`TaskBoard`) and project-scoped task tracking with statuses (`TODO`, `IN_PROGRESS`, `REVIEW`, `BLOCKED`, `COMPLETED`, `CANCELLED`), priorities (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), effort tracking (`estimatedEffortHours`, `actualEffortHours`), overdue detection, attachments metadata, and activity comments.

## 2. Authorization Boundaries
- `tasks.create` / `tasks.assign_manage`: Create tasks, assign/reassign active same-tenant users, edit scope/priority/due dates, and delete tasks.
- `tasks.update_assigned` (`TEAM_MEMBER`, `VOLUNTEER`): Strictly scoped to tasks where `task.assignedUserId === actor.id`; permits updating `status`, `completionPercentage`, `actualEffortHours`, and posting comments only — reassignment or modifying another member's task is rejected with HTTP 403.

## 3. API Contracts
| Endpoint | Method | Permission | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/v1/tasks` | `GET` | `tasks.view` / `tasks.update_assigned` | Tenant tasks filtered by project, status, priority, assignee, overdue |
| `/api/v1/tasks` | `POST` | `tasks.create` / `tasks.assign_manage` | Create task & email assignee |
| `/api/v1/projects/[id]/tasks` | `GET`/`POST` | `tasks.view` / `tasks.create` | Project-scoped task list & creation |
| `/api/v1/tasks/[id]` | `GET`/`PATCH`/`DELETE` | `tasks.view` / `tasks.update_assigned` / `tasks.assign_manage` | Detail, update/comment, delete |
