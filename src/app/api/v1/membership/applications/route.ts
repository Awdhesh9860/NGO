import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedContext, requireAnyPermission } from '@/server/authorization/guards';
import { resolveTenant } from '@/server/tenant/tenant-resolver';
import { stakeholderRepository } from '@/server/repositories/stakeholder.repository';
import { membershipService } from '@/server/services/membership.service';
import { createMembershipApplicationSchema } from '@/features/membership/schemas/membership.schema';
import { NotFoundError } from '@/lib/error-handler';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, [
      'members.view',
      'members.approve',
      'members.manage',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const status = req.nextUrl.searchParams.get('status') || undefined;

    const apps = await stakeholderRepository.findMembershipApplications(orgId, { status });
    return NextResponse.json(successResponse(apps, undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

/**
 * Public-capable membership application submission.
 * Never auto-approves; always routed through authorized governance approval.
 */
export async function POST(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedContext(req).catch(() => null);
    const tenant = await resolveTenant(req, authContext?.user.organizationId.toString());
    if (!tenant) throw new NotFoundError('Active organization could not be resolved');

    const body = await req.json();
    const validated = createMembershipApplicationSchema.parse(body);
    const created = await membershipService.submitApplication(tenant._id.toString(), validated);

    return NextResponse.json(
      successResponse(
        {
          id: created._id.toString(),
          applicationCode: created.applicationCode,
          category: created.category,
          status: created.status,
          feeAmountMinor: created.feeAmountMinor,
          currency: created.currency,
          feePaymentStatus: created.feePaymentStatus,
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
