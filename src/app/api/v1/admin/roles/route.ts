import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/server/authorization/guards';
import { adminService, toAdminActor } from '@/server/services/admin.service';
import { createRoleSchema } from '@/features/admin/schemas/admin.schema';
import { ALL_PERMISSIONS, ROLE_PERMISSIONS } from '@/server/authorization/permissions';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requirePermission(req, 'users.view');
    const orgId = authContext.user.organizationId.toString();

    const customRoles = await adminService.getRoles(orgId);

    return NextResponse.json(
      successResponse({
        systemRoles: ROLE_PERMISSIONS,
        customRoles: customRoles.map((r) => ({
          id: r._id.toString(),
          name: r.name,
          key: r.key,
          description: r.description,
          permissions: r.permissions,
          isSystemRole: r.isSystemRole,
          status: r.status,
          createdAt: r.createdAt,
        })),
        allPermissionsCatalog: ALL_PERMISSIONS,
      }, undefined, orgId),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authContext = await requirePermission(req, 'roles.manage');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const rawBody = await req.json();
    const validated = createRoleSchema.parse(rawBody);

    const created = await adminService.createRole(orgId, validated, actor);

    return NextResponse.json(
      successResponse({
        id: created._id.toString(),
        name: created.name,
        key: created.key,
        description: created.description,
        permissions: created.permissions,
        isSystemRole: created.isSystemRole,
        status: created.status,
        createdAt: created.createdAt,
      }, undefined, orgId),
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
