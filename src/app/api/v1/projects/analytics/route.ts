import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { projectService } from '@/server/services/project.service';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, [
      'project_reports.view',
      'projects.view',
      'programs.view',
    ]);
    const orgId = authContext.user.organizationId.toString();

    const analytics = await projectService.getOperationalAnalytics(orgId);

    return NextResponse.json(successResponse(analytics, undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
