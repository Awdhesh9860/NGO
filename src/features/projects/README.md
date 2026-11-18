# Projects & Field Operations Feature Module
**Module Path**: `src/features/projects`  
**Domain**: Project Lifecycles, Milestone Tracking & Beneficiary Telemetry  

## Responsibilities
- Public exploration of ongoing and completed field projects.
- Funding goal progress monitoring and beneficiary reporting.
- Milestone tracking and field completion toggles.
- Project manager and field team assignments.

## Public Exports (`index.ts`)
- `ProjectsView`: Categorized listing of projects with filter bar.
- `ProjectDetailView`: Detailed project view with milestones and photos.
- `StaffPortal`: Field staff operations center for milestone status updates.
- `Project`, `Milestone`: Core TypeScript entity interfaces.

## Permissions Required
- `projects.view`: View all project records.
- `projects.manage`: Create and modify field projects.
- `projects.view_assigned`: Access projects assigned to active user.
