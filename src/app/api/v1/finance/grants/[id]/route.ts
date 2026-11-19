import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission, requirePermission } from '@/server/authorization/guards';
import { budgetGrantComplianceService } from '@/server/services/budget-grant-compliance.service';
import { toAdminActor } from '@/server/services/admin.service';
import { updateGrantSchema } from '@/features/finance/schemas/finance.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const authContext = await requireAnyPermission(req, [
      'finance.grants.view',
      'finance.grants.manage',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const detail = await budgetGrantComplianceService.getGrantDetail(id, orgId);
    return NextResponse.json(successResponse(detail, undefined, orgId), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const authContext = await requirePermission(req, 'finance.grants.manage');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const body = await req.json();
    const input = updateGrantSchema.parse(body);

    const result = await budgetGrantComplianceService.updateGrant(id, orgId, input, actor);
    return NextResponse.json(successResponse(result, undefined, orgId), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}
