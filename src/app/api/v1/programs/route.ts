import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { programService } from '@/server/services/program.service';
import { toAdminActor } from '@/server/services/admin.service';
import { createProgramSchema } from '@/features/programs/schemas/program.schema';
import { ProgramStatus } from '@/server/database/models/Program';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, ['programs.view', 'programs.manage']);
    const orgId = authContext.user.organizationId.toString();

    const sp = req.nextUrl.searchParams;
    const page = parseInt(sp.get('page') || '1', 10);
    const limit = parseInt(sp.get('limit') || '20', 10);
    const status = (sp.get('status') as ProgramStatus) || undefined;
    const category = sp.get('category') || undefined;
    const departmentId = sp.get('departmentId') || undefined;
    const search = sp.get('search') || undefined;
    const includeArchived = sp.get('includeArchived') === 'true';

    const result = await programService.listPrograms(
      orgId,
      { status, category, departmentId, search, includeArchived },
      { page, limit }
    );

    const data = result.programs.map((p) => ({
      id: p._id.toString(),
      title: p.title,
      slug: p.slug,
      code: p.code,
      shortDescription: p.shortDescription,
      category: p.category,
      focusArea: p.focusArea,
      programManager: p.programManagerId,
      department: p.departmentId,
      budget: p.budget,
      targetBeneficiaries: p.targetBeneficiaries,
      actualBeneficiaries: p.actualBeneficiaries,
      geographicCoverage: p.geographicCoverage,
      startDate: p.startDate,
      endDate: p.endDate,
      status: p.status,
      isPublicVisible: p.isPublicVisible,
      kpisCount: p.kpis?.length || 0,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return NextResponse.json(
      successResponse(
        data,
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
    const authContext = await requireAnyPermission(req, ['programs.create', 'programs.manage']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const body = await req.json();
    const validated = createProgramSchema.parse(body);

    const created = await programService.createProgram(orgId, validated, actor);

    return NextResponse.json(
      successResponse(
        {
          id: created._id.toString(),
          title: created.title,
          slug: created.slug,
          code: created.code,
          status: created.status,
          category: created.category,
          budget: created.budget,
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
