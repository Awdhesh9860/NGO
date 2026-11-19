import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { stakeholderRepository } from '@/server/repositories/stakeholder.repository';
import { volunteerService } from '@/server/services/volunteer.service';
import { toAdminActor } from '@/server/services/admin.service';
import { issueVolunteerCertificateSchema } from '@/features/volunteers/schemas/volunteer.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireAnyPermission(req, [
      'volunteers.view',
      'volunteers.certificates.issue',
      'certificates.issue',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const { id } = await context.params;

    const certs = await stakeholderRepository.findVolunteerCertificates(orgId, id);
    return NextResponse.json(successResponse(certs, undefined, orgId), {
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
    const authContext = await requireAnyPermission(req, [
      'volunteers.certificates.issue',
      'certificates.issue',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const { id } = await context.params;

    const body = await req.json();
    const validated = issueVolunteerCertificateSchema.parse(body);
    const cert = await volunteerService.issueCertificate(id, orgId, validated, actor);

    return NextResponse.json(successResponse(cert, undefined, orgId), {
      status: HTTP_STATUS.CREATED,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
