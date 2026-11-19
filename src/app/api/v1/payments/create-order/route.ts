import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedContext } from '@/server/authorization/guards';
import { resolveTenant } from '@/server/tenant/tenant-resolver';
import { donationPaymentService } from '@/server/services/donation-payment.service';
import { createPaymentOrderSchema } from '@/features/donations/schemas/donation.schema';
import { NotFoundError } from '@/lib/error-handler';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function POST(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedContext(req).catch(() => null);
    const tenant = await resolveTenant(req, authContext?.user.organizationId.toString());
    if (!tenant) {
      throw new NotFoundError('Active NGO organization context could not be resolved');
    }

    const body = await req.json();
    const validated = createPaymentOrderSchema.parse(body);

    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined;
    const userAgent = req.headers.get('user-agent') || undefined;

    const result = await donationPaymentService.createPaymentOrder(
      tenant._id.toString(),
      validated,
      { ipAddress, userAgent }
    );

    return NextResponse.json(
      successResponse(
        {
          idempotentReplay: result.idempotentReplay,
          donation: {
            id: result.donation._id.toString(),
            donationCode: result.donation.donationCode,
            amountMinor: result.donation.amountMinor,
            currency: result.donation.currency,
            status: result.donation.status,
            paymentProvider: result.donation.paymentProvider,
            providerOrderId: result.donation.providerOrderId,
            purpose: result.donation.purpose,
            createdAt: result.donation.createdAt,
          },
          paymentOrder: result.paymentOrder,
        },
        undefined,
        tenant._id.toString()
      ),
      { status: result.idempotentReplay ? HTTP_STATUS.OK : HTTP_STATUS.CREATED }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
