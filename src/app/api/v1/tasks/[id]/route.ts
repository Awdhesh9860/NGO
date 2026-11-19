import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { projectService } from '@/server/services/project.service';
import { toAdminActor } from '@/server/services/admin.service';
import { updateTaskSchema } from '@/features/tasks/schemas/task.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await requireAnyPermission(req, [
      'tasks.view',
      'tasks.assign_manage',
      'tasks.update_assigned',
    ]);
    const orgId = authContext.user.organizationId.toString();

    const task = await projectService.getTaskById(id, orgId);

    return NextResponse.json(
      successResponse(
        {
          id: task._id.toString(),
          title: task.title,
          description: task.description,
          project: task.projectId,
          assignedUser: task.assignedUserId,
          createdBy: task.createdBy,
          priority: task.priority,
          startDate: task.startDate,
          dueDate: task.dueDate,
          estimatedEffortHours: task.estimatedEffortHours,
          actualEffortHours: task.actualEffortHours,
          status: task.status,
          completionPercentage: task.completionPercentage,
          attachments: task.attachments,
          comments: task.comments,
          completedAt: task.completedAt,
          createdAt: task.createdAt,
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

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await requireAnyPermission(req, ['tasks.assign_manage', 'tasks.update_assigned']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const body = await req.json();
    const validated = updateTaskSchema.parse(body);

    const updated = await projectService.updateTask(id, orgId, validated, actor);

    return NextResponse.json(
      successResponse(
        {
          id: updated._id.toString(),
          title: updated.title,
          status: updated.status,
          priority: updated.priority,
          completionPercentage: updated.completionPercentage,
          actualEffortHours: updated.actualEffortHours,
          assignedUser: updated.assignedUserId,
          comments: updated.comments,
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
    const authContext = await requireAnyPermission(req, ['tasks.assign_manage']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    await projectService.deleteTask(id, orgId, actor);
    return NextResponse.json(successResponse({ deleted: true, id }, undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
