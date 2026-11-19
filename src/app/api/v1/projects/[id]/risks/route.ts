import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { projectService } from '@/server/services/project.service';
import { toAdminActor } from '@/server/services/admin.service';
import {
  createProjectRiskSchema,
  updateProjectRiskSchema,
} from '@/features/projects/schemas/project.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError, ValidationError } from '@/server/errors';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await requireAnyPermission(req, ['projects.view', 'projects.view_assigned']);
    const orgId = authContext.user.organizationId.toString();

    const risks = await projectService.listProjectRisks(id, orgId);
    return NextResponse.json(
      successResponse(
        risks.map((r) => ({
          id: r._id.toString(),
          title: r.title,
          description: r.description,
          severity: r.severity,
          likelihood: r.likelihood,
          mitigationPlan: r.mitigationPlan,
          owner: r.ownerUserId,
          status: r.status,
          resolvedAt: r.resolvedAt,
          createdAt: r.createdAt,
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
    const authContext = await requireAnyPermission(req, ['projects.update', 'projects.manage']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const body = await req.json();
    const validated = createProjectRiskSchema.parse(body);

    const created = await projectService.createProjectRisk(id, orgId, validated, actor);
    return NextResponse.json(
      successResponse(
        {
          id: created._id.toString(),
          title: created.title,
          severity: created.severity,
          status: created.status,
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
    const authContext = await requireAnyPermission(req, ['projects.update', 'projects.manage']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const body = await req.json();
    const riskId = body.riskId as string;
    if (!riskId) throw new ValidationError('riskId is required');

    const validated = updateProjectRiskSchema.parse(body);
    const updated = await projectService.updateProjectRisk(id, riskId, orgId, validated, actor);

    return NextResponse.json(
      successResponse(
        {
          id: updated._id.toString(),
          title: updated.title,
          severity: updated.severity,
          status: updated.status,
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
    const authContext = await requireAnyPermission(req, ['projects.update', 'projects.manage']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const riskId = req.nextUrl.searchParams.get('riskId');
    if (!riskId) throw new ValidationError('riskId query parameter is required');

    await projectService.deleteProjectRisk(id, riskId, orgId, actor);
    return NextResponse.json(successResponse({ deleted: true, riskId }, undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
