import { NextRequest, NextResponse } from 'next/server';
import { programService } from '@/server/services/program.service';
import { resolveTenant } from '@/server/tenant/tenant-resolver';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

/**
 * Public read-only endpoint returning ONLY approved & publicly publishable programs.
 * Internal budgets, drafts, pending approvals, and private metadata are strictly excluded.
 */
export async function GET(req: NextRequest) {
  try {
    const tenant = await resolveTenant(req).catch(() => null);
    const programs = await programService.listPublicPrograms(tenant?._id?.toString());
    return NextResponse.json(successResponse(programs, undefined, tenant?._id?.toString()), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
