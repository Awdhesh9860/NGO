import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission, requirePermission } from '@/server/authorization/guards';
import { accountingService } from '@/server/services/accounting.service';
import { toAdminActor } from '@/server/services/admin.service';
import {
  createAccountingPeriodSchema,
  updateAccountingPeriodStatusSchema,
} from '@/features/finance/schemas/finance.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, [
      'finance.periods.manage',
      'finance.journals.view',
      'finance.ledger.view',
      'finance.reports.view',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const periods = await accountingService.listPeriods(orgId);
    return NextResponse.json(successResponse(periods, undefined, orgId), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authContext = await requirePermission(req, 'finance.periods.manage');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const body = await req.json();
    const input = createAccountingPeriodSchema.parse(body);

    const period = await accountingService.createPeriod(orgId, input, actor);
    return NextResponse.json(successResponse(period, undefined, orgId), { status: HTTP_STATUS.CREATED });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authContext = await requirePermission(req, 'finance.periods.manage');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const body = await req.json();
    const input = updateAccountingPeriodStatusSchema.parse(body);

    const updated = await accountingService.updatePeriodStatus(orgId, input, actor);
    return NextResponse.json(successResponse(updated, undefined, orgId), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}
