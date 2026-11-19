import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/server/authorization/guards';
import { adminService, toAdminActor } from '@/server/services/admin.service';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError, ValidationError } from '@/server/errors';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await requirePermission(req, 'users.manage');
    const orgId = authContext.user.organizationId.toString();

    const sessions = await adminService.getUserSessionsForAdmin(id, orgId);

    const safeSessions = sessions.map((s) => ({
      id: s._id.toString(),
      device: s.device,
      browser: s.browser,
      ipAddress: s.ipAddress,
      lastActiveAt: s.lastActiveAt,
      expiresAt: s.expiresAt,
      createdAt: s.createdAt,
    }));

    return NextResponse.json(successResponse(safeSessions, undefined, orgId), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await requirePermission(req, 'users.manage');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const sessionId = req.nextUrl.searchParams.get('sessionId');
    const revokeAll = req.nextUrl.searchParams.get('all') === 'true';

    if (!revokeAll && !sessionId) {
      throw new ValidationError('Provide either sessionId or all=true to terminate session(s)');
    }

    const result = await adminService.revokeUserSessionForAdmin(
      id,
      revokeAll ? 'all' : (sessionId as string),
      orgId,
      actor
    );

    return NextResponse.json(successResponse(result, undefined, orgId), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}
