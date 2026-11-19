import { describe, it, expect, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import {
  ProgramService,
  assertValidProgramTransition,
  toPublicProgramDTO,
} from '../server/services/program.service';
import {
  ProjectService,
  assertValidProjectTransition,
  assertSafeBeneficiarySummary,
  calculateProjectBudgetSummary,
  toPublicProjectDTO,
} from '../server/services/project.service';
import { programRepository } from '../server/repositories/program.repository';
import { projectRepository } from '../server/repositories/project.repository';
import { taskRepository } from '../server/repositories/task.repository';
import { milestoneRepository } from '../server/repositories/milestone.repository';
import { projectOperationsRepository } from '../server/repositories/project-operations.repository';
import { userRepository } from '../server/repositories/user.repository';
import { departmentRepository } from '../server/repositories/department.repository';
import { organizationRepository } from '../server/repositories/organization.repository';
import { adminService, AdminActor } from '../server/services/admin.service';
import { emailProvider } from '../integrations/email/nodemailer.provider';
import { validateDocumentFile } from '../integrations/storage/local.provider';
import { createProgramSchema } from '../features/programs/schemas/program.schema';
import { createProjectSchema } from '../features/projects/schemas/project.schema';
import { createTaskSchema } from '../features/tasks/schemas/task.schema';
import { createBudgetEntrySchema } from '../features/project-budget/schemas/budget.schema';

const ORG_A_ID = new mongoose.Types.ObjectId().toString();
const ORG_B_ID = new mongoose.Types.ObjectId().toString();
const PM_ID = new mongoose.Types.ObjectId().toString();
const DIRECTOR_ID = new mongoose.Types.ObjectId().toString();
const MEMBER_ID = new mongoose.Types.ObjectId().toString();
const OTHER_MEMBER_ID = new mongoose.Types.ObjectId().toString();
const PROGRAM_ID = new mongoose.Types.ObjectId().toString();
const PROJECT_ID = new mongoose.Types.ObjectId().toString();

const pmActor: AdminActor = {
  id: PM_ID,
  name: 'Riya Sharma',
  email: 'riya@org-a.org',
  role: 'PROJECT_MANAGER',
  organizationId: ORG_A_ID,
};

const directorActor: AdminActor = {
  id: DIRECTOR_ID,
  name: 'Dr. Arvind Verma',
  email: 'director@org-a.org',
  role: 'EXECUTIVE_DIRECTOR',
  organizationId: ORG_A_ID,
};

const memberActor: AdminActor = {
  id: MEMBER_ID,
  name: 'Field Associate',
  email: 'field@org-a.org',
  role: 'TEAM_MEMBER',
  organizationId: ORG_A_ID,
};

describe('Phase 7: Program, Project, Task & Budget Zod Schemas', () => {
  it('validates program creation and rejects invalid slugs or codes', () => {
    expect(
      createProgramSchema.safeParse({
        title: 'Education & Digital Literacy',
        slug: 'education-digital-literacy',
        code: 'PRG-EDU-01',
        shortDescription: 'Bringing digital classrooms to rural blocks.',
        category: 'Education & Digital Literacy',
        budget: 1500000,
      }).success
    ).toBe(true);

    expect(
      createProgramSchema.safeParse({
        title: 'Bad Program',
        slug: 'Invalid Slug!',
        code: 'lower_code',
        shortDescription: 'short',
        category: 'Education',
      }).success
    ).toBe(false);
  });

  it('validates project, task, and budget entry schemas strictly', () => {
    expect(
      createProjectSchema.safeParse({
        name: 'Bundelkhand Solar Water Grid',
        code: 'PRJ-WAT-01',
        slug: 'bundelkhand-solar-water-grid',
        shortDescription: 'Clean solar-powered aquifer stations across 12 villages.',
        category: 'Rural Development',
        approvedBudget: 500000,
      }).success
    ).toBe(true);

    expect(
      createProjectSchema.safeParse({
        name: 'Bad Coords',
        code: 'PRJ-02',
        slug: 'bad-coords',
        shortDescription: 'Valid length description for project.',
        category: 'Rural Development',
        coordinates: { lat: 200, lng: 0 },
      }).success
    ).toBe(false);

    expect(
      createTaskSchema.safeParse({
        title: 'Conduct Village Baseline Survey',
        projectId: PROJECT_ID,
        priority: 'HIGH',
      }).success
    ).toBe(true);

    expect(
      createBudgetEntrySchema.safeParse({
        category: 'INFRASTRUCTURE',
        description: 'Solar pump installation',
        plannedAmount: 100000,
        actualAmount: -500,
      }).success
    ).toBe(false);
  });
});

describe('Phase 7: Program & Project Lifecycle State Machines', () => {
  it('allows valid program lifecycle transitions and blocks invalid transitions or unauthorized approvals', () => {
    expect(() => assertValidProgramTransition('DRAFT', 'PENDING_APPROVAL', pmActor)).not.toThrow();
    expect(() => assertValidProgramTransition('PENDING_APPROVAL', 'APPROVED', directorActor)).not.toThrow();
    expect(() => assertValidProgramTransition('APPROVED', 'ACTIVE', pmActor)).not.toThrow();
    expect(() => assertValidProgramTransition('ACTIVE', 'COMPLETED', pmActor)).not.toThrow();

    // Invalid direct jump DRAFT -> COMPLETED
    expect(() => assertValidProgramTransition('DRAFT', 'COMPLETED', directorActor)).toThrow(
      /Invalid program lifecycle transition/i
    );

    // Unauthorized approval by PROJECT_MANAGER
    expect(() => assertValidProgramTransition('PENDING_APPROVAL', 'APPROVED', pmActor)).toThrow(
      /programs\.approve/i
    );
  });

  it('allows valid project lifecycle transitions and restricts approve/cancel/complete/archive', () => {
    expect(() => assertValidProjectTransition('DRAFT', 'PENDING_APPROVAL', pmActor)).not.toThrow();
    expect(() => assertValidProjectTransition('PENDING_APPROVAL', 'APPROVED', directorActor)).not.toThrow();
    expect(() => assertValidProjectTransition('APPROVED', 'ACTIVE', pmActor)).not.toThrow();

    // Invalid direct jump DRAFT -> ACTIVE
    expect(() => assertValidProjectTransition('DRAFT', 'ACTIVE', directorActor)).toThrow(
      /Invalid project lifecycle transition/i
    );

    // PROJECT_MANAGER cannot approve, cancel, complete, or archive
    expect(() => assertValidProjectTransition('PENDING_APPROVAL', 'APPROVED', pmActor)).toThrow(
      /projects\.approve/i
    );
    expect(() => assertValidProjectTransition('ACTIVE', 'CANCELLED', pmActor)).toThrow(/projects\.approve/i);
    expect(() => assertValidProjectTransition('ACTIVE', 'COMPLETED', pmActor)).toThrow(/projects\.approve/i);
    expect(() => assertValidProjectTransition('COMPLETED', 'ARCHIVED', pmActor)).toThrow(/projects\.archive/i);
  });
});

describe('Phase 7: Budget Calculations, Beneficiary Privacy & Public/Private Content Separation', () => {
  it('computes accurate budget totals, remaining balance, utilization %, and variance flags from persisted entries', () => {
    const summary = calculateProjectBudgetSummary(500000, [
      { category: 'PERSONNEL', plannedAmount: 200000, actualAmount: 180000 },
      { category: 'EQUIPMENT', plannedAmount: 150000, actualAmount: 170000 },
      { category: 'TRAINING', plannedAmount: 100000, actualAmount: 50000 },
    ]);

    expect(summary.approvedBudget).toBe(500000);
    expect(summary.totalPlanned).toBe(450000);
    expect(summary.totalActual).toBe(400000);
    expect(summary.remainingBudget).toBe(100000);
    expect(summary.utilizationPercentage).toBe(80);
    expect(summary.exceedsPlanned).toBe(false);
    expect(summary.exceedsApproved).toBe(false);

    const equipment = summary.byCategory.find((c) => c.category === 'EQUIPMENT');
    expect(equipment?.variance).toBe(-20000);
  });

  it('rejects personal identifying information in beneficiary summaries (safeguarding)', () => {
    expect(() =>
      assertSafeBeneficiarySummary({
        participationNotes: 'Aggregated reach across 4 rural gram panchayats',
        demographics: [{ groupLabel: 'Women Self-Help Groups', count: 240 }],
      })
    ).not.toThrow();

    expect(() =>
      assertSafeBeneficiarySummary({
        participationNotes: 'Contact beneficiary at person@example.com for follow up',
      })
    ).toThrow(/Personal identifiers/i);

    expect(() =>
      assertSafeBeneficiarySummary({
        outcomeSummary: 'Beneficiary mobile 9876543210 confirmed attendance',
      })
    ).toThrow(/Personal identifiers/i);

    expect(() =>
      assertSafeBeneficiarySummary({
        demographics: [{ groupLabel: 'Aadhaar 1234 5678 9012', count: 1 }],
      })
    ).toThrow(/Personal identifiers/i);
  });

  it('strictly excludes internal budgets, private docs, risks, and granular minor demographics from public projections', () => {
    const mockProgram = {
      _id: new mongoose.Types.ObjectId(PROGRAM_ID),
      title: 'Women Empowerment',
      slug: 'women-empowerment',
      code: 'PRG-WOM-01',
      category: 'Women Empowerment',
      shortDescription: 'Livelihood and financial literacy program.',
      budget: 2500000,
      targetBeneficiaries: 1000,
      actualBeneficiaries: 650,
      status: 'ACTIVE',
      objectives: ['Micro-enterprise training'],
      geographicCoverage: ['Uttar Pradesh'],
      expectedOutcomes: ['Income resilience'],
      gallery: [],
    };
    const publicProg = toPublicProgramDTO(mockProgram as never);
    expect('budget' in publicProg).toBe(false);
    expect(publicProg.title).toBe('Women Empowerment');

    const mockProject = {
      _id: new mongoose.Types.ObjectId(PROJECT_ID),
      name: 'Tailoring Cooperative',
      code: 'PRJ-WOM-01',
      slug: 'tailoring-cooperative',
      category: 'Women Empowerment',
      shortDescription: 'Community tailoring hub.',
      approvedBudget: 950000,
      targetBeneficiaries: 300,
      actualBeneficiaries: 220,
      progressPercentage: 75,
      status: 'ACTIVE',
      beneficiarySummary: {
        targetCount: 300,
        actualCount: 220,
        categories: ['Women Artisans'],
        geographicCoverage: ['Lucknow'],
        includesMinorBeneficiaries: true,
        safeguardingVerified: true,
        demographics: [{ groupLabel: 'Minors', count: 15 }],
        participationNotes: 'Internal staff note',
        outcomeSummary: '220 women trained',
      },
      expectedOutcomes: ['Self-employment'],
      keyDeliverables: ['50 sewing stations'],
      images: [],
    };
    const publicProj = toPublicProjectDTO(mockProject as never);
    expect('approvedBudget' in publicProj).toBe(false);
    expect('demographics' in publicProj.beneficiaryReach).toBe(false);
    expect('participationNotes' in publicProj.beneficiaryReach).toBe(false);
    expect(publicProj.beneficiaryReach.actualCount).toBe(220);
  });

  it('enforces document MIME allowlist and 15 MB size cap', () => {
    expect(() => validateDocumentFile('application/pdf', 1024 * 500)).not.toThrow();
    expect(() => validateDocumentFile('application/x-msdownload', 1024)).toThrow(/Unsupported file MIME type/i);
    expect(() => validateDocumentFile('application/pdf', 20 * 1024 * 1024)).toThrow(/File size must be/i);
  });
});

describe('Phase 7: Service-Level Tenant Isolation, Approvals, Tasks, Milestones & Audit Logs', () => {
  const programService = new ProgramService();
  const projectService = new ProjectService();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(adminService, 'logAudit').mockResolvedValue({ _id: new mongoose.Types.ObjectId() } as never);
    vi.spyOn(emailProvider, 'sendEmail').mockResolvedValue({ success: true, messageId: 'msg-1' });
    vi.spyOn(organizationRepository, 'findById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(ORG_A_ID),
      name: 'HopeHorizon Foundation',
      notificationSettings: { emailNotifications: true },
    } as never);
  });

  it('rejects cross-tenant manager/department assignments and cross-tenant team assignments', async () => {
    vi.spyOn(projectRepository, 'findBySlugOrCode').mockResolvedValue(null);
    vi.spyOn(userRepository, 'findById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(OTHER_MEMBER_ID),
      organizationId: new mongoose.Types.ObjectId(ORG_B_ID),
      name: 'Foreign User',
      status: 'active',
    } as never);

    await expect(
      projectService.createProject(
        ORG_A_ID,
        {
          name: 'Cross Tenant PM Test',
          code: 'PRJ-XT-01',
          slug: 'cross-tenant-pm',
          shortDescription: 'Testing cross-tenant manager rejection.',
          category: 'Rural Development',
          projectManagerId: OTHER_MEMBER_ID,
          approvedBudget: 0,
          targetBeneficiaries: 0,
          actualBeneficiaries: 0,
          expectedOutcomes: [],
          keyDeliverables: [],
          riskLevel: 'LOW',
          priority: 'MEDIUM',
          images: [],
          isPublicVisible: false,
        },
        pmActor
      )
    ).rejects.toThrow(/active user in this organization/i);

    vi.spyOn(projectRepository, 'findById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(PROJECT_ID),
      organizationId: new mongoose.Types.ObjectId(ORG_A_ID),
      name: 'Tenant A Project',
      teamMembers: [],
    } as never);

    await expect(
      projectService.assignTeamMember(
        PROJECT_ID,
        ORG_A_ID,
        { userId: OTHER_MEMBER_ID, responsibility: 'Coordinator', accessLevel: 'CONTRIBUTOR' },
        pmActor
      )
    ).rejects.toThrow(/Cross-tenant team assignment is forbidden/i);
  });

  it('rejects department belonging to another tenant on program creation', async () => {
    vi.spyOn(programRepository, 'findBySlugOrCode').mockResolvedValue(null);
    vi.spyOn(departmentRepository, 'findById').mockResolvedValue(null);

    await expect(
      programService.createProgram(
        ORG_A_ID,
        {
          title: 'Health Program',
          slug: 'health-program',
          code: 'PRG-HLTH-01',
          shortDescription: 'Primary medical camp program.',
          category: 'Healthcare & Medical Support',
          departmentId: new mongoose.Types.ObjectId().toString(),
          objectives: [],
          gallery: [],
          budget: 0,
          targetBeneficiaries: 0,
          actualBeneficiaries: 0,
          geographicCoverage: [],
          expectedOutcomes: [],
          kpis: [],
          isPublicVisible: false,
        },
        directorActor
      )
    ).rejects.toThrow(/department does not exist in this organization/i);
  });

  it('enforces NO SELF-APPROVAL and requires rejection reason on project approvals', async () => {
    const approvalId = new mongoose.Types.ObjectId().toString();
    vi.spyOn(projectRepository, 'findById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(PROJECT_ID),
      organizationId: new mongoose.Types.ObjectId(ORG_A_ID),
      name: 'Clean Water Project',
      status: 'PENDING_APPROVAL',
    } as never);

    vi.spyOn(projectOperationsRepository, 'findApprovalById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(approvalId),
      organizationId: new mongoose.Types.ObjectId(ORG_A_ID),
      entityType: 'PROJECT',
      entityId: new mongoose.Types.ObjectId(PROJECT_ID),
      submittedBy: new mongoose.Types.ObjectId(DIRECTOR_ID), // Director submitted it themselves
      status: 'PENDING',
    } as never);

    // Self-approval MUST fail even for EXECUTIVE_DIRECTOR
    await expect(
      projectService.decideProjectApproval(
        PROJECT_ID,
        ORG_A_ID,
        { approvalId, decision: 'APPROVED' },
        directorActor
      )
    ).rejects.toThrow(/cannot approve or reject their own/i);

    // When submitted by PM, rejecting without reason fails, and approving succeeds with audit log
    vi.spyOn(projectOperationsRepository, 'findApprovalById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(approvalId),
      organizationId: new mongoose.Types.ObjectId(ORG_A_ID),
      entityType: 'PROJECT',
      entityId: new mongoose.Types.ObjectId(PROJECT_ID),
      submittedBy: new mongoose.Types.ObjectId(PM_ID),
      status: 'PENDING',
    } as never);

    await expect(
      projectService.decideProjectApproval(
        PROJECT_ID,
        ORG_A_ID,
        { approvalId, decision: 'REJECTED' },
        directorActor
      )
    ).rejects.toThrow(/Rejection reason is required/i);

    vi.spyOn(projectOperationsRepository, 'updateApproval').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(approvalId),
      status: 'APPROVED',
    } as never);
    vi.spyOn(projectRepository, 'update').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(PROJECT_ID),
      status: 'APPROVED',
    } as never);
    vi.spyOn(userRepository, 'findById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(PM_ID),
      name: 'Riya Sharma',
      email: 'riya@org-a.org',
    } as never);

    await projectService.decideProjectApproval(
      PROJECT_ID,
      ORG_A_ID,
      { approvalId, decision: 'APPROVED', comments: 'Scope verified' },
      directorActor
    );
    expect(adminService.logAudit).toHaveBeenCalledWith(
      directorActor,
      'PROJECT_APPROVED',
      'Project',
      PROJECT_ID,
      expect.stringContaining('APPROVED'),
      expect.any(Object)
    );
  });

  it('enforces task assignment permissions and prevents non-managers from editing others tasks', async () => {
    const taskId = new mongoose.Types.ObjectId().toString();
    vi.spyOn(taskRepository, 'findById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(taskId),
      organizationId: new mongoose.Types.ObjectId(ORG_A_ID),
      projectId: new mongoose.Types.ObjectId(PROJECT_ID),
      title: 'Distribute Kits',
      assignedUserId: new mongoose.Types.ObjectId(OTHER_MEMBER_ID),
      status: 'TODO',
      comments: [],
    } as never);

    // TEAM_MEMBER trying to update another user's task is forbidden
    await expect(
      projectService.updateTask(taskId, ORG_A_ID, { status: 'COMPLETED' }, memberActor)
    ).rejects.toThrow(/only update tasks assigned directly to you/i);

    // TEAM_MEMBER trying to reassign their own task without tasks.assign_manage is forbidden
    vi.spyOn(taskRepository, 'findById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(taskId),
      organizationId: new mongoose.Types.ObjectId(ORG_A_ID),
      projectId: new mongoose.Types.ObjectId(PROJECT_ID),
      title: 'Distribute Kits',
      assignedUserId: new mongoose.Types.ObjectId(MEMBER_ID),
      status: 'TODO',
      comments: [],
    } as never);

    await expect(
      projectService.updateTask(taskId, ORG_A_ID, { assignedUserId: OTHER_MEMBER_ID }, memberActor)
    ).rejects.toThrow(/tasks\.assign_manage/i);
  });

  it('recalculates project progress automatically when milestones complete', async () => {
    vi.spyOn(milestoneRepository, 'findMany').mockResolvedValue([
      { status: 'COMPLETED', completionPercentage: 100 },
      { status: 'IN_PROGRESS', completionPercentage: 50 },
      { status: 'CANCELLED', completionPercentage: 0 },
    ] as never);
    const updateProjSpy = vi.spyOn(projectRepository, 'update').mockResolvedValue({} as never);

    const avg = await projectService.recalculateProjectProgress(PROJECT_ID, ORG_A_ID);
    expect(avg).toBe(75);
    expect(updateProjSpy).toHaveBeenCalledWith(PROJECT_ID, ORG_A_ID, { progressPercentage: 75 });
  });

  it('prevents publishing DRAFT programs or uploading PUBLIC_APPROVED docs without authorization', async () => {
    vi.spyOn(programRepository, 'findById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(PROGRAM_ID),
      organizationId: new mongoose.Types.ObjectId(ORG_A_ID),
      title: 'Draft Program',
      status: 'DRAFT',
    } as never);

    await expect(
      programService.updateProgram(PROGRAM_ID, ORG_A_ID, { isPublicVisible: true }, directorActor)
    ).rejects.toThrow(/Only APPROVED, ACTIVE, or COMPLETED programs/i);

    vi.spyOn(projectRepository, 'findById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(PROJECT_ID),
      organizationId: new mongoose.Types.ObjectId(ORG_A_ID),
      name: 'Field Project',
    } as never);

    await expect(
      projectService.createProjectDocument(
        PROJECT_ID,
        ORG_A_ID,
        {
          title: 'Public Photo',
          category: 'PROGRESS_PHOTO',
          fileName: 'camp.jpg',
          mimeType: 'image/jpeg',
          fileSizeBytes: 50000,
          visibility: 'PUBLIC_APPROVED',
        },
        pmActor // PROJECT_MANAGER lacks content.publish & projects.approve
      )
    ).rejects.toThrow(/content\.publish or projects\.approve/i);
  });
});
