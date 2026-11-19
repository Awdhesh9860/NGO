import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { donationPaymentService } from '@/server/services/donation-payment.service';
import { fundraisingRepository } from '@/server/repositories/fundraising.repository';
import { toAdminActor } from '@/server/services/admin.service';
import { NotFoundError } from '@/lib/error-handler';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireAnyPermission(req, ['receipts.view', 'donations.view_all']);
    const orgId = authContext.user.organizationId.toString();
    const { id } = await context.params;

    const receipts = await fundraisingRepository.findReceipts(
      orgId,
      { donationId: id },
      { page: 1, limit: 10 }
    );
    const active = receipts.find((r) => r.status === 'ISSUED') || receipts[0];
    if (!active) {
      throw new NotFoundError('No receipt has been issued for this donation yet');
    }

    return NextResponse.json(successResponse({ activeReceipt: active, history: receipts }, undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireAnyPermission(req, ['receipts.issue']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const { id } = await context.params;

    const receipt = await donationPaymentService.issueReceipt(orgId, id, actor);
    return NextResponse.json(successResponse(receipt, undefined, orgId), {
      status: HTTP_STATUS.CREATED,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
