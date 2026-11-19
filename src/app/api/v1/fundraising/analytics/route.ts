import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { donationPaymentService } from '@/server/services/donation-payment.service';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, [
      'fundraising.analytics.view',
      'donations.view_all',
      'campaigns.view',
    ]);
    const orgId = authContext.user.organizationId.toString();

    const analytics = await donationPaymentService.getFundraisingAnalytics(orgId);
    return NextResponse.json(successResponse(analytics, undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
