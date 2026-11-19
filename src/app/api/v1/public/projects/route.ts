import { NextRequest, NextResponse } from 'next/server';
import { projectService } from '@/server/services/project.service';
import { resolveTenant } from '@/server/tenant/tenant-resolver';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

/**
 * Public read-only endpoint returning ONLY approved & publicly publishable projects.
 * Internal budgets, internal documents, risks, approval notes, and beneficiary PII are strictly excluded.
 */
export async function GET(req: NextRequest) {
  try {
    const tenant = await resolveTenant(req).catch(() => null);
    const programId = req.nextUrl.searchParams.get('programId') || undefined;
    const projects = await projectService.listPublicProjects(tenant?._id?.toString(), programId);
    return NextResponse.json(successResponse(projects, undefined, tenant?._id?.toString()), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
