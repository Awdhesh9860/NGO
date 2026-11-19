import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { beneficiaryService } from '@/server/services/beneficiary.service';
import { toAdminActor } from '@/server/services/admin.service';
import { createBeneficiarySchema } from '@/features/beneficiaries/schemas/beneficiary.schema';
import { BeneficiaryStatus } from '@/server/database/models/Beneficiary';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

/**
 * General Beneficiary listing endpoint.
 * STRICT PRIVACY GUARANTEE: NEVER returns sensitiveProfile, guardianDetails, documentRefs,
 * phone/email, or full address from this listing endpoint.
 */
export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, [
      'beneficiaries.view',
      'beneficiaries.manage',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const sp = req.nextUrl.searchParams;
    if (sp.get('export') === 'true') {
      const exported = await beneficiaryService.exportBeneficiaries(orgId, actor);
      return NextResponse.json(successResponse(exported, undefined, orgId), {
        status: HTTP_STATUS.OK,
      });
    }

    const page = parseInt(sp.get('page') || '1', 10);
    const limit = parseInt(sp.get('limit') || '25', 10);
    const status = (sp.get('status') as BeneficiaryStatus) || undefined;
    const verificationStatus = sp.get('verificationStatus') || undefined;
    const assistanceCategory = sp.get('assistanceCategory') || undefined;
    const projectId = sp.get('projectId') || undefined;
    const district = sp.get('district') || undefined;
    const search = sp.get('search') || undefined;
    const requiresSafeguarding =
      sp.get('requiresSafeguarding') === 'true'
        ? true
        : sp.get('requiresSafeguarding') === 'false'
        ? false
        : undefined;

    const result = await beneficiaryService.listBeneficiaries(
      orgId,
      {
        status,
        verificationStatus,
        assistanceCategory,
        projectId,
        district,
        requiresSafeguarding,
        search,
      },
      { page, limit },
      actor
    );

    return NextResponse.json(
      successResponse(
        result.beneficiaries,
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
    const authContext = await requireAnyPermission(req, ['beneficiaries.create']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const body = await req.json();
    const validated = createBeneficiarySchema.parse(body);
    const created = await beneficiaryService.registerBeneficiary(orgId, validated, actor);

    return NextResponse.json(successResponse(created, undefined, orgId), {
      status: HTTP_STATUS.CREATED,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
