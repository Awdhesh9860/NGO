# Project Budget Planning & Tracking Module

**Module Ownership:** Finance & Operations Squad (`src/features/project-budget/`, `src/server/database/models/ProjectBudgetEntry.ts`, `src/app/api/v1/projects/[id]/budget/route.ts`)  
**Phase:** 07 — Enterprise Program & Project Management

## 1. Scope & Ownership Boundaries
Provides project-level budget planning and expenditure summary tracking across 9 categories (`PERSONNEL`, `EQUIPMENT`, `TRAINING`, `TRAVEL`, `INFRASTRUCTURE`, `HEALTHCARE_SUPPLIES`, `EDUCATIONAL_MATERIALS`, `ADMINISTRATION`, `OTHER_OPERATIONAL`). Does **not** introduce a competing accounting ledger or payment system (deferred to later finance/donation phases).

## 2. Calculation Rules (`calculateProjectBudgetSummary`)
All financial summaries are computed strictly from persisted `ProjectBudgetEntry` records and `project.approvedBudget`:
- `totalPlanned` = $\sum \text{plannedAmount}$
- `totalActual` = $\sum \text{actualAmount}$
- `remainingBudget` = $\text{approvedBudget} - \text{totalActual}$
- `utilizationPercentage` = $(\text{totalActual} / \text{approvedBudget}) \times 100$ (0 when `approvedBudget === 0`)
- Flags: `exceedsPlanned` and `exceedsApproved` surface automatically in `BudgetSummary` and the Operational Dashboard Attention Required panel.

## 3. Access Control & Privacy
- Viewing budget lines requires `project_budget.view`; adding/editing/deleting requires `project_budget.manage`.
- Internal budgets are **strictly stripped** from public website APIs (`/api/v1/public/programs`, `/api/v1/public/projects`).
