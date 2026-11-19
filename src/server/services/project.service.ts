import mongoose from 'mongoose';
import { projectRepository, ProjectFilterOptions } from '@/server/repositories/project.repository';
import { programRepository } from '@/server/repositories/program.repository';
import { taskRepository, TaskFilterOptions } from '@/server/repositories/task.repository';
import { milestoneRepository, MilestoneFilterOptions } from '@/server/repositories/milestone.repository';
import { projectOperationsRepository } from '@/server/repositories/project-operations.repository';
import { userRepository } from '@/server/repositories/user.repository';
import { departmentRepository } from '@/server/repositories/department.repository';
import { organizationRepository } from '@/server/repositories/organization.repository';
import { auditRepository } from '@/server/repositories/audit.repository';
import { IProjectDocument, ProjectStatus } from '@/server/database/models/Project';
import { Program } from '@/server/database/models/Program';
import { Project } from '@/server/database/models/Project';
import { Task, ITaskDocument } from '@/server/database/models/Task';
import { ProjectMilestone, IProjectMilestoneDocument } from '@/server/database/models/ProjectMilestone';
import { ProjectBudgetEntry, IProjectBudgetEntryDocument } from '@/server/database/models/ProjectBudgetEntry';
import { ProjectApproval } from '@/server/database/models/ProjectApproval';
import { ProjectRisk } from '@/server/database/models/ProjectRisk';
import { ProjectDocument } from '@/server/database/models/ProjectDocument';
import { Department } from '@/server/database/models/Department';
import { adminService, AdminActor } from '@/server/services/admin.service';
import { checkRolePermission } from '@/server/authorization/permissions';
import { emailProvider } from '@/integrations/email/nodemailer.provider';
import {
  renderProjectAssignmentEmail,
  renderTaskAssignmentEmail,
  renderApprovalRequestEmail,
  renderApprovalDecisionEmail,
} from '@/integrations/email/templates';
import { storageProvider, validateDocumentFile } from '@/integrations/storage/local.provider';
import {
  ConflictError,
  NotFoundError,
  AuthorizationError,
  ValidationError,
} from '@/lib/error-handler';
import {
  CreateProjectInput,
  UpdateProjectInput,
  AssignProjectTeamMemberInput,
  CreateProjectRiskInput,
  UpdateProjectRiskInput,
} from '@/features/projects/schemas/project.schema';
import { CreateTaskInput, UpdateTaskInput } from '@/features/tasks/schemas/task.schema';
import { CreateMilestoneInput, UpdateMilestoneInput } from '@/features/milestones/schemas/milestone.schema';
import { SubmitApprovalInput, DecideApprovalInput } from '@/features/project-approvals/schemas/approval.schema';
import { CreateBudgetEntryInput, UpdateBudgetEntryInput } from '@/features/project-budget/schemas/budget.schema';
import { CreateProjectDocumentInput } from '@/features/project-documents/schemas/document.schema';
import connectToDatabase from '@/server/database/connection';

export const PROJECT_STATUS_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  DRAFT: ['PENDING_APPROVAL', 'CANCELLED', 'ARCHIVED'],
  PENDING_APPROVAL: ['APPROVED', 'DRAFT', 'CANCELLED'],
  APPROVED: ['PLANNED', 'ACTIVE', 'ON_HOLD', 'CANCELLED', 'ARCHIVED'],
  PLANNED: ['ACTIVE', 'ON_HOLD', 'CANCELLED', 'ARCHIVED'],
  ACTIVE: ['ON_HOLD', 'COMPLETED', 'CANCELLED', 'ARCHIVED'],
  ON_HOLD: ['ACTIVE', 'PLANNED', 'CANCELLED', 'ARCHIVED'],
  COMPLETED: ['ARCHIVED'],
  CANCELLED: ['DRAFT', 'ARCHIVED'],
  ARCHIVED: [],
};

export function assertValidProjectTransition(
  current: ProjectStatus,
  next: ProjectStatus,
  actor: AdminActor
): void {
  if (current === next) return;

  const allowed = PROJECT_STATUS_TRANSITIONS[current] || [];
  if (!allowed.includes(next)) {
    throw new ValidationError(
      `Invalid project lifecycle transition from "${current}" to "${next}". Allowed next states: ${
        allowed.length > 0 ? allowed.join(', ') : 'none'
      }`
    );
  }

  if (
    (next === 'APPROVED' || next === 'CANCELLED' || next === 'COMPLETED') &&
    actor.role !== 'SUPER_ADMIN' &&
    !checkRolePermission(actor.role, 'projects.approve')
  ) {
    throw new AuthorizationError(
      `Missing projects.approve permission to transition project to "${next}"`
    );
  }

  if (
    next === 'ARCHIVED' &&
    actor.role !== 'SUPER_ADMIN' &&
    !checkRolePermission(actor.role, 'projects.archive')
  ) {
    throw new AuthorizationError('Missing projects.archive permission to archive projects');
  }
}

const PII_DETECTION_PATTERNS = [
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, // email
  /\b\d{4}\s?\d{4}\s?\d{4}\b/, // Aadhaar-like 12-digit number
  /\b[A-Z]{5}\d{4}[A-Z]\b/, // PAN
  /\b(?:\+91[\s-]?)?[6-9]\d{9}\b/, // Indian mobile phone
];

/**
 * Safeguarding check: ensures aggregated beneficiary summary notes/labels never store PII.
 */
export function assertSafeBeneficiarySummary(summary?: {
  participationNotes?: string;
  outcomeSummary?: string;
  demographics?: Array<{ groupLabel: string; count: number }>;
}): void {
  if (!summary) return;
  const fieldsToScan = [
    summary.participationNotes || '',
    summary.outcomeSummary || '',
    ...(summary.demographics || []).map((d) => d.groupLabel),
  ];

  for (const text of fieldsToScan) {
    for (const pattern of PII_DETECTION_PATTERNS) {
      if (pattern.test(text)) {
        throw new ValidationError(
          'Beneficiary summaries must contain aggregated non-identifying data only. Personal identifiers (email, phone, PAN, or government ID numbers) are prohibited.'
        );
      }
    }
  }
}

/**
 * Pure deterministic budget rollup from persisted ProjectBudgetEntry records.
 */
export function calculateProjectBudgetSummary(
  approvedBudget: number,
  entries: Array<Pick<IProjectBudgetEntryDocument, 'category' | 'plannedAmount' | 'actualAmount'>>
) {
  const totalPlanned = entries.reduce((sum, e) => sum + (Number(e.plannedAmount) || 0), 0);
  const totalActual = entries.reduce((sum, e) => sum + (Number(e.actualAmount) || 0), 0);
  const remainingBudget = approvedBudget - totalActual;
  const remainingPlanned = totalPlanned - totalActual;
  const utilizationPercentage =
    approvedBudget > 0 ? Math.round((totalActual / approvedBudget) * 10000) / 100 : 0;
  const plannedUtilizationPercentage =
    totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 10000) / 100 : 0;

  const categoryMap = new Map<string, { category: string; plannedAmount: number; actualAmount: number; variance: number }>();
  for (const e of entries) {
    const existing = categoryMap.get(e.category) || {
      category: e.category,
      plannedAmount: 0,
      actualAmount: 0,
      variance: 0,
    };
    existing.plannedAmount += Number(e.plannedAmount) || 0;
    existing.actualAmount += Number(e.actualAmount) || 0;
    existing.variance = existing.plannedAmount - existing.actualAmount;
    categoryMap.set(e.category, existing);
  }

  return {
    approvedBudget,
    totalPlanned,
    totalActual,
    remainingBudget,
    remainingPlanned,
    utilizationPercentage,
    plannedUtilizationPercentage,
    exceedsPlanned: totalPlanned > 0 && totalActual > totalPlanned,
    exceedsApproved: approvedBudget > 0 && totalActual > approvedBudget,
    byCategory: Array.from(categoryMap.values()),
  };
}

