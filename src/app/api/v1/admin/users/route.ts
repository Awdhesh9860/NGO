import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/server/authorization/guards';
import { adminService, toAdminActor } from '@/server/services/admin.service';
import { createUserSchema } from '@/features/admin/schemas/admin.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requirePermission(req, 'users.view');
    const orgId = authContext.user.organizationId.toString();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const role = searchParams.get('role') || undefined;
    const status = (searchParams.get('status') as 'active' | 'inactive' | 'suspended') || undefined;
    const departmentId = searchParams.get('departmentId') || undefined;
    const search = searchParams.get('search') || undefined;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    const result = await adminService.getUsers(
      orgId,
      { role, status, departmentId, search },
      { page, limit, sortBy, sortOrder }
    );

    const safeUsers = result.users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      customRoleId: u.customRoleId,
      departmentId: u.departmentId,
      managerId: u.managerId,
      phone: u.phone,
      designation: u.designation,
      avatar: u.avatar,
      status: u.status,
      isEmailVerified: u.isEmailVerified,
      twoFactorEnabled: u.twoFactor?.enabled || false,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
    }));

    return NextResponse.json(
      successResponse(
        safeUsers,
        {
          page: result.page,
          pageSize: result.limit,
          totalCount: result.total,
          totalPages: result.totalPages,
          hasNextPage: result.page < result.totalPages,
          hasPrevPage: result.page > 1,
        },
        orgId
      ),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authContext = await requirePermission(req, 'users.manage');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const rawBody = await req.json();
    const validated = createUserSchema.parse(rawBody);

    const created = await adminService.createUser(orgId, validated, actor);

    return NextResponse.json(
      successResponse(
        {
          id: created._id.toString(),
          name: created.name,
          email: created.email,
          role: created.role,
          customRoleId: created.customRoleId,
          departmentId: created.departmentId,
          managerId: created.managerId,
          phone: created.phone,
          designation: created.designation,
          status: created.status,
          createdAt: created.createdAt,
        },
        undefined,
        orgId
      ),
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
