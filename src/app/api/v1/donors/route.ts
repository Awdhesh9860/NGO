import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { donorService } from '@/server/services/donor.service';
import { toAdminActor } from '@/server/services/admin.service';
import { createDonorSchema } from '@/features/donors/schemas/donor.schema';
import { DonorStatus, DonorType } from '@/server/database/models/Donor';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, ['donors.view', 'donors.manage']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const sp = req.nextUrl.searchParams;
    if (sp.get('export') === 'true') {
      const exported = await donorService.exportDonors(orgId, actor);
      return NextResponse.json(successResponse(exported, undefined, orgId), {
        status: HTTP_STATUS.OK,
      });
    }

    const page = parseInt(sp.get('page') || '1', 10);
    const limit = parseInt(sp.get('limit') || '20', 10);
    const donorType = (sp.get('donorType') as DonorType) || undefined;
    const status = (sp.get('status') as DonorStatus) || undefined;
    const search = sp.get('search') || undefined;
    const hasActiveRecurring =
      sp.get('hasActiveRecurring') === 'true'
        ? true
        : sp.get('hasActiveRecurring') === 'false'
        ? false
        : undefined;

    const result = await donorService.listDonors(
      orgId,
      { donorType, status, search, hasActiveRecurring },
      { page, limit },
      actor
    );

    return NextResponse.json(
      successResponse(
        result.donors,
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

export async function POST(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, ['donors.manage']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const body = await req.json();
    const validated = createDonorSchema.parse(body);
    const created = await donorService.createDonor(orgId, validated, actor);

    return NextResponse.json(successResponse(created, undefined, orgId), {
      status: HTTP_STATUS.CREATED,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
