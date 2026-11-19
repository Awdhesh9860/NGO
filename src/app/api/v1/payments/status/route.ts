import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { donationPaymentService } from '@/server/services/donation-payment.service';
import { getPaymentProviderStatuses } from '@/integrations/payment';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const scope = req.nextUrl.searchParams.get('scope');
    if (scope === 'providers') {
      return NextResponse.json(
        successResponse({ providers: getPaymentProviderStatuses() }),
        { status: HTTP_STATUS.OK }
      );
    }

    const authContext = await requireAnyPermission(req, [
      'payments.view',
      'payments.reconcile',
      'donations.view_all',
    ]);
    const orgId = authContext.user.organizationId.toString();

    const overview = await donationPaymentService.getPaymentMonitoringOverview(orgId);
    return NextResponse.json(successResponse(overview, undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
