import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAnyPermission, requirePermission } from '@/server/authorization/guards';
import { accountingService } from '@/server/services/accounting.service';
import { toAdminActor } from '@/server/services/admin.service';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

const incomeSyncSchema = z.object({
  sourceType: z.enum(['DONATION', 'REFUND']),
  sourceId: z.string().trim().min(1, 'sourceId is required'),
});

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, [
      'finance.income.view',
      'finance.income.manage',
      'finance.reports.view',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const sp = req.nextUrl.searchParams;

    const ledger = await accountingService.getGeneralLedger(orgId, {
      accountType: 'INCOME',
      programId: sp.get('programId') || undefined,
      projectId: sp.get('projectId') || undefined,
      departmentId: sp.get('departmentId') || undefined,
      from: sp.get('from') ? new Date(sp.get('from')!) : undefined,
      to: sp.get('to') ? new Date(sp.get('to')!) : undefined,
    });

    return NextResponse.json(successResponse(ledger, undefined, orgId), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}

/**
 * Idempotently syncs a verified Phase 08 Donation or processed Refund into the Double-Entry Ledger.
 * Body: { sourceType: 'DONATION' | 'REFUND', sourceId: string }
 */
export async function POST(req: NextRequest) {
  try {
    const authContext = await requirePermission(req, 'finance.income.manage');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const body = await req.json();
    const validated = incomeSyncSchema.parse(body);

    if (validated.sourceType === 'DONATION') {
      const synced = await accountingService.syncVerifiedDonationToLedger(orgId, validated.sourceId, actor);
      return NextResponse.json(successResponse(synced, undefined, orgId), { status: HTTP_STATUS.CREATED });
    }

    const synced = await accountingService.syncProcessedRefundToLedger(orgId, validated.sourceId, actor);
    return NextResponse.json(successResponse(synced, undefined, orgId), { status: HTTP_STATUS.CREATED });
  } catch (error) {
    return handleRouteError(error);
  }
}
