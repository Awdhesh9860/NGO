import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { donationPaymentService } from '@/server/services/donation-payment.service';
import { toAdminActor } from '@/server/services/admin.service';
import { reconcilePaymentSchema } from '@/features/donations/schemas/donation.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function POST(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, ['payments.reconcile']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const body = await req.json();
    const validated = reconcilePaymentSchema.parse(body);

    const result = await donationPaymentService.reconcilePendingPayment(
      orgId,
      validated.donationId,
      actor
    );

    return NextResponse.json(successResponse(result, undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
