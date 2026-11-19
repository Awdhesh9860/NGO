import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { volunteerService } from '@/server/services/volunteer.service';
import { toAdminActor } from '@/server/services/admin.service';
import { VolunteerStatus, VolunteerVerificationStatus } from '@/server/database/models/VolunteerProfile';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, ['volunteers.view', 'volunteers.manage']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const sp = req.nextUrl.searchParams;
    const page = parseInt(sp.get('page') || '1', 10);
    const limit = parseInt(sp.get('limit') || '25', 10);
    const status = (sp.get('status') as VolunteerStatus) || undefined;
    const verificationStatus = (sp.get('verificationStatus') as VolunteerVerificationStatus) || undefined;
    const skill = sp.get('skill') || undefined;
    const search = sp.get('search') || undefined;

    const result = await volunteerService.listVolunteers(
      orgId,
      { status, verificationStatus, skill, search },
      { page, limit },
      actor
    );

    return NextResponse.json(
      successResponse(
        result.volunteers,
        {
          page: result.page,
          pageSize: result.limit,
          totalCount: result.total,
          totalPages: result.totalPages,
          hasNextPage: result.page < result.totalPages,
          hasPrevPage: result.page > 1,
        },
        orgId
      ),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
