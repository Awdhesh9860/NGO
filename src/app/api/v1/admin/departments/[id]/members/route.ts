import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/server/authorization/guards';
import { adminService, toAdminActor } from '@/server/services/admin.service';
import { departmentMemberActionSchema } from '@/features/admin/schemas/admin.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError, ValidationError } from '@/server/errors';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await requirePermission(req, 'departments.manage');
    const orgId = authContext.user.organizationId.toString();

    const members = await adminService.getDepartmentMembers(id, orgId);

    return NextResponse.json(
      successResponse(
        members.map((m) => ({
          id: m._id.toString(),
          name: m.name,
          email: m.email,
          role: m.role,
          designation: m.designation,
          status: m.status,
        })),
        undefined,
        orgId
      ),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await requirePermission(req, 'departments.manage');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const rawBody = await req.json();
    const { userId } = departmentMemberActionSchema.parse(rawBody);

    const updated = await adminService.assignDepartmentMember(id, userId, orgId, actor);

    return NextResponse.json(
      successResponse(
        {
          id: updated._id.toString(),
          name: updated.name,
          email: updated.email,
          departmentId: id,
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
    const authContext = await requirePermission(req, 'departments.manage');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      throw new ValidationError('userId query parameter is required');
    }

    const updated = await adminService.removeDepartmentMember(id, userId, orgId, actor);

    return NextResponse.json(
      successResponse(
        {
          id: updated._id.toString(),
          name: updated.name,
          removedFromDepartmentId: id,
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
