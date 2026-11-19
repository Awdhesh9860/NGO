import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { projectService } from '@/server/services/project.service';
import { MilestoneStatus } from '@/server/database/models/ProjectMilestone';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, [
      'projects.view',
      'milestones.manage',
      'projects.view_assigned',
    ]);
    const orgId = authContext.user.organizationId.toString();

    const sp = req.nextUrl.searchParams;
    const projectId = sp.get('projectId') || undefined;
    const status = (sp.get('status') as MilestoneStatus) || undefined;
    const overdueOnly = sp.get('overdueOnly') === 'true';

    const milestones = await projectService.listMilestones(orgId, { projectId, status, overdueOnly });

    return NextResponse.json(
      successResponse(
        milestones.map((m) => ({
          id: m._id.toString(),
          project: m.projectId,
          title: m.title,
          description: m.description,
          targetDate: m.targetDate,
          completionDate: m.completionDate,
          status: m.status,
          responsibleUser: m.responsibleUserId,
          deliverables: m.deliverables,
          completionPercentage: m.completionPercentage,
          createdAt: m.createdAt,
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
