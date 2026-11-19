import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/server/authorization/guards';
import { adminService, toAdminActor } from '@/server/services/admin.service';
import { updateUserSchema } from '@/features/admin/schemas/admin.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await requirePermission(req, 'users.view');
    const orgId = authContext.user.organizationId.toString();

    const [user, activity] = await Promise.all([
      adminService.getUserById(id, orgId),
      adminService.getUserActivity(id, orgId, 15),
    ]);

    return NextResponse.json(
      successResponse(
        {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          customRoleId: user.customRoleId,
          departmentId: user.departmentId,
          managerId: user.managerId,
          phone: user.phone,
          designation: user.designation,
          avatar: user.avatar,
          status: user.status,
          isEmailVerified: user.isEmailVerified,
          twoFactorEnabled: user.twoFactor?.enabled || false,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          activity: activity.map((a) => ({
            id: a._id.toString(),
            action: a.action,
            resource: a.resource,
            details: a.details,
            timestamp: a.timestamp,
          })),
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

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await requirePermission(req, 'users.manage');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const rawBody = await req.json();
    const validated = updateUserSchema.parse(rawBody);

    const updated = await adminService.updateUser(id, orgId, validated, actor);

    return NextResponse.json(
      successResponse(
        {
          id: updated._id.toString(),
          name: updated.name,
          email: updated.email,
          role: updated.role,
          customRoleId: updated.customRoleId,
          departmentId: updated.departmentId,
          managerId: updated.managerId,
          phone: updated.phone,
          designation: updated.designation,
          avatar: updated.avatar,
          status: updated.status,
          updatedAt: updated.updatedAt,
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

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await requirePermission(req, 'users.manage');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const deactivated = await adminService.deactivateUser(id, orgId, actor);

    return NextResponse.json(
      successResponse(
        {
          id: deactivated._id.toString(),
          status: deactivated.status,
          message: 'User account has been successfully suspended',
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
