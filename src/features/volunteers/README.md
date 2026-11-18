# Volunteers Feature Module
**Module Path**: `src/features/volunteers`  
**Domain**: Grassroots Onboarding, Service Hour Logging & Credentials  

## Responsibilities
- Public volunteer application onboarding.
- Administrative vetting and status transitions.
- Interactive service hour submissions.
- Field service recognition and certificate tracking.

## Public Exports (`index.ts`)
- `VolunteerView`: Multi-step application submission page.
- `VolunteerPortal`: Self-service portal for logging hours and viewing credentials.
- `Volunteer`: TypeScript entity interface.

## Permissions Required
- `volunteers.view`: View candidate applications.
- `volunteers.manage`: Approve or reject volunteer applications.
- `volunteers.log_hours`: Submit volunteer field hours.
