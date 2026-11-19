import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { fundraisingRepository } from '@/server/repositories/fundraising.repository';
import { donationPaymentService } from '@/server/services/donation-payment.service';
import { toAdminActor } from '@/server/services/admin.service';
import { cancelReceiptSchema } from '@/features/donations/schemas/donation.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, ['receipts.view', 'donations.view_all']);
    const orgId = authContext.user.organizationId.toString();

    const sp = req.nextUrl.searchParams;
    const page = parseInt(sp.get('page') || '1', 10);
    const limit = parseInt(sp.get('limit') || '25', 10);
    const status = (sp.get('status') as 'ISSUED' | 'CANCELLED') || undefined;

    const [receipts, total] = await Promise.all([
      fundraisingRepository.findReceipts(orgId, { status }, { page, limit }),
      fundraisingRepository.countReceipts(orgId, { status }),
    ]);

    return NextResponse.json(
      successResponse(
        receipts,
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

export async function PATCH(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, ['receipts.cancel']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const body = await req.json();
    const validated = cancelReceiptSchema.parse(body);
    const result = await donationPaymentService.cancelReceipt(
      orgId,
      validated.receiptId,
      validated.reason,
      validated.reissue,
      actor
    );

    return NextResponse.json(successResponse(result, undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
