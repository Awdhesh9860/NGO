import crypto from 'crypto';
import mongoose from 'mongoose';
import connectToDatabase from '@/server/database/connection';
import { financeRepository } from '@/server/repositories/finance.repository';
import { programRepository } from '@/server/repositories/program.repository';
import { projectRepository } from '@/server/repositories/project.repository';
import { departmentRepository } from '@/server/repositories/department.repository';
import { ProjectBudgetEntry } from '@/server/database/models/ProjectBudgetEntry';
import { JournalLine } from '@/server/database/models/JournalLine';
import { GrantStatus } from '@/server/database/models/Grant';
import {
  ComplianceValidityStatus,
  IComplianceRecordDocument,
} from '@/server/database/models/ComplianceRecord';
import { accountingService } from '@/server/services/accounting.service';
import { adminService, AdminActor } from '@/server/services/admin.service';
import { checkRolePermission } from '@/server/authorization/permissions';
import { validateDocumentFile } from '@/integrations/storage/local.provider';
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '@/lib/error-handler';
import {
  calculateMinorPercentage,
  subtractMinorUnits,
  sumMinorUnits,
  toMinorUnits,
} from '@/lib/money';
import {
  CreateBudgetInput,
  CreateFundAllocationInput,
  CreateGrantInput,
  UpdateBudgetInput,
  UpdateGrantInput,
} from '@/features/finance/schemas/finance.schema';
import {
  CreateComplianceRecordInput,
  UpdateComplianceRecordInput,
} from '@/features/compliance/schemas/compliance.schema';

// ======================== PURE DOMAIN INVARIANTS ========================

