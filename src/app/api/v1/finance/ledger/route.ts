import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { accountingService } from '@/server/services/accounting.service';
import { AccountType } from '@/server/database/models/ChartOfAccount';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, [
      'finance.ledger.view',
      'finance.reports.view',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const sp = req.nextUrl.searchParams;

    const ledger = await accountingService.getGeneralLedger(orgId, {
      accountId: sp.get('accountId') || undefined,
      accountType: (sp.get('accountType') as AccountType) || undefined,
      periodId: sp.get('periodId') || undefined,
      programId: sp.get('programId') || undefined,
      projectId: sp.get('projectId') || undefined,
      departmentId: sp.get('departmentId') || undefined,
      from: sp.get('from') ? new Date(sp.get('from')!) : undefined,
      to: sp.get('to') ? new Date(sp.get('to')!) : undefined,
    });

    return NextResponse.json(successResponse(ledger, undefined, orgId), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}
