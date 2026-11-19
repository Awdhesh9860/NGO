import { NextRequest, NextResponse } from 'next/server';
import { projectService } from '@/server/services/project.service';
import { resolveTenant } from '@/server/tenant/tenant-resolver';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError, NotFoundError } from '@/server/errors';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const tenant = await resolveTenant(req).catch(() => null);
    const project = await projectService.getPublicProjectBySlugOrId(slug, tenant?._id?.toString());
    if (!project) {
      throw new NotFoundError('Published project not found');
    }
    return NextResponse.json(successResponse(project, undefined, tenant?._id?.toString()), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
