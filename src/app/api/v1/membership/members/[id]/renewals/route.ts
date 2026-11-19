import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { stakeholderRepository } from '@/server/repositories/stakeholder.repository';
import { membershipService } from '@/server/services/membership.service';
import { toAdminActor } from '@/server/services/admin.service';
import { createMembershipRenewalSchema } from '@/features/membership/schemas/membership.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireAnyPermission(req, ['members.view', 'members.renew']);
    const orgId = authContext.user.organizationId.toString();
    const { id } = await context.params;

    const renewals = await stakeholderRepository.findRenewalsByMembership(orgId, id);
    return NextResponse.json(successResponse(renewals, undefined, orgId), {
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
    const authContext = await requireAnyPermission(req, ['members.renew']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const { id } = await context.params;

    const body = await req.json();
    const validated = createMembershipRenewalSchema.parse(body);
    const created = await membershipService.processRenewal(id, orgId, validated, actor);

    return NextResponse.json(successResponse(created, undefined, orgId), {
      status: HTTP_STATUS.CREATED,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
