import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { financialReportsService } from '@/server/services/financial-reports.service';
import { BudgetLevel } from '@/server/database/models/Budget';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, [
      'finance.reports.view',
      'finance.budgets.view',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const sp = req.nextUrl.searchParams;
    const report = await financialReportsService.getBudgetVsActualReport(orgId, {
      financialYear: sp.get('financialYear') || undefined,
      level: (sp.get('level') as BudgetLevel) || undefined,
      projectId: sp.get('projectId') || undefined,
    });
    return NextResponse.json(successResponse(report, undefined, orgId), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}
