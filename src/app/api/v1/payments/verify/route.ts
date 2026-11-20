import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedContext } from '@/server/authorization/guards';
import { resolveTenant } from '@/server/tenant/tenant-resolver';
import { donationPaymentService } from '@/server/services/donation-payment.service';
import { verifyPaymentSchema } from '@/features/donations/schemas/donation.schema';
import { enforceRateLimit } from '@/server/security/rate-limit';
import { NotFoundError } from '@/lib/error-handler';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function POST(req: NextRequest) {
  try {
    await enforceRateLimit(req, 'PAYMENT_VERIFY');
    const authContext = await getAuthenticatedContext(req).catch(() => null);
    const tenant = await resolveTenant(req, authContext?.user.organizationId.toString());
    if (!tenant) {
      throw new NotFoundError('Active organization context could not be resolved');
    }

    const body = await req.json();
    const validated = verifyPaymentSchema.parse(body);

    const result = await donationPaymentService.verifyOnlinePayment(
      tenant._id.toString(),
      validated
    );

    return NextResponse.json(
      successResponse(
        {
          verified: result.verified,
          alreadySettled: result.alreadySettled,
          donation: {
            id: result.donation._id.toString(),
            donationCode: result.donation.donationCode,
            status: result.donation.status,
            amountMinor: result.donation.amountMinor,
            currency: result.donation.currency,
            receiptStatus: result.donation.receiptStatus,
          },
          receipt: result.receipt
            ? {
                id: result.receipt._id.toString(),
                receiptNumber: result.receipt.receiptNumber,
                taxBenefitEligible: result.receipt.taxBenefitEligible,
                taxEligibilityReason: result.receipt.taxEligibilityReason,
              }
            : null,
        },
        undefined,
        tenant._id.toString()
      ),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
