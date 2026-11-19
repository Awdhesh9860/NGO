import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { fundraisingRepository } from '@/server/repositories/fundraising.repository';
import { donationPaymentService } from '@/server/services/donation-payment.service';
import { toAdminActor } from '@/server/services/admin.service';
import { updateRecurringDonationSchema } from '@/features/donations/schemas/donation.schema';
import { NotFoundError } from '@/lib/error-handler';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireAnyPermission(req, ['donations.view_all', 'donations.manage']);
    const orgId = authContext.user.organizationId.toString();
    const { id } = await context.params;

    const record = await fundraisingRepository.findRecurringById(id, orgId);
    if (!record) throw new NotFoundError('Recurring donation not found in this organization');

    return NextResponse.json(successResponse(record, undefined, orgId), {
      status: HTTP_STATUS.OK,
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
    const authContext = await requireAnyPermission(req, ['donations.manage']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const { id } = await context.params;

    const body = await req.json();
    const validated = updateRecurringDonationSchema.parse(body);

    const updated = await donationPaymentService.updateRecurringDonation(orgId, id, validated, actor);
    return NextResponse.json(successResponse(updated, undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
