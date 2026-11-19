import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { checkRolePermission } from '@/server/authorization/permissions';
import { projectService } from '@/server/services/project.service';
import { toAdminActor } from '@/server/services/admin.service';
import { updateProjectSchema } from '@/features/projects/schemas/project.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await requireAnyPermission(req, [
      'projects.view',
      'projects.manage',
      'projects.view_assigned',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const [project, team, activity] = await Promise.all([
      projectService.getProjectById(id, orgId, actor),
      projectService.getProjectTeamWithWorkload(id, orgId),
      projectService.getProjectActivity(id, orgId),
    ]);

    const canViewBudget =
      actor.role === 'SUPER_ADMIN' || checkRolePermission(actor.role, 'project_budget.view');
    const canViewBeneficiarySummary =
      actor.role === 'SUPER_ADMIN' ||
      checkRolePermission(actor.role, 'beneficiaries.view_project_summary');

    return NextResponse.json(
      successResponse(
        {
          id: project._id.toString(),
          name: project.name,
          code: project.code,
          slug: project.slug,
          shortDescription: project.shortDescription,
          detailedDescription: project.detailedDescription,
          program: project.programId,
          category: project.category,
          projectManager: project.projectManagerId,
          department: project.departmentId,
          team,
          startDate: project.startDate,
          endDate: project.endDate,
          location: project.location,
          state: project.state,
          district: project.district,
          block: project.block,
          village: project.village,
          coordinates: project.coordinates,
          approvedBudget: canViewBudget ? project.approvedBudget : undefined,
          targetBeneficiaries: project.targetBeneficiaries,
          actualBeneficiaries: project.actualBeneficiaries,
          beneficiarySummary: canViewBeneficiarySummary ? project.beneficiarySummary : undefined,
          expectedOutcomes: project.expectedOutcomes,
          keyDeliverables: project.keyDeliverables,
          riskLevel: project.riskLevel,
          priority: project.priority,
          progressPercentage: project.progressPercentage,
          images: project.images,
          status: project.status,
          isPublicVisible: project.isPublicVisible,
          activity: activity.map((a) => ({
            id: a._id.toString(),
            actorName: a.actorName,
            actorRole: a.actorRole,
            action: a.action,
            details: a.details,
            timestamp: a.timestamp,
          })),
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
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
    const authContext = await requireAnyPermission(req, [
      'projects.update',
      'projects.manage',
      'projects.approve',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const body = await req.json();
    const validated = updateProjectSchema.parse(body);

    const updated = await projectService.updateProject(id, orgId, validated, actor);

    return NextResponse.json(
      successResponse(
        {
          id: updated._id.toString(),
          name: updated.name,
          status: updated.status,
          progressPercentage: updated.progressPercentage,
          isPublicVisible: updated.isPublicVisible,
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
    const authContext = await requireAnyPermission(req, ['projects.archive', 'projects.manage']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const archived = await projectService.archiveProject(id, orgId, actor);

    return NextResponse.json(
      successResponse(
        {
          id: archived._id.toString(),
          status: archived.status,
          message: 'Project archived safely',
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
