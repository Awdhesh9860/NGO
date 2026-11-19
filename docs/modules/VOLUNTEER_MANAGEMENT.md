# Volunteer Management Module

## Overview
Provides end-to-end multi-tenant volunteer lifecycle management: public registration applications, structured review and interview scheduling, configurable verification checks, project/program assignments, privacy-respecting attendance & verified hours, and verifiable service certificates.

## Data Model & Tenant Isolation
- Collections: `VolunteerApplication`, `VolunteerProfile`, `VolunteerAssignment`, `VolunteerAttendance`, `VolunteerCertificate`.
- Every document is scoped by `organizationId` with compound unique indexes (`{ organizationId, volunteerCode }`, `{ organizationId, email }`).

## Verification Governance
- New volunteer profiles always begin as `UNVERIFIED` upon application approval.
- Configurable verification requirements (`emailVerified`, `mobileVerified`, `identityRequired`/`identityVerified`, `referenceRequired`/`referenceVerified`, `backgroundCheckRequired`/`backgroundCheckConsented`/`backgroundVerified`) are enforced server-side before allowing `verificationStatus: 'VERIFIED'`.
- Restricted verification document references are returned only to actors with `volunteers.verify`.
