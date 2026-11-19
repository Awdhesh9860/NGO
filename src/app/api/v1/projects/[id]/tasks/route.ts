import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { projectService } from '@/server/services/project.service';
import { toAdminActor } from '@/server/services/admin.service';
import { createTaskSchema } from '@/features/tasks/schemas/task.schema';
import { TaskStatus, TaskPriority } from '@/server/database/models/Task';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await requireAnyPermission(req, ['tasks.view', 'projects.view', 'projects.view_assigned']);
    const orgId = authContext.user.organizationId.toString();

    await projectService.getProjectById(id, orgId, toAdminActor(authContext.user, req));

    const sp = req.nextUrl.searchParams;
    const status = (sp.get('status') as TaskStatus) || undefined;
    const priority = (sp.get('priority') as TaskPriority) || undefined;
    const assignedUserId = sp.get('assignedUserId') || undefined;
    const overdueOnly = sp.get('overdueOnly') === 'true';

    const result = await projectService.listTasks(
      orgId,
      { projectId: id, status, priority, assignedUserId, overdueOnly },
      { page: 1, limit: 100 }
    );

    return NextResponse.json(
      successResponse(
        result.tasks.map((t) => ({
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
          commentsCount: t.comments?.length || 0,
          createdAt: t.createdAt,
        })),
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
    const authContext = await requireAnyPermission(req, ['tasks.create', 'tasks.assign_manage']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const body = await req.json();
    const validated = createTaskSchema.parse({ ...body, projectId: id });

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
