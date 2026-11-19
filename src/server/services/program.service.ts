import mongoose from 'mongoose';
import { programRepository, ProgramFilterOptions } from '@/server/repositories/program.repository';
import { projectRepository } from '@/server/repositories/project.repository';
import { userRepository } from '@/server/repositories/user.repository';
import { departmentRepository } from '@/server/repositories/department.repository';
import { projectOperationsRepository } from '@/server/repositories/project-operations.repository';
import { organizationRepository } from '@/server/repositories/organization.repository';
import { auditRepository } from '@/server/repositories/audit.repository';
import { IProgramDocument, ProgramStatus } from '@/server/database/models/Program';
import { ProjectBudgetEntry } from '@/server/database/models/ProjectBudgetEntry';
import { Project } from '@/server/database/models/Project';
import { adminService, AdminActor } from '@/server/services/admin.service';
import { checkRolePermission } from '@/server/authorization/permissions';
import { emailProvider } from '@/integrations/email/nodemailer.provider';
import {
  renderApprovalRequestEmail,
  renderApprovalDecisionEmail,
} from '@/integrations/email/templates';
import {
  ConflictError,
  NotFoundError,
  AuthorizationError,
  ValidationError,
} from '@/lib/error-handler';
import { CreateProgramInput, UpdateProgramInput } from '@/features/programs/schemas/program.schema';
import { SubmitApprovalInput, DecideApprovalInput } from '@/features/project-approvals/schemas/approval.schema';
import connectToDatabase from '@/server/database/connection';

export const PROGRAM_STATUS_TRANSITIONS: Record<ProgramStatus, ProgramStatus[]> = {
  DRAFT: ['PENDING_APPROVAL', 'ARCHIVED'],
  PENDING_APPROVAL: ['APPROVED', 'REJECTED', 'DRAFT'],
  REJECTED: ['DRAFT', 'PENDING_APPROVAL', 'ARCHIVED'],
  APPROVED: ['ACTIVE', 'ON_HOLD', 'ARCHIVED'],
  ACTIVE: ['ON_HOLD', 'COMPLETED', 'ARCHIVED'],
  ON_HOLD: ['ACTIVE', 'COMPLETED', 'ARCHIVED'],
  COMPLETED: ['ARCHIVED'],
  ARCHIVED: [],
};

export function assertValidProgramTransition(
  current: ProgramStatus,
  next: ProgramStatus,
  actor: AdminActor
): void {
  if (current === next) return;

  const allowed = PROGRAM_STATUS_TRANSITIONS[current] || [];
  if (!allowed.includes(next)) {
    throw new ValidationError(
      `Invalid program lifecycle transition from "${current}" to "${next}". Allowed next states: ${
        allowed.length > 0 ? allowed.join(', ') : 'none'
      }`
    );
  }

  if (
    (next === 'APPROVED' || next === 'REJECTED') &&
    actor.role !== 'SUPER_ADMIN' &&
    !checkRolePermission(actor.role, 'programs.approve')
  ) {
    throw new AuthorizationError('Missing programs.approve permission to approve or reject programs');
  }

  if (
    next === 'ARCHIVED' &&
    actor.role !== 'SUPER_ADMIN' &&
    !checkRolePermission(actor.role, 'programs.archive')
  ) {
    throw new AuthorizationError('Missing programs.archive permission to archive programs');
  }
}

/**
 * Strips all internal financial budgets, internal manager emails, and non-public metadata.
 */
export function toPublicProgramDTO(program: IProgramDocument) {
  return {
    id: program._id.toString(),
    title: program.title,
    slug: program.slug,
    code: program.code,
    category: program.category,
    focusArea: program.focusArea,
    shortDescription: program.shortDescription,
    detailedDescription: program.detailedDescription,
    objectives: program.objectives || [],
    targetAudience: program.targetAudience,
    geographicCoverage: program.geographicCoverage || [],
    expectedOutcomes: program.expectedOutcomes || [],
    targetBeneficiaries: program.targetBeneficiaries,
    actualBeneficiaries: program.actualBeneficiaries,
    coverImage: program.coverImage,
    gallery: program.gallery || [],
    status: program.status,
    startDate: program.startDate,
    endDate: program.endDate,
  };
}

