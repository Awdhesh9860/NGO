# Program & Project Module Development Guidelines

**Applies To:** All squads building on Phase 07 operational modules

## 1. Hybrid Feature-Based Module Ownership
| Feature Directory | Squad | Key Exports |
| :--- | :--- | :--- |
| `src/features/programs/` | Programs Squad | `ProgramCard`, `ProgramForm`, `ProgramStatusBadge`, `programApiService`, `usePublicPrograms`, `program.schema.ts` |
| `src/features/projects/` | Field Operations Squad | `ProjectCard`, `ProjectForm`, `ProjectStatusBadge`, `ProjectProgress`, `ProjectTimeline`, `ProjectTeamPanel`, `RiskRegister`, `ProjectActivityTimeline`, `projectApiService`, `usePublicProjects` |
| `src/features/tasks/` | Delivery Squad | `TaskBoard`, `TaskCard`, `taskApiService`, `task.schema.ts` |
| `src/features/milestones/` | Delivery Squad | `MilestoneTimeline`, `milestone.schema.ts` |
| `src/features/project-approvals/` | Governance Squad | `ApprovalPanel`, `approval.schema.ts` |
| `src/features/project-budget/` | Finance & Ops Squad | `BudgetSummary`, `BudgetUtilizationChart`, `budget.schema.ts` |
| `src/features/project-documents/` | Operations & Storage Squad | `ProjectDocumentsPanel`, `document.schema.ts` |
| `src/features/project-reports/` | Analytics Squad | `projectReportsApiService`, `OperationalAnalyticsData` |

## 2. Boundary & Collaboration Rules
1. **No Duplicate Models:** Extend existing `User`, `Department`, `Organization`, and `AuditLog` models; never create a competing `Team` collection.
2. **State Machines Live on the Server:** Always validate status transitions via `assertValidProgramTransition` and `assertValidProjectTransition`.
3. **Never Expose Internal Data Publicly:** All public website routes must read only through `toPublicProgramDTO` / `toPublicProjectDTO`.
4. **Testing Commands:**
   ```bash
   npx tsc --noEmit
   npm run test:run
   npm run build
   ```
