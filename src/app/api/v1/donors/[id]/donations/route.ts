import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { donationPaymentService } from '@/server/services/donation-payment.service';
import { fundraisingRepository } from '@/server/repositories/fundraising.repository';
import { NotFoundError } from '@/lib/error-handler';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireAnyPermission(req, ['donors.view', 'donations.view_all']);
    const orgId = authContext.user.organizationId.toString();
    const { id } = await context.params;

    const donor = await fundraisingRepository.findDonorById(id, orgId);
    if (!donor) throw new NotFoundError('Donor not found in this organization');

    const sp = req.nextUrl.searchParams;
    const page = parseInt(sp.get('page') || '1', 10);
    const limit = parseInt(sp.get('limit') || '25', 10);

    const result = await donationPaymentService.listDonations(orgId, { donorId: id }, { page, limit });
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
