import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission, requirePermission } from '@/server/authorization/guards';
import { accountingService } from '@/server/services/accounting.service';
import { toAdminActor } from '@/server/services/admin.service';
import { createAccountSchema } from '@/features/finance/schemas/finance.schema';
import { AccountType } from '@/server/database/models/ChartOfAccount';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, [
      'finance.accounts.view',
      'finance.accounts.manage',
      'finance.journals.create',
      'finance.ledger.view',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const sp = req.nextUrl.searchParams;
    const accountType = (sp.get('accountType') as AccountType) || undefined;
    const includeInactive = sp.get('includeInactive') === 'true';

    const accounts = await accountingService.listAccounts(orgId, { accountType, includeInactive });
    return NextResponse.json(successResponse(accounts, undefined, orgId), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authContext = await requirePermission(req, 'finance.accounts.manage');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const body = await req.json();

    if (body?.action === 'SEED_DEFAULTS') {
      const seeded = await accountingService.seedDefaultChartOfAccounts(orgId, actor);
      return NextResponse.json(successResponse(seeded, undefined, orgId), { status: HTTP_STATUS.CREATED });
    }

    const input = createAccountSchema.parse(body);
    const created = await accountingService.createAccount(orgId, input, actor);
    return NextResponse.json(successResponse(created, undefined, orgId), { status: HTTP_STATUS.CREATED });
  } catch (error) {
    return handleRouteError(error);
  }
}
