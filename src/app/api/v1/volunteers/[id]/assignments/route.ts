import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { stakeholderRepository } from '@/server/repositories/stakeholder.repository';
import { volunteerService } from '@/server/services/volunteer.service';
import { toAdminActor } from '@/server/services/admin.service';
import {
  createVolunteerAssignmentSchema,
  updateVolunteerAssignmentSchema,
} from '@/features/volunteers/schemas/volunteer.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireAnyPermission(req, ['volunteers.view', 'volunteers.assign']);
    const orgId = authContext.user.organizationId.toString();
    const { id } = await context.params;

    const assignments = await stakeholderRepository.findVolunteerAssignments(orgId, id);
    return NextResponse.json(successResponse(assignments, undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireAnyPermission(req, ['volunteers.assign']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const { id } = await context.params;

    const body = await req.json();
    const validated = createVolunteerAssignmentSchema.parse(body);
    const created = await volunteerService.createAssignment(id, orgId, validated, actor);

    return NextResponse.json(successResponse(created, undefined, orgId), {
      status: HTTP_STATUS.CREATED,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireAnyPermission(req, ['volunteers.assign']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const { id } = await context.params;

    const body = await req.json();
    const validated = updateVolunteerAssignmentSchema.parse(body);
    const updated = await volunteerService.updateAssignmentStatus(id, orgId, validated, actor);

    return NextResponse.json(successResponse(updated, undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
