import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { programService } from '@/server/services/program.service';
import { toAdminActor } from '@/server/services/admin.service';
import { updateProgramSchema } from '@/features/programs/schemas/program.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await requireAnyPermission(req, ['programs.view', 'programs.manage']);
    const orgId = authContext.user.organizationId.toString();

    const detail = await programService.getProgramPerformance(id, orgId);
    const p = detail.program;

    return NextResponse.json(
      successResponse(
        {
          program: {
            id: p._id.toString(),
            title: p.title,
            slug: p.slug,
            code: p.code,
            shortDescription: p.shortDescription,
            detailedDescription: p.detailedDescription,
            objectives: p.objectives,
            targetAudience: p.targetAudience,
            focusArea: p.focusArea,
            category: p.category,
            coverImage: p.coverImage,
            gallery: p.gallery,
            startDate: p.startDate,
            endDate: p.endDate,
            programManager: p.programManagerId,
            department: p.departmentId,
            budget: p.budget,
            targetBeneficiaries: p.targetBeneficiaries,
            actualBeneficiaries: p.actualBeneficiaries,
            geographicCoverage: p.geographicCoverage,
            expectedOutcomes: p.expectedOutcomes,
            kpis: p.kpis,
            status: p.status,
            isPublicVisible: p.isPublicVisible,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          },
          projects: detail.projects.map((pr) => ({
            id: pr._id.toString(),
            name: pr.name,
            code: pr.code,
            slug: pr.slug,
            status: pr.status,
            approvedBudget: pr.approvedBudget,
            progressPercentage: pr.progressPercentage,
            targetBeneficiaries: pr.targetBeneficiaries,
            actualBeneficiaries: pr.actualBeneficiaries,
          })),
          approvals: detail.approvals.map((a) => ({
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
          activity: detail.activity.map((l) => ({
            id: l._id.toString(),
            actorName: l.actorName,
            actorRole: l.actorRole,
            action: l.action,
            details: l.details,
            timestamp: l.timestamp,
          })),
          performance: detail.performance,
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
    const authContext = await requireAnyPermission(req, ['programs.update', 'programs.manage', 'programs.approve']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const body = await req.json();
    const validated = updateProgramSchema.parse(body);

    const updated = await programService.updateProgram(id, orgId, validated, actor);

    return NextResponse.json(
      successResponse(
        {
          id: updated._id.toString(),
          title: updated.title,
          status: updated.status,
          isPublicVisible: updated.isPublicVisible,
          updatedAt: updated.updatedAt,
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
    const authContext = await requireAnyPermission(req, ['programs.archive', 'programs.manage']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const archived = await programService.archiveProgram(id, orgId, actor);

    return NextResponse.json(
      successResponse(
        {
          id: archived._id.toString(),
          status: archived.status,
          message: 'Program archived safely',
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