/**
 * Strictly sanitized public project DTO:
 * - Excludes internal approvedBudget & budget entries
 * - Excludes internal/restricted documents, risk register, and approval comments
 * - Excludes beneficiary personal data & granular minor demographics
 */
export function toPublicProjectDTO(
  project: IProjectDocument,
  publicMilestones: Array<{ title: string; targetDate: Date; status: string; completionPercentage: number }> = [],
  publicPhotos: Array<{ title: string; fileUrl: string }> = []
) {
  const programRef =
    project.programId && typeof project.programId === 'object' && 'title' in project.programId
      ? {
          id: (project.programId as unknown as { _id: mongoose.Types.ObjectId })._id.toString(),
          title: (project.programId as unknown as { title: string }).title,
          slug: (project.programId as unknown as { slug: string }).slug,
        }
      : null;

  return {
    id: project._id.toString(),
    name: project.name,
    code: project.code,
    slug: project.slug,
    category: project.category,
    program: programRef,
    shortDescription: project.shortDescription,
    detailedDescription: project.detailedDescription,
    location: project.location || [project.village, project.block, project.district, project.state].filter(Boolean).join(', '),
    state: project.state,
    district: project.district,
    startDate: project.startDate,
    endDate: project.endDate,
    status: project.status,
    progressPercentage: project.progressPercentage,
    expectedOutcomes: project.expectedOutcomes || [],
    keyDeliverables: project.keyDeliverables || [],
    beneficiaryReach: {
      targetCount: project.targetBeneficiaries,
      actualCount: project.actualBeneficiaries,
      categories: project.beneficiarySummary?.categories || [],
      geographicCoverage: project.beneficiarySummary?.geographicCoverage || [],
      outcomeSummary: project.beneficiarySummary?.outcomeSummary || '',
    },
    images: project.images || [],
    publicPhotos,
    milestones: publicMilestones,
  };
}

