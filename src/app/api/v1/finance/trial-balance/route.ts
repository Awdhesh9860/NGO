import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission, requirePermission } from '@/server/authorization/guards';
import { accountingService } from '@/server/services/accounting.service';
import { financialReportsService } from '@/server/services/financial-reports.service';
import { toAdminActor } from '@/server/services/admin.service';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    if (sp.get('export') === 'csv') {
      const authContext = await requirePermission(req, 'finance.reports.export');
      const orgId = authContext.user.organizationId.toString();
      const actor = toAdminActor(authContext.user, req);
      const csv = await financialReportsService.exportStatementCsv(orgId, 'TRIAL_BALANCE', actor);
      return new NextResponse(csv, {
        status: HTTP_STATUS.OK,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="trial-balance.csv"',
        },
      });
    }

    const authContext = await requireAnyPermission(req, [
      'finance.ledger.view',
      'finance.reports.view',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const tb = await accountingService.getTrialBalance(orgId, {
      periodId: sp.get('periodId') || undefined,
      from: sp.get('from') ? new Date(sp.get('from')!) : undefined,
      to: sp.get('to') ? new Date(sp.get('to')!) : undefined,
    });
    return NextResponse.json(successResponse(tb, undefined, orgId), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}
