import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/server/authorization/guards';
import { adminService } from '@/server/services/admin.service';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requirePermission(req, 'audit_logs.view');
    const orgId = authContext.user.organizationId.toString();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    const actorId = searchParams.get('actorId') || undefined;
    const action = searchParams.get('action') || undefined;
    const resource = searchParams.get('resource') || undefined;
    const search = searchParams.get('search') || undefined;
    const startDateStr = searchParams.get('startDate') || undefined;
    const endDateStr = searchParams.get('endDate') || undefined;

    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    const result = await adminService.getAuditLogs(
      orgId,
      { actorId, action, resource, search, startDate, endDate },
      { page, limit }
    );

    const safeLogs = result.logs.map((log) => ({
      id: log._id.toString(),
      actorId: log.actorId.toString(),
      actorName: log.actorName,
      actorRole: log.actorRole,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      details: log.details,
      ipAddress: log.ipAddress,
      timestamp: log.timestamp,
    }));

    return NextResponse.json(
      successResponse(safeLogs, {
        page: result.page,
        pageSize: result.limit,
        totalCount: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPrevPage: result.page > 1,
      }, orgId),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
