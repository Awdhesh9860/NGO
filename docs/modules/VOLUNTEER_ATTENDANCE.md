# Volunteer Attendance & Verified Hours

## Attendance Lifecycle
- Statuses: `PRESENT`, `ABSENT`, `HALF_DAY`, `EXCUSED`, `PENDING_VERIFICATION`.
- Supervisor Approval States: `PENDING`, `APPROVED`, `REJECTED`.

## Security & Integrity Invariants
1. **Duplicate Check-in Prevention**: Compound unique index `{ organizationId, volunteerId, attendanceDate, assignmentId }`.
2. **Time Validation**: `computeAttendanceMinutes` enforces `checkOutAt > checkInAt` and caps single shifts at 1,440 minutes (24 hours).
3. **Verified Hours Rule**: `computeVerifiedHoursSummary` counts ONLY `approvalStatus === 'APPROVED'` records with status `PRESENT` or `HALF_DAY`. Pending, rejected, absent, and excused sessions are excluded.
4. **Audit Trail**: Every entry logs `createdBy`, optional `correctedBy` + `correctionReason`, and `approvedBy` + `approvedAt`.
5. **Zero Location Surveillance**: Continuous GPS tracking and location surveillance are intentionally excluded.
