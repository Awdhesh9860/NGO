import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/server/authorization/guards';
import { adminService } from '@/server/services/admin.service';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requirePermission(req, 'users.view');
    const orgId = authContext.user.organizationId.toString();

    const stats = await adminService.getExecutiveStats(orgId);

    return NextResponse.json(
      successResponse(stats, undefined, orgId),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
