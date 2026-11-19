import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { fundraisingRepository } from '@/server/repositories/fundraising.repository';
import { donationPaymentService } from '@/server/services/donation-payment.service';
import { toAdminActor } from '@/server/services/admin.service';
import { NotFoundError } from '@/lib/error-handler';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireAnyPermission(req, [
      'refunds.view',
      'refunds.approve',
      'refunds.process',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const { id } = await context.params;

    const refund = await fundraisingRepository.findRefundById(id, orgId);
    if (!refund) throw new NotFoundError('Refund request not found in this organization');

    return NextResponse.json(successResponse(refund, undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

/**
 * Executes an already-APPROVED refund via payment provider or manual bank payout recording.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireAnyPermission(req, ['refunds.process']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const { id } = await context.params;

    const processed = await donationPaymentService.processApprovedRefund(orgId, id, actor);
    return NextResponse.json(successResponse(processed, undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
