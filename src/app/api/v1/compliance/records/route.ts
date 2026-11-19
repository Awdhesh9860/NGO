import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission, requirePermission } from '@/server/authorization/guards';
import { budgetGrantComplianceService } from '@/server/services/budget-grant-compliance.service';
import { toAdminActor } from '@/server/services/admin.service';
import { createComplianceRecordSchema } from '@/features/compliance/schemas/compliance.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, [
      'compliance.view',
      'compliance.manage',
      'compliance.verify',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const sp = req.nextUrl.searchParams;
    const records = await budgetGrantComplianceService.listComplianceRecords(orgId, {
      complianceType: sp.get('complianceType') || undefined,
      validityStatus: sp.get('validityStatus') || undefined,
    });
    return NextResponse.json(successResponse(records, undefined, orgId), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authContext = await requirePermission(req, 'compliance.manage');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const body = await req.json();
    const input = createComplianceRecordSchema.parse(body);

    const created = await budgetGrantComplianceService.createComplianceRecord(orgId, input, actor);
    return NextResponse.json(successResponse(created, undefined, orgId), { status: HTTP_STATUS.CREATED });
  } catch (error) {
    return handleRouteError(error);
  }
}
