import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { fundraisingRepository } from '@/server/repositories/fundraising.repository';
import { donationPaymentService } from '@/server/services/donation-payment.service';
import { toAdminActor } from '@/server/services/admin.service';
import { requestRefundSchema } from '@/features/donations/schemas/donation.schema';
import { RefundStatus } from '@/server/database/models/Refund';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, [
      'refunds.view',
      'refunds.request',
      'refunds.approve',
      'refunds.process',
    ]);
    const orgId = authContext.user.organizationId.toString();

    const sp = req.nextUrl.searchParams;
    const page = parseInt(sp.get('page') || '1', 10);
    const limit = parseInt(sp.get('limit') || '25', 10);
    const status = (sp.get('status') as RefundStatus) || undefined;
    const donationId = sp.get('donationId') || undefined;

    const [refunds, total] = await Promise.all([
      fundraisingRepository.findRefunds(orgId, { status, donationId }, { page, limit }),
      fundraisingRepository.countRefunds(orgId, { status }),
    ]);

    return NextResponse.json(
      successResponse(
        refunds,
        {
          page,
          pageSize: limit,
          totalCount: total,
          totalPages: Math.ceil(total / limit) || 1,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
        orgId
      ),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, ['refunds.request']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const body = await req.json();
    const validated = requestRefundSchema.parse(body);

    const result = await donationPaymentService.requestRefund(orgId, validated, actor);
    return NextResponse.json(successResponse(result, undefined, orgId), {
      status: result.idempotentReplay ? HTTP_STATUS.OK : HTTP_STATUS.CREATED,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
