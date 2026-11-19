import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission, requirePermission } from '@/server/authorization/guards';
import { expenseVendorService } from '@/server/services/expense-vendor.service';
import { toAdminActor } from '@/server/services/admin.service';
import { createExpenseSchema } from '@/features/finance/schemas/finance.schema';
import { ExpenseStatus } from '@/server/database/models/Expense';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, [
      'finance.expenses.view',
      'finance.expenses.create',
      'finance.expenses.approve',
      'finance.expenses.pay',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const sp = req.nextUrl.searchParams;

    const result = await expenseVendorService.listExpenses(
      orgId,
      {
        status: (sp.get('status') as ExpenseStatus) || undefined,
        category: sp.get('category') || undefined,
        projectId: sp.get('projectId') || undefined,
        departmentId: sp.get('departmentId') || undefined,
      },
      {
        page: parseInt(sp.get('page') || '1', 10),
        limit: parseInt(sp.get('limit') || '25', 10),
      },
      actor
    );

    return NextResponse.json(
      successResponse(
        result.expenses,
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
    const authContext = await requirePermission(req, 'finance.expenses.create');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const body = await req.json();
    const input = createExpenseSchema.parse(body);

    const created = await expenseVendorService.createExpense(orgId, input, actor);
    return NextResponse.json(successResponse(created, undefined, orgId), { status: HTTP_STATUS.CREATED });
  } catch (error) {
    return handleRouteError(error);
  }
}
