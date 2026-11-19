import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { projectService } from '@/server/services/project.service';
import { toAdminActor } from '@/server/services/admin.service';
import { assignProjectTeamMemberSchema } from '@/features/projects/schemas/project.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError, ValidationError } from '@/server/errors';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await requireAnyPermission(req, ['projects.view', 'projects.view_assigned', 'projects.assign']);
    const orgId = authContext.user.organizationId.toString();

    const team = await projectService.getProjectTeamWithWorkload(id, orgId);
    return NextResponse.json(successResponse(team, undefined, orgId), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await requireAnyPermission(req, ['projects.assign', 'projects.manage']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const body = await req.json();
    const validated = assignProjectTeamMemberSchema.parse(body);

    await projectService.assignTeamMember(id, orgId, validated, actor);
    const team = await projectService.getProjectTeamWithWorkload(id, orgId);

    return NextResponse.json(successResponse(team, undefined, orgId), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await requireAnyPermission(req, ['projects.assign', 'projects.manage']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) throw new ValidationError('userId query parameter is required');

    await projectService.removeTeamMember(id, userId, orgId, actor);
    const team = await projectService.getProjectTeamWithWorkload(id, orgId);

    return NextResponse.json(successResponse(team, undefined, orgId), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}
