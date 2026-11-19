import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { stakeholderRepository } from '@/server/repositories/stakeholder.repository';
import {
  beneficiaryService,
  resolveBeneficiaryClearance,
} from '@/server/services/beneficiary.service';
import { toAdminActor } from '@/server/services/admin.service';
import {
  createBeneficiaryCaseSchema,
  updateBeneficiaryCaseSchema,
} from '@/features/beneficiaries/schemas/beneficiary.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireAnyPermission(req, ['beneficiaries.case.manage']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const clearance = resolveBeneficiaryClearance(actor);
    const { id } = await context.params;

    const [cases, notes] = await Promise.all([
      stakeholderRepository.findCasesByBeneficiary(orgId, id),
      stakeholderRepository.findCaseNotes(orgId, id, clearance.canManageSafeguarding),
    ]);

    return NextResponse.json(
      successResponse(
        {
          cases: cases.filter((c) => !c.isSafeguardingCase || clearance.canManageSafeguarding),
          notes,
        },
        undefined,
        orgId
      ),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireAnyPermission(req, ['beneficiaries.case.manage']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const { id } = await context.params;

    const body = await req.json();
    const validated = createBeneficiaryCaseSchema.parse(body);
    const created = await beneficiaryService.createCase(id, orgId, validated, actor);

    return NextResponse.json(successResponse(created, undefined, orgId), {
      status: HTTP_STATUS.CREATED,
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
    const authContext = await requireAnyPermission(req, ['beneficiaries.case.manage']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const { id } = await context.params;

    const body = await req.json();
    const validated = updateBeneficiaryCaseSchema.parse(body);
    const result = await beneficiaryService.updateCase(id, orgId, validated, actor);

    return NextResponse.json(successResponse(result, undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
