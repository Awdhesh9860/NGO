import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/server/authorization/guards';
import { adminService, toAdminActor } from '@/server/services/admin.service';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await requirePermission(req, 'users.manage');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const { invitation } = await adminService.resendInvitation(id, orgId, actor);

    return NextResponse.json(
      successResponse(
        {
          id: invitation._id.toString(),
          email: invitation.email,
          role: invitation.role,
          expiresAt: invitation.expiresAt,
          status: invitation.status,
          message: 'Invitation resent with a refreshed security token',
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