export class ProjectService {
  // ==========================================
  // PROJECT CRUD
  // ==========================================
  async listProjects(
    organizationId: string,
    filter: ProjectFilterOptions = {},
    pagination: { page?: number; limit?: number } = {}
  ) {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(100, Math.max(1, pagination.limit || 20));
    const [projects, total] = await Promise.all([
      projectRepository.findMany(organizationId, filter, { page, limit }),
      projectRepository.count(organizationId, filter),
    ]);
    return {
      projects,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getProjectById(id: string, organizationId: string, actor?: AdminActor): Promise<IProjectDocument> {
    const project = await projectRepository.findById(id, organizationId);
    if (!project) {
      throw new NotFoundError('Project not found in this organization');
    }

    // If actor lacks projects.view (org-wide), ensure they are assigned to this project
    if (
      actor &&
      actor.role !== 'SUPER_ADMIN' &&
      !checkRolePermission(actor.role, 'projects.view')
    ) {
      const isManager =
        project.projectManagerId &&
        ((typeof project.projectManagerId === 'object' && '_id' in project.projectManagerId
          ? project.projectManagerId._id.toString()
          : (project.projectManagerId as mongoose.Types.ObjectId).toString()) === actor.id);

      const isTeamMember = (project.teamMembers || []).some((m) => {
        const uid =
          typeof m.userId === 'object' && '_id' in m.userId
            ? m.userId._id.toString()
            : (m.userId as mongoose.Types.ObjectId).toString();
        return uid === actor.id;
      });

      if (!isManager && !isTeamMember) {
        throw new AuthorizationError('You are not assigned to this project');
      }
    }

    return project;
  }

  async createProject(
    organizationId: string,
    input: CreateProjectInput,
    actor: AdminActor
  ): Promise<IProjectDocument> {
    assertSafeBeneficiarySummary(input.beneficiarySummary);

    const normalizedSlug = input.slug.toLowerCase().trim();
    const normalizedCode = input.code.toUpperCase().trim();

    const duplicate = await projectRepository.findBySlugOrCode(organizationId, normalizedSlug, normalizedCode);
    if (duplicate) {
      throw new ConflictError(
        `A project with slug "${normalizedSlug}" or code "${normalizedCode}" already exists in this organization`
      );
    }

    let programId: mongoose.Types.ObjectId | undefined;
    if (input.programId) {
      const program = await programRepository.findById(input.programId, organizationId);
      if (!program) {
        throw new ValidationError('Parent program does not exist in this organization');
      }
      programId = new mongoose.Types.ObjectId(input.programId);
    }

    let projectManagerId: mongoose.Types.ObjectId | undefined;
    if (input.projectManagerId) {
      const mgr = await userRepository.findById(input.projectManagerId);
      if (!mgr || mgr.organizationId.toString() !== organizationId || mgr.status !== 'active') {
        throw new ValidationError('Assigned project manager must be an active user in this organization');
      }
      projectManagerId = new mongoose.Types.ObjectId(input.projectManagerId);
    }

    let departmentId: mongoose.Types.ObjectId | undefined;
    if (input.departmentId) {
      const dept = await departmentRepository.findById(input.departmentId, organizationId);
      if (!dept) {
        throw new ValidationError('Assigned department does not exist in this organization');
      }
      departmentId = new mongoose.Types.ObjectId(input.departmentId);
    }

    const created = await projectRepository.create({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      programId,
      name: input.name,
      code: normalizedCode,
      slug: normalizedSlug,
      shortDescription: input.shortDescription,
      detailedDescription: input.detailedDescription,
      category: input.category,
      projectManagerId,
      departmentId,
      teamMembers: projectManagerId
        ? [
            {
              userId: projectManagerId,
              responsibility: 'Project Manager',
              accessLevel: 'LEAD',
              assignedAt: new Date(),
              assignedBy: new mongoose.Types.ObjectId(actor.id),
            },
          ]
        : [],
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      location: input.location,
      state: input.state,
      district: input.district,
      block: input.block,
      village: input.village,
      coordinates: input.coordinates,
      approvedBudget: input.approvedBudget,
      targetBeneficiaries: input.targetBeneficiaries,
      actualBeneficiaries: input.actualBeneficiaries,
      beneficiarySummary: input.beneficiarySummary || {
        targetCount: input.targetBeneficiaries,
        actualCount: input.actualBeneficiaries,
        categories: [],
        geographicCoverage: [input.district, input.state].filter(Boolean) as string[],
        includesMinorBeneficiaries: false,
        safeguardingVerified: false,
        demographics: [],
      },
      expectedOutcomes: input.expectedOutcomes,
      keyDeliverables: input.keyDeliverables,
      riskLevel: input.riskLevel,
      priority: input.priority,
      images: input.images,
      status: 'DRAFT',
      isPublicVisible: false,
      progressPercentage: 0,
      createdBy: new mongoose.Types.ObjectId(actor.id),
    });

    await adminService.logAudit(
      actor,
      'PROJECT_CREATE',
      'Project',
      created._id.toString(),
      `Created project "${created.name}" (${created.code})`,
      { code: created.code, category: created.category, status: created.status }
    );

    return created;
  }

  async updateProject(
    id: string,
    organizationId: string,
    input: UpdateProjectInput,
    actor: AdminActor
  ): Promise<IProjectDocument> {
    const existing = await this.getProjectById(id, organizationId, actor);

    if (input.beneficiarySummary) {
      assertSafeBeneficiarySummary(input.beneficiarySummary);
    }

    if (input.status && input.status !== existing.status) {
      assertValidProjectTransition(existing.status, input.status, actor);
    }

    const effectiveStatus = input.status || existing.status;
    if (
      input.isPublicVisible === true &&
      !['APPROVED', 'PLANNED', 'ACTIVE', 'COMPLETED'].includes(effectiveStatus)
    ) {
      throw new ValidationError(
        'Only APPROVED, PLANNED, ACTIVE, or COMPLETED projects can be published to the public website'
      );
    }

    if (input.slug || input.code) {
      const dup = await projectRepository.findBySlugOrCode(
        organizationId,
        input.slug?.toLowerCase().trim(),
        input.code?.toUpperCase().trim()
      );
      if (dup && dup._id.toString() !== id) {
        throw new ConflictError('Another project already uses this slug or code in this organization');
      }
    }

    const updates: Record<string, unknown> = {
      updatedBy: new mongoose.Types.ObjectId(actor.id),
    };

    const scalarFields = [
      'name',
      'shortDescription',
      'detailedDescription',
      'category',
      'location',
      'state',
      'district',
      'block',
      'village',
      'coordinates',
      'approvedBudget',
      'targetBeneficiaries',
      'actualBeneficiaries',
      'beneficiarySummary',
      'expectedOutcomes',
      'keyDeliverables',
      'riskLevel',
      'priority',
      'progressPercentage',
      'images',
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
    if (input.startDate !== undefined) updates.startDate = input.startDate ? new Date(input.startDate) : undefined;
    if (input.endDate !== undefined) updates.endDate = input.endDate ? new Date(input.endDate) : undefined;

    if (input.programId !== undefined) {
      if (input.programId) {
        const program = await programRepository.findById(input.programId, organizationId);
        if (!program) throw new ValidationError('Parent program does not exist in this organization');
        updates.programId = new mongoose.Types.ObjectId(input.programId);
      } else {
        updates.programId = undefined;
      }
    }

    if (input.projectManagerId !== undefined) {
      if (input.projectManagerId) {
        const mgr = await userRepository.findById(input.projectManagerId);
        if (!mgr || mgr.organizationId.toString() !== organizationId || mgr.status !== 'active') {
          throw new ValidationError('Assigned project manager must be an active user in this organization');
        }
        updates.projectManagerId = new mongoose.Types.ObjectId(input.projectManagerId);
      } else {
        updates.projectManagerId = undefined;
      }
    }

    if (input.departmentId !== undefined) {
      if (input.departmentId) {
        const dept = await departmentRepository.findById(input.departmentId, organizationId);
        if (!dept) throw new ValidationError('Assigned department does not exist in this organization');
        updates.departmentId = new mongoose.Types.ObjectId(input.departmentId);
      } else {
        updates.departmentId = undefined;
      }
    }

    if (effectiveStatus === 'ARCHIVED' || effectiveStatus === 'CANCELLED') {
      updates.isPublicVisible = false;
    }

    const updated = await projectRepository.update(id, organizationId, updates as Partial<IProjectDocument>);
    if (!updated) throw new NotFoundError('Project not found');

    await adminService.logAudit(
      actor,
      input.status && input.status !== existing.status ? 'PROJECT_STATUS_CHANGE' : 'PROJECT_UPDATE',
      'Project',
      id,
      `Updated project "${updated.name}"${
        input.status && input.status !== existing.status
          ? ` (${existing.status} -> ${input.status})`
          : ''
      }`,
      { previousStatus: existing.status, newStatus: updated.status }
    );

    return updated;
  }

  async archiveProject(id: string, organizationId: string, actor: AdminActor) {
    return this.updateProject(id, organizationId, { status: 'ARCHIVED', isPublicVisible: false }, actor);
  }

  // ==========================================
  // PROJECT TEAM MANAGEMENT (NO DUPLICATE TEAM COLLECTION)
  // ==========================================
  async getProjectTeamWithWorkload(projectId: string, organizationId: string) {
    const project = await this.getProjectById(projectId, organizationId);
    await connectToDatabase();
    const orgObjId = new mongoose.Types.ObjectId(organizationId);

    const memberIds = (project.teamMembers || []).map((m) =>
      typeof m.userId === 'object' && '_id' in m.userId
        ? m.userId._id
        : new mongoose.Types.ObjectId((m.userId as mongoose.Types.ObjectId).toString())
    );

    const workloadAgg =
      memberIds.length > 0
        ? await Task.aggregate([
            {
              $match: {
                organizationId: orgObjId,
                assignedUserId: { $in: memberIds },
                status: { $nin: ['COMPLETED', 'CANCELLED'] },
              },
            },
            {
              $group: {
                _id: '$assignedUserId',
                openTasks: { $sum: 1 },
                projectTasks: {
                  $sum: {
                    $cond: [{ $eq: ['$projectId', new mongoose.Types.ObjectId(projectId)] }, 1, 0],
                  },
                },
              },
            },
          ])
        : [];

    const workloadMap = new Map<string, { openTasks: number; projectTasks: number }>();
    workloadAgg.forEach((w: { _id: mongoose.Types.ObjectId; openTasks: number; projectTasks: number }) => {
      workloadMap.set(w._id.toString(), { openTasks: w.openTasks, projectTasks: w.projectTasks });
    });

    return (project.teamMembers || []).map((m) => {
      const populated =
        typeof m.userId === 'object' && '_id' in m.userId
          ? (m.userId as unknown as { _id: mongoose.Types.ObjectId; name: string; email: string; role: string; designation?: string; status: string })
          : null;
      const uid = populated ? populated._id.toString() : (m.userId as mongoose.Types.ObjectId).toString();
      const load = workloadMap.get(uid) || { openTasks: 0, projectTasks: 0 };

      return {
        userId: uid,
        name: populated?.name || 'User',
        email: populated?.email || '',
        role: populated?.role || '',
        designation: populated?.designation,
        status: populated?.status || 'active',
        responsibility: m.responsibility,
        accessLevel: m.accessLevel,
        assignedAt: m.assignedAt,
        workload: load,
      };
    });
  }

  async assignTeamMember(
    projectId: string,
    organizationId: string,
    input: AssignProjectTeamMemberInput,
    actor: AdminActor
  ) {
    const project = await this.getProjectById(projectId, organizationId);
    const targetUser = await userRepository.findById(input.userId);

    if (!targetUser || targetUser.organizationId.toString() !== organizationId) {
      throw new AuthorizationError('Cross-tenant team assignment is forbidden; user does not belong to this organization');
    }
    if (targetUser.status !== 'active') {
      throw new ValidationError('Only active organization users can be assigned to a project team');
    }

    const filtered = (project.teamMembers || []).filter((m) => {
      const uid =
        typeof m.userId === 'object' && '_id' in m.userId
          ? m.userId._id.toString()
          : (m.userId as mongoose.Types.ObjectId).toString();
      return uid !== input.userId;
    });

    filtered.push({
      userId: new mongoose.Types.ObjectId(input.userId),
      responsibility: input.responsibility,
      accessLevel: input.accessLevel,
      assignedAt: new Date(),
      assignedBy: new mongoose.Types.ObjectId(actor.id),
    });

    const updated = await projectRepository.update(projectId, organizationId, {
      teamMembers: filtered,
      updatedBy: new mongoose.Types.ObjectId(actor.id),
    });

    await adminService.logAudit(
      actor,
      'PROJECT_TEAM_ASSIGN',
      'Project',
      projectId,
      `Assigned ${targetUser.name} (${targetUser.email}) to "${project.name}" as ${input.responsibility} (${input.accessLevel})`
    );

    const org = await organizationRepository.findById(organizationId);
    if (org?.notificationSettings?.emailNotifications !== false) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const tpl = renderProjectAssignmentEmail({
        recipientName: targetUser.name,
        projectName: project.name,
        responsibility: input.responsibility,
        assignedBy: actor.name,
        projectUrl: `${appUrl}/dashboard/admin/projects/${projectId}`,
        organizationName: org?.name,
      });
      await emailProvider.sendEmail({
        to: targetUser.email,
        subject: tpl.subject,
        htmlContent: tpl.html,
        textContent: tpl.text,
      });
    }

    return updated;
  }

  async removeTeamMember(projectId: string, userId: string, organizationId: string, actor: AdminActor) {
    const project = await this.getProjectById(projectId, organizationId);

    const filtered = (project.teamMembers || []).filter((m) => {
      const uid =
        typeof m.userId === 'object' && '_id' in m.userId
          ? m.userId._id.toString()
          : (m.userId as mongoose.Types.ObjectId).toString();
      return uid !== userId;
    });

    const updated = await projectRepository.update(projectId, organizationId, {
      teamMembers: filtered,
      updatedBy: new mongoose.Types.ObjectId(actor.id),
    });

    await adminService.logAudit(
      actor,
      'PROJECT_TEAM_REMOVE',
      'Project',
      projectId,
      `Removed user ${userId} from project "${project.name}"`
    );

    return updated;
  }

  // ==========================================
  // TASKS MANAGEMENT
  // ==========================================
  async listTasks(
    organizationId: string,
    filter: TaskFilterOptions = {},
    pagination: { page?: number; limit?: number } = {}
  ) {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(100, Math.max(1, pagination.limit || 25));
    const [tasks, total] = await Promise.all([
      taskRepository.findMany(organizationId, filter, { page, limit }),
      taskRepository.count(organizationId, filter),
    ]);
    return {
      tasks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getTaskById(taskId: string, organizationId: string): Promise<ITaskDocument> {
    const task = await taskRepository.findById(taskId, organizationId);
    if (!task) throw new NotFoundError('Task not found in this organization');
    return task;
  }

  async createTask(organizationId: string, input: CreateTaskInput, actor: AdminActor): Promise<ITaskDocument> {
    const project = await this.getProjectById(input.projectId, organizationId);

    let assignedUser: Awaited<ReturnType<typeof userRepository.findById>> = null;
    if (input.assignedUserId) {
      if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'tasks.assign_manage')) {
        throw new AuthorizationError('Missing tasks.assign_manage permission to assign tasks to team members');
      }
      assignedUser = await userRepository.findById(input.assignedUserId);
      if (!assignedUser || assignedUser.organizationId.toString() !== organizationId || assignedUser.status !== 'active') {
        throw new ValidationError('Task assignee must be an active user belonging to this organization');
      }
    }

    const programId =
      input.programId
        ? new mongoose.Types.ObjectId(input.programId)
        : project.programId
        ? new mongoose.Types.ObjectId(
            typeof project.programId === 'object' && '_id' in project.programId
              ? project.programId._id.toString()
              : (project.programId as mongoose.Types.ObjectId).toString()
          )
        : undefined;

    const task = await taskRepository.create({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      projectId: new mongoose.Types.ObjectId(input.projectId),
      programId,
      title: input.title,
      description: input.description,
      assignedUserId: input.assignedUserId ? new mongoose.Types.ObjectId(input.assignedUserId) : undefined,
      createdBy: new mongoose.Types.ObjectId(actor.id),
      priority: input.priority,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      estimatedEffortHours: input.estimatedEffortHours,
      actualEffortHours: input.actualEffortHours || 0,
      status: input.status,
      completionPercentage: input.status === 'COMPLETED' ? 100 : input.completionPercentage,
      attachments: input.attachments,
      completedAt: input.status === 'COMPLETED' ? new Date() : null,
    });

    await adminService.logAudit(
      actor,
      'TASK_CREATE',
      'Task',
      task._id.toString(),
      `Created task "${task.title}" in project "${project.name}"`
    );

    if (assignedUser) {
      const org = await organizationRepository.findById(organizationId);
      if (org?.notificationSettings?.emailNotifications !== false) {
        const tpl = renderTaskAssignmentEmail({
          recipientName: assignedUser.name,
          taskTitle: task.title,
          projectName: project.name,
          priority: task.priority,
          dueDate: task.dueDate ? task.dueDate.toLocaleDateString() : undefined,
          assignedBy: actor.name,
        });
        await emailProvider.sendEmail({
          to: assignedUser.email,
          subject: tpl.subject,
          htmlContent: tpl.html,
          textContent: tpl.text,
        });
      }
    }

    return task;
  }

  async updateTask(
    taskId: string,
    organizationId: string,
    input: UpdateTaskInput,
    actor: AdminActor
  ): Promise<ITaskDocument> {
    const existing = await this.getTaskById(taskId, organizationId);
    const canAssignManage =
      actor.role === 'SUPER_ADMIN' || checkRolePermission(actor.role, 'tasks.assign_manage');

    const currentAssigneeId = existing.assignedUserId
      ? typeof existing.assignedUserId === 'object' && '_id' in existing.assignedUserId
        ? existing.assignedUserId._id.toString()
        : (existing.assignedUserId as mongoose.Types.ObjectId).toString()
      : null;

    // Non-managers can ONLY update status, completionPercentage, actualEffortHours, comments on tasks assigned to them
    if (!canAssignManage) {
      if (currentAssigneeId !== actor.id) {
        throw new AuthorizationError('You can only update tasks assigned directly to you');
      }
      if (input.assignedUserId !== undefined && input.assignedUserId !== currentAssigneeId) {
        throw new AuthorizationError('Missing tasks.assign_manage permission to reassign tasks');
      }
    }

    const updates: Record<string, unknown> = {};
    if (canAssignManage) {
      if (input.title !== undefined) updates.title = input.title;
      if (input.description !== undefined) updates.description = input.description;
      if (input.priority !== undefined) updates.priority = input.priority;
      if (input.startDate !== undefined) updates.startDate = input.startDate ? new Date(input.startDate) : undefined;
      if (input.dueDate !== undefined) updates.dueDate = input.dueDate ? new Date(input.dueDate) : undefined;
      if (input.estimatedEffortHours !== undefined) updates.estimatedEffortHours = input.estimatedEffortHours;
      if (input.attachments !== undefined) updates.attachments = input.attachments;

      if (input.assignedUserId !== undefined) {
        if (input.assignedUserId) {
          const assignee = await userRepository.findById(input.assignedUserId);
          if (!assignee || assignee.organizationId.toString() !== organizationId || assignee.status !== 'active') {
            throw new ValidationError('Reassigned user must be an active member of this organization');
          }
          updates.assignedUserId = new mongoose.Types.ObjectId(input.assignedUserId);
        } else {
          updates.assignedUserId = undefined;
        }
      }
    }

    if (input.status !== undefined) {
      updates.status = input.status;
      if (input.status === 'COMPLETED') {
        updates.completionPercentage = 100;
        updates.completedAt = new Date();
      } else {
        updates.completedAt = null;
      }
    }
    if (input.completionPercentage !== undefined && input.status !== 'COMPLETED') {
      updates.completionPercentage = input.completionPercentage;
    }
    if (input.actualEffortHours !== undefined) {
      updates.actualEffortHours = input.actualEffortHours;
    }
    if (input.commentBody) {
      updates.comments = [
        ...(existing.comments || []),
        {
          authorId: new mongoose.Types.ObjectId(actor.id),
          authorName: actor.name,
          body: input.commentBody,
          createdAt: new Date(),
        },
      ];
    }

    const updated = await taskRepository.update(taskId, organizationId, updates as Partial<ITaskDocument>);
    if (!updated) throw new NotFoundError('Task not found');

    await adminService.logAudit(
      actor,
      'TASK_UPDATE',
      'Task',
      taskId,
      `Updated task "${updated.title}" (status: ${updated.status}, ${updated.completionPercentage}%)`
    );

    return updated;
  }

  async deleteTask(taskId: string, organizationId: string, actor: AdminActor): Promise<boolean> {
    const task = await this.getTaskById(taskId, organizationId);
    const deleted = await taskRepository.delete(taskId, organizationId);
    if (deleted) {
      await adminService.logAudit(actor, 'TASK_DELETE', 'Task', taskId, `Deleted task "${task.title}"`);
    }
    return deleted;
  }

  // ==========================================
  // MILESTONES MANAGEMENT
  // ==========================================
  async listMilestones(organizationId: string, filter: MilestoneFilterOptions = {}) {
    return await milestoneRepository.findMany(organizationId, filter);
  }

  async createMilestone(
    projectId: string,
    organizationId: string,
    input: CreateMilestoneInput,
    actor: AdminActor
  ): Promise<IProjectMilestoneDocument> {
    const project = await this.getProjectById(projectId, organizationId);

    if (input.responsibleUserId) {
      const user = await userRepository.findById(input.responsibleUserId);
      if (!user || user.organizationId.toString() !== organizationId || user.status !== 'active') {
        throw new ValidationError('Responsible user must be an active member of this organization');
      }
    }

    const milestone = await milestoneRepository.create({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      projectId: new mongoose.Types.ObjectId(projectId),
      title: input.title,
      description: input.description,
      targetDate: new Date(input.targetDate),
      completionDate: input.status === 'COMPLETED' ? new Date() : input.completionDate ? new Date(input.completionDate) : null,
      status: input.status,
      responsibleUserId: input.responsibleUserId ? new mongoose.Types.ObjectId(input.responsibleUserId) : undefined,
      deliverables: input.deliverables,
      completionPercentage: input.status === 'COMPLETED' ? 100 : input.completionPercentage,
      createdBy: new mongoose.Types.ObjectId(actor.id),
    });

    await this.recalculateProjectProgress(projectId, organizationId);
    await adminService.logAudit(
      actor,
      'MILESTONE_CREATE',
      'ProjectMilestone',
      milestone._id.toString(),
      `Created milestone "${milestone.title}" for project "${project.name}"`
    );

    return milestone;
  }

  async updateMilestone(
    projectId: string,
    milestoneId: string,
    organizationId: string,
    input: UpdateMilestoneInput,
    actor: AdminActor
  ): Promise<IProjectMilestoneDocument> {
    await this.getProjectById(projectId, organizationId);
    const existing = await milestoneRepository.findById(milestoneId, organizationId);
    if (!existing) throw new NotFoundError('Milestone not found in this organization');

    const updates: Record<string, unknown> = {};
    if (input.title !== undefined) updates.title = input.title;
    if (input.description !== undefined) updates.description = input.description;
    if (input.targetDate !== undefined) updates.targetDate = new Date(input.targetDate);
    if (input.deliverables !== undefined) updates.deliverables = input.deliverables;
    if (input.responsibleUserId !== undefined) {
      if (input.responsibleUserId) {
        const user = await userRepository.findById(input.responsibleUserId);
        if (!user || user.organizationId.toString() !== organizationId || user.status !== 'active') {
          throw new ValidationError('Responsible user must belong to this organization');
        }
        updates.responsibleUserId = new mongoose.Types.ObjectId(input.responsibleUserId);
      } else {
        updates.responsibleUserId = undefined;
      }
    }

    if (input.status !== undefined) {
      updates.status = input.status;
      if (input.status === 'COMPLETED') {
        updates.completionPercentage = 100;
        updates.completionDate = new Date();
      } else {
        updates.completionDate = null;
      }
    }
    if (input.completionPercentage !== undefined && input.status !== 'COMPLETED') {
      updates.completionPercentage = input.completionPercentage;
    }

    const updated = await milestoneRepository.update(
      milestoneId,
      organizationId,
      updates as Partial<IProjectMilestoneDocument>
    );
    if (!updated) throw new NotFoundError('Milestone not found');

    await this.recalculateProjectProgress(projectId, organizationId);
    await adminService.logAudit(
      actor,
      'MILESTONE_UPDATE',
      'ProjectMilestone',
      milestoneId,
      `Updated milestone "${updated.title}" (${updated.status}, ${updated.completionPercentage}%)`
    );

    return updated;
  }

  async deleteMilestone(projectId: string, milestoneId: string, organizationId: string, actor: AdminActor) {
    await this.getProjectById(projectId, organizationId);
    const deleted = await milestoneRepository.delete(milestoneId, organizationId);
    if (deleted) {
      await this.recalculateProjectProgress(projectId, organizationId);
      await adminService.logAudit(actor, 'MILESTONE_DELETE', 'ProjectMilestone', milestoneId, 'Deleted project milestone');
    }
    return deleted;
  }

  async recalculateProjectProgress(projectId: string, organizationId: string): Promise<number> {
    const milestones = await milestoneRepository.findMany(organizationId, { projectId });
    const activeMilestones = milestones.filter((m) => m.status !== 'CANCELLED');
    if (activeMilestones.length === 0) return 0;

    const avg = Math.round(
      activeMilestones.reduce((sum, m) => sum + (m.completionPercentage || 0), 0) / activeMilestones.length
    );
    await projectRepository.update(projectId, organizationId, { progressPercentage: avg });
    return avg;
  }

  // ==========================================
  // PROJECT APPROVAL WORKFLOW
  // ==========================================
  async listProjectApprovals(projectId: string, organizationId: string) {
    await this.getProjectById(projectId, organizationId);
    return await projectOperationsRepository.findApprovalsByEntity(organizationId, 'PROJECT', projectId);
  }

  async submitProjectForApproval(
    projectId: string,
    organizationId: string,
    input: SubmitApprovalInput,
    actor: AdminActor
  ) {
    const project = await this.getProjectById(projectId, organizationId);
    if (project.status !== 'DRAFT') {
      throw new ValidationError(
        `Only DRAFT projects can be submitted for approval (current status: ${project.status})`
      );
    }

    let approverEmail: string | undefined;
    let approverName = 'Approving Authority';
    let assignedApproverId: mongoose.Types.ObjectId | undefined;

    if (input.assignedApproverId) {
      if (input.assignedApproverId === actor.id) {
        throw new ValidationError('Submitters cannot assign themselves as the approver');
      }
      const approver = await userRepository.findById(input.assignedApproverId);
      if (!approver || approver.organizationId.toString() !== organizationId || approver.status !== 'active') {
        throw new ValidationError('Assigned approver must be an active user in this organization');
      }
      assignedApproverId = new mongoose.Types.ObjectId(input.assignedApproverId);
      approverEmail = approver.email;
      approverName = approver.name;
    }

    const previous = await projectOperationsRepository.findApprovalsByEntity(organizationId, 'PROJECT', projectId);
    const revisionCount = previous.length + 1;

    await projectRepository.update(projectId, organizationId, {
      status: 'PENDING_APPROVAL',
      updatedBy: new mongoose.Types.ObjectId(actor.id),
    });

    const approval = await projectOperationsRepository.createApproval({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      entityType: 'PROJECT',
      entityId: new mongoose.Types.ObjectId(projectId),
      entityTitle: project.name,
      submittedBy: new mongoose.Types.ObjectId(actor.id),
      assignedApproverId,
      stage: input.stage,
      status: 'PENDING',
      submissionNotes: input.submissionNotes,
      revisionCount,
      history: [
        {
          action: revisionCount > 1 ? 'RESUBMITTED' : 'SUBMITTED',
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
      'PROJECT_APPROVAL_SUBMIT',
      'Project',
      projectId,
      `Submitted project "${project.name}" for approval (stage: ${input.stage}, revision #${revisionCount})`
    );

    if (approverEmail) {
      const org = await organizationRepository.findById(organizationId);
      if (org?.notificationSettings?.emailNotifications !== false) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const tpl = renderApprovalRequestEmail({
          approverName,
          entityType: 'PROJECT',
          entityTitle: project.name,
          submittedBy: actor.name,
          notes: input.submissionNotes,
          reviewUrl: `${appUrl}/dashboard/admin/projects/${projectId}`,
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

  async decideProjectApproval(
    projectId: string,
    organizationId: string,
    input: DecideApprovalInput,
    actor: AdminActor
  ) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'projects.approve')) {
      throw new AuthorizationError('Missing projects.approve permission to approve or reject projects');
    }

    const project = await this.getProjectById(projectId, organizationId);
    const approval = await projectOperationsRepository.findApprovalById(input.approvalId, organizationId);
    if (!approval || approval.entityType !== 'PROJECT' || approval.entityId.toString() !== projectId) {
      throw new NotFoundError('Approval request not found for this project');
    }
    if (approval.status !== 'PENDING' && approval.status !== 'UNDER_REVIEW') {
      throw new ValidationError(`Approval request has already been decided (${approval.status})`);
    }

    const submitterId =
      typeof approval.submittedBy === 'object' && '_id' in approval.submittedBy
        ? approval.submittedBy._id.toString()
        : (approval.submittedBy as mongoose.Types.ObjectId).toString();

    if (submitterId === actor.id) {
      throw new AuthorizationError('Submitters cannot approve or reject their own project submission');
    }

    if (input.decision === 'REJECTED' && !input.rejectionReason?.trim()) {
      throw new ValidationError('Rejection reason is required when rejecting a project');
    }

    // Rejected projects return to DRAFT so the Project Manager can revise and resubmit
    const nextProjectStatus: ProjectStatus = input.decision === 'APPROVED' ? 'APPROVED' : 'DRAFT';

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

    await projectRepository.update(projectId, organizationId, {
      status: nextProjectStatus,
      updatedBy: new mongoose.Types.ObjectId(actor.id),
    });

    await adminService.logAudit(
      actor,
      input.decision === 'APPROVED' ? 'PROJECT_APPROVED' : 'PROJECT_REJECTED',
      'Project',
      projectId,
      `${input.decision} project "${project.name}"`,
      { decision: input.decision, approvalId: input.approvalId }
    );

    const submitter = await userRepository.findById(submitterId);
    if (submitter) {
      const org = await organizationRepository.findById(organizationId);
      if (org?.notificationSettings?.emailNotifications !== false) {
        const tpl = renderApprovalDecisionEmail({
          submitterName: submitter.name,
          entityType: 'PROJECT',
          entityTitle: project.name,
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

  // ==========================================
  // BUDGET PLANNING & TRACKING
  // ==========================================
  async getProjectBudget(projectId: string, organizationId: string) {
    const project = await this.getProjectById(projectId, organizationId);
    const entries = await projectOperationsRepository.findBudgetEntries(organizationId, projectId);
    const summary = calculateProjectBudgetSummary(project.approvedBudget || 0, entries);
    return { entries, summary };
  }

  async createBudgetEntry(
    projectId: string,
    organizationId: string,
    input: CreateBudgetEntryInput,
    actor: AdminActor
  ) {
    const project = await this.getProjectById(projectId, organizationId);
    const entry = await projectOperationsRepository.createBudgetEntry({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      projectId: new mongoose.Types.ObjectId(projectId),
      budgetPeriod: input.budgetPeriod,
      category: input.category,
      description: input.description,
      plannedAmount: input.plannedAmount,
      actualAmount: input.actualAmount,
      notes: input.notes,
      recordedBy: new mongoose.Types.ObjectId(actor.id),
    });

    await adminService.logAudit(
      actor,
      'PROJECT_BUDGET_CREATE',
      'ProjectBudgetEntry',
      entry._id.toString(),
      `Added ${input.category} budget item for "${project.name}" (planned: ${input.plannedAmount}, actual: ${input.actualAmount})`
    );

    return entry;
  }

  async updateBudgetEntry(
    projectId: string,
    entryId: string,
    organizationId: string,
    input: UpdateBudgetEntryInput,
    actor: AdminActor
  ) {
    await this.getProjectById(projectId, organizationId);
    const updated = await projectOperationsRepository.updateBudgetEntry(entryId, organizationId, projectId, {
      ...input,
      updatedBy: new mongoose.Types.ObjectId(actor.id),
    } as Partial<IProjectBudgetEntryDocument>);

    if (!updated) throw new NotFoundError('Budget entry not found');

    await adminService.logAudit(
      actor,
      'PROJECT_BUDGET_UPDATE',
      'ProjectBudgetEntry',
      entryId,
      `Updated budget entry (${updated.category}: planned ${updated.plannedAmount}, actual ${updated.actualAmount})`
    );
    return updated;
  }

  async deleteBudgetEntry(projectId: string, entryId: string, organizationId: string, actor: AdminActor) {
    await this.getProjectById(projectId, organizationId);
    const deleted = await projectOperationsRepository.deleteBudgetEntry(entryId, organizationId, projectId);
    if (deleted) {
      await adminService.logAudit(actor, 'PROJECT_BUDGET_DELETE', 'ProjectBudgetEntry', entryId, 'Deleted project budget entry');
    }
    return deleted;
  }

  // ==========================================
  // PROJECT DOCUMENTS
  // ==========================================
  async listProjectDocuments(projectId: string, organizationId: string, actor: AdminActor) {
    await this.getProjectById(projectId, organizationId, actor);
    const docs = await projectOperationsRepository.findDocuments(organizationId, projectId);
    const canViewRestricted =
      actor.role === 'SUPER_ADMIN' ||
      checkRolePermission(actor.role, 'project_documents.manage') ||
      checkRolePermission(actor.role, 'projects.approve');

    const visibleDocs = docs.filter((d) => d.visibility !== 'RESTRICTED' || canViewRestricted);
    return Promise.all(
      visibleDocs.map(async (d) => ({
        id: d._id.toString(),
        title: d.title,
        category: d.category,
        fileName: d.fileName,
        mimeType: d.mimeType,
        fileSizeBytes: d.fileSizeBytes,
        visibility: d.visibility,
        description: d.description,
        uploadedBy: d.uploadedBy,
        signedDownloadUrl: await storageProvider.getSignedDownloadUrl(d.storageKey, 900),
        createdAt: d.createdAt,
      }))
    );
  }

  async createProjectDocument(
    projectId: string,
    organizationId: string,
    input: CreateProjectDocumentInput,
    actor: AdminActor
  ) {
    const project = await this.getProjectById(projectId, organizationId);
    validateDocumentFile(input.mimeType, input.fileSizeBytes);

    if (
      input.visibility === 'PUBLIC_APPROVED' &&
      actor.role !== 'SUPER_ADMIN' &&
      !checkRolePermission(actor.role, 'content.publish') &&
      !checkRolePermission(actor.role, 'projects.approve')
    ) {
      throw new AuthorizationError('Publishing PUBLIC_APPROVED documents requires content.publish or projects.approve permission');
    }

    const storageResult = await storageProvider.uploadFile({
      fileName: input.fileName,
      folder: `org-${organizationId}/projects/${projectId}`,
      mimeType: input.mimeType,
      buffer: Buffer.alloc(Math.min(input.fileSizeBytes, 64)),
      isPublic: input.visibility === 'PUBLIC_APPROVED',
    });

    const record = await projectOperationsRepository.createDocument({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      projectId: new mongoose.Types.ObjectId(projectId),
      title: input.title,
      category: input.category,
      fileName: input.fileName,
      storageKey: storageResult.key,
      fileUrl: input.fileUrl || storageResult.fileUrl,
      mimeType: input.mimeType,
      fileSizeBytes: input.fileSizeBytes,
      visibility: input.visibility,
      description: input.description,
      uploadedBy: new mongoose.Types.ObjectId(actor.id),
    });

    await adminService.logAudit(
      actor,
      'PROJECT_DOCUMENT_UPLOAD',
      'ProjectDocument',
      record._id.toString(),
      `Uploaded ${record.category} document "${record.title}" (${record.visibility}) to "${project.name}"`
    );

    return record;
  }

  async deleteProjectDocument(projectId: string, documentId: string, organizationId: string, actor: AdminActor) {
    await this.getProjectById(projectId, organizationId);
    const doc = await projectOperationsRepository.findDocumentById(documentId, organizationId, projectId);
    if (!doc) throw new NotFoundError('Document not found');

    await storageProvider.deleteFile(doc.storageKey);
    const deleted = await projectOperationsRepository.deleteDocument(documentId, organizationId, projectId);
    if (deleted) {
      await adminService.logAudit(
        actor,
        'PROJECT_DOCUMENT_DELETE',
        'ProjectDocument',
        documentId,
        `Removed document "${doc.title}"`
      );
    }
    return deleted;
  }

  // ==========================================
  // PROJECT RISK REGISTER
  // ==========================================
  async listProjectRisks(projectId: string, organizationId: string) {
    await this.getProjectById(projectId, organizationId);
    return await projectOperationsRepository.findRisks(organizationId, projectId);
  }

  async createProjectRisk(
    projectId: string,
    organizationId: string,
    input: CreateProjectRiskInput,
    actor: AdminActor
  ) {
    const project = await this.getProjectById(projectId, organizationId);
    if (input.ownerUserId) {
      const owner = await userRepository.findById(input.ownerUserId);
      if (!owner || owner.organizationId.toString() !== organizationId) {
        throw new ValidationError('Risk owner must belong to this organization');
      }
    }

    const risk = await projectOperationsRepository.createRisk({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      projectId: new mongoose.Types.ObjectId(projectId),
      title: input.title,
      description: input.description,
      severity: input.severity,
      likelihood: input.likelihood,
      mitigationPlan: input.mitigationPlan,
      ownerUserId: input.ownerUserId ? new mongoose.Types.ObjectId(input.ownerUserId) : undefined,
      status: input.status,
      createdBy: new mongoose.Types.ObjectId(actor.id),
    });

    await adminService.logAudit(
      actor,
      'PROJECT_RISK_CREATE',
      'ProjectRisk',
      risk._id.toString(),
      `Logged ${risk.severity} risk "${risk.title}" on "${project.name}"`
    );

    return risk;
  }

  async updateProjectRisk(
    projectId: string,
    riskId: string,
    organizationId: string,
    input: UpdateProjectRiskInput,
    actor: AdminActor
  ) {
    await this.getProjectById(projectId, organizationId);
    const payload: Record<string, unknown> = { ...input };
    if (input.ownerUserId === null) payload.ownerUserId = undefined;
    else if (input.ownerUserId) payload.ownerUserId = new mongoose.Types.ObjectId(input.ownerUserId);
    if (input.status === 'RESOLVED' || input.status === 'CLOSED') {
      payload.resolvedAt = new Date();
    }

    const updated = await projectOperationsRepository.updateRisk(riskId, organizationId, projectId, payload);
    if (!updated) throw new NotFoundError('Project risk not found');

    await adminService.logAudit(
      actor,
      'PROJECT_RISK_UPDATE',
      'ProjectRisk',
      riskId,
      `Updated risk "${updated.title}" (${updated.status})`
    );
    return updated;
  }

  async deleteProjectRisk(projectId: string, riskId: string, organizationId: string, actor: AdminActor) {
    await this.getProjectById(projectId, organizationId);
    const deleted = await projectOperationsRepository.deleteRisk(riskId, organizationId, projectId);
    if (deleted) {
      await adminService.logAudit(actor, 'PROJECT_RISK_DELETE', 'ProjectRisk', riskId, 'Deleted project risk');
    }
    return deleted;
  }

  async getProjectActivity(projectId: string, organizationId: string) {
    await this.getProjectById(projectId, organizationId);
    const logs = await auditRepository.findMany(organizationId, {}, { page: 1, limit: 50 });
    return logs.filter((l) => l.resourceId === projectId);
  }

  // ==========================================
  // OPERATIONAL DASHBOARD ANALYTICS (100% REAL DB)
  // ==========================================
  async getOperationalAnalytics(organizationId: string) {
    await connectToDatabase();
    const orgObjId = new mongoose.Types.ObjectId(organizationId);
    const now = new Date();

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [
      programsByStatusAgg,
      programsByCategoryAgg,
      programBudgetAgg,
      projectsByStatusAgg,
      projectsMonthlyAgg,
      projectsByDeptAgg,
      projectsByStateAgg,
      projectBudgetTotalAgg,
      overdueProjectsCount,
      overdueMilestones,
      overdueTasks,
      pendingApprovals,
      unresolvedRisks,
      budgetVarianceAgg,
      departments,
    ] = await Promise.all([
      Program.aggregate([
        { $match: { organizationId: orgObjId, isDeleted: { $ne: true } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Program.aggregate([
        { $match: { organizationId: orgObjId, isDeleted: { $ne: true } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      Program.aggregate([
        { $match: { organizationId: orgObjId, isDeleted: { $ne: true }, status: { $ne: 'ARCHIVED' } } },
        { $group: { _id: null, totalBudget: { $sum: '$budget' } } },
      ]),
      Project.aggregate([
        { $match: { organizationId: orgObjId, isDeleted: { $ne: true } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgProgress: { $avg: '$progressPercentage' },
            approvedBudget: { $sum: '$approvedBudget' },
          },
        },
      ]),
      Project.aggregate([
        { $match: { organizationId: orgObjId, isDeleted: { $ne: true }, createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Project.aggregate([
        { $match: { organizationId: orgObjId, isDeleted: { $ne: true }, departmentId: { $exists: true, $ne: null } } },
        { $group: { _id: '$departmentId', count: { $sum: 1 } } },
      ]),
      Project.aggregate([
        { $match: { organizationId: orgObjId, isDeleted: { $ne: true }, state: { $exists: true, $nin: ['', null] } } },
        { $group: { _id: '$state', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      ProjectBudgetEntry.aggregate([
        { $match: { organizationId: orgObjId } },
        {
          $group: {
            _id: null,
            totalPlanned: { $sum: '$plannedAmount' },
            totalActual: { $sum: '$actualAmount' },
          },
        },
      ]),
      Project.countDocuments({
        organizationId: orgObjId,
        isDeleted: { $ne: true },
        endDate: { $lt: now },
        status: { $in: ['PLANNED', 'ACTIVE', 'ON_HOLD'] },
      }),
      ProjectMilestone.find({
        organizationId: orgObjId,
        targetDate: { $lt: now },
        status: { $nin: ['COMPLETED', 'CANCELLED'] },
      })
        .populate('projectId', 'name code')
        .sort({ targetDate: 1 })
        .limit(10),
      Task.find({
        organizationId: orgObjId,
        dueDate: { $lt: now },
        status: { $nin: ['COMPLETED', 'CANCELLED'] },
      })
        .populate('projectId', 'name code')
        .populate('assignedUserId', 'name')
        .sort({ dueDate: 1 })
        .limit(10),
      ProjectApproval.find({
        organizationId: orgObjId,
        status: { $in: ['PENDING', 'UNDER_REVIEW'] },
      })
        .populate('submittedBy', 'name')
        .sort({ createdAt: -1 })
        .limit(10),
      ProjectRisk.find({
        organizationId: orgObjId,
        status: { $in: ['OPEN', 'MITIGATING'] },
        severity: { $in: ['HIGH', 'CRITICAL'] },
      })
        .populate('projectId', 'name code')
        .sort({ createdAt: -1 })
        .limit(10),
      ProjectBudgetEntry.aggregate([
        { $match: { organizationId: orgObjId } },
        {
          $group: {
            _id: '$projectId',
            planned: { $sum: '$plannedAmount' },
            actual: { $sum: '$actualAmount' },
          },
        },
        { $match: { $expr: { $gt: ['$actual', '$planned'] } } },
      ]),
      Department.find({ organizationId: orgObjId }).select('_id name').lean(),
    ]);

    const programStatusMap: Record<string, number> = {};
    let totalPrograms = 0;
    programsByStatusAgg.forEach((r: { _id: string; count: number }) => {
      programStatusMap[r._id] = r.count;
      totalPrograms += r.count;
    });

    const projectStatusMap: Record<string, number> = {};
    let totalProjects = 0;
    let totalApprovedProjectBudget = 0;
    projectsByStatusAgg.forEach((r: { _id: string; count: number; approvedBudget: number }) => {
      projectStatusMap[r._id] = r.count;
      totalProjects += r.count;
      totalApprovedProjectBudget += r.approvedBudget || 0;
    });

    const totalPlanned = projectBudgetTotalAgg[0]?.totalPlanned || 0;
    const totalActual = projectBudgetTotalAgg[0]?.totalActual || 0;
    const budgetUtilizationPct =
      totalApprovedProjectBudget > 0
        ? Math.round((totalActual / totalApprovedProjectBudget) * 10000) / 100
        : 0;

    const deptNames = new Map<string, string>();
    departments.forEach((d) => deptNames.set(d._id.toString(), d.name));

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return {
      programOverview: {
        total: totalPrograms,
        active: programStatusMap.ACTIVE || 0,
        completed: programStatusMap.COMPLETED || 0,
        pendingApproval: programStatusMap.PENDING_APPROVAL || 0,
        totalBudget: programBudgetAgg[0]?.totalBudget || 0,
        byCategory: programsByCategoryAgg.map((c: { _id: string; count: number }) => ({
          category: c._id || 'Uncategorized',
          count: c.count,
        })),
      },
      projectOverview: {
        total: totalProjects,
        active: projectStatusMap.ACTIVE || 0,
        completed: projectStatusMap.COMPLETED || 0,
        onHold: projectStatusMap.ON_HOLD || 0,
        overdue: overdueProjectsCount,
        pendingApproval: projectStatusMap.PENDING_APPROVAL || 0,
        byStatus: projectStatusMap,
      },
      budgetOverview: {
        totalApprovedBudget: totalApprovedProjectBudget,
        totalPlannedExpenditure: totalPlanned,
        totalActualExpenditure: totalActual,
        remainingBudget: totalApprovedProjectBudget - totalActual,
        utilizationPercentage: budgetUtilizationPct,
      },
      charts: {
        monthlyProjectCreations: projectsMonthlyAgg.map(
          (m: { _id: { year: number; month: number }; count: number }) => ({
            month: `${monthNames[(m._id.month - 1) % 12]} ${m._id.year}`,
            count: m.count,
          })
        ),
        departmentDistribution: projectsByDeptAgg.map((d: { _id: mongoose.Types.ObjectId; count: number }) => ({
          departmentId: d._id.toString(),
          name: deptNames.get(d._id.toString()) || 'Unassigned',
          count: d.count,
        })),
        geographicDistribution: projectsByStateAgg.map((s: { _id: string; count: number }) => ({
          state: s._id,
          count: s.count,
        })),
      },
      attentionRequired: {
        overdueMilestones: overdueMilestones.map((m) => ({
          id: m._id.toString(),
          title: m.title,
          targetDate: m.targetDate,
          project: m.projectId,
        })),
        overdueTasks: overdueTasks.map((t) => ({
          id: t._id.toString(),
          title: t.title,
          dueDate: t.dueDate,
          priority: t.priority,
          project: t.projectId,
          assignee: t.assignedUserId,
        })),
        projectsExceedingPlannedBudgetCount: budgetVarianceAgg.length,
        pendingApprovals: pendingApprovals.map((a) => ({
          id: a._id.toString(),
          entityType: a.entityType,
          entityId: a.entityId.toString(),
          entityTitle: a.entityTitle,
          stage: a.stage,
          submittedBy: a.submittedBy,
          createdAt: a.createdAt,
        })),
        unresolvedHighRisks: unresolvedRisks.map((r) => ({
          id: r._id.toString(),
          title: r.title,
          severity: r.severity,
          status: r.status,
          project: r.projectId,
        })),
      },
    };
  }

  // ==========================================
  // PUBLIC WEBSITE SAFE PROJECTIONS
  // ==========================================
  async listPublicProjects(organizationId?: string, programId?: string) {
    const projects = await projectRepository.findPublicPublished(organizationId, programId);
    return projects.map((p) => toPublicProjectDTO(p));
  }

  async getPublicProjectBySlugOrId(slugOrId: string, organizationId?: string) {
    const project = await projectRepository.findPublicBySlugOrId(slugOrId, organizationId);
    if (!project) return null;

    const [milestones, publicPhotos] = await Promise.all([
      milestoneRepository.findMany(project.organizationId.toString(), { projectId: project._id.toString() }),
      ProjectDocument.find({
        organizationId: project.organizationId,
        projectId: project._id,
        visibility: 'PUBLIC_APPROVED',
        category: 'PROGRESS_PHOTO',
      }).lean(),
    ]);

    return toPublicProjectDTO(
      project,
      milestones
        .filter((m) => m.status !== 'CANCELLED')
        .map((m) => ({
          title: m.title,
          targetDate: m.targetDate,
          status: m.status,
          completionPercentage: m.completionPercentage,
        })),
      publicPhotos.map((ph) => ({
        title: ph.title,
        fileUrl: ph.fileUrl,
      }))
    );
  }
}

export const projectService = new ProjectService();
