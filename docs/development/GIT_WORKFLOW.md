# Enterprise NGO Platform — Git Workflow & Branching Strategy
**Platform**: HopeHorizon / Vikas NGO Ecosystem  
**Model**: GitFlow with Feature Branch Isolation for Multi-Developer Teams  

---

## 1. Branch Strategy

```mermaid
gitGraph
    commit id: "v1.0.0" tag: "v1.0.0"
    branch develop
    checkout develop
    commit id: "Initial Develop"
    branch feature/donations-80g
    checkout feature/donations-80g
    commit id: "feat(donations): add PAN validation"
    commit id: "feat(donations): receipt PDF generator"
    checkout develop
    merge feature/donations-80g id: "Merge PR #104"
    branch release/v2.0.0
    checkout release/v2.0.0
    commit id: "chore: bump version 2.0.0"
    checkout main
    merge release/v2.0.0 id: "Deploy v2.0.0" tag: "v2.0.0"
    checkout develop
    merge release/v2.0.0 id: "Sync develop"
```

### Branch Roles:
- **`main`**: Protected production branch. Code here is deployed directly to production.
- **`develop`**: Primary continuous integration branch. All feature branches merge here via reviewed Pull Requests.
- **`feature/<domain>-<description>`**: Isolated feature branch created from `develop` (e.g. `feature/donations-pan-verification`).
- **`fix/<issue-description>`**: Bug fix branch created from `develop`.
- **`hotfix/<emergency-fix>`**: Critical fix branch branched directly from `main`.

---

## 2. Commit Message Standards (Conventional Commits)

Format: `<type>(<scope>): <subject>`

### Allowed Types:
- `feat`: A new user-facing or platform feature.
- `fix`: A bug fix.
- `refactor`: Code reorganization with no functional or API changes.
- `docs`: Documentation updates only.
- `test`: Adding or updating test cases.
- `chore`: Build tooling, dependency bumps, or config adjustments.

### Examples:
- `feat(donations): add section 80G Form 10BE receipt generation`
- `fix(auth): prevent session expiration race condition in token refresh`
- `docs(architecture): document module boundary rules for multi-dev setup`
