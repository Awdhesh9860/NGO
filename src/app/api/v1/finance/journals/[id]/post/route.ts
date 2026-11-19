import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/server/authorization/guards';
import { accountingService } from '@/server/services/accounting.service';
import { toAdminActor } from '@/server/services/admin.service';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const authContext = await requirePermission(req, 'finance.journals.post');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const posted = await accountingService.postJournalEntry(id, orgId, actor);
    return NextResponse.json(successResponse(posted, undefined, orgId), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}
