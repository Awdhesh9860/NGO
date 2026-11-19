import crypto from 'crypto';
import mongoose from 'mongoose';
import { financeRepository } from '@/server/repositories/finance.repository';
import { programRepository } from '@/server/repositories/program.repository';
import { projectRepository } from '@/server/repositories/project.repository';
import { departmentRepository } from '@/server/repositories/department.repository';
import { accountingService } from '@/server/services/accounting.service';
import { adminService, AdminActor } from '@/server/services/admin.service';
import { checkRolePermission } from '@/server/authorization/permissions';
import {
  encryptFinancialSecret,
  maskAccountNumber,
  parseBankStatementCsv,
} from '@/server/security/financial-crypto';
import { ExpenseStatus } from '@/server/database/models/Expense';
import { IVendorDocument } from '@/server/database/models/Vendor';
import { IBankAccountDocument } from '@/server/database/models/BankAccount';
import { UserRole } from '@/types';
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '@/lib/error-handler';
import { sumMinorUnits, subtractMinorUnits } from '@/lib/money';
import {
  ApproveExpenseInput,
  CreateBankAccountInput,
  CreateExpenseInput,
  CreateVendorBillInput,
  CreateVendorInput,
  ImportBankStatementInput,
  PayExpenseInput,
  ReconcileBankTransactionInput,
  UpdateVendorInput,
} from '@/features/finance/schemas/finance.schema';

// ======================== EXPENSE LIFECYCLE & APPROVAL THRESHOLDS ========================

export const EXPENSE_STATUS_TRANSITIONS: Record<ExpenseStatus, ExpenseStatus[]> = {
  DRAFT: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['PAYMENT_PENDING', 'PAID', 'CANCELLED'],
  REJECTED: ['DRAFT', 'SUBMITTED'],
  PAYMENT_PENDING: ['PAID', 'CANCELLED'],
  PAID: [],
  CANCELLED: [],
};

/**
 * Default role-based expense approval authority limits (integer minor INR paise).
 * Prevents users from approving expenses exceeding their assigned financial threshold.
 */
export const ROLE_EXPENSE_APPROVAL_THRESHOLDS_MINOR: Partial<Record<UserRole, number>> = {
  MANAGER: 5_000_000, // ₹50,000
  ADMIN: 25_000_000, // ₹2,50,000
  EXECUTIVE_DIRECTOR: 100_000_000, // ₹10,00,000
  SUPER_ADMIN: Number.MAX_SAFE_INTEGER,
};

export function getApprovalThresholdMinorForRole(role: UserRole): number {
  return ROLE_EXPENSE_APPROVAL_THRESHOLDS_MINOR[role] ?? 0;
}

/**
 * Safe Vendor DTO: NEVER exposes encrypted bank account payload; shows masked last-4 only when authorized.
 */
export function toSafeVendorDTO(vendor: IVendorDocument, canViewBankSummary: boolean) {
  return {
    id: vendor._id.toString(),
    vendorCode: vendor.vendorCode,
    name: vendor.name,
    vendorType: vendor.vendorType,
    contactPerson: vendor.contactPerson,
    email: vendor.email,
    mobileNumber: vendor.mobileNumber,
    address: vendor.address,
    taxIdentifier: vendor.taxIdentifier,
    bankSummary:
      canViewBankSummary && vendor.bankAccountMasked
        ? {
            bankName: vendor.bankName,
            bankBranch: vendor.bankBranch,
            ifscCode: vendor.ifscCode,
            accountNumberMasked: vendor.bankAccountMasked,
            beneficiaryAccountName: vendor.beneficiaryAccountName,
          }
        : undefined,
    hasBankDetailsOnFile: Boolean(vendor.bankAccountMasked),
    status: vendor.status,
    documentRefs: vendor.documentRefs || [],
    notes: vendor.notes,
    createdAt: vendor.createdAt,
  };
}

/**
 * Safe Bank Account DTO: NEVER exposes raw or encrypted account numbers in general APIs or dashboard tables.
 */
export function toSafeBankAccountDTO(account: IBankAccountDocument) {
  return {
    id: account._id.toString(),
    accountName: account.accountName,
    bankName: account.bankName,
    branchName: account.branchName,
    accountType: account.accountType,
    accountNumberMasked: account.accountNumberMasked,
    ifscCode: account.ifscCode,
    swiftCode: account.swiftCode,
    currency: account.currency,
    openingBalanceMinor: account.openingBalanceMinor,
    ledgerAccountId: account.ledgerAccountId?.toString(),
    lastReconciledBalanceMinor: account.lastReconciledBalanceMinor,
    lastReconciledAt: account.lastReconciledAt,
    isReconciled: Boolean(account.lastReconciledAt),
    status: account.status,
    notes: account.notes,
    createdAt: account.createdAt,
  };
}