export class ProgramService {
  async listPrograms(
    organizationId: string,
    filter: ProgramFilterOptions = {},
    pagination: { page?: number; limit?: number } = {}
  ) {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(100, Math.max(1, pagination.limit || 20));
    const [programs, total] = await Promise.all([
      programRepository.findMany(organizationId, filter, { page, limit }),
      programRepository.count(organizationId, filter),
    ]);
    return {
      programs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getProgramById(id: string, organizationId: string) {
    const program = await programRepository.findById(id, organizationId);
    if (!program) {
      throw new NotFoundError('Program not found in this organization');
    }
    return program;
  }

  async getProgramPerformance(id: string, organizationId: string) {
    const program = await this.getProgramById(id, organizationId);
    await connectToDatabase();
    const orgObjId = new mongoose.Types.ObjectId(organizationId);
    const progObjId = new mongoose.Types.ObjectId(id);

    const [projects, approvals, activity] = await Promise.all([
      projectRepository.findMany(organizationId, { programId: id, includeArchived: true }, { page: 1, limit: 100 }),
      projectOperationsRepository.findApprovalsByEntity(organizationId, 'PROGRAM', id),
      auditRepository.findMany(organizationId, { resource: 'Program' }, { page: 1, limit: 25 }),
    ]);

    const projectIds = projects.map((p) => p._id);
    let totalPlannedExpenditure = 0;
    let totalActualExpenditure = 0;

    if (projectIds.length > 0) {
      const budgetRollup = await ProjectBudgetEntry.aggregate([
        { $match: { organizationId: orgObjId, projectId: { $in: projectIds } } },
        {
          $group: {
            _id: null,
            planned: { $sum: '$plannedAmount' },
            actual: { $sum: '$actualAmount' },
          },
        },
      ]);
      if (budgetRollup[0]) {
        totalPlannedExpenditure = budgetRollup[0].planned || 0;
        totalActualExpenditure = budgetRollup[0].actual || 0;
      }
    }

    const allocatedProjectBudgets = projects.reduce((sum, p) => sum + (p.approvedBudget || 0), 0);
    const totalActualBeneficiaries = projects.reduce((sum, p) => sum + (p.actualBeneficiaries || 0), 0);
    const utilizationPercentage =
      program.budget > 0 ? Math.round((totalActualExpenditure / program.budget) * 10000) / 100 : 0;

    return {
      program,
      projects,
      approvals,
      activity: activity.filter((a) => a.resourceId === progObjId.toString()),
      performance: {
        projectCount: projects.length,
        activeProjectCount: projects.filter((p) => p.status === 'ACTIVE').length,
        completedProjectCount: projects.filter((p) => p.status === 'COMPLETED').length,
        programBudget: program.budget,
        allocatedProjectBudgets,
        totalPlannedExpenditure,
        totalActualExpenditure,
        remainingProgramBudget: program.budget - totalActualExpenditure,
        utilizationPercentage,
        targetBeneficiaries: program.targetBeneficiaries,
        actualBeneficiaries: Math.max(program.actualBeneficiaries, totalActualBeneficiaries),
      },
    };
  }

  async createProgram(
    organizationId: string,
    input: CreateProgramInput,
    actor: AdminActor
  ): Promise<IProgramDocument> {
    const normalizedSlug = input.slug.toLowerCase().trim();
    const normalizedCode = input.code.toUpperCase().trim();

    const duplicate = await programRepository.findBySlugOrCode(organizationId, normalizedSlug, normalizedCode);
    if (duplicate) {
      throw new ConflictError(
        `A program with slug "${normalizedSlug}" or code "${normalizedCode}" already exists in this organization`
      );
    }

    // Validate manager belongs to same active tenant
    let programManagerId: mongoose.Types.ObjectId | undefined;
    if (input.programManagerId) {
      const mgr = await userRepository.findById(input.programManagerId);
      if (!mgr || mgr.organizationId.toString() !== organizationId || mgr.status !== 'active') {
        throw new ValidationError('Assigned program manager must be an active user in this organization');
      }
      programManagerId = new mongoose.Types.ObjectId(input.programManagerId);
    }

    // Validate department belongs to same tenant
    let departmentId: mongoose.Types.ObjectId | undefined;
    if (input.departmentId) {
      const dept = await departmentRepository.findById(input.departmentId, organizationId);
      if (!dept) {
        throw new ValidationError('Assigned department does not exist in this organization');
      }
      departmentId = new mongoose.Types.ObjectId(input.departmentId);
    }

    // Draft programs cannot be publicly visible immediately
    const created = await programRepository.create({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      title: input.title,
      slug: normalizedSlug,
      code: normalizedCode,
      shortDescription: input.shortDescription,
      detailedDescription: input.detailedDescription,
      objectives: input.objectives,
      targetAudience: input.targetAudience,
      focusArea: input.focusArea,
      category: input.category,
      coverImage: input.coverImage || undefined,
      gallery: input.gallery,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      programManagerId,
      departmentId,
      budget: input.budget,
      targetBeneficiaries: input.targetBeneficiaries,
      actualBeneficiaries: input.actualBeneficiaries,
      geographicCoverage: input.geographicCoverage,
      expectedOutcomes: input.expectedOutcomes,
      kpis: input.kpis,
      status: 'DRAFT',
      isPublicVisible: false,
      createdBy: new mongoose.Types.ObjectId(actor.id),
    });

    await adminService.logAudit(
      actor,
      'PROGRAM_CREATE',
      'Program',
      created._id.toString(),
      `Created program "${created.title}" (${created.code})`,
      { code: created.code, category: created.category, status: created.status }
    );

    return created;
  }

  async updateProgram(
    id: string,
    organizationId: string,
    input: UpdateProgramInput,
    actor: AdminActor
  ): Promise<IProgramDocument> {
    const existing = await this.getProgramById(id, organizationId);

    if (input.status && input.status !== existing.status) {
      assertValidProgramTransition(existing.status, input.status, actor);
    }

    const effectiveStatus = input.status || existing.status;
    if (
      input.isPublicVisible === true &&
      !['APPROVED', 'ACTIVE', 'COMPLETED'].includes(effectiveStatus)
    ) {
      throw new ValidationError(
        'Only APPROVED, ACTIVE, or COMPLETED programs can be marked visible on the public website'
      );
    }

    if (input.slug || input.code) {
      const dup = await programRepository.findBySlugOrCode(
        organizationId,
        input.slug?.toLowerCase().trim(),
        input.code?.toUpperCase().trim()
      );
      if (dup && dup._id.toString() !== id) {
        throw new ConflictError('Another program already uses this slug or code in this organization');
      }
    }

    const updates: Record<string, unknown> = {
      updatedBy: new mongoose.Types.ObjectId(actor.id),
    };

    const scalarFields = [
      'title',
      'shortDescription',
      'detailedDescription',
      'objectives',
      'targetAudience',
      'focusArea',
      'category',
      'gallery',
      'budget',
      'targetBeneficiaries',
      'actualBeneficiaries',
      'geographicCoverage',
      'expectedOutcomes',
      'kpis',
      'status',
      'isPublicVisible',
    ] as const;

    for (const field of scalarFields) {
      if (input[field] !== undefined) {
        updates[field] = input[field];
      }
    }

    if (input.slug) updates.slug = input.slug.toLowerCase().trim();
    if (input.code) updates.code = input.code.toUpperCase().trim();
    if (input.coverImage !== undefined) updates.coverImage = input.coverImage || undefined;
    if (input.startDate !== undefined) updates.startDate = input.startDate ? new Date(input.startDate) : undefined;
    if (input.endDate !== undefined) updates.endDate = input.endDate ? new Date(input.endDate) : undefined;

    if (input.programManagerId !== undefined) {
      if (input.programManagerId) {
        const mgr = await userRepository.findById(input.programManagerId);
        if (!mgr || mgr.organizationId.toString() !== organizationId || mgr.status !== 'active') {
          throw new ValidationError('Assigned program manager must be an active user in this organization');
        }
        updates.programManagerId = new mongoose.Types.ObjectId(input.programManagerId);
      } else {
        updates.programManagerId = undefined;
      }
    }

    if (input.departmentId !== undefined) {
      if (input.departmentId) {
        const dept = await departmentRepository.findById(input.departmentId, organizationId);
        if (!dept) {
          throw new ValidationError('Assigned department does not exist in this organization');
        }
        updates.departmentId = new mongoose.Types.ObjectId(input.departmentId);
      } else {
        updates.departmentId = undefined;
      }
    }

    // Automatically unpublish if moved to ARCHIVED or REJECTED
    if (effectiveStatus === 'ARCHIVED' || effectiveStatus === 'REJECTED') {
      updates.isPublicVisible = false;
    }

    const updated = await programRepository.update(id, organizationId, updates as Partial<IProgramDocument>);
    if (!updated) throw new NotFoundError('Program not found');

    await adminService.logAudit(
      actor,
      input.status && input.status !== existing.status ? 'PROGRAM_STATUS_CHANGE' : 'PROGRAM_UPDATE',
      'Program',
      id,
      `Updated program "${updated.title}"${
        input.status && input.status !== existing.status
          ? ` (${existing.status} -> ${input.status})`
          : ''
      }`,
      { previousStatus: existing.status, newStatus: updated.status }
    );

    return updated;
  }

  async archiveProgram(id: string, organizationId: string, actor: AdminActor): Promise<IProgramDocument> {
    return this.updateProgram(id, organizationId, { status: 'ARCHIVED', isPublicVisible: false }, actor);
  }

  async submitProgramForApproval(
    programId: string,
    organizationId: string,
    input: SubmitApprovalInput,
    actor: AdminActor
  ) {
    const program = await this.getProgramById(programId, organizationId);
    if (!['DRAFT', 'REJECTED'].includes(program.status)) {
      throw new ValidationError(`Only DRAFT or REJECTED programs can be submitted for approval (current: ${program.status})`);
    }

    let approverEmail: string | undefined;
    let approverName = 'Approving Authority';
    let assignedApproverId: mongoose.Types.ObjectId | undefined;

    if (input.assignedApproverId) {
      if (input.assignedApproverId === actor.id) {
        throw new ValidationError('You cannot assign yourself as the approver for your own submission');
      }
      const approver = await userRepository.findById(input.assignedApproverId);
      if (!approver || approver.organizationId.toString() !== organizationId || approver.status !== 'active') {
        throw new ValidationError('Assigned approver must be an active user in this organization');
      }
      assignedApproverId = new mongoose.Types.ObjectId(input.assignedApproverId);
      approverEmail = approver.email;
      approverName = approver.name;
    }

    const previousApprovals = await projectOperationsRepository.findApprovalsByEntity(
      organizationId,
      'PROGRAM',
      programId
    );
    const revisionCount = previousApprovals.length + 1;
    const isResubmission = program.status === 'REJECTED';

    await programRepository.update(programId, organizationId, {
      status: 'PENDING_APPROVAL',
      updatedBy: new mongoose.Types.ObjectId(actor.id),
    });

    const approval = await projectOperationsRepository.createApproval({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      entityType: 'PROGRAM',
      entityId: new mongoose.Types.ObjectId(programId),
      entityTitle: program.title,
      submittedBy: new mongoose.Types.ObjectId(actor.id),
      assignedApproverId,
      stage: input.stage,
      status: 'PENDING',
      submissionNotes: input.submissionNotes,
      revisionCount,
      history: [
        {
          action: isResubmission ? 'RESUBMITTED' : 'SUBMITTED',
          actorId: new mongoose.Types.ObjectId(actor.id),
          actorName: actor.name,
          actorRole: actor.role,
          comments: input.submissionNotes,
          timestamp: new Date(),
        },
      ],
    });

    await adminService.logAudit(
      actor,
      'PROGRAM_APPROVAL_SUBMIT',
      'Program',
      programId,
      `Submitted program "${program.title}" for approval (revision #${revisionCount})`
    );

    if (approverEmail) {
      const org = await organizationRepository.findById(organizationId);
      if (org?.notificationSettings?.emailNotifications !== false) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const tpl = renderApprovalRequestEmail({
          approverName,
          entityType: 'PROGRAM',
          entityTitle: program.title,
          submittedBy: actor.name,
          notes: input.submissionNotes,
          reviewUrl: `${appUrl}/dashboard/admin/programs/${programId}`,
        });
        await emailProvider.sendEmail({
          to: approverEmail,
          subject: tpl.subject,
          htmlContent: tpl.html,
          textContent: tpl.text,
        });
      }
    }

    return approval;
  }

  async decideProgramApproval(
    programId: string,
    organizationId: string,
    input: DecideApprovalInput,
    actor: AdminActor
  ) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'programs.approve')) {
      throw new AuthorizationError('Missing programs.approve permission');
    }

    const program = await this.getProgramById(programId, organizationId);
    const approval = await projectOperationsRepository.findApprovalById(input.approvalId, organizationId);
    if (!approval || approval.entityType !== 'PROGRAM' || approval.entityId.toString() !== programId) {
      throw new NotFoundError('Approval request not found for this program');
    }
    if (approval.status !== 'PENDING' && approval.status !== 'UNDER_REVIEW') {
      throw new ValidationError(`Approval request has already been decided (${approval.status})`);
    }

    const submitterId =
      typeof approval.submittedBy === 'object' && '_id' in approval.submittedBy
        ? approval.submittedBy._id.toString()
        : (approval.submittedBy as mongoose.Types.ObjectId).toString();

    if (submitterId === actor.id) {
      throw new AuthorizationError('Submitters cannot approve or reject their own submission');
    }

    if (input.decision === 'REJECTED' && !input.rejectionReason?.trim()) {
      throw new ValidationError('Rejection reason is required when rejecting a program');
    }

    const nextProgramStatus: ProgramStatus = input.decision === 'APPROVED' ? 'APPROVED' : 'REJECTED';

    const updatedApproval = await projectOperationsRepository.updateApproval(input.approvalId, organizationId, {
      $set: {
        status: input.decision,
        decisionComments: input.comments,
        rejectionReason: input.decision === 'REJECTED' ? input.rejectionReason : undefined,
        decidedBy: new mongoose.Types.ObjectId(actor.id),
        decidedAt: new Date(),
      },
      $push: {
        history: {
          action: input.decision,
          actorId: new mongoose.Types.ObjectId(actor.id),
          actorName: actor.name,
          actorRole: actor.role,
          comments: input.rejectionReason || input.comments,
          timestamp: new Date(),
        },
      },
    });

    await programRepository.update(programId, organizationId, {
      status: nextProgramStatus,
      updatedBy: new mongoose.Types.ObjectId(actor.id),
    });

    await adminService.logAudit(
      actor,
      input.decision === 'APPROVED' ? 'PROGRAM_APPROVED' : 'PROGRAM_REJECTED',
      'Program',
      programId,
      `${input.decision} program "${program.title}"`,
      { decision: input.decision, approvalId: input.approvalId }
    );

    const submitter = await userRepository.findById(submitterId);
    if (submitter) {
      const org = await organizationRepository.findById(organizationId);
      if (org?.notificationSettings?.emailNotifications !== false) {
        const tpl = renderApprovalDecisionEmail({
          submitterName: submitter.name,
          entityType: 'PROGRAM',
          entityTitle: program.title,
          decision: input.decision,
          decidedBy: actor.name,
          comments: input.rejectionReason || input.comments,
        });
        await emailProvider.sendEmail({
          to: submitter.email,
          subject: tpl.subject,
          htmlContent: tpl.html,
          textContent: tpl.text,
        });
      }
    }

    return updatedApproval;
  }

  async listPublicPrograms(organizationId?: string) {
    const programs = await programRepository.findPublicPublished(organizationId);
    return programs.map(toPublicProgramDTO);
  }

  async getPublicProgramBySlug(slug: string, organizationId?: string) {
    const program = await programRepository.findPublicBySlug(slug, organizationId);
    if (!program) return null;

    await connectToDatabase();
    const linkedProjects = await Project.find({
      organizationId: program.organizationId,
      programId: program._id,
      isPublicVisible: true,
      isDeleted: { $ne: true },
      status: { $in: ['APPROVED', 'PLANNED', 'ACTIVE', 'COMPLETED'] },
    }).sort({ createdAt: -1 });

    return {
      program: toPublicProgramDTO(program),
      projects: linkedProjects.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        slug: p.slug,
        category: p.category,
        shortDescription: p.shortDescription,
        location: p.location || [p.district, p.state].filter(Boolean).join(', '),
        status: p.status,
        progressPercentage: p.progressPercentage,
        targetBeneficiaries: p.targetBeneficiaries,
        actualBeneficiaries: p.actualBeneficiaries,
        images: p.images || [],
      })),
    };
  }
}

export const programService = new ProgramService();
