import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { financialReportsService } from '@/server/services/financial-reports.service';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, [
      'finance.reports.view',
      'finance.grants.view',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const report = await financialReportsService.getGrantUtilizationReport(orgId);
    return NextResponse.json(successResponse(report, undefined, orgId), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}
