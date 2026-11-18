# Enterprise NGO Platform — Pull Request Guidelines
**Platform**: HopeHorizon / Vikas NGO Ecosystem  
**Goal**: High Code Quality, Continuous Integration & Seamless Collaboration  

---

## 1. Pull Request Lifecycle

1. **Keep PRs Small & Focused**: Aim for fewer than 400 lines of modified code per PR. Large PRs slow down reviews and increase merge conflict risk.
2. **Branch from Latest `develop`**: Rebase or merge `develop` into your feature branch before opening a PR.
3. **Fill the PR Template**: Clearly describe the business objective, type of change, and test evidence.

---

## 2. Automated CI Gate Requirements

Before any PR can be merged into `develop`, GitHub Actions CI must pass the following checks:
1. **TypeScript Verification**: Zero type errors under strict mode.
2. **ESLint Verification**: Zero lint errors.
3. **Unit Tests**: 100% pass rate across all Vitest suites (`npm run test:run`).
4. **Architectural Verification**: No deep imports or client/server boundary violations.

---

## 3. Code Review & Approval Policies

- **Feature Modules**: Requires approval from the designated **Feature Owner** or a peer engineer.
- **Shared Infrastructure**: Any modification to `src/shared/`, `src/server/`, `src/components/ui/`, or `src/config/` requires mandatory approval from the **Technical Lead**.
- **Merge Strategy**: **Squash and Merge** is enforced on `develop` to keep the git history clean and linear.
