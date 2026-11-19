import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { donorService } from '@/server/services/donor.service';
import { toAdminActor } from '@/server/services/admin.service';
import { updateDonorSchema } from '@/features/donors/schemas/donor.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireAnyPermission(req, ['donors.view', 'donors.manage']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const { id } = await context.params;

    const profile = await donorService.getDonorProfile(id, orgId, actor);
    return NextResponse.json(successResponse(profile, undefined, orgId), {
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
    const authContext = await requireAnyPermission(req, ['donors.manage']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const { id } = await context.params;

    const body = await req.json();
    const validated = updateDonorSchema.parse(body);
    const updated = await donorService.updateDonor(id, orgId, validated, actor);

    return NextResponse.json(successResponse(updated, undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
