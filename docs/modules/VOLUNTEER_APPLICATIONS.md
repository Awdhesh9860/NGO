# Volunteer Applications & Onboarding Workflow

## Application Lifecycle (7 States)
`DRAFT` → `SUBMITTED` → `UNDER_REVIEW` → `INTERVIEW_SCHEDULED` → `APPROVED` | `REJECTED` | `WITHDRAWN`.

## Controls & Anti-Duplicate Rules
1. **Zod Validation**: Public `/volunteer` applications validate required name, email, mobile number, availability, and explicit `consentAccepted: true` declaration.
2. **Data Minimization**: Does not collect Aadhaar or unnecessary sensitive IDs during intake.
3. **Duplicate Prevention**: Blocks submitting a new application while another application for `{ organizationId, email }` is in `SUBMITTED`, `UNDER_REVIEW`, or `INTERVIEW_SCHEDULED`, or if an active volunteer profile already exists.
4. **Resubmission Policy**: Rejections require an audited `rejectionReason` and configure `allowResubmission`.
5. **No Auto-Approval**: Applications always enter `SUBMITTED` and require `volunteers.manage` review.
