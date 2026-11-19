import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/server/authorization/guards';
import { adminService, toAdminActor } from '@/server/services/admin.service';
import { updateRoleSchema } from '@/features/admin/schemas/admin.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await requirePermission(req, 'roles.manage');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const rawBody = await req.json();
    const validated = updateRoleSchema.parse(rawBody);

    const updated = await adminService.updateRole(id, orgId, validated, actor);

    return NextResponse.json(
      successResponse({
        id: updated._id.toString(),
        name: updated.name,
        key: updated.key,
        description: updated.description,
        permissions: updated.permissions,
        status: updated.status,
        updatedAt: updated.updatedAt,
      }, undefined, orgId),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
