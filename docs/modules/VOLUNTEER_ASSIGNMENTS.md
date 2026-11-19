# Volunteer Assignments Module

## Assignment Lifecycle (6 States)
`INVITED` → `ACCEPTED` → `ACTIVE` → `PAUSED` → `COMPLETED` | `WITHDRAWN`.

## Assignment Rules
1. **Active Volunteer Gate**: Only volunteers with `status === 'ACTIVE'` can receive new assignments.
2. **Restricted Assignment Verification**: Assignments marked `requiresVerification: true` strictly require `volunteer.verificationStatus === 'VERIFIED'`.
3. **Same-Tenant Referential Integrity**: Linked `programId`, `projectId`, and `supervisorId` are verified to exist inside the exact same `organizationId`.
4. **Schedule Conflict Prevention**: Checks overlapping active/accepted/invited date ranges and `scheduledDays` to prevent conflicting double-bookings.
5. **Audit & Notification**: Every assignment creation and status transition writes an audit record and notifies the volunteer (respecting communication preferences).
