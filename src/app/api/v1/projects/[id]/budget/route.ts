import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { projectService } from '@/server/services/project.service';
import { toAdminActor } from '@/server/services/admin.service';
import {
  createBudgetEntrySchema,
  updateBudgetEntrySchema,
} from '@/features/project-budget/schemas/budget.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError, ValidationError } from '@/server/errors';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await requireAnyPermission(req, ['project_budget.view', 'project_budget.manage']);
    const orgId = authContext.user.organizationId.toString();

    const { entries, summary } = await projectService.getProjectBudget(id, orgId);

    return NextResponse.json(
      successResponse(
        {
          summary,
          entries: entries.map((e) => ({
            id: e._id.toString(),
            budgetPeriod: e.budgetPeriod,
            category: e.category,
            description: e.description,
            plannedAmount: e.plannedAmount,
            actualAmount: e.actualAmount,
            variance: e.plannedAmount - e.actualAmount,
            notes: e.notes,
            recordedBy: e.recordedBy,
            createdAt: e.createdAt,
          })),
        },
        undefined,
        orgId
      ),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await requireAnyPermission(req, ['project_budget.manage']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const body = await req.json();
    const validated = createBudgetEntrySchema.parse(body);

    const created = await projectService.createBudgetEntry(id, orgId, validated, actor);

    return NextResponse.json(
      successResponse(
        {
          id: created._id.toString(),
          category: created.category,
          plannedAmount: created.plannedAmount,
          actualAmount: created.actualAmount,
        },
        undefined,
        orgId
      ),
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await requireAnyPermission(req, ['project_budget.manage']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const body = await req.json();
    const entryId = body.entryId as string;
    if (!entryId) throw new ValidationError('entryId is required');

    const validated = updateBudgetEntrySchema.parse(body);
    const updated = await projectService.updateBudgetEntry(id, entryId, orgId, validated, actor);

    return NextResponse.json(
      successResponse(
        {
          id: updated._id.toString(),
          category: updated.category,
          plannedAmount: updated.plannedAmount,
          actualAmount: updated.actualAmount,
        },
        undefined,
        orgId
      ),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await requireAnyPermission(req, ['project_budget.manage']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const entryId = req.nextUrl.searchParams.get('entryId');
    if (!entryId) throw new ValidationError('entryId query parameter is required');

    await projectService.deleteBudgetEntry(id, entryId, orgId, actor);
    return NextResponse.json(successResponse({ deleted: true, entryId }, undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
