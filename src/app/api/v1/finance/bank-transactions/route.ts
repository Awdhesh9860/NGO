import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission, requirePermission } from '@/server/authorization/guards';
import { expenseVendorService } from '@/server/services/expense-vendor.service';
import { toAdminActor } from '@/server/services/admin.service';
import { importBankStatementSchema } from '@/features/finance/schemas/finance.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, [
      'finance.bank_accounts.view',
      'finance.reconciliation.manage',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const sp = req.nextUrl.searchParams;
    const bankAccountId = sp.get('bankAccountId') || undefined;
    const status = sp.get('status') || undefined;

    const txns = await expenseVendorService.listBankTransactions(orgId, bankAccountId, status);
    return NextResponse.json(successResponse(txns, undefined, orgId), { status: HTTP_STATUS.OK });
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
    const input = importBankStatementSchema.parse(body);

    const result = await expenseVendorService.importBankStatementCsv(orgId, input, actor);
    return NextResponse.json(successResponse(result, undefined, orgId), { status: HTTP_STATUS.CREATED });
  } catch (error) {
    return handleRouteError(error);
  }
}
