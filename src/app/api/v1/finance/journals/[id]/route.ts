import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission, requirePermission } from '@/server/authorization/guards';
import { accountingService } from '@/server/services/accounting.service';
import { toAdminActor } from '@/server/services/admin.service';
import { reverseJournalEntrySchema } from '@/features/finance/schemas/finance.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const authContext = await requireAnyPermission(req, [
      'finance.journals.view',
      'finance.ledger.view',
      'finance.journals.approve',
      'finance.journals.post',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const detail = await accountingService.getJournalDetail(id, orgId);
    return NextResponse.json(successResponse(detail, undefined, orgId), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}

/**
 * Traceable Reversal Endpoint: Posted journals cannot be edited or deleted;
 * POST /api/v1/finance/journals/[id] creates and posts a balanced counter-journal.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const authContext = await requirePermission(req, 'finance.journals.post');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const body = await req.json();
    const input = reverseJournalEntrySchema.parse(body);

    const reversed = await accountingService.reverseJournalEntry(id, orgId, input, actor);
    return NextResponse.json(successResponse(reversed, undefined, orgId), { status: HTTP_STATUS.CREATED });
  } catch (error) {
    return handleRouteError(error);
  }
}
