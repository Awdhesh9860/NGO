import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { membershipService } from '@/server/services/membership.service';
import { toAdminActor } from '@/server/services/admin.service';
import { updateMembershipStatusSchema } from '@/features/membership/schemas/membership.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireAnyPermission(req, ['members.view', 'members.manage']);
    const orgId = authContext.user.organizationId.toString();
    const { id } = await context.params;

    const detail = await membershipService.getMemberDetail(id, orgId);
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
    const authContext = await requireAnyPermission(req, ['members.manage', 'members.suspend']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const { id } = await context.params;

    const body = await req.json();
    const validated = updateMembershipStatusSchema.parse(body);
    const updated = await membershipService.updateMembershipStatus(id, orgId, validated, actor);

    return NextResponse.json(successResponse(updated, undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
