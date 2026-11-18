# Projects & Field Deployments Module Specification
**Module**: `src/features/projects`  
**Owner Squad**: Squad Gamma (Field Operations)  

---

## 1. Scope & Domain Responsibilities
- Lifecycle management of field projects across programs (Clean Water, Education, Healthcare).
- Milestone tracking, progress percentage calculation, and field completion verification.
- Direct beneficiary count aggregation and GPS location tagging.
- Field dispatches and photo uploads from project sites.

## 2. Public API & Component Boundaries
- `ProjectsView`: Filterable listing of active and completed field projects.
- `ProjectDetailView`: Comprehensive project overview with objectives, milestones, and funding status.
- `StaffPortal`: Field staff operations center for milestone toggling.
