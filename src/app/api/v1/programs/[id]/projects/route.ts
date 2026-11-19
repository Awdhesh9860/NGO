import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { programService } from '@/server/services/program.service';
import { projectService } from '@/server/services/project.service';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await requireAnyPermission(req, ['programs.view', 'projects.view']);
    const orgId = authContext.user.organizationId.toString();

    await programService.getProgramById(id, orgId);
    const result = await projectService.listProjects(orgId, { programId: id }, { page: 1, limit: 100 });

    return NextResponse.json(
      successResponse(
        result.projects.map((p) => ({
          id: p._id.toString(),
          name: p.name,
          code: p.code,
          slug: p.slug,
          category: p.category,
          status: p.status,
          priority: p.priority,
          progressPercentage: p.progressPercentage,
          approvedBudget: p.approvedBudget,
          targetBeneficiaries: p.targetBeneficiaries,
          actualBeneficiaries: p.actualBeneficiaries,
          projectManager: p.projectManagerId,
          startDate: p.startDate,
          endDate: p.endDate,
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
