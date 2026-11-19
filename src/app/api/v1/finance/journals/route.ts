import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission, requirePermission } from '@/server/authorization/guards';
import { accountingService } from '@/server/services/accounting.service';
import { toAdminActor } from '@/server/services/admin.service';
import { createJournalEntrySchema } from '@/features/finance/schemas/finance.schema';
import { JournalEntryStatus } from '@/server/database/models/JournalEntry';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, [
      'finance.journals.view',
      'finance.journals.create',
      'finance.journals.approve',
      'finance.journals.post',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const sp = req.nextUrl.searchParams;
    const status = (sp.get('status') as JournalEntryStatus) || undefined;
    const periodId = sp.get('periodId') || undefined;
    const referenceType = sp.get('referenceType') || undefined;
    const from = sp.get('from') ? new Date(sp.get('from')!) : undefined;
    const to = sp.get('to') ? new Date(sp.get('to')!) : undefined;
    const page = parseInt(sp.get('page') || '1', 10);
    const limit = parseInt(sp.get('limit') || '25', 10);

    const result = await accountingService.listJournals(
      orgId,
      { status, periodId, referenceType, from, to },
      { page, limit }
    );

    return NextResponse.json(
      successResponse(
        result.journals,
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
    const authContext = await requirePermission(req, 'finance.journals.create');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const body = await req.json();
    const input = createJournalEntrySchema.parse(body);

    const result = await accountingService.createJournalEntry(orgId, input, actor);
    return NextResponse.json(successResponse(result, undefined, orgId), { status: HTTP_STATUS.CREATED });
  } catch (error) {
    return handleRouteError(error);
  }
}
