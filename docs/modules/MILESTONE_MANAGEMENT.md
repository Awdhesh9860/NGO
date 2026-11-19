# Milestone Management Module

**Module Ownership:** Delivery & Execution Squad (`src/features/milestones/`, `src/app/dashboard/admin/milestones/`, `src/app/api/v1/projects/[id]/milestones/`)  
**Phase:** 07 — Enterprise Program & Project Management

## 1. Overview
Tracks key project deliverables, target dates, completion dates, responsible owners, and completion percentages across individual projects and organization-wide milestone dashboards.

## 2. Automatic Project Progress Rollup
Whenever a milestone is created, updated, completed, or deleted, `projectService.recalculateProjectProgress(projectId, organizationId)` computes the mean `completionPercentage` across all non-cancelled milestones and persists `project.progressPercentage` automatically.

## 3. API Contracts
| Endpoint | Method | Permission | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/v1/milestones` | `GET` | `milestones.manage` / `projects.view` | Cross-project milestones with `?overdueOnly=true` filter |
| `/api/v1/projects/[id]/milestones` | `GET` | `projects.view` / `projects.view_assigned` | Milestones for one project |
| `/api/v1/projects/[id]/milestones` | `POST` | `milestones.manage` | Create milestone |
| `/api/v1/projects/[id]/milestones` | `PATCH` | `milestones.manage` | Update status / mark completed (sets `completionPercentage: 100` & `completionDate`) |
| `/api/v1/projects/[id]/milestones` | `DELETE` | `milestones.manage` | Remove milestone & recalculate project progress |
