import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { checkRolePermission } from '@/server/authorization/permissions';
import { projectService } from '@/server/services/project.service';
import { toAdminActor } from '@/server/services/admin.service';
import { createTaskSchema } from '@/features/tasks/schemas/task.schema';
import { TaskStatus, TaskPriority } from '@/server/database/models/Task';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, [
      'tasks.view',
      'tasks.assign_manage',
      'tasks.update_assigned',
    ]);
    const orgId = authContext.user.organizationId.toString();

    const canViewAllTasks =
      authContext.user.role === 'SUPER_ADMIN' ||
      checkRolePermission(authContext.user.role, 'tasks.assign_manage') ||
      checkRolePermission(authContext.user.role, 'projects.view');

    const sp = req.nextUrl.searchParams;
    const page = parseInt(sp.get('page') || '1', 10);
    const limit = parseInt(sp.get('limit') || '25', 10);
    const projectId = sp.get('projectId') || undefined;
    const status = (sp.get('status') as TaskStatus) || undefined;
    const priority = (sp.get('priority') as TaskPriority) || undefined;
    const assignedUserId = canViewAllTasks
      ? sp.get('assignedUserId') || undefined
      : authContext.user._id.toString();
    const overdueOnly = sp.get('overdueOnly') === 'true';
    const search = sp.get('search') || undefined;

    const result = await projectService.listTasks(
      orgId,
      { projectId, status, priority, assignedUserId, overdueOnly, search },
      { page, limit }
    );

    const data = result.tasks.map((t) => ({
      id: t._id.toString(),
      title: t.title,
      description: t.description,
      project: t.projectId,
      assignedUser: t.assignedUserId,
      createdBy: t.createdBy,
      priority: t.priority,
      startDate: t.startDate,
      dueDate: t.dueDate,
      estimatedEffortHours: t.estimatedEffortHours,
      actualEffortHours: t.actualEffortHours,
      status: t.status,
      completionPercentage: t.completionPercentage,
      attachments: t.attachments,
      comments: t.comments,
      completedAt: t.completedAt,
      createdAt: t.createdAt,
    }));

    return NextResponse.json(
      successResponse(
        data,
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
    const authContext = await requireAnyPermission(req, ['tasks.create', 'tasks.assign_manage']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const body = await req.json();
    const validated = createTaskSchema.parse(body);

    const created = await projectService.createTask(orgId, validated, actor);

    return NextResponse.json(
      successResponse(
        {
          id: created._id.toString(),
          title: created.title,
          status: created.status,
          priority: created.priority,
          dueDate: created.dueDate,
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
