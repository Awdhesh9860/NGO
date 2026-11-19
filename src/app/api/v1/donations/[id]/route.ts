import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { donationPaymentService } from '@/server/services/donation-payment.service';
import { toAdminActor } from '@/server/services/admin.service';
import { manualDonationVerificationSchema } from '@/features/donations/schemas/donation.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireAnyPermission(req, [
      'donations.view_all',
      'donations.verify',
      'donations.manage',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const { id } = await context.params;

    const detail = await donationPaymentService.getDonationDetail(orgId, id);
    return NextResponse.json(successResponse(detail, undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

/**
 * Authorized staff manual verification (Approve / Reject) for pending UPI & Bank Transfer donations.
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireAnyPermission(req, ['donations.verify']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const { id } = await context.params;

    const body = await req.json();
    const validated = manualDonationVerificationSchema.parse(body);
    const result = await donationPaymentService.verifyManualDonation(orgId, id, validated, actor);

    return NextResponse.json(successResponse(result, undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
