import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission, requirePermission } from '@/server/authorization/guards';
import { accountingService } from '@/server/services/accounting.service';
import { toAdminActor } from '@/server/services/admin.service';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';
import { ValidationError } from '@/lib/error-handler';

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

    if (body?.sourceType === 'DONATION' && typeof body.sourceId === 'string') {
      const synced = await accountingService.syncVerifiedDonationToLedger(orgId, body.sourceId, actor);
      return NextResponse.json(successResponse(synced, undefined, orgId), { status: HTTP_STATUS.CREATED });
    }
    if (body?.sourceType === 'REFUND' && typeof body.sourceId === 'string') {
      const synced = await accountingService.syncProcessedRefundToLedger(orgId, body.sourceId, actor);
      return NextResponse.json(successResponse(synced, undefined, orgId), { status: HTTP_STATUS.CREATED });
    }

    throw new ValidationError('Body must include sourceType ("DONATION" or "REFUND") and sourceId');
  } catch (error) {
    return handleRouteError(error);
  }
}