function generateFinanceCode(prefix: string): string {
  const year = new Date().getUTCFullYear();
  return `${prefix}-${year}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

export class ExpenseVendorService {
  // ======================== EXPENSES ========================

  async createExpense(organizationId: string, input: CreateExpenseInput, actor: AdminActor) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'finance.expenses.create')) {
      throw new AuthorizationError('Missing finance.expenses.create permission');
    }

    if (input.vendorId) {
      const vendor = await financeRepository.findVendorById(input.vendorId, organizationId);
      if (!vendor) throw new ValidationError('Vendor not found in this organization');
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
    if (input.fundAllocationId) {
      const alloc = await financeRepository.findFundAllocationById(input.fundAllocationId, organizationId);
      if (!alloc) throw new ValidationError('Linked fund allocation not found in this organization');
      const remaining = subtractMinorUnits(alloc.allocatedAmountMinor, alloc.utilizedAmountMinor);
      if (input.amountMinor > remaining) {
        throw new ValidationError(
          `Expense exceeds remaining balance (${remaining} minor units) on fund allocation ${alloc.allocationCode}`
        );
      }
    }

    const expenseNumber = generateFinanceCode('EXP');
    const initialStatus: ExpenseStatus = input.submitImmediately ? 'SUBMITTED' : 'DRAFT';

    const expense = await financeRepository.createExpense({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      expenseNumber,
      title: input.title,
      description: input.description,
      category: input.category,
      amountMinor: input.amountMinor,
      currency: (input.currency || 'INR').toUpperCase(),
      expenseDate: new Date(input.expenseDate),
      vendorId: input.vendorId ? new mongoose.Types.ObjectId(input.vendorId) : undefined,
      vendorBillId: input.vendorBillId ? new mongoose.Types.ObjectId(input.vendorBillId) : undefined,
      departmentId: input.departmentId ? new mongoose.Types.ObjectId(input.departmentId) : undefined,
      programId: input.programId ? new mongoose.Types.ObjectId(input.programId) : undefined,
      projectId: input.projectId ? new mongoose.Types.ObjectId(input.projectId) : undefined,
      grantId: input.grantId ? new mongoose.Types.ObjectId(input.grantId) : undefined,
      fundAllocationId: input.fundAllocationId
        ? new mongoose.Types.ObjectId(input.fundAllocationId)
        : undefined,
      expenseAccountId: input.expenseAccountId
        ? new mongoose.Types.ObjectId(input.expenseAccountId)
        : undefined,
      paymentMethod: input.paymentMethod || 'BANK_TRANSFER',
      invoiceNumber: input.invoiceNumber,
      referenceNumber: input.referenceNumber,
      documentRefs: input.documentRefs || [],
      status: initialStatus,
      submittedBy: new mongoose.Types.ObjectId(actor.id),
      submittedAt: input.submitImmediately ? new Date() : undefined,
      notes: input.notes,
      history: [
        {
          status: initialStatus,
          actorId: new mongoose.Types.ObjectId(actor.id),
          actorName: actor.name,
          actorRole: actor.role,
          comment: input.submitImmediately ? 'Expense submitted for review' : 'Expense drafted',
          timestamp: new Date(),
        },
      ],
    });

    await adminService.logAudit(
      actor,
      'FINANCE_EXPENSE_CREATED',
      'Expense',
      expense._id.toString(),
      `Created ${initialStatus} expense ${expenseNumber} (${expense.amountMinor} minor units)`
    );

    return expense;
  }

  async listExpenses(
    organizationId: string,
    filters: { status?: ExpenseStatus; category?: string; projectId?: string; departmentId?: string },
    pagination: { page?: number; limit?: number },
    actor: AdminActor
  ) {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(100, Math.max(1, pagination.limit || 25));
    // TEAM_MEMBER sees only own expense submissions
    const submittedBy = actor.role === 'TEAM_MEMBER' ? actor.id : undefined;
    const { items, total } = await financeRepository.findExpenses(
      organizationId,
      { ...filters, submittedBy },
      { page, limit }
    );
    return {
      expenses: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getExpenseDetail(id: string, organizationId: string, actor: AdminActor) {
    const expense = await financeRepository.findExpenseById(id, organizationId);
    if (!expense) throw new NotFoundError('Expense not found in this organization');
    if (actor.role === 'TEAM_MEMBER' && expense.submittedBy.toString() !== actor.id) {
      throw new AuthorizationError('You may only inspect your own expense submissions');
    }
    const approvals = await financeRepository.findExpenseApprovals(id, organizationId);
    return { expense, approvals };
  }

  /**
   * Enforces:
   * 1. `finance.expenses.approve` authorization
   * 2. Strict NO SELF-APPROVAL unless explicitly permitted by policy
   * 3. Role monetary approval threshold limit (prevents approving above assigned limit)
   * 4. Auditable ExpenseApproval record
   */
  async decideExpenseApproval(
    expenseId: string,
    organizationId: string,
    input: ApproveExpenseInput,
    actor: AdminActor
  ) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'finance.expenses.approve')) {
      throw new AuthorizationError('Missing finance.expenses.approve permission');
    }

    const expense = await financeRepository.findExpenseById(expenseId, organizationId);
    if (!expense) throw new NotFoundError('Expense not found in this organization');

    if (expense.status === 'PAID' || expense.status === 'CANCELLED') {
      throw new ValidationError(`Expense ${expense.expenseNumber} is already ${expense.status}`);
    }

    // Strict self-approval block
    if (
      expense.submittedBy.toString() === actor.id &&
      !(expense.allowSelfApprovalPolicy && actor.role === 'SUPER_ADMIN')
    ) {
      throw new AuthorizationError('Self-approval is prohibited: expense submitter cannot approve their own submission');
    }

    const roleThresholdMinor = getApprovalThresholdMinorForRole(actor.role);

    if (input.decision === 'APPROVED' && expense.amountMinor > roleThresholdMinor) {
      throw new AuthorizationError(
        `Expense amount (${expense.amountMinor} minor units) exceeds approval threshold (${roleThresholdMinor} minor units) for role ${actor.role}. Escalate to a higher approver.`
      );
    }

    if (input.decision === 'REJECTED' && !input.rejectionReason?.trim() && !input.comment?.trim()) {
      throw new ValidationError('Rejection reason is mandatory when rejecting an expense');
    }

    let nextStatus: ExpenseStatus = expense.status;
    if (input.decision === 'REVIEWED' || input.decision === 'ESCALATED') {
      nextStatus = 'UNDER_REVIEW';
    } else if (input.decision === 'APPROVED') {
      nextStatus = 'APPROVED';
    } else if (input.decision === 'REJECTED') {
      nextStatus = 'REJECTED';
    }

    if (nextStatus !== expense.status) {
      const allowed = EXPENSE_STATUS_TRANSITIONS[expense.status] || [];
      if (!allowed.includes(nextStatus)) {
        throw new ValidationError(`Cannot transition expense from "${expense.status}" to "${nextStatus}"`);
      }
    }

    const approvalRecord = await financeRepository.createExpenseApproval({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      expenseId: expense._id as mongoose.Types.ObjectId,
      stage: input.stage || 'FINAL_APPROVAL',
      approverId: new mongoose.Types.ObjectId(actor.id),
      approverName: actor.name,
      approverRole: actor.role,
      roleThresholdMinor: Number.isFinite(roleThresholdMinor) && roleThresholdMinor < Number.MAX_SAFE_INTEGER
        ? roleThresholdMinor
        : expense.amountMinor,
      expenseAmountMinor: expense.amountMinor,
      decision: input.decision,
      comment: input.comment || input.rejectionReason,
      escalatedToRole: input.escalatedToRole,
      decidedAt: new Date(),
    });

    const updated = await financeRepository.updateExpense(expenseId, organizationId, {
      $set: {
        status: nextStatus,
        ...(input.decision === 'APPROVED'
          ? { approvedBy: new mongoose.Types.ObjectId(actor.id), approvedAt: new Date() }
          : {}),
        ...(input.decision === 'REJECTED'
          ? { rejectionReason: input.rejectionReason || input.comment }
          : {}),
      },
      $push: {
        history: {
          status: nextStatus,
          actorId: new mongoose.Types.ObjectId(actor.id),
          actorName: actor.name,
          actorRole: actor.role,
          comment: input.comment || input.rejectionReason || `Decision: ${input.decision}`,
          timestamp: new Date(),
        },
      },
    });

    await adminService.logAudit(
      actor,
      `FINANCE_EXPENSE_${input.decision}`,
      'Expense',
      expenseId,
      `Expense ${expense.expenseNumber} ${input.decision} -> ${nextStatus}`
    );

    return { expense: updated, approval: approvalRecord };
  }

  /**
   * Records payment for an APPROVED expense (requires separate `finance.expenses.pay` permission),
   * idempotently posts a balanced double-entry accounting journal (DR Expense / CR Bank or Cash),
   * and updates linked FundAllocation utilization when applicable.
   */
  async payApprovedExpense(
    expenseId: string,
    organizationId: string,
    input: PayExpenseInput,
    actor: AdminActor
  ) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'finance.expenses.pay')) {
      throw new AuthorizationError('Missing finance.expenses.pay permission');
    }

    const expense = await financeRepository.findExpenseById(expenseId, organizationId);
    if (!expense) throw new NotFoundError('Expense not found in this organization');

    if (expense.status === 'PAID') {
      throw new ConflictError(`Expense ${expense.expenseNumber} is already paid`);
    }
    if (!['APPROVED', 'PAYMENT_PENDING'].includes(expense.status)) {
      throw new ValidationError(
        `Expense ${expense.expenseNumber} must be APPROVED before payment (current status: ${expense.status})`
      );
    }

    let creditLedgerAccountId = input.cashOrBankAccountId;
    if (input.bankAccountId) {
      const bankAcc = await financeRepository.findBankAccountById(input.bankAccountId, organizationId);
      if (!bankAcc) throw new ValidationError('Selected bank account not found in this organization');
      if (bankAcc.status !== 'ACTIVE') throw new ValidationError('Selected bank account is not active');
      if (!creditLedgerAccountId && bankAcc.ledgerAccountId) {
        creditLedgerAccountId = bankAcc.ledgerAccountId.toString();
      }
    }

    const paidDate = input.paidDate ? new Date(input.paidDate) : new Date();

    // Post balanced double-entry ledger voucher idempotently
    const ledgerPost = await accountingService.postAutomatedLedgerEvent(
      organizationId,
      {
        transactionDate: paidDate,
        description: `Expense Payment ${expense.expenseNumber}: ${expense.title}`,
        referenceType: 'EXPENSE',
        referenceId: expense._id.toString(),
        idempotencyKey: `EXPENSE_PAY:${expense._id.toString()}`,
        currency: expense.currency,
        debitAccountCode: {
          code: expense.projectId ? '5020' : '5010',
          name: expense.projectId ? 'Field Project Expenses' : 'Program Delivery Expenses',
          type: 'EXPENSE',
          category: expense.category,
        },
        creditAccountCode: {
          code: input.paymentMethod === 'CASH' ? '1010' : '1020',
          name: input.paymentMethod === 'CASH' ? 'Cash on Hand' : 'Primary NGO Bank Account',
          type: 'ASSET',
          category: input.paymentMethod === 'CASH' ? 'Cash' : 'Bank Accounts',
        },
        amountMinor: expense.amountMinor,
        debitAccountId: input.expenseAccountId || expense.expenseAccountId?.toString(),
        creditAccountId: creditLedgerAccountId,
        dimensions: {
          programId: expense.programId?.toString(),
          projectId: expense.projectId?.toString(),
          departmentId: expense.departmentId?.toString(),
          grantId: expense.grantId?.toString(),
          fundAllocationId: expense.fundAllocationId?.toString(),
          vendorId: expense.vendorId?.toString(),
        },
      },
      actor
    );

    const updated = await financeRepository.updateExpense(expenseId, organizationId, {
      $set: {
        status: 'PAID',
        paidBy: new mongoose.Types.ObjectId(actor.id),
        paidAt: paidDate,
        paymentMethod: input.paymentMethod || expense.paymentMethod,
        paymentReference: input.paymentReference,
        bankAccountId: input.bankAccountId ? new mongoose.Types.ObjectId(input.bankAccountId) : undefined,
        journalEntryId: ledgerPost.journal?._id,
      },
      $push: {
        history: {
          status: 'PAID',
          actorId: new mongoose.Types.ObjectId(actor.id),
          actorName: actor.name,
          actorRole: actor.role,
          comment: `Paid via ${input.paymentMethod || expense.paymentMethod} (Ref: ${input.paymentReference})`,
          timestamp: new Date(),
        },
      },
    });

    // Update restricted/unrestricted fund allocation utilization if linked
    if (expense.fundAllocationId) {
      const alloc = await financeRepository.findFundAllocationById(
        expense.fundAllocationId.toString(),
        organizationId
      );
      if (alloc) {
        const nextUtilized = sumMinorUnits([alloc.utilizedAmountMinor, expense.amountMinor]);
        const nextStatus = nextUtilized >= alloc.allocatedAmountMinor ? 'EXHAUSTED' : 'ACTIVE';
        await financeRepository.updateFundAllocation(alloc._id.toString(), organizationId, {
          $set: { utilizedAmountMinor: nextUtilized, status: nextStatus },
          $push: {
            history: {
              action: 'UTILIZED',
              amountMinor: expense.amountMinor,
              note: `Expense ${expense.expenseNumber} paid`,
              actorId: new mongoose.Types.ObjectId(actor.id),
              actorName: actor.name,
              timestamp: new Date(),
            },
          },
        });
      }
    }

    await adminService.logAudit(
      actor,
      'FINANCE_EXPENSE_PAID',
      'Expense',
      expenseId,
      `Paid expense ${expense.expenseNumber} (${expense.amountMinor} minor units) & posted journal ${ledgerPost.journal?.journalNumber || 'N/A'}`
    );

    return { expense: updated, journal: ledgerPost.journal };
  }

  // ======================== VENDORS & BILLS ========================

  async listVendors(organizationId: string, actor: AdminActor, status?: string) {
    const canViewBank =
      actor.role === 'SUPER_ADMIN' || checkRolePermission(actor.role, 'finance.vendors.manage');
    const vendors = await financeRepository.findVendors(organizationId, status);
    return vendors.map((v) => toSafeVendorDTO(v, canViewBank));
  }

  async createVendor(organizationId: string, input: CreateVendorInput, actor: AdminActor) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'finance.vendors.manage')) {
      throw new AuthorizationError('Missing finance.vendors.manage permission');
    }

    const vendorCode = generateFinanceCode('VND');
    const encryptedAcct = input.bankAccountNumber
      ? encryptFinancialSecret(input.bankAccountNumber)
      : undefined;
    const maskedAcct = input.bankAccountNumber
      ? maskAccountNumber(input.bankAccountNumber)
      : undefined;

    const vendor = await financeRepository.createVendor({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      vendorCode,
      name: input.name,
      vendorType: input.vendorType || 'SUPPLIER',
      contactPerson: input.contactPerson,
      email: input.email,
      mobileNumber: input.mobileNumber,
      address: input.address,
      taxIdentifier: input.taxIdentifier,
      bankName: input.bankName,
      bankBranch: input.bankBranch,
      ifscCode: input.ifscCode,
      bankAccountMasked: maskedAcct,
      bankAccountEncrypted: encryptedAcct,
      beneficiaryAccountName: input.beneficiaryAccountName,
      status: 'ACTIVE',
      notes: input.notes,
      createdBy: new mongoose.Types.ObjectId(actor.id),
    });

    await adminService.logAudit(
      actor,
      'FINANCE_VENDOR_CREATED',
      'Vendor',
      vendor._id.toString(),
      `Created vendor ${vendorCode} (${vendor.name})`
    );

    return toSafeVendorDTO(vendor, true);
  }

  async updateVendor(id: string, organizationId: string, input: UpdateVendorInput, actor: AdminActor) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'finance.vendors.manage')) {
      throw new AuthorizationError('Missing finance.vendors.manage permission');
    }
    const existing = await financeRepository.findVendorById(id, organizationId);
    if (!existing) throw new NotFoundError('Vendor not found in this organization');

    const $set: Record<string, unknown> = {
      updatedBy: new mongoose.Types.ObjectId(actor.id),
    };
    if (input.name) $set.name = input.name;
    if (input.vendorType) $set.vendorType = input.vendorType;
    if (input.contactPerson !== undefined) $set.contactPerson = input.contactPerson;
    if (input.email !== undefined) $set.email = input.email;
    if (input.mobileNumber !== undefined) $set.mobileNumber = input.mobileNumber;
    if (input.address !== undefined) $set.address = input.address;
    if (input.taxIdentifier !== undefined) $set.taxIdentifier = input.taxIdentifier;
    if (input.bankName !== undefined) $set.bankName = input.bankName;
    if (input.ifscCode !== undefined) $set.ifscCode = input.ifscCode;
    if (input.status) $set.status = input.status;
    if (input.notes !== undefined) $set.notes = input.notes;
    if (input.bankAccountNumber) {
      $set.bankAccountMasked = maskAccountNumber(input.bankAccountNumber);
      $set.bankAccountEncrypted = encryptFinancialSecret(input.bankAccountNumber);
    }

    const updated = await financeRepository.updateVendor(id, organizationId, { $set });
    return updated ? toSafeVendorDTO(updated, true) : null;
  }

  async getVendorDetail(id: string, organizationId: string, actor: AdminActor) {
    const vendor = await financeRepository.findVendorById(id, organizationId);
    if (!vendor) throw new NotFoundError('Vendor not found in this organization');
    const canViewBank =
      actor.role === 'SUPER_ADMIN' || checkRolePermission(actor.role, 'finance.vendors.manage');
    const bills = await financeRepository.findVendorBills(organizationId, id);
    const totalBilledMinor = sumMinorUnits(bills.map((b) => b.totalAmountMinor));
    const totalPaidMinor = sumMinorUnits(bills.map((b) => b.paidAmountMinor));

    return {
      vendor: toSafeVendorDTO(vendor, canViewBank),
      bills,
      summary: {
        totalBilledMinor,
        totalPaidMinor,
        outstandingBalanceMinor: Math.max(0, subtractMinorUnits(totalBilledMinor, totalPaidMinor)),
      },
    };
  }

  async createVendorBill(
    vendorId: string,
    organizationId: string,
    input: CreateVendorBillInput,
    actor: AdminActor
  ) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'finance.vendors.manage')) {
      throw new AuthorizationError('Missing finance.vendors.manage permission');
    }

    const vendor = await financeRepository.findVendorById(vendorId, organizationId);
    if (!vendor) throw new NotFoundError('Vendor not found in this organization');

    const dup = await financeRepository.findDuplicateVendorBill(
      organizationId,
      vendorId,
      input.billNumber
    );
    if (dup) {
      throw new ConflictError(
        `Duplicate vendor bill: bill number "${input.billNumber.toUpperCase()}" already exists for vendor ${vendor.name}`
      );
    }

    const totalAmountMinor = sumMinorUnits([input.subtotalMinor, input.taxAmountMinor || 0]);

    const bill = await financeRepository.createVendorBill({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      vendorId: vendor._id as mongoose.Types.ObjectId,
      billNumber: input.billNumber.toUpperCase(),
      billDate: new Date(input.billDate),
      dueDate: new Date(input.dueDate),
      subtotalMinor: input.subtotalMinor,
      taxAmountMinor: input.taxAmountMinor || 0,
      totalAmountMinor,
      paidAmountMinor: 0,
      currency: (input.currency || 'INR').toUpperCase(),
      taxSummary: input.taxSummary,
      description: input.description,
      approvalStatus: 'PENDING_APPROVAL',
      paymentStatus: 'UNPAID',
      linkedExpenseId: input.linkedExpenseId
        ? new mongoose.Types.ObjectId(input.linkedExpenseId)
        : undefined,
      createdBy: new mongoose.Types.ObjectId(actor.id),
    });

    await adminService.logAudit(
      actor,
      'FINANCE_VENDOR_BILL_CREATED',
      'VendorBill',
      bill._id.toString(),
      `Recorded bill ${bill.billNumber} for vendor ${vendor.name} (${totalAmountMinor} minor units)`
    );

    return bill;
  }

  // ======================== BANK ACCOUNTS & RECONCILIATION ========================

  async listBankAccounts(organizationId: string) {
    const accounts = await financeRepository.findBankAccounts(organizationId);
    return accounts.map(toSafeBankAccountDTO);
  }

  async createBankAccount(organizationId: string, input: CreateBankAccountInput, actor: AdminActor) {
    if (
      actor.role !== 'SUPER_ADMIN' &&
      !checkRolePermission(actor.role, 'finance.bank_accounts.manage')
    ) {
      throw new AuthorizationError('Missing finance.bank_accounts.manage permission');
    }

    if (input.ledgerAccountId) {
      const ledgerAcc = await financeRepository.findAccountById(input.ledgerAccountId, organizationId);
      if (!ledgerAcc || ledgerAcc.accountType !== 'ASSET') {
        throw new ValidationError('Linked ledger account must be an active ASSET account in this organization');
      }
    }

    try {
      const created = await financeRepository.createBankAccount({
        organizationId: new mongoose.Types.ObjectId(organizationId),
        accountName: input.accountName,
        bankName: input.bankName,
        branchName: input.branchName,
        accountType: input.accountType || 'CURRENT',
        accountNumberMasked: maskAccountNumber(input.accountNumber),
        accountNumberEncrypted: encryptFinancialSecret(input.accountNumber),
        ifscCode: input.ifscCode,
        swiftCode: input.swiftCode,
        currency: (input.currency || 'INR').toUpperCase(),
        openingBalanceMinor: input.openingBalanceMinor || 0,
        ledgerAccountId: input.ledgerAccountId
          ? new mongoose.Types.ObjectId(input.ledgerAccountId)
          : undefined,
        status: 'ACTIVE',
        notes: input.notes,
        createdBy: new mongoose.Types.ObjectId(actor.id),
      });

      await adminService.logAudit(
        actor,
        'FINANCE_BANK_ACCOUNT_CREATED',
        'BankAccount',
        created._id.toString(),
        `Registered bank account "${created.accountName}" (${created.accountNumberMasked})`
      );

      return toSafeBankAccountDTO(created);
    } catch (err: unknown) {
      if ((err as { code?: number })?.code === 11000) {
        throw new ConflictError('A bank account with this name already exists in this organization');
      }
      throw err;
    }
  }

  async importBankStatementCsv(
    organizationId: string,
    input: ImportBankStatementInput,
    actor: AdminActor
  ) {
    if (
      actor.role !== 'SUPER_ADMIN' &&
      !checkRolePermission(actor.role, 'finance.reconciliation.manage')
    ) {
      throw new AuthorizationError('Missing finance.reconciliation.manage permission');
    }

    const bankAccount = await financeRepository.findBankAccountById(input.bankAccountId, organizationId);
    if (!bankAccount) throw new NotFoundError('Bank account not found in this organization');

    const parsedRows = parseBankStatementCsv(input.csvContent, bankAccount.currency || 'INR');
    const existingFingerprints = await financeRepository.findExistingBankFingerprints(
      organizationId,
      input.bankAccountId,
      parsedRows.map((r) => r.rowFingerprint)
    );

    const importBatchId = `IMP-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const seenInBatch = new Set<string>();
    const toInsert = [];
    let duplicatesSkipped = 0;

    for (const row of parsedRows) {
      if (existingFingerprints.has(row.rowFingerprint) || seenInBatch.has(row.rowFingerprint)) {
        duplicatesSkipped += 1;
        continue;
      }
      seenInBatch.add(row.rowFingerprint);
      toInsert.push({
        organizationId: new mongoose.Types.ObjectId(organizationId),
        bankAccountId: bankAccount._id as mongoose.Types.ObjectId,
        importBatchId,
        transactionDate: row.transactionDate,
        description: row.description,
        reference: row.reference,
        debitMinor: row.debitMinor,
        creditMinor: row.creditMinor,
        runningBalanceMinor: row.runningBalanceMinor,
        currency: bankAccount.currency,
        rowFingerprint: row.rowFingerprint,
        importSource: 'CSV_IMPORT' as const,
        rawRowSnapshot: row.rawRowSnapshot,
        // NEVER auto-reconcile imported statement lines
        reconciliationStatus: 'UNMATCHED' as const,
        importedBy: new mongoose.Types.ObjectId(actor.id),
      });
    }

    const inserted = toInsert.length > 0 ? await financeRepository.createBankTransactions(toInsert) : [];

    await adminService.logAudit(
      actor,
      'FINANCE_BANK_STATEMENT_IMPORTED',
      'BankAccount',
      input.bankAccountId,
      `Imported ${inserted.length} bank statement rows (${duplicatesSkipped} duplicates skipped) for ${bankAccount.accountName}`
    );

    return {
      importBatchId,
      importedCount: inserted.length,
      duplicatesSkipped,
      unmatchedCount: inserted.length,
      note: 'Imported rows remain UNMATCHED until explicitly reconciled by authorized finance staff.',
    };
  }

  async listBankTransactions(organizationId: string, bankAccountId?: string, status?: string) {
    return financeRepository.findBankTransactions(organizationId, bankAccountId, status);
  }

  async reconcileTransactionOrSession(
    organizationId: string,
    input: ReconcileBankTransactionInput,
    actor: AdminActor
  ) {
    if (
      actor.role !== 'SUPER_ADMIN' &&
      !checkRolePermission(actor.role, 'finance.reconciliation.manage')
    ) {
      throw new AuthorizationError('Missing finance.reconciliation.manage permission');
    }

    if (input.action === 'FINALIZE_SESSION') {
      if (!input.bankAccountId || !input.statementFromDate || !input.statementToDate || input.statementClosingBalanceMinor === undefined) {
        throw new ValidationError(
          'bankAccountId, statementFromDate, statementToDate, and statementClosingBalanceMinor are required to finalize reconciliation'
        );
      }

      const bankAccount = await financeRepository.findBankAccountById(input.bankAccountId, organizationId);
      if (!bankAccount) throw new NotFoundError('Bank account not found in this organization');

      const txns = await financeRepository.findBankTransactions(organizationId, input.bankAccountId);
      const matchedCount = txns.filter((t) => t.reconciliationStatus === 'MATCHED').length;
      const unmatchedCount = txns.filter((t) => t.reconciliationStatus !== 'MATCHED').length;

      // Compute ledger balance from linked ledger account posted lines + opening balance
      let ledgerBalanceMinor = bankAccount.openingBalanceMinor;
      if (bankAccount.ledgerAccountId) {
        const ledger = await accountingService.getGeneralLedger(organizationId, {
          accountId: bankAccount.ledgerAccountId.toString(),
          to: new Date(input.statementToDate),
        });
        ledgerBalanceMinor = sumMinorUnits([
          bankAccount.openingBalanceMinor,
          subtractMinorUnits(ledger.totalDebitMinor, ledger.totalCreditMinor),
        ]);
      }

      const differenceMinor = subtractMinorUnits(input.statementClosingBalanceMinor, ledgerBalanceMinor);
      const sessionStatus =
        unmatchedCount === 0 && differenceMinor === 0 ? 'RECONCILED' : 'COMPLETED_WITH_UNMATCHED';

      const sessionRecord = await financeRepository.createBankReconciliation({
        organizationId: new mongoose.Types.ObjectId(organizationId),
        bankAccountId: bankAccount._id as mongoose.Types.ObjectId,
        statementFromDate: new Date(input.statementFromDate),
        statementToDate: new Date(input.statementToDate),
        statementClosingBalanceMinor: input.statementClosingBalanceMinor,
        ledgerBalanceMinor,
        differenceMinor,
        matchedCount,
        unmatchedCount,
        status: sessionStatus,
        reconciledBy: new mongoose.Types.ObjectId(actor.id),
        reconciledAt: new Date(),
        notes: input.note,
      });

      if (sessionStatus === 'RECONCILED') {
        await financeRepository.updateBankAccount(input.bankAccountId, organizationId, {
          $set: {
            lastReconciledBalanceMinor: input.statementClosingBalanceMinor,
            lastReconciledAt: new Date(),
          },
        });
      }

      await adminService.logAudit(
        actor,
        'FINANCE_BANK_RECONCILIATION_SESSION',
        'BankReconciliation',
        sessionRecord._id.toString(),
        `Reconciliation session for ${bankAccount.accountName}: ${sessionStatus} (diff=${differenceMinor}, unmatched=${unmatchedCount})`
      );

      return { session: sessionRecord };
    }

    // MATCH or DISCREPANCY on individual BankTransaction
    if (!input.transactionId) {
      throw new ValidationError('transactionId is required to match or flag a bank statement row');
    }
    const txn = await financeRepository.findBankTransactionById(input.transactionId, organizationId);
    if (!txn) throw new NotFoundError('Bank statement transaction not found in this organization');

    if (input.action === 'MATCH' && (!input.matchedEntityType || !input.matchedEntityId)) {
      throw new ValidationError('matchedEntityType and matchedEntityId are required when matching a bank transaction');
    }

    const updated = await financeRepository.updateBankTransaction(input.transactionId, organizationId, {
      $set: {
        reconciliationStatus: input.action === 'MATCH' ? 'MATCHED' : 'DISCREPANCY',
        matchedEntityType: input.matchedEntityType,
        matchedEntityId: input.matchedEntityId,
        matchedNote: input.note,
        matchedBy: new mongoose.Types.ObjectId(actor.id),
        matchedAt: new Date(),
      },
    });

    await adminService.logAudit(
      actor,
      `FINANCE_BANK_TXN_${input.action}`,
      'BankTransaction',
      input.transactionId,
      `Bank transaction marked ${input.action} (${input.matchedEntityType || 'N/A'}:${input.matchedEntityId || ''})`
    );

    return { transaction: updated };
  }

  async listReconciliations(organizationId: string, bankAccountId?: string) {
    return financeRepository.findBankReconciliations(organizationId, bankAccountId);
  }
}

export const expenseVendorService = new ExpenseVendorService();
