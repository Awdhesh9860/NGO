import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/server/authorization/guards';
import { adminService, toAdminActor } from '@/server/services/admin.service';
import { updateOrganizationSchema } from '@/features/admin/schemas/admin.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requirePermission(req, 'users.view');
    const orgId = authContext.user.organizationId.toString();

    const org = await adminService.getOrganization(orgId);

    return NextResponse.json(
      successResponse({
        id: org._id.toString(),
        name: org.name,
        slug: org.slug,
        customDomain: org.customDomain,
        logo: org.logo,
        contactEmail: org.contactEmail,
        contactPhone: org.contactPhone,
        headquartersAddress: org.headquartersAddress,
        statutory: org.statutory,
        settings: org.settings,
        isActive: org.isActive,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
      }, undefined, orgId),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authContext = await requirePermission(req, 'organizations.manage');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const rawBody = await req.json();
    const validated = updateOrganizationSchema.parse(rawBody);

    const updated = await adminService.updateOrganization(orgId, validated, actor);

    return NextResponse.json(
      successResponse({
        id: updated._id.toString(),
        name: updated.name,
        slug: updated.slug,
        customDomain: updated.customDomain,
        logo: updated.logo,
        contactEmail: updated.contactEmail,
        contactPhone: updated.contactPhone,
        headquartersAddress: updated.headquartersAddress,
        statutory: updated.statutory,
        settings: updated.settings,
        isActive: updated.isActive,
        updatedAt: updated.updatedAt,
      }, undefined, orgId),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