export const GRANT_STATUS_TRANSITIONS: Record<GrantStatus, GrantStatus[]> = {
  DRAFT: ['APPLIED', 'CANCELLED'],
  APPLIED: ['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  REJECTED: ['DRAFT'],
  CANCELLED: [],
};

/**
 * Pure restricted-fund compliance validator:
 * Prevents allocating RESTRICTED donor/grant funds to an unauthorized program, project, or purpose.
 */
export function assertRestrictedFundCompliance(input: {
  restrictionType: 'UNRESTRICTED' | 'RESTRICTED';
  permittedPurposes: string[];
  permittedProgramId?: string;
  permittedProjectId?: string;
  allocatedProgramId?: string;
  allocatedProjectId?: string;
  purpose: string;
}): void {
  if (input.restrictionType !== 'RESTRICTED') return;

  if (
    input.permittedProgramId &&
    input.allocatedProgramId &&
    input.permittedProgramId !== input.allocatedProgramId
  ) {
    throw new ValidationError(
      'Restricted fund violation: fund cannot be allocated to a program outside its donor/grant restriction'
    );
  }
  if (
    input.permittedProjectId &&
    input.allocatedProjectId &&
    input.permittedProjectId !== input.allocatedProjectId
  ) {
    throw new ValidationError(
      'Restricted fund violation: fund cannot be allocated to a project outside its donor/grant restriction'
    );
  }
  if (input.permittedPurposes.length > 0) {
    const normalizedPurpose = input.purpose.toLowerCase();
    const matchesPermitted = input.permittedPurposes.some((p) => {
      const token = p.trim().toLowerCase();
      return token.length > 0 && (normalizedPurpose.includes(token) || token.includes(normalizedPurpose));
    });
    if (!matchesPermitted) {
      throw new ValidationError(
        `Restricted fund violation: allocation purpose "${input.purpose}" does not match permitted purposes (${input.permittedPurposes.join(', ')})`
      );
    }
  }
}

export interface BudgetUtilizationSummary {
  plannedAmountMinor: number;
  approvedAmountMinor: number;
  actualSpentMinor: number;
  remainingAmountMinor: number;
  varianceMinor: number;
  utilizationPercent: number;
  isAlertTriggered: boolean;
  isOverBudget: boolean;
}

/**
 * Pure integer-safe budget utilization computation from posted ledger expenditure.
 */
export function computeBudgetUtilization(
  plannedAmountMinor: number,
  approvedAmountMinor: number,
  actualSpentMinor: number,
  alertThresholdPercent = 85
): BudgetUtilizationSummary {
  const baselineMinor = approvedAmountMinor > 0 ? approvedAmountMinor : plannedAmountMinor;
  const remainingAmountMinor = subtractMinorUnits(baselineMinor, actualSpentMinor);
  const varianceMinor = subtractMinorUnits(baselineMinor, actualSpentMinor);
  const utilizationPercent = calculateMinorPercentage(actualSpentMinor, baselineMinor);
  return {
    plannedAmountMinor,
    approvedAmountMinor,
    actualSpentMinor,
    remainingAmountMinor,
    varianceMinor,
    utilizationPercent,
    isAlertTriggered: utilizationPercent >= alertThresholdPercent,
    isOverBudget: actualSpentMinor > baselineMinor,
  };
}

export interface ComplianceDeadlineEvaluation {
  id: string;
  complianceType: string;
  title: string;
  jurisdiction: string;
  validityStatus: ComplianceValidityStatus;
  effectiveDeadline?: Date;
  daysUntilDeadline: number | null;
  urgency: 'OVERDUE' | 'DUE_SOON' | 'UPCOMING' | 'NO_DEADLINE' | 'NOT_APPLICABLE';
  isIndependentlyVerified: boolean;
}

/**
 * Pure compliance deadline evaluator — distinguishes recorded documents from verified compliance
 * and flags overdue or expiring (< 45 days) statutory obligations cleanly.
 */
export function evaluateComplianceDeadline(
  record: Pick<
    IComplianceRecordDocument,
    '_id' | 'complianceType' | 'title' | 'jurisdiction' | 'validityStatus' | 'expiryDate' | 'filingDeadline'
  >,
  now: Date = new Date()
): ComplianceDeadlineEvaluation {
  if (record.validityStatus === 'NOT_APPLICABLE') {
    return {
      id: String(record._id),
      complianceType: record.complianceType,
      title: record.title,
      jurisdiction: record.jurisdiction,
      validityStatus: record.validityStatus,
      daysUntilDeadline: null,
      urgency: 'NOT_APPLICABLE',
      isIndependentlyVerified: false,
    };
  }

  const candidates = [record.expiryDate, record.filingDeadline]
    .filter((d): d is Date => Boolean(d))
    .map((d) => new Date(d))
    .sort((a, b) => a.getTime() - b.getTime());

  const effectiveDeadline = candidates[0];
  if (!effectiveDeadline) {
    return {
      id: String(record._id),
      complianceType: record.complianceType,
      title: record.title,
      jurisdiction: record.jurisdiction,
      validityStatus: record.validityStatus,
      daysUntilDeadline: null,
      urgency: 'NO_DEADLINE',
      isIndependentlyVerified: record.validityStatus === 'INDEPENDENTLY_VERIFIED',
    };
  }

  const daysUntilDeadline = Math.ceil((effectiveDeadline.getTime() - now.getTime()) / 86400000);
  const urgency: ComplianceDeadlineEvaluation['urgency'] =
    daysUntilDeadline < 0 ? 'OVERDUE' : daysUntilDeadline <= 45 ? 'DUE_SOON' : 'UPCOMING';

  return {
    id: String(record._id),
    complianceType: record.complianceType,
    title: record.title,
    jurisdiction: record.jurisdiction,
    validityStatus: record.validityStatus,
    effectiveDeadline,
    daysUntilDeadline,
    urgency,
    isIndependentlyVerified: record.validityStatus === 'INDEPENDENTLY_VERIFIED',
  };
}

function generateCode(prefix: string): string {
  const year = new Date().getUTCFullYear();
  return `${prefix}-${year}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

export class BudgetGrantComplianceService {
  // ======================== BUDGETS (INTEGRATED WITH PHASE 07 PROJECT BUDGETS) ========================

  async createBudget(organizationId: string, input: CreateBudgetInput, actor: AdminActor) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'finance.budgets.manage')) {
      throw new AuthorizationError('Missing finance.budgets.manage permission');
    }

    if (input.level === 'DEPARTMENT' && !input.departmentId) {
      throw new ValidationError('departmentId is required for a DEPARTMENT-level budget');
    }
    if (input.level === 'PROGRAM' && !input.programId) {
      throw new ValidationError('programId is required for a PROGRAM-level budget');
    }
    if (input.level === 'PROJECT' && !input.projectId) {
      throw new ValidationError('projectId is required for a PROJECT-level budget');
    }

    if (input.departmentId) {
      const dept = await departmentRepository.findById(input.departmentId, organizationId);
      if (!dept) throw new ValidationError('Department not found in this organization');
    }
    if (input.programId) {
      const prog = await programRepository.findById(input.programId, organizationId);
      if (!prog) throw new ValidationError('Program not found in this organization');
    }
    if (input.projectId) {
      const proj = await projectRepository.findById(input.projectId, organizationId);
      if (!proj) throw new ValidationError('Project not found in this organization');
    }

    const budget = await financeRepository.createBudget({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      budgetCode: generateCode('BDG'),
      name: input.name,
      level: input.level,
      financialYear: input.financialYear,
      budgetPeriod: input.budgetPeriod || 'Annual',
      category: input.category,
      plannedAmountMinor: input.plannedAmountMinor,
      approvedAmountMinor: 0,
      currency: (input.currency || 'INR').toUpperCase(),
      alertThresholdPercent: input.alertThresholdPercent || 85,
      departmentId: input.departmentId ? new mongoose.Types.ObjectId(input.departmentId) : undefined,
      programId: input.programId ? new mongoose.Types.ObjectId(input.programId) : undefined,
      projectId: input.projectId ? new mongoose.Types.ObjectId(input.projectId) : undefined,
      linkedProjectBudgetEntryId: input.linkedProjectBudgetEntryId
        ? new mongoose.Types.ObjectId(input.linkedProjectBudgetEntryId)
        : undefined,
      approvalStatus: 'DRAFT',
      notes: input.notes,
      createdBy: new mongoose.Types.ObjectId(actor.id),
    });

    await adminService.logAudit(
      actor,
      'FINANCE_BUDGET_CREATED',
      'Budget',
      budget._id.toString(),
      `Created ${budget.level} budget ${budget.budgetCode} (${budget.plannedAmountMinor} minor units)`
    );

    return budget;
  }

  async updateBudgetWorkflow(
    budgetId: string,
    organizationId: string,
    input: UpdateBudgetInput,
    actor: AdminActor
  ) {
    const budget = await financeRepository.findBudgetById(budgetId, organizationId);
    if (!budget) throw new NotFoundError('Budget not found in this organization');

    if (input.action === 'APPROVE' || input.action === 'REJECT') {
      if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'finance.budgets.approve')) {
        throw new AuthorizationError('Missing finance.budgets.approve permission');
      }
      if (budget.createdBy.toString() === actor.id && actor.role !== 'SUPER_ADMIN') {
        throw new AuthorizationError('Budget creator cannot self-approve their own budget');
      }
      const nextStatus = input.action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
      const updated = await financeRepository.updateBudget(budgetId, organizationId, {
        $set: {
          approvalStatus: nextStatus,
          ...(input.action === 'APPROVE'
            ? {
                approvedAmountMinor: input.approvedAmountMinor || budget.plannedAmountMinor,
                approvedBy: new mongoose.Types.ObjectId(actor.id),
                approvedAt: new Date(),
              }
            : { rejectionReason: input.reason || 'Budget rejected during review' }),
          updatedBy: new mongoose.Types.ObjectId(actor.id),
        },
      });
      await adminService.logAudit(
        actor,
        `FINANCE_BUDGET_${input.action}`,
        'Budget',
        budgetId,
        `Budget ${budget.budgetCode} -> ${nextStatus}`
      );
      return updated;
    }

    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'finance.budgets.manage')) {
      throw new AuthorizationError('Missing finance.budgets.manage permission');
    }

    if (input.action === 'SUBMIT') {
      return financeRepository.updateBudget(budgetId, organizationId, {
        $set: { approvalStatus: 'SUBMITTED', updatedBy: new mongoose.Types.ObjectId(actor.id) },
      });
    }

    // REVISE
    if (!input.newPlannedAmountMinor || !input.reason?.trim()) {
      throw new ValidationError('newPlannedAmountMinor and reason are required to revise a budget');
    }
    const updated = await financeRepository.updateBudget(budgetId, organizationId, {
      $set: {
        plannedAmountMinor: input.newPlannedAmountMinor,
        approvalStatus: 'REVISED',
        updatedBy: new mongoose.Types.ObjectId(actor.id),
      },
      $push: {
        revisionHistory: {
          previousPlannedMinor: budget.plannedAmountMinor,
          newPlannedMinor: input.newPlannedAmountMinor,
          reason: input.reason.trim(),
          actorId: new mongoose.Types.ObjectId(actor.id),
          actorName: actor.name,
          timestamp: new Date(),
        },
      },
    });
    await adminService.logAudit(
      actor,
      'FINANCE_BUDGET_REVISED',
      'Budget',
      budgetId,
      `Revised budget ${budget.budgetCode}: ${budget.plannedAmountMinor} -> ${input.newPlannedAmountMinor}`
    );
    return updated;
  }

  /**
   * Lists multi-level budgets enriched with actual expenditure strictly derived from posted JournalLine
   * expense debits (never manually entered dashboard counters), plus Phase 07 ProjectBudgetEntry summaries.
   */
  async listBudgetsWithUtilization(
    organizationId: string,
    filters?: { financialYear?: string; level?: 'ORGANIZATION' | 'DEPARTMENT' | 'PROGRAM' | 'PROJECT'; projectId?: string }
  ) {
    await connectToDatabase();
    const orgObjId = new mongoose.Types.ObjectId(organizationId);
    const [budgets, projectBudgetEntries, postedExpenseLines] = await Promise.all([
      financeRepository.findBudgets(organizationId, filters),
      ProjectBudgetEntry.find({ organizationId: orgObjId }),
      JournalLine.find({
        organizationId: orgObjId,
        isPosted: true,
        accountTypeSnapshot: 'EXPENSE',
      }),
    ]);

    const enrichedBudgets = budgets.map((b) => {
      const matchingLines = postedExpenseLines.filter((line) => {
        if (b.level === 'PROJECT' && b.projectId) {
          return line.projectId?.toString() === b.projectId.toString();
        }
        if (b.level === 'PROGRAM' && b.programId) {
          return line.programId?.toString() === b.programId.toString();
        }
        if (b.level === 'DEPARTMENT' && b.departmentId) {
          return line.departmentId?.toString() === b.departmentId.toString();
        }
        return true; // ORGANIZATION level
      });
      const actualSpentMinor = sumMinorUnits(
        matchingLines.map((l) => subtractMinorUnits(l.debitMinor, l.creditMinor))
      );
      const utilization = computeBudgetUtilization(
        b.plannedAmountMinor,
        b.approvedAmountMinor,
        Math.max(0, actualSpentMinor),
        b.alertThresholdPercent
      );
      return {
        id: b._id.toString(),
        budgetCode: b.budgetCode,
        name: b.name,
        level: b.level,
        financialYear: b.financialYear,
        budgetPeriod: b.budgetPeriod,
        category: b.category,
        currency: b.currency,
        approvalStatus: b.approvalStatus,
        departmentId: b.departmentId?.toString(),
        programId: b.programId?.toString(),
        projectId: b.projectId?.toString(),
        alertThresholdPercent: b.alertThresholdPercent,
        ...utilization,
      };
    });

    // Bridge Phase 07 ProjectBudgetEntry without duplicating records (convert major plannedAmount -> minor)
    const projectBudgetBridge = projectBudgetEntries.map((entry) => {
      const plannedMinor = toMinorUnits(entry.plannedAmount || 0, 'INR');
      const ledgerSpentMinor = sumMinorUnits(
        postedExpenseLines
          .filter((l) => l.projectId?.toString() === entry.projectId.toString())
          .map((l) => subtractMinorUnits(l.debitMinor, l.creditMinor))
      );
      return {
        projectBudgetEntryId: entry._id.toString(),
        projectId: entry.projectId.toString(),
        budgetPeriod: entry.budgetPeriod,
        category: entry.category,
        description: entry.description,
        ledgerActualSpentMinor: Math.max(0, ledgerSpentMinor),
        ...computeBudgetUtilization(plannedMinor, plannedMinor, Math.max(0, ledgerSpentMinor), 85),
      };
    });

    return {
      budgets: enrichedBudgets,
      projectBudgetBridge,
      authoritativeSourceNote:
        'Approved planned budgets bridge Phase 07 ProjectBudgetEntry and Phase 10 multi-level Budgets; actual expenditures are computed strictly from posted General Ledger EXPENSE entries.',
    };
  }

  // ======================== FUND ALLOCATION & RESTRICTED FUNDS ========================

  async createFundAllocation(
    organizationId: string,
    input: CreateFundAllocationInput,
    actor: AdminActor
  ) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'finance.budgets.manage')) {
      throw new AuthorizationError('Missing finance.budgets.manage permission');
    }

    let permittedProgramId = input.permittedProgramId;
    let permittedProjectId = input.permittedProjectId;
    let permittedPurposes = input.permittedPurposes || [];
    let restrictionType = input.restrictionType;

    // If sourced from a Grant, automatically inherit its restriction rules
    if (input.fundSource === 'GRANT' && mongoose.Types.ObjectId.isValid(input.sourceReferenceId)) {
      const grant = await financeRepository.findGrantById(input.sourceReferenceId, organizationId);
      if (!grant) throw new ValidationError('Linked grant not found in this organization');
      if (grant.isRestricted) {
        restrictionType = 'RESTRICTED';
        if (grant.linkedProgramId && !permittedProgramId) {
          permittedProgramId = grant.linkedProgramId.toString();
        }
        if (grant.linkedProjectId && !permittedProjectId) {
          permittedProjectId = grant.linkedProjectId.toString();
        }
        if (grant.permittedPurposes.length > 0 && permittedPurposes.length === 0) {
          permittedPurposes = grant.permittedPurposes;
        }
      }
    }

    // STRICT RESTRICTED FUND CHECK
    assertRestrictedFundCompliance({
      restrictionType,
      permittedPurposes,
      permittedProgramId,
      permittedProjectId,
      allocatedProgramId: input.allocatedProgramId,
      allocatedProjectId: input.allocatedProjectId,
      purpose: input.purpose,
    });

    if (input.allocatedProgramId) {
      const prog = await programRepository.findById(input.allocatedProgramId, organizationId);
      if (!prog) throw new ValidationError('Target program not found in this organization');
    }
    if (input.allocatedProjectId) {
      const proj = await projectRepository.findById(input.allocatedProjectId, organizationId);
      if (!proj) throw new ValidationError('Target project not found in this organization');
    }
    if (input.allocatedDepartmentId) {
      const dept = await departmentRepository.findById(input.allocatedDepartmentId, organizationId);
      if (!dept) throw new ValidationError('Target department not found in this organization');
    }

    try {
      const allocation = await financeRepository.createFundAllocation({
        organizationId: new mongoose.Types.ObjectId(organizationId),
        allocationCode: generateCode('FND'),
        fundSource: input.fundSource,
        sourceReferenceId: input.sourceReferenceId,
        sourceLabel: input.sourceLabel,
        restrictionType,
        permittedPurposes,
        permittedProgramId: permittedProgramId ? new mongoose.Types.ObjectId(permittedProgramId) : undefined,
        permittedProjectId: permittedProjectId ? new mongoose.Types.ObjectId(permittedProjectId) : undefined,
        allocatedProgramId: input.allocatedProgramId
          ? new mongoose.Types.ObjectId(input.allocatedProgramId)
          : undefined,
        allocatedProjectId: input.allocatedProjectId
          ? new mongoose.Types.ObjectId(input.allocatedProjectId)
          : undefined,
        allocatedDepartmentId: input.allocatedDepartmentId
          ? new mongoose.Types.ObjectId(input.allocatedDepartmentId)
          : undefined,
        purpose: input.purpose,
        allocatedAmountMinor: input.allocatedAmountMinor,
        utilizedAmountMinor: 0,
        currency: (input.currency || 'INR').toUpperCase(),
        allocatedDate: new Date(),
        status: 'ACTIVE',
        history: [
          {
            action: 'CREATED',
            amountMinor: input.allocatedAmountMinor,
            note: `Allocated ${restrictionType} funds from ${input.fundSource} (${input.sourceLabel})`,
            actorId: new mongoose.Types.ObjectId(actor.id),
            actorName: actor.name,
            timestamp: new Date(),
          },
        ],
        createdBy: new mongoose.Types.ObjectId(actor.id),
      });

      await adminService.logAudit(
        actor,
        'FINANCE_FUND_ALLOCATED',
        'FundAllocation',
        allocation._id.toString(),
        `Allocated ${allocation.allocationCode} (${restrictionType}, ${allocation.allocatedAmountMinor} minor units)`
      );

      return allocation;
    } catch (err: unknown) {
      if ((err as { code?: number })?.code === 11000) {
        throw new ConflictError('Duplicate fund allocation for the same source, target, and purpose');
      }
      throw err;
    }
  }

  async listFundAllocations(organizationId: string, restrictionType?: string) {
    const items = await financeRepository.findFundAllocations(organizationId, restrictionType);
    return items.map((a) => ({
      id: a._id.toString(),
      allocationCode: a.allocationCode,
      fundSource: a.fundSource,
      sourceReferenceId: a.sourceReferenceId,
      sourceLabel: a.sourceLabel,
      restrictionType: a.restrictionType,
      permittedPurposes: a.permittedPurposes,
      purpose: a.purpose,
      allocatedProgramId: a.allocatedProgramId?.toString(),
      allocatedProjectId: a.allocatedProjectId?.toString(),
      allocatedDepartmentId: a.allocatedDepartmentId?.toString(),
      allocatedAmountMinor: a.allocatedAmountMinor,
      utilizedAmountMinor: a.utilizedAmountMinor,
      availableBalanceMinor: Math.max(0, subtractMinorUnits(a.allocatedAmountMinor, a.utilizedAmountMinor)),
      utilizationPercent: calculateMinorPercentage(a.utilizedAmountMinor, a.allocatedAmountMinor),
      currency: a.currency,
      allocatedDate: a.allocatedDate,
      status: a.status,
    }));
  }

  // ======================== GRANTS ========================

  async createGrant(organizationId: string, input: CreateGrantInput, actor: AdminActor) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'finance.grants.manage')) {
      throw new AuthorizationError('Missing finance.grants.manage permission');
    }

    if (input.linkedProgramId) {
      const prog = await programRepository.findById(input.linkedProgramId, organizationId);
      if (!prog) throw new ValidationError('Linked program not found in this organization');
    }
    if (input.linkedProjectId) {
      const proj = await projectRepository.findById(input.linkedProjectId, organizationId);
      if (!proj) throw new ValidationError('Linked project not found in this organization');
    }

    try {
      const grant = await financeRepository.createGrant({
        organizationId: new mongoose.Types.ObjectId(organizationId),
        grantReferenceNumber: input.grantReferenceNumber.toUpperCase(),
        grantName: input.grantName,
        providerName: input.providerName,
        providerType: input.providerType || 'FOUNDATION',
        awardDate: input.awardDate ? new Date(input.awardDate) : undefined,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        awardAmountMinor: input.awardAmountMinor,
        receivedAmountMinor: 0,
        currency: (input.currency || 'INR').toUpperCase(),
        isRestricted: input.isRestricted ?? true,
        restrictions: input.restrictions,
        permittedPurposes: input.permittedPurposes || [],
        linkedProgramId: input.linkedProgramId ? new mongoose.Types.ObjectId(input.linkedProgramId) : undefined,
        linkedProjectId: input.linkedProjectId ? new mongoose.Types.ObjectId(input.linkedProjectId) : undefined,
        reportingDeadlines: (input.reportingDeadlines || []).map((r) => ({
          title: r.title,
          dueDate: new Date(r.dueDate),
          status: 'PENDING' as const,
          notes: r.notes,
        })),
        disbursementSchedule: (input.disbursementSchedule || []).map((d) => ({
          trancheLabel: d.trancheLabel,
          expectedDate: new Date(d.expectedDate),
          expectedAmountMinor: d.expectedAmountMinor,
          receivedAmountMinor: 0,
          status: 'SCHEDULED' as const,
        })),
        status: 'DRAFT',
        statusHistory: [
          {
            status: 'DRAFT',
            actorId: new mongoose.Types.ObjectId(actor.id),
            actorName: actor.name,
            note: 'Grant record created',
            timestamp: new Date(),
          },
        ],
        createdBy: new mongoose.Types.ObjectId(actor.id),
      });

      await adminService.logAudit(
        actor,
        'FINANCE_GRANT_CREATED',
        'Grant',
        grant._id.toString(),
        `Created grant ${grant.grantReferenceNumber} (${grant.grantName})`
      );
      return grant;
    } catch (err: unknown) {
      if ((err as { code?: number })?.code === 11000) {
        throw new ConflictError('A grant with this reference number already exists in this organization');
      }
      throw err;
    }
  }

  async listGrants(organizationId: string, status?: GrantStatus) {
    return financeRepository.findGrants(organizationId, status);
  }

  async getGrantDetail(id: string, organizationId: string) {
    const grant = await financeRepository.findGrantById(id, organizationId);
    if (!grant) throw new NotFoundError('Grant not found in this organization');
    const allocations = await financeRepository.findFundAllocations(organizationId);
    const linkedAllocations = allocations.filter(
      (a) => a.fundSource === 'GRANT' && a.sourceReferenceId === id
    );
    const postedLines = await financeRepository.findPostedLedgerLines(organizationId, {
      grantId: id,
      accountType: 'EXPENSE',
    });
    const ledgerUtilizedMinor = sumMinorUnits(
      postedLines.map((l) => subtractMinorUnits(l.debitMinor, l.creditMinor))
    );
    return {
      grant,
      allocations: linkedAllocations,
      ledgerUtilizedMinor: Math.max(0, ledgerUtilizedMinor),
      remainingAwardMinor: Math.max(0, subtractMinorUnits(grant.awardAmountMinor, grant.receivedAmountMinor)),
      utilizationPercent: calculateMinorPercentage(Math.max(0, ledgerUtilizedMinor), grant.receivedAmountMinor || grant.awardAmountMinor),
    };
  }

  async updateGrant(
    grantId: string,
    organizationId: string,
    input: UpdateGrantInput,
    actor: AdminActor
  ) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'finance.grants.manage')) {
      throw new AuthorizationError('Missing finance.grants.manage permission');
    }

    const grant = await financeRepository.findGrantById(grantId, organizationId);
    if (!grant) throw new NotFoundError('Grant not found in this organization');

    if (input.action === 'UPDATE_STATUS') {
      if (!input.status) throw new ValidationError('Target status is required');
      if (input.status !== grant.status) {
        const allowed = GRANT_STATUS_TRANSITIONS[grant.status] || [];
        if (!allowed.includes(input.status)) {
          throw new ValidationError(`Invalid grant transition from "${grant.status}" to "${input.status}"`);
        }
      }
      const updated = await financeRepository.updateGrant(grantId, organizationId, {
        $set: { status: input.status, updatedBy: new mongoose.Types.ObjectId(actor.id) },
        $push: {
          statusHistory: {
            status: input.status,
            actorId: new mongoose.Types.ObjectId(actor.id),
            actorName: actor.name,
            note: input.note || `Transitioned to ${input.status}`,
            timestamp: new Date(),
          },
        },
      });
      await adminService.logAudit(
        actor,
        'FINANCE_GRANT_STATUS_UPDATE',
        'Grant',
        grantId,
        `Grant ${grant.grantReferenceNumber}: ${grant.status} -> ${input.status}`
      );
      return { grant: updated, journal: null };
    }

    if (input.action === 'RECORD_RECEIPT') {
      if (!input.receiptAmountMinor) {
        throw new ValidationError('receiptAmountMinor is required when recording a grant disbursement receipt');
      }
      const nextReceived = sumMinorUnits([grant.receivedAmountMinor, input.receiptAmountMinor]);
      if (nextReceived > grant.awardAmountMinor) {
        throw new ValidationError('Total received grant funds cannot exceed awardAmountMinor');
      }
      const receiptDate = input.receiptDate ? new Date(input.receiptDate) : new Date();
      const trancheKey = input.trancheLabel || `TRANCHE-${Date.now()}`;

      // Post balanced double-entry journal idempotently: DR Bank (1020) / CR Institutional Grants Income (4030)
      const ledgerPost = await accountingService.postAutomatedLedgerEvent(
        organizationId,
        {
          transactionDate: receiptDate,
          description: `Grant Receipt ${grant.grantReferenceNumber} (${trancheKey}) — ${grant.providerName}`,
          referenceType: 'GRANT_RECEIPT',
          referenceId: grant._id.toString(),
          idempotencyKey: `GRANT_RECEIPT:${grant._id.toString()}:${trancheKey}`,
          currency: grant.currency,
          debitAccountCode: {
            code: '1020',
            name: 'Primary NGO Bank Account',
            type: 'ASSET',
            category: 'Bank Accounts',
          },
          creditAccountCode: {
            code: '4030',
            name: 'Institutional Grants Income',
            type: 'INCOME',
            category: 'Grants',
          },
          amountMinor: input.receiptAmountMinor,
          dimensions: {
            programId: grant.linkedProgramId?.toString(),
            projectId: grant.linkedProjectId?.toString(),
            grantId: grant._id.toString(),
          },
        },
        actor
      );

      const updated = await financeRepository.updateGrant(grantId, organizationId, {
        $set: {
          receivedAmountMinor: nextReceived,
          status: grant.status === 'APPROVED' ? 'ACTIVE' : grant.status,
          updatedBy: new mongoose.Types.ObjectId(actor.id),
        },
      });

      await adminService.logAudit(
        actor,
        'FINANCE_GRANT_RECEIPT',
        'Grant',
        grantId,
        `Recorded receipt of ${input.receiptAmountMinor} minor units on grant ${grant.grantReferenceNumber}`
      );
      return { grant: updated, journal: ledgerPost.journal };
    }

    // SUBMIT_REPORT
    const updatedDeadlines = (grant.reportingDeadlines || []).map((r) =>
      r.title === input.reportTitle ? { ...r, status: 'SUBMITTED' as const, submittedAt: new Date() } : r
    );
    const updated = await financeRepository.updateGrant(grantId, organizationId, {
      $set: { reportingDeadlines: updatedDeadlines, updatedBy: new mongoose.Types.ObjectId(actor.id) },
    });
    return { grant: updated, journal: null };
  }

  // ======================== COMPLIANCE RECORDS & DEADLINES ========================

  async createComplianceRecord(
    organizationId: string,
    input: CreateComplianceRecordInput,
    actor: AdminActor
  ) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'compliance.manage')) {
      throw new AuthorizationError('Missing compliance.manage permission');
    }

    // Never auto-verify uploaded documents: initial status is always DOCUMENT_RECORDED (or DRAFT / NOT_APPLICABLE)
    const initialStatus: ComplianceValidityStatus = !input.isRequiredForOrg
      ? 'NOT_APPLICABLE'
      : input.documentRef || input.registrationNumber
      ? 'DOCUMENT_RECORDED'
      : 'DRAFT';

    const record = await financeRepository.createComplianceRecord({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      complianceType: input.complianceType,
      customTypeName: input.customTypeName,
      title: input.title,
      jurisdiction: input.jurisdiction || 'India',
      isRequiredForOrg: input.isRequiredForOrg ?? true,
      registrationNumber: input.registrationNumber,
      issuingAuthority: input.issuingAuthority,
      issueDate: input.issueDate ? new Date(input.issueDate) : undefined,
      expiryDate: input.expiryDate ? new Date(input.expiryDate) : undefined,
      filingDeadline: input.filingDeadline ? new Date(input.filingDeadline) : undefined,
      reviewDate: input.reviewDate ? new Date(input.reviewDate) : undefined,
      validityStatus: initialStatus,
      documentRef: input.documentRef,
      responsibleUserId: input.responsibleUserId
        ? new mongoose.Types.ObjectId(input.responsibleUserId)
        : undefined,
      notes: input.notes,
      createdBy: new mongoose.Types.ObjectId(actor.id),
    });

    await adminService.logAudit(
      actor,
      'COMPLIANCE_RECORD_CREATED',
      'ComplianceRecord',
      record._id.toString(),
      `Recorded compliance entry ${record.complianceType} (${record.title}) with status ${initialStatus}`
    );

    return record;
  }

  async listComplianceRecords(
    organizationId: string,
    filters?: { complianceType?: string; validityStatus?: string }
  ) {
    const records = await financeRepository.findComplianceRecords(organizationId, filters);
    const now = new Date();
    return records.map((r) => ({
      id: r._id.toString(),
      complianceType: r.complianceType,
      customTypeName: r.customTypeName,
      title: r.title,
      jurisdiction: r.jurisdiction,
      isRequiredForOrg: r.isRequiredForOrg,
      registrationNumber: r.registrationNumber,
      issuingAuthority: r.issuingAuthority,
      issueDate: r.issueDate,
      expiryDate: r.expiryDate,
      filingDeadline: r.filingDeadline,
      reviewDate: r.reviewDate,
      validityStatus: r.validityStatus,
      documentRef: r.documentRef,
      responsibleUserId: r.responsibleUserId?.toString(),
      verifiedBy: r.verifiedBy?.toString(),
      verifiedAt: r.verifiedAt,
      verificationNotes: r.verificationNotes,
      notes: r.notes,
      deadlineEvaluation: evaluateComplianceDeadline(r, now),
    }));
  }

  async updateComplianceRecord(
    id: string,
    organizationId: string,
    input: UpdateComplianceRecordInput,
    actor: AdminActor
  ) {
    const existing = await financeRepository.findComplianceRecordById(id, organizationId);
    if (!existing) throw new NotFoundError('Compliance record not found in this organization');

    if (input.action === 'VERIFY') {
      if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'compliance.verify')) {
        throw new AuthorizationError(
          'Missing compliance.verify permission to mark a compliance record as INDEPENDENTLY_VERIFIED'
        );
      }
      if (!existing.registrationNumber && !existing.documentRef?.storageKey && !input.registrationNumber) {
        throw new ValidationError(
          'Cannot mark record INDEPENDENTLY_VERIFIED without a recorded registration number or supporting document reference'
        );
      }
      const updated = await financeRepository.updateComplianceRecord(id, organizationId, {
        $set: {
          validityStatus: 'INDEPENDENTLY_VERIFIED',
          verifiedBy: new mongoose.Types.ObjectId(actor.id),
          verifiedAt: new Date(),
          verificationNotes: input.verificationNotes || 'Independently reviewed and verified',
          ...(input.registrationNumber ? { registrationNumber: input.registrationNumber.toUpperCase() } : {}),
          updatedBy: new mongoose.Types.ObjectId(actor.id),
        },
        $push: {
          renewalHistory: {
            action: 'INDEPENDENTLY_VERIFIED',
            actorId: new mongoose.Types.ObjectId(actor.id),
            actorName: actor.name,
            note: input.verificationNotes || 'Verified externally',
            timestamp: new Date(),
          },
        },
      });
      await adminService.logAudit(
        actor,
        'COMPLIANCE_RECORD_VERIFIED',
        'ComplianceRecord',
        id,
        `Marked compliance record ${existing.complianceType} (${existing.title}) as INDEPENDENTLY_VERIFIED`
      );
      return updated;
    }

    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'compliance.manage')) {
      throw new AuthorizationError('Missing compliance.manage permission');
    }

    if (input.action === 'MARK_NOT_APPLICABLE') {
      return financeRepository.updateComplianceRecord(id, organizationId, {
        $set: {
          isRequiredForOrg: false,
          validityStatus: 'NOT_APPLICABLE',
          notes: input.notes || existing.notes,
          updatedBy: new mongoose.Types.ObjectId(actor.id),
        },
      });
    }

    if (input.action === 'RENEW') {
      if (!input.expiryDate) {
        throw new ValidationError('New expiryDate is required when recording a compliance renewal');
      }
      // Renewal resets status back to DOCUMENT_RECORDED until independently re-verified
      const updated = await financeRepository.updateComplianceRecord(id, organizationId, {
        $set: {
          expiryDate: new Date(input.expiryDate),
          validityStatus: 'DOCUMENT_RECORDED',
          updatedBy: new mongoose.Types.ObjectId(actor.id),
        },
        $push: {
          renewalHistory: {
            action: 'RENEWAL_RECORDED',
            previousExpiryDate: existing.expiryDate,
            newExpiryDate: new Date(input.expiryDate),
            actorId: new mongoose.Types.ObjectId(actor.id),
            actorName: actor.name,
            note: input.notes || 'Renewal recorded; awaiting independent verification',
            timestamp: new Date(),
          },
        },
      });
      return updated;
    }

    return financeRepository.updateComplianceRecord(id, organizationId, {
      $set: {
        ...(input.title ? { title: input.title } : {}),
        ...(input.registrationNumber !== undefined
          ? { registrationNumber: input.registrationNumber.toUpperCase() }
          : {}),
        ...(input.issuingAuthority !== undefined ? { issuingAuthority: input.issuingAuthority } : {}),
        ...(input.expiryDate ? { expiryDate: new Date(input.expiryDate) } : {}),
        ...(input.filingDeadline ? { filingDeadline: new Date(input.filingDeadline) } : {}),
        ...(input.reviewDate ? { reviewDate: new Date(input.reviewDate) } : {}),
        ...(input.responsibleUserId
          ? { responsibleUserId: new mongoose.Types.ObjectId(input.responsibleUserId) }
          : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        updatedBy: new mongoose.Types.ObjectId(actor.id),
      },
    });
  }

  async getComplianceDeadlines(organizationId: string, now: Date = new Date()) {
    const records = await financeRepository.findComplianceRecords(organizationId);
    const evaluations = records
      .map((r) => evaluateComplianceDeadline(r, now))
      .filter((e) => e.urgency !== 'NOT_APPLICABLE');

    const overdue = evaluations.filter((e) => e.urgency === 'OVERDUE');
    const dueSoon = evaluations.filter((e) => e.urgency === 'DUE_SOON');
    const upcoming = evaluations.filter((e) => e.urgency === 'UPCOMING');

    return {
      overdue,
      dueSoon,
      upcoming,
      totalTracked: records.length,
      independentlyVerifiedCount: records.filter((r) => r.validityStatus === 'INDEPENDENTLY_VERIFIED').length,
      recordedOnlyCount: records.filter((r) => r.validityStatus === 'DOCUMENT_RECORDED').length,
      legalDisclaimer:
        'Compliance status reflects internal records and authorized review entries. This platform does not perform automated government statutory filing or replace certified Chartered Accountant / legal verification.',
    };
  }

  // ======================== FINANCIAL DOCUMENTS ========================

  async registerFinancialDocument(
    organizationId: string,
    input: {
      documentType:
        | 'EXPENSE_INVOICE'
        | 'VENDOR_BILL'
        | 'PAYMENT_PROOF'
        | 'BANK_STATEMENT'
        | 'GRANT_AGREEMENT'
        | 'AUDIT_REPORT'
        | 'FINANCIAL_STATEMENT'
        | 'COMPLIANCE_CERTIFICATE'
        | 'VOUCHER';
      title: string;
      fileName: string;
      mimeType: string;
      sizeBytes: number;
      storageKey: string;
      linkedEntityType:
        | 'EXPENSE'
        | 'VENDOR'
        | 'VENDOR_BILL'
        | 'BANK_ACCOUNT'
        | 'GRANT'
        | 'COMPLIANCE_RECORD'
        | 'JOURNAL_ENTRY';
      linkedEntityId: string;
    },
    actor: AdminActor
  ) {
    validateDocumentFile(input.mimeType, input.sizeBytes);
    const doc = await financeRepository.createFinancialDocument({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      ...input,
      isPrivate: true,
      version: 1,
      uploadedBy: new mongoose.Types.ObjectId(actor.id),
    });
    return doc;
  }
}

export const budgetGrantComplianceService = new BudgetGrantComplianceService();
