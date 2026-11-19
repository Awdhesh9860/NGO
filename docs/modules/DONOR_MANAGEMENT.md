# Donor Management (CRM) Module

## Capabilities
- Organization-scoped donor registry keyed uniquely by `{ organizationId, email }`.
- Donor profiles capture type (`INDIVIDUAL`, `CORPORATE`, `INSTITUTIONAL`, `FOUNDATION`), contact details, communication preferences, anonymity default, optional PAN, and restricted internal notes.
- Lifetime verified totals (`lifetimeAmountMinor`) and verified `donationCount` are recalculated strictly from verified `SUCCESSFUL` and `PARTIALLY_REFUNDED` donations net of refunds.

## Deterministic Donor Segmentation
Segments are calculated directly from verified donation activity (`computeDonorSegments` in `src/server/services/donor.service.ts`):
- `PROSPECT`: 0 verified donations
- `FIRST_TIME`: 1 verified donation
- `REPEAT`: 2+ verified donations
- `MONTHLY_RECURRING`: active provider recurring mandate
- `MAJOR`: verified lifetime giving ≥ ₹50,000 (`5,000,000` paise)
- `RECENTLY_ACTIVE`: verified donation within last 90 days
- `INACTIVE`: last verified donation ≥ 365 days ago

## Sensitive Data Gating
Users lacking `donors.view_sensitive` receive masked PANs (`AB******4F`), restricted phone indicators, and zero `internalNotes`. Export (`GET /api/v1/donors?export=true`) requires `donors.export` and records an immutable audit log entry.
