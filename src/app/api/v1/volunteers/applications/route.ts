import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedContext, requireAnyPermission } from '@/server/authorization/guards';
import { resolveTenant } from '@/server/tenant/tenant-resolver';
import { stakeholderRepository } from '@/server/repositories/stakeholder.repository';
import { volunteerService } from '@/server/services/volunteer.service';
import { createVolunteerApplicationSchema } from '@/features/volunteers/schemas/volunteer.schema';
import { VolunteerApplicationStatus } from '@/server/database/models/VolunteerApplication';
import { enforceRateLimit } from '@/server/security/rate-limit';
import { NotFoundError } from '@/lib/error-handler';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, ['volunteers.view', 'volunteers.manage']);
    const orgId = authContext.user.organizationId.toString();

    const sp = req.nextUrl.searchParams;
    const page = parseInt(sp.get('page') || '1', 10);
    const limit = parseInt(sp.get('limit') || '25', 10);
    const status = (sp.get('status') as VolunteerApplicationStatus) || undefined;
    const search = sp.get('search') || undefined;

    const [applications, total] = await Promise.all([
      stakeholderRepository.findVolunteerApplications(orgId, { status, search }, { page, limit }),
      stakeholderRepository.countVolunteerApplications(orgId, { status }),
    ]);

    return NextResponse.json(
      successResponse(
        applications,
        {
          page,
          pageSize: limit,
          totalCount: total,
          totalPages: Math.ceil(total / limit) || 1,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
        orgId
      ),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

/**
 * Public-capable volunteer registration application submission.
 * Never trusts browser-supplied organizationId; resolves tenant securely server-side.
 */
export async function POST(req: NextRequest) {
  try {
    await enforceRateLimit(req, 'PUBLIC_FORM');
    const authContext = await getAuthenticatedContext(req).catch(() => null);
    const tenant = await resolveTenant(req, authContext?.user.organizationId.toString());
    if (!tenant) throw new NotFoundError('Active organization could not be resolved');

    const body = await req.json();
    const validated = createVolunteerApplicationSchema.parse(body);

    const created = await volunteerService.submitApplication(tenant._id.toString(), validated);

    return NextResponse.json(
      successResponse(
        {
          id: created._id.toString(),
          applicationCode: created.applicationCode,
          fullName: created.fullName,
          status: created.status,
          createdAt: created.createdAt,
        },
        undefined,
        tenant._id.toString()
      ),
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
