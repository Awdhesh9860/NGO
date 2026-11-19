# Campaign Management Module

## Overview
The Campaign Management module powers multi-tenant NGO fundraising appeals with strict governance approvals, integer minor-unit financial targets, public publishing controls, and verified progress computation.

## Lifecycle & Transitions (9 States)
- `DRAFT` → `PENDING_APPROVAL`, `CANCELLED`, `ARCHIVED`
- `PENDING_APPROVAL` → `APPROVED`, `DRAFT`, `CANCELLED`
- `APPROVED` → `ACTIVE`, `PAUSED`, `CANCELLED`, `ARCHIVED`
- `ACTIVE` → `PAUSED`, `GOAL_REACHED`, `COMPLETED`, `CANCELLED`, `ARCHIVED`
- `PAUSED` → `ACTIVE`, `COMPLETED`, `CANCELLED`, `ARCHIVED`
- `GOAL_REACHED` → `ACTIVE`, `COMPLETED`, `ARCHIVED`
- `COMPLETED` → `ARCHIVED`
- `CANCELLED` → `DRAFT`, `ARCHIVED`
- `ARCHIVED` → Terminal

## Governance & Security Rules
1. **Tenant Isolation**: Unique `{ organizationId, slug }` and `{ organizationId, code }` indexes isolate campaigns per NGO tenant.
2. **No Self-Approval**: Campaign submitters cannot approve or reject their own submission. Approving requires `campaigns.approve`.
3. **Public Publishing Gate**: Only `APPROVED`, `ACTIVE`, `GOAL_REACHED`, or `COMPLETED` campaigns with `isPublicVisible: true` appear on `/api/v1/public/campaigns`. Publishing requires `campaigns.publish`.
4. **Verified Totals Only**: Public and admin progress totals are computed strictly from `SUCCESSFUL` and `PARTIALLY_REFUNDED` donations (net of processed refunds). Pending, initiated, failed, and cancelled records are excluded.

## Key Implementation Files
- Model: `src/server/database/models/Campaign.ts`, `src/server/database/models/CampaignUpdate.ts`
- Service: `src/server/services/campaign.service.ts`
- API Routes: `/api/v1/campaigns`, `/api/v1/campaigns/[id]`, `/api/v1/campaigns/[id]/approval`, `/api/v1/campaigns/[id]/updates`, `/api/v1/public/campaigns`, `/api/v1/public/campaigns/[slug]`
- UI: `src/features/campaigns/`, `src/app/dashboard/admin/campaigns/`
