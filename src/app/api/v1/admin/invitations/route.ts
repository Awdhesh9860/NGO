import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/server/authorization/guards';
import { adminService, toAdminActor } from '@/server/services/admin.service';
import { createInvitationSchema } from '@/features/admin/schemas/admin.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requirePermission(req, 'users.manage');
    const orgId = authContext.user.organizationId.toString();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    const status = (searchParams.get('status') as 'pending' | 'accepted' | 'revoked' | 'expired') || undefined;
    const role = searchParams.get('role') || undefined;
    const search = searchParams.get('search') || undefined;

    const result = await adminService.getInvitations(
      orgId,
      { status, role, search },
      { page, limit }
    );

    const safeInvitations = result.invitations.map((inv) => ({
      id: inv._id.toString(),
      email: inv.email,
      role: inv.role,
      department: inv.departmentId,
      invitedBy: inv.invitedBy,
      expiresAt: inv.expiresAt,
      status: inv.status,
      acceptedAt: inv.acceptedAt,
      createdAt: inv.createdAt,
    }));

    return NextResponse.json(
      successResponse(safeInvitations, {
        page,
        pageSize: limit,
        totalCount: result.total,
        totalPages: Math.ceil(result.total / limit) || 1,
        hasNextPage: page * limit < result.total,
        hasPrevPage: page > 1,
      }, orgId),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authContext = await requirePermission(req, 'users.manage');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const rawBody = await req.json();
    const validated = createInvitationSchema.parse(rawBody);

    const { invitation } = await adminService.sendInvitation(orgId, validated, actor);

    return NextResponse.json(
      successResponse({
        id: invitation._id.toString(),
        email: invitation.email,
        role: invitation.role,
        departmentId: invitation.departmentId,
        expiresAt: invitation.expiresAt,
        status: invitation.status,
        createdAt: invitation.createdAt,
      }, undefined, orgId),
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
