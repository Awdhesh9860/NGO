import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { budgetGrantComplianceService } from '@/server/services/budget-grant-compliance.service';
import { toAdminActor } from '@/server/services/admin.service';
import { updateComplianceRecordSchema } from '@/features/compliance/schemas/compliance.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const authContext = await requireAnyPermission(req, [
      'compliance.manage',
      'compliance.verify',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const body = await req.json();
    const input = updateComplianceRecordSchema.parse(body);

    const updated = await budgetGrantComplianceService.updateComplianceRecord(id, orgId, input, actor);
    return NextResponse.json(successResponse(updated, undefined, orgId), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}
