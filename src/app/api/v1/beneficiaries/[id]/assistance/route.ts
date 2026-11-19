import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { stakeholderRepository } from '@/server/repositories/stakeholder.repository';
import { beneficiaryService } from '@/server/services/beneficiary.service';
import { toAdminActor } from '@/server/services/admin.service';
import { recordAssistanceSchema } from '@/features/beneficiaries/schemas/beneficiary.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireAnyPermission(req, [
      'beneficiaries.view',
      'beneficiaries.assistance.manage',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const { id } = await context.params;

    const history = await stakeholderRepository.findAssistanceByBeneficiary(orgId, id);
    return NextResponse.json(successResponse(history, undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireAnyPermission(req, ['beneficiaries.assistance.manage']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const { id } = await context.params;

    const body = await req.json();
    const validated = recordAssistanceSchema.parse(body);
    const created = await beneficiaryService.recordAssistance(id, orgId, validated, actor);

    return NextResponse.json(successResponse(created, undefined, orgId), {
      status: HTTP_STATUS.CREATED,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
