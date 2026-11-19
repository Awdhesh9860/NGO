import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedContext, requireAnyPermission } from '@/server/authorization/guards';
import { resolveTenant } from '@/server/tenant/tenant-resolver';
import { membershipService } from '@/server/services/membership.service';
import { toAdminActor } from '@/server/services/admin.service';
import { createMembershipPlanSchema } from '@/features/membership/schemas/membership.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const isPublic = req.nextUrl.searchParams.get('public') === 'true';
    if (isPublic) {
      const authContext = await getAuthenticatedContext(req).catch(() => null);
      const tenant = await resolveTenant(req, authContext?.user.organizationId.toString());
      if (!tenant) {
        return NextResponse.json(successResponse([]), { status: HTTP_STATUS.OK });
      }
      const plans = await membershipService.listPlans(tenant._id.toString(), true);
      return NextResponse.json(successResponse(plans, undefined, tenant._id.toString()), {
        status: HTTP_STATUS.OK,
      });
    }

    const authContext = await requireAnyPermission(req, ['members.view', 'members.manage']);
    const orgId = authContext.user.organizationId.toString();
    const plans = await membershipService.listPlans(orgId, false);
    return NextResponse.json(successResponse(plans, undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, ['members.create', 'members.manage']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const body = await req.json();
    const validated = createMembershipPlanSchema.parse(body);
    const created = await membershipService.createPlan(orgId, validated, actor);

    return NextResponse.json(successResponse(created, undefined, orgId), {
      status: HTTP_STATUS.CREATED,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
