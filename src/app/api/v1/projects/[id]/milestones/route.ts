import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { projectService } from '@/server/services/project.service';
import { toAdminActor } from '@/server/services/admin.service';
import {
  createMilestoneSchema,
  updateMilestoneSchema,
} from '@/features/milestones/schemas/milestone.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError, ValidationError } from '@/server/errors';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await requireAnyPermission(req, [
      'projects.view',
      'projects.view_assigned',
      'milestones.manage',
    ]);
    const orgId = authContext.user.organizationId.toString();

    await projectService.getProjectById(id, orgId, toAdminActor(authContext.user, req));
    const milestones = await projectService.listMilestones(orgId, { projectId: id });

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

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await requireAnyPermission(req, ['milestones.manage', 'projects.manage']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const body = await req.json();
    const validated = createMilestoneSchema.parse(body);

    const created = await projectService.createMilestone(id, orgId, validated, actor);

    return NextResponse.json(
      successResponse(
        {
          id: created._id.toString(),
          title: created.title,
          targetDate: created.targetDate,
          status: created.status,
          completionPercentage: created.completionPercentage,
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

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await requireAnyPermission(req, ['milestones.manage', 'projects.manage']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const body = await req.json();
    const milestoneId = body.milestoneId as string;
    if (!milestoneId) throw new ValidationError('milestoneId is required');

    const validated = updateMilestoneSchema.parse(body);
    const updated = await projectService.updateMilestone(id, milestoneId, orgId, validated, actor);

    return NextResponse.json(
      successResponse(
        {
          id: updated._id.toString(),
          title: updated.title,
          status: updated.status,
          completionPercentage: updated.completionPercentage,
          completionDate: updated.completionDate,
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
    const authContext = await requireAnyPermission(req, ['milestones.manage', 'projects.manage']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const milestoneId = req.nextUrl.searchParams.get('milestoneId');
    if (!milestoneId) throw new ValidationError('milestoneId query parameter is required');

    await projectService.deleteMilestone(id, milestoneId, orgId, actor);
    return NextResponse.json(successResponse({ deleted: true, milestoneId }, undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
