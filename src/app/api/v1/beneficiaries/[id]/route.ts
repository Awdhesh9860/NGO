import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { beneficiaryService } from '@/server/services/beneficiary.service';
import { toAdminActor } from '@/server/services/admin.service';
import { updateBeneficiaryStatusSchema } from '@/features/beneficiaries/schemas/beneficiary.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireAnyPermission(req, [
      'beneficiaries.view',
      'beneficiaries.manage',
      'beneficiaries.sensitive.view',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const { id } = await context.params;

    const detail = await beneficiaryService.getBeneficiaryDetail(id, orgId, actor);
    return NextResponse.json(successResponse(detail, undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireAnyPermission(req, [
      'beneficiaries.manage',
      'safeguarding.manage',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const { id } = await context.params;

    const body = await req.json();
    const validated = updateBeneficiaryStatusSchema.parse(body);
    const updated = await beneficiaryService.updateBeneficiaryStatus(id, orgId, validated, actor);

    return NextResponse.json(successResponse(updated, undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
