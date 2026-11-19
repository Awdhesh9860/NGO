import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/server/authorization/guards';
import { adminService, toAdminActor } from '@/server/services/admin.service';
import { updateDepartmentSchema } from '@/features/admin/schemas/admin.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await requirePermission(req, 'departments.manage');
    const orgId = authContext.user.organizationId.toString();

    const dept = await adminService.getDepartmentById(id, orgId);

    return NextResponse.json(
      successResponse({
        id: dept._id.toString(),
        name: dept.name,
        slug: dept.slug,
        description: dept.description,
        headUser: dept.headUserId,
        budget: dept.budget,
        status: dept.status,
        createdAt: dept.createdAt,
        updatedAt: dept.updatedAt,
      }, undefined, orgId),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await requirePermission(req, 'departments.manage');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const rawBody = await req.json();
    const validated = updateDepartmentSchema.parse(rawBody);

    const updated = await adminService.updateDepartment(id, orgId, validated, actor);

    return NextResponse.json(
      successResponse({
        id: updated._id.toString(),
        name: updated.name,
        slug: updated.slug,
        description: updated.description,
        budget: updated.budget,
        status: updated.status,
        updatedAt: updated.updatedAt,
      }, undefined, orgId),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await requirePermission(req, 'departments.manage');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    await adminService.deleteDepartment(id, orgId, actor);

    return NextResponse.json(
      successResponse({
        id,
        deleted: true,
        message: 'Department deleted successfully and associated staff unassigned',
      }, undefined, orgId),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
