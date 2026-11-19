import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission, requirePermission } from '@/server/authorization/guards';
import { budgetGrantComplianceService } from '@/server/services/budget-grant-compliance.service';
import { toAdminActor } from '@/server/services/admin.service';
import { createGrantSchema } from '@/features/finance/schemas/finance.schema';
import { GrantStatus } from '@/server/database/models/Grant';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, [
      'finance.grants.view',
      'finance.grants.manage',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const status = (req.nextUrl.searchParams.get('status') as GrantStatus) || undefined;
    const grants = await budgetGrantComplianceService.listGrants(orgId, status);
    return NextResponse.json(successResponse(grants, undefined, orgId), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authContext = await requirePermission(req, 'finance.grants.manage');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const body = await req.json();
    const input = createGrantSchema.parse(body);

    const created = await budgetGrantComplianceService.createGrant(orgId, input, actor);
    return NextResponse.json(successResponse(created, undefined, orgId), { status: HTTP_STATUS.CREATED });
  } catch (error) {
    return handleRouteError(error);
  }
}
