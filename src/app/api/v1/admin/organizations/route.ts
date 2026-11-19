import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/server/authorization/guards';
import { adminService, toAdminActor } from '@/server/services/admin.service';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requirePermission(req, 'organizations.manage');
    const actor = toAdminActor(authContext.user, req);

    const organizations = await adminService.listOrganizationsForSuperAdmin(actor);

    return NextResponse.json(
      successResponse(
        organizations.map((org) => ({
          id: org._id.toString(),
          name: org.name,
          slug: org.slug,
          status: org.status || (org.isActive ? 'ACTIVE' : 'INACTIVE'),
          verificationStatus: org.verificationStatus || 'unverified',
          contactEmail: org.contactEmail,
        }))
      ),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
