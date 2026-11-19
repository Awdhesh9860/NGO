import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedContext, requireAnyPermission } from '@/server/authorization/guards';
import { resolveTenant } from '@/server/tenant/tenant-resolver';
import { fundraisingRepository } from '@/server/repositories/fundraising.repository';
import { donationPaymentService } from '@/server/services/donation-payment.service';
import { toAdminActor } from '@/server/services/admin.service';
import { createRecurringDonationSchema } from '@/features/donations/schemas/donation.schema';
import { RecurringDonationStatus } from '@/server/database/models/RecurringDonation';
import { NotFoundError } from '@/lib/error-handler';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, ['donations.view_all', 'donations.manage']);
    const orgId = authContext.user.organizationId.toString();

    const sp = req.nextUrl.searchParams;
    const page = parseInt(sp.get('page') || '1', 10);
    const limit = parseInt(sp.get('limit') || '25', 10);
    const status = (sp.get('status') as RecurringDonationStatus) || undefined;
    const donorId = sp.get('donorId') || undefined;

    const [items, total] = await Promise.all([
      fundraisingRepository.findRecurringDonations(orgId, { status, donorId }, { page, limit }),
      fundraisingRepository.countRecurringDonations(orgId, { status }),
    ]);

    return NextResponse.json(
      successResponse(
        items,
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
    const authContext = await getAuthenticatedContext(req).catch(() => null);
    const tenant = await resolveTenant(req, authContext?.user.organizationId.toString());
    if (!tenant) {
      throw new NotFoundError('Active organization context could not be resolved');
    }

    const body = await req.json();
    const validated = createRecurringDonationSchema.parse(body);
    const actor = authContext ? toAdminActor(authContext.user, req) : undefined;

    const result = await donationPaymentService.createRecurringDonation(
      tenant._id.toString(),
      validated,
      actor
    );

    return NextResponse.json(successResponse(result, undefined, tenant._id.toString()), {
      status: HTTP_STATUS.CREATED,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
