import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { programService } from '@/server/services/program.service';
import { projectOperationsRepository } from '@/server/repositories/project-operations.repository';
import { toAdminActor } from '@/server/services/admin.service';
import {
  submitApprovalSchema,
  decideApprovalSchema,
} from '@/features/project-approvals/schemas/approval.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await requireAnyPermission(req, ['programs.view', 'programs.approve']);
    const orgId = authContext.user.organizationId.toString();

    await programService.getProgramById(id, orgId);
    const approvals = await projectOperationsRepository.findApprovalsByEntity(orgId, 'PROGRAM', id);

    return NextResponse.json(
      successResponse(
        approvals.map((a) => ({
          id: a._id.toString(),
          stage: a.stage,
          status: a.status,
          submittedBy: a.submittedBy,
          assignedApproverId: a.assignedApproverId,
          decidedBy: a.decidedBy,
          submissionNotes: a.submissionNotes,
          decisionComments: a.decisionComments,
          rejectionReason: a.rejectionReason,
          revisionCount: a.revisionCount,
          history: a.history,
          createdAt: a.createdAt,
          decidedAt: a.decidedAt,
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
    const authContext = await requireAnyPermission(req, ['programs.update', 'programs.create', 'programs.manage']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const body = await req.json();
    const validated = submitApprovalSchema.parse(body);

    const approval = await programService.submitProgramForApproval(id, orgId, validated, actor);

    return NextResponse.json(
      successResponse(
        {
          id: approval._id.toString(),
          status: approval.status,
          stage: approval.stage,
          revisionCount: approval.revisionCount,
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
    const authContext = await requireAnyPermission(req, ['programs.approve']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const body = await req.json();
    const validated = decideApprovalSchema.parse(body);

    const decided = await programService.decideProgramApproval(id, orgId, validated, actor);

    return NextResponse.json(
      successResponse(
        {
          id: decided?._id.toString(),
          status: decided?.status,
          decisionComments: decided?.decisionComments,
          rejectionReason: decided?.rejectionReason,
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
