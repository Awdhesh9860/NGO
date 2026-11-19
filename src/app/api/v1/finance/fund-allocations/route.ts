import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission, requirePermission } from '@/server/authorization/guards';
import { budgetGrantComplianceService } from '@/server/services/budget-grant-compliance.service';
import { toAdminActor } from '@/server/services/admin.service';
import { createFundAllocationSchema } from '@/features/finance/schemas/finance.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, [
      'finance.budgets.view',
      'finance.grants.view',
      'finance.reports.view',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const restrictionType = req.nextUrl.searchParams.get('restrictionType') || undefined;
    const allocations = await budgetGrantComplianceService.listFundAllocations(orgId, restrictionType);
    return NextResponse.json(successResponse(allocations, undefined, orgId), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authContext = await requirePermission(req, 'finance.budgets.manage');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const body = await req.json();
    const input = createFundAllocationSchema.parse(body);

    const created = await budgetGrantComplianceService.createFundAllocation(orgId, input, actor);
    return NextResponse.json(successResponse(created, undefined, orgId), { status: HTTP_STATUS.CREATED });
  } catch (error) {
    return handleRouteError(error);
  }
}
