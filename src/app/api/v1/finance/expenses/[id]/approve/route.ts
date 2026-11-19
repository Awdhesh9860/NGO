import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/server/authorization/guards';
import { expenseVendorService } from '@/server/services/expense-vendor.service';
import { toAdminActor } from '@/server/services/admin.service';
import { approveExpenseSchema } from '@/features/finance/schemas/finance.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const authContext = await requirePermission(req, 'finance.expenses.approve');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const body = await req.json();
    const input = approveExpenseSchema.parse(body);

    const result = await expenseVendorService.decideExpenseApproval(id, orgId, input, actor);
    return NextResponse.json(successResponse(result, undefined, orgId), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}
