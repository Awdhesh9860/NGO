import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { volunteerService } from '@/server/services/volunteer.service';
import { toAdminActor } from '@/server/services/admin.service';
import { reviewVolunteerApplicationSchema } from '@/features/volunteers/schemas/volunteer.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireAnyPermission(req, ['volunteers.manage']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const { id } = await context.params;

    const body = await req.json();
    const validated = reviewVolunteerApplicationSchema.parse(body);
    const result = await volunteerService.reviewApplication(id, orgId, validated, actor);

    return NextResponse.json(successResponse(result, undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
