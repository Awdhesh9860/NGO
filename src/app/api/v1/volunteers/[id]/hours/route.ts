import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { stakeholderRepository } from '@/server/repositories/stakeholder.repository';
import { computeVerifiedHoursSummary } from '@/server/services/volunteer.service';
import { NotFoundError } from '@/lib/error-handler';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireAnyPermission(req, [
      'volunteers.hours.view',
      'volunteers.view',
      'volunteers.manage',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const { id } = await context.params;

    const volunteer = await stakeholderRepository.findVolunteerById(id, orgId);
    if (!volunteer) throw new NotFoundError('Volunteer not found in this organization');

    const projectId = req.nextUrl.searchParams.get('projectId') || undefined;
    const records = await stakeholderRepository.findVolunteerAttendance(orgId, id, { projectId });
    const summary = computeVerifiedHoursSummary(records);

    return NextResponse.json(
      successResponse(
        {
          volunteerId: id,
          volunteerCode: volunteer.volunteerCode,
          ...summary,
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
