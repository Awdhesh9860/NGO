import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/server/authorization/guards';
import { accountingService } from '@/server/services/accounting.service';
import { toAdminActor } from '@/server/services/admin.service';
import { updateAccountSchema } from '@/features/finance/schemas/finance.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const authContext = await requirePermission(req, 'finance.accounts.manage');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const body = await req.json();
    const input = updateAccountSchema.parse(body);
    const updated = await accountingService.updateAccount(id, orgId, input, actor);
    return NextResponse.json(successResponse(updated, undefined, orgId), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const authContext = await requirePermission(req, 'finance.accounts.manage');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const result = await accountingService.deleteAccount(id, orgId, actor);
    return NextResponse.json(successResponse(result, undefined, orgId), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}
