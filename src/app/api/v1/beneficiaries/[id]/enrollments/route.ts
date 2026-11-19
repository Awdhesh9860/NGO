import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { stakeholderRepository } from '@/server/repositories/stakeholder.repository';
import { beneficiaryService } from '@/server/services/beneficiary.service';
import { toAdminActor } from '@/server/services/admin.service';
import { enrollBeneficiarySchema } from '@/features/beneficiaries/schemas/beneficiary.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireAnyPermission(req, [
      'beneficiaries.view',
      'beneficiaries.enroll',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const { id } = await context.params;

    const enrollments = await stakeholderRepository.findEnrollmentsByBeneficiary(orgId, id);
    return NextResponse.json(successResponse(enrollments, undefined, orgId), {
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
    const authContext = await requireAnyPermission(req, ['beneficiaries.enroll']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const { id } = await context.params;

    const body = await req.json();
    const validated = enrollBeneficiarySchema.parse(body);
    const created = await beneficiaryService.enrollInProject(id, orgId, validated, actor);

    return NextResponse.json(successResponse(created, undefined, orgId), {
      status: HTTP_STATUS.CREATED,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
