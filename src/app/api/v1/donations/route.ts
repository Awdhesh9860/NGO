import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { donationPaymentService } from '@/server/services/donation-payment.service';
import { DonationStatus, PaymentProviderType } from '@/server/database/models/Donation';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, [
      'donations.view_all',
      'donations.verify',
      'donations.manage',
    ]);
    const orgId = authContext.user.organizationId.toString();

    const sp = req.nextUrl.searchParams;
    const page = parseInt(sp.get('page') || '1', 10);
    const limit = parseInt(sp.get('limit') || '20', 10);
    const status = (sp.get('status') as DonationStatus) || undefined;
    const paymentProvider = (sp.get('paymentProvider') as PaymentProviderType) || undefined;
    const campaignId = sp.get('campaignId') || undefined;
    const donorId = sp.get('donorId') || undefined;
    const search = sp.get('search') || undefined;
    const fromDate = sp.get('fromDate') ? new Date(sp.get('fromDate') as string) : undefined;
    const toDate = sp.get('toDate') ? new Date(sp.get('toDate') as string) : undefined;

    const result = await donationPaymentService.listDonations(
      orgId,
      { status, paymentProvider, campaignId, donorId, search, fromDate, toDate },
      { page, limit }
    );

    return NextResponse.json(
      successResponse(
        result.donations,
        {
          page: result.page,
          pageSize: result.limit,
          totalCount: result.total,
          totalPages: result.totalPages,
          hasNextPage: result.page < result.totalPages,
          hasPrevPage: result.page > 1,
        },
        orgId
      ),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
