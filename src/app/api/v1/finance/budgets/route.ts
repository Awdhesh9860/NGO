import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission, requirePermission } from '@/server/authorization/guards';
import { budgetGrantComplianceService } from '@/server/services/budget-grant-compliance.service';
import { toAdminActor } from '@/server/services/admin.service';
import { createBudgetSchema } from '@/features/finance/schemas/finance.schema';
import { BudgetLevel } from '@/server/database/models/Budget';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, [
      'finance.budgets.view',
      'finance.budgets.manage',
      'finance.budgets.approve',
      'project_budget.view',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const sp = req.nextUrl.searchParams;
    const data = await budgetGrantComplianceService.listBudgetsWithUtilization(orgId, {
      financialYear: sp.get('financialYear') || undefined,
      level: (sp.get('level') as BudgetLevel) || undefined,
      projectId: sp.get('projectId') || undefined,
    });
    return NextResponse.json(successResponse(data, undefined, orgId), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authContext = await requirePermission(req, 'finance.budgets.manage');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const body = await req.json();
    const input = createBudgetSchema.parse(body);

    const created = await budgetGrantComplianceService.createBudget(orgId, input, actor);
    return NextResponse.json(successResponse(created, undefined, orgId), { status: HTTP_STATUS.CREATED });
  } catch (error) {
    return handleRouteError(error);
  }
}
