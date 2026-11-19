import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/server/authorization/guards';
import { adminService, toAdminActor } from '@/server/services/admin.service';
import { createDepartmentSchema } from '@/features/admin/schemas/admin.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requirePermission(req, 'departments.manage');
    const orgId = authContext.user.organizationId.toString();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const status = (searchParams.get('status') as 'active' | 'inactive') || undefined;
    const search = searchParams.get('search') || undefined;

    const result = await adminService.getDepartments(orgId, { status, search }, { page, limit });

    const safeDepartments = result.departments.map((d) => ({
      id: d._id.toString(),
      name: d.name,
      slug: d.slug,
      description: d.description,
      headUser: d.headUserId,
      budget: d.budget,
      status: d.status,
      memberCount: result.memberCounts[d._id.toString()] || 0,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));

    return NextResponse.json(
      successResponse(
        safeDepartments,
        {
          page,
          pageSize: limit,
          totalCount: result.total,
          totalPages: Math.ceil(result.total / limit) || 1,
          hasNextPage: page * limit < result.total,
          hasPrevPage: page > 1,
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
    const authContext = await requirePermission(req, 'departments.manage');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const rawBody = await req.json();
    const validated = createDepartmentSchema.parse(rawBody);

    const created = await adminService.createDepartment(orgId, validated, actor);

    return NextResponse.json(
      successResponse(
        {
          id: created._id.toString(),
          name: created.name,
          slug: created.slug,
          description: created.description,
          budget: created.budget,
          status: created.status,
          memberCount: 0,
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
