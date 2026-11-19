import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { checkRolePermission } from '@/server/authorization/permissions';
import { projectService } from '@/server/services/project.service';
import { toAdminActor } from '@/server/services/admin.service';
import { createProjectSchema } from '@/features/projects/schemas/project.schema';
import { ProjectStatus } from '@/server/database/models/Project';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, [
      'projects.view',
      'projects.manage',
      'projects.view_assigned',
    ]);
    const orgId = authContext.user.organizationId.toString();

    const canViewAll =
      authContext.user.role === 'SUPER_ADMIN' ||
      checkRolePermission(authContext.user.role, 'projects.view');

    const sp = req.nextUrl.searchParams;
    const page = parseInt(sp.get('page') || '1', 10);
    const limit = parseInt(sp.get('limit') || '20', 10);
    const status = (sp.get('status') as ProjectStatus) || undefined;
    const programId = sp.get('programId') || undefined;
    const departmentId = sp.get('departmentId') || undefined;
    const category = sp.get('category') || undefined;
    const state = sp.get('state') || undefined;
    const priority = sp.get('priority') || undefined;
    const search = sp.get('search') || undefined;
    const includeArchived = sp.get('includeArchived') === 'true';

    const result = await projectService.listProjects(
      orgId,
      {
        status,
        programId,
        departmentId,
        category,
        state,
        priority,
        search,
        includeArchived,
        assignedToUserId: canViewAll ? undefined : authContext.user._id.toString(),
      },
      { page, limit }
    );

    const canViewBudget =
      authContext.user.role === 'SUPER_ADMIN' ||
      checkRolePermission(authContext.user.role, 'project_budget.view');

    const data = result.projects.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      code: p.code,
      slug: p.slug,
      shortDescription: p.shortDescription,
      category: p.category,
      program: p.programId,
      projectManager: p.projectManagerId,
      department: p.departmentId,
      teamCount: p.teamMembers?.length || 0,
      location: p.location || [p.district, p.state].filter(Boolean).join(', '),
      state: p.state,
      district: p.district,
      startDate: p.startDate,
      endDate: p.endDate,
      approvedBudget: canViewBudget ? p.approvedBudget : undefined,
      targetBeneficiaries: p.targetBeneficiaries,
      actualBeneficiaries: p.actualBeneficiaries,
      riskLevel: p.riskLevel,
      priority: p.priority,
      progressPercentage: p.progressPercentage,
      status: p.status,
      isPublicVisible: p.isPublicVisible,
      createdAt: p.createdAt,
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
    const authContext = await requireAnyPermission(req, ['projects.create', 'projects.manage']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const body = await req.json();
    const validated = createProjectSchema.parse(body);

    const created = await projectService.createProject(orgId, validated, actor);

    return NextResponse.json(
      successResponse(
        {
          id: created._id.toString(),
          name: created.name,
          code: created.code,
          slug: created.slug,
          status: created.status,
          category: created.category,
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
