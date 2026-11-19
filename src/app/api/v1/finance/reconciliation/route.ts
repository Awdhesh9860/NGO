import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission, requirePermission } from '@/server/authorization/guards';
import { expenseVendorService } from '@/server/services/expense-vendor.service';
import { toAdminActor } from '@/server/services/admin.service';
import { reconcileBankTransactionSchema } from '@/features/finance/schemas/finance.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, [
      'finance.bank_accounts.view',
      'finance.reconciliation.manage',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const bankAccountId = req.nextUrl.searchParams.get('bankAccountId') || undefined;
    const sessions = await expenseVendorService.listReconciliations(orgId, bankAccountId);
    return NextResponse.json(successResponse(sessions, undefined, orgId), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authContext = await requirePermission(req, 'finance.reconciliation.manage');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const body = await req.json();
    const input = reconcileBankTransactionSchema.parse(body);

    const result = await expenseVendorService.reconcileTransactionOrSession(orgId, input, actor);
    return NextResponse.json(successResponse(result, undefined, orgId), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}
