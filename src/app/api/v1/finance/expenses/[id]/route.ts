import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { expenseVendorService } from '@/server/services/expense-vendor.service';
import { toAdminActor } from '@/server/services/admin.service';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const authContext = await requireAnyPermission(req, [
      'finance.expenses.view',
      'finance.expenses.approve',
      'finance.expenses.pay',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const detail = await expenseVendorService.getExpenseDetail(id, orgId, actor);
    return NextResponse.json(successResponse(detail, undefined, orgId), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}
