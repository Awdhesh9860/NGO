import crypto from 'crypto';
import mongoose from 'mongoose';
import { financeRepository } from '@/server/repositories/finance.repository';
import { fundraisingRepository } from '@/server/repositories/fundraising.repository';
import { adminService, AdminActor } from '@/server/services/admin.service';
import { checkRolePermission } from '@/server/authorization/permissions';
import { runInFinancialTransaction } from '@/server/database/transactions';
import {
  AccountType,
  getNormalBalanceForAccountType,
  IChartOfAccountDocument,
} from '@/server/database/models/ChartOfAccount';
import { IJournalLineDocument } from '@/server/database/models/JournalLine';
import { JournalReferenceType } from '@/server/database/models/JournalEntry';
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '@/lib/error-handler';
import { sumMinorUnits, subtractMinorUnits } from '@/lib/money';
import {
  ApproveJournalEntryInput,
  CreateAccountInput,
  CreateAccountingPeriodInput,
  CreateJournalEntryInput,
  ReverseJournalEntryInput,
  UpdateAccountInput,
  UpdateAccountingPeriodStatusInput,
} from '@/features/finance/schemas/finance.schema';

// ======================== PURE DOUBLE-ENTRY ACCOUNTING HELPERS ========================

export interface JournalLineDraft {
  accountId: string;
  debitMinor: number;
  creditMinor: number;
  description?: string;
  programId?: string;
  projectId?: string;
  departmentId?: string;
  campaignId?: string;
  grantId?: string;
  fundAllocationId?: string;
  vendorId?: string;
}

/**
 * MANDATORY ACCOUNTING INVARIANT:
 * Every journal entry MUST have >= 2 lines, integer minor units only,
 * each line strictly debit OR credit (never both), totalDebits > 0, and Total Debits === Total Credits.
 */
export function assertBalancedJournalLines(lines: JournalLineDraft[]): {
  totalDebitMinor: number;
  totalCreditMinor: number;
} {
  if (!lines || lines.length < 2) {
    throw new ValidationError('Double-entry journal requires at least 2 lines (debit and credit)');
  }

  for (let i = 0; i < lines.length; i += 1) {
    const l = lines[i];
    if (!Number.isInteger(l.debitMinor) || !Number.isInteger(l.creditMinor)) {
      throw new ValidationError(`Journal line ${i + 1} amounts must be integer minor currency units`);
    }
    if (l.debitMinor < 0 || l.creditMinor < 0) {
      throw new ValidationError(`Journal line ${i + 1} amounts cannot be negative`);
    }
    if ((l.debitMinor > 0 && l.creditMinor > 0) || (l.debitMinor === 0 && l.creditMinor === 0)) {
      throw new ValidationError(
        `Journal line ${i + 1} must carry either a positive debitMinor OR positive creditMinor`
      );
    }
  }

  const totalDebitMinor = sumMinorUnits(lines.map((l) => l.debitMinor));
  const totalCreditMinor = sumMinorUnits(lines.map((l) => l.creditMinor));

  if (totalDebitMinor <= 0 || totalCreditMinor <= 0) {
    throw new ValidationError('Journal entry totals must be strictly positive');
  }
  if (totalDebitMinor !== totalCreditMinor) {
    throw new ValidationError(
      `Unbalanced journal entry: Total Debits (${totalDebitMinor}) !== Total Credits (${totalCreditMinor})`
    );
  }

  return { totalDebitMinor, totalCreditMinor };
}

export interface TrialBalanceRow {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  debitTotalMinor: number;
  creditTotalMinor: number;
  netDebitMinor: number;
  netCreditMinor: number;
}

export interface TrialBalanceReport {
  rows: TrialBalanceRow[];
  totalDebitMinor: number;
  totalCreditMinor: number;
  isBalanced: boolean;
}

/**
 * Pure Trial Balance computation strictly from posted JournalLine rows (integer minor units).
 */
export function computeTrialBalanceFromLines(
  lines: Array<
    Pick<
      IJournalLineDocument,
      'accountId' | 'accountCodeSnapshot' | 'accountNameSnapshot' | 'accountTypeSnapshot' | 'debitMinor' | 'creditMinor'
    >
  >
): TrialBalanceReport {
  const map = new Map<string, TrialBalanceRow>();

  for (const line of lines) {
    const key = String(line.accountId);
    const existing = map.get(key) || {
      accountId: key,
      accountCode: line.accountCodeSnapshot,
      accountName: line.accountNameSnapshot,
      accountType: line.accountTypeSnapshot,
      debitTotalMinor: 0,
      creditTotalMinor: 0,
      netDebitMinor: 0,
      netCreditMinor: 0,
    };
    existing.debitTotalMinor = sumMinorUnits([existing.debitTotalMinor, line.debitMinor]);
    existing.creditTotalMinor = sumMinorUnits([existing.creditTotalMinor, line.creditMinor]);
    map.set(key, existing);
  }

  const rows = Array.from(map.values())
    .map((r) => {
      const diff = subtractMinorUnits(r.debitTotalMinor, r.creditTotalMinor);
      return {
        ...r,
        netDebitMinor: diff > 0 ? diff : 0,
        netCreditMinor: diff < 0 ? Math.abs(diff) : 0,
      };
    })
    .sort((a, b) => a.accountCode.localeCompare(b.accountCode));

  const totalDebitMinor = sumMinorUnits(rows.map((r) => r.netDebitMinor));
  const totalCreditMinor = sumMinorUnits(rows.map((r) => r.netCreditMinor));

  return {
    rows,
    totalDebitMinor,
    totalCreditMinor,
    isBalanced: totalDebitMinor === totalCreditMinor,
  };
}

export const DEFAULT_NGO_COA_SEED: Array<{
  code: string;
  name: string;
  accountType: AccountType;
  category: string;
  isSystemAccount: boolean;
}> = [
  // Assets
  { code: '1010', name: 'Cash on Hand', accountType: 'ASSET', category: 'Cash', isSystemAccount: true },
  { code: '1020', name: 'Primary NGO Bank Account', accountType: 'ASSET', category: 'Bank Accounts', isSystemAccount: true },
  { code: '1030', name: 'FCRA / Designated Bank Account', accountType: 'ASSET', category: 'Bank Accounts', isSystemAccount: false },
  { code: '1100', name: 'Grants & Pledges Receivable', accountType: 'ASSET', category: 'Accounts Receivable', isSystemAccount: true },
  { code: '1500', name: 'Fixed Assets & Equipment', accountType: 'ASSET', category: 'Fixed Assets', isSystemAccount: false },
  // Liabilities
  { code: '2010', name: 'Accounts Payable (Vendors)', accountType: 'LIABILITY', category: 'Accounts Payable', isSystemAccount: true },
  { code: '2020', name: 'Outstanding Accrued Expenses', accountType: 'LIABILITY', category: 'Outstanding Expenses', isSystemAccount: true },
  { code: '2100', name: 'Unspent Restricted Grant Liability', accountType: 'LIABILITY', category: 'Other Liabilities', isSystemAccount: false },
  // Equity / Fund Balances
  { code: '3010', name: 'General Unrestricted Fund Balance', accountType: 'EQUITY', category: 'Unrestricted Funds', isSystemAccount: true },
  { code: '3020', name: 'Restricted Program Fund Balance', accountType: 'EQUITY', category: 'Restricted Funds', isSystemAccount: true },
  // Income
  { code: '4010', name: 'Individual Donations Income', accountType: 'INCOME', category: 'Individual Donations', isSystemAccount: true },
  { code: '4020', name: 'Corporate & CSR Donations Income', accountType: 'INCOME', category: 'Corporate Donations', isSystemAccount: true },
  { code: '4030', name: 'Institutional Grants Income', accountType: 'INCOME', category: 'Grants', isSystemAccount: true },
  { code: '4040', name: 'Membership Fees Income', accountType: 'INCOME', category: 'Membership Fees', isSystemAccount: true },
  { code: '4050', name: 'Fundraising Event Income', accountType: 'INCOME', category: 'Fundraising Income', isSystemAccount: false },
  { code: '4090', name: 'Donation Refunds & Adjustments (Contra-Income)', accountType: 'INCOME', category: 'Other Income', isSystemAccount: true },
  // Expenses
  { code: '5010', name: 'Program Delivery Expenses', accountType: 'EXPENSE', category: 'Program Expenses', isSystemAccount: true },
  { code: '5020', name: 'Field Project Expenses', accountType: 'EXPENSE', category: 'Project Expenses', isSystemAccount: true },
  { code: '5030', name: 'Salaries & Personnel Expenses', accountType: 'EXPENSE', category: 'Staff Expenses', isSystemAccount: true },
  { code: '5040', name: 'Administrative & Office Expenses', accountType: 'EXPENSE', category: 'Administrative Expenses', isSystemAccount: true },
  { code: '5050', name: 'Field Travel & Transportation', accountType: 'EXPENSE', category: 'Travel Expenses', isSystemAccount: false },
  { code: '5060', name: 'Training & Community Workshops', accountType: 'EXPENSE', category: 'Training Expenses', isSystemAccount: false },
  { code: '5070', name: 'Infrastructure & Equipment', accountType: 'EXPENSE', category: 'Infrastructure Expenses', isSystemAccount: false },
  { code: '5080', name: 'Communication & Utilities', accountType: 'EXPENSE', category: 'Communication Expenses', isSystemAccount: false },
];

function generateJournalNumber(): string {
  const year = new Date().getUTCFullYear();
  return `JE-${year}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

export class AccountingService {
  // ======================== CHART OF ACCOUNTS ========================

  async listAccounts(organizationId: string, filters?: { accountType?: AccountType; includeInactive?: boolean }) {
    return financeRepository.findAccounts(organizationId, filters);
  }

  async seedDefaultChartOfAccounts(organizationId: string, actor: AdminActor) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'finance.accounts.manage')) {
      throw new AuthorizationError('Missing finance.accounts.manage permission');
    }

    const existing = await financeRepository.findAccounts(organizationId, { includeInactive: true });
    const existingCodes = new Set(existing.map((a) => a.code));
    const created: IChartOfAccountDocument[] = [];

    for (const def of DEFAULT_NGO_COA_SEED) {
      if (existingCodes.has(def.code)) continue;
      const doc = await financeRepository.createAccount({
        organizationId: new mongoose.Types.ObjectId(organizationId),
        code: def.code,
        name: def.name,
        accountType: def.accountType,
        category: def.category,
        normalBalance: getNormalBalanceForAccountType(def.accountType),
        isSystemAccount: def.isSystemAccount,
        isActive: true,
        createdBy: new mongoose.Types.ObjectId(actor.id),
      });
      created.push(doc);
    }

    if (created.length > 0) {
      await adminService.logAudit(
        actor,
        'FINANCE_COA_SEEDED',
        'ChartOfAccount',
        organizationId,
        `Seeded ${created.length} standard NGO Chart of Accounts entries`
      );
    }
    return { createdCount: created.length, accounts: await financeRepository.findAccounts(organizationId) };
  }

  async createAccount(organizationId: string, input: CreateAccountInput, actor: AdminActor) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'finance.accounts.manage')) {
      throw new AuthorizationError('Missing finance.accounts.manage permission');
    }

    const dup = await financeRepository.findAccountByCode(input.code, organizationId);
    if (dup) {
      throw new ConflictError(`Account code "${input.code.toUpperCase()}" already exists in this organization`);
    }

    if (input.parentAccountId) {
      const parent = await financeRepository.findAccountById(input.parentAccountId, organizationId);
      if (!parent) throw new ValidationError('Parent account not found in this organization');
      if (parent.accountType !== input.accountType) {
        throw new ValidationError('Parent account must share the same accountType');
      }
    }

    const created = await financeRepository.createAccount({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      code: input.code.toUpperCase(),
      name: input.name,
      accountType: input.accountType,
      category: input.category,
      normalBalance: getNormalBalanceForAccountType(input.accountType),
      parentAccountId: input.parentAccountId ? new mongoose.Types.ObjectId(input.parentAccountId) : undefined,
      description: input.description,
      isSystemAccount: Boolean(input.isSystemAccount),
      isActive: true,
      createdBy: new mongoose.Types.ObjectId(actor.id),
    });

    await adminService.logAudit(
      actor,
      'FINANCE_ACCOUNT_CREATED',
      'ChartOfAccount',
      created._id.toString(),
      `Created account ${created.code} — ${created.name} (${created.accountType})`
    );
    return created;
  }

  async updateAccount(id: string, organizationId: string, input: UpdateAccountInput, actor: AdminActor) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'finance.accounts.manage')) {
      throw new AuthorizationError('Missing finance.accounts.manage permission');
    }
    const existing = await financeRepository.findAccountById(id, organizationId);
    if (!existing) throw new NotFoundError('Account not found in this organization');

    if (existing.isSystemAccount && input.isActive === false) {
      throw new ValidationError('Protected system accounts cannot be deactivated');
    }

    const updated = await financeRepository.updateAccount(id, organizationId, {
      $set: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.category ? { category: input.category } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        ...(input.parentAccountId ? { parentAccountId: new mongoose.Types.ObjectId(input.parentAccountId) } : {}),
        updatedBy: new mongoose.Types.ObjectId(actor.id),
      },
    });
    return updated;
  }

  async deleteAccount(id: string, organizationId: string, actor: AdminActor) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'finance.accounts.manage')) {
      throw new AuthorizationError('Missing finance.accounts.manage permission');
    }
    const existing = await financeRepository.findAccountById(id, organizationId);
    if (!existing) throw new NotFoundError('Account not found in this organization');
    if (existing.isSystemAccount) {
      throw new ValidationError('System accounts are protected and cannot be deleted');
    }
    const postedUsageCount = await financeRepository.countPostedLinesForAccount(id, organizationId);
    if (postedUsageCount > 0) {
      throw new ConflictError(
        `Cannot delete account ${existing.code}: referenced by ${postedUsageCount} posted ledger line(s). Deactivate instead.`
      );
    }

    await financeRepository.deleteAccount(id, organizationId);
    await adminService.logAudit(
      actor,
      'FINANCE_ACCOUNT_DELETED',
      'ChartOfAccount',
      id,
      `Deleted unused account ${existing.code} — ${existing.name}`
    );
    return { deleted: true };
  }

  // ======================== ACCOUNTING PERIODS ========================

  async listPeriods(organizationId: string) {
    return financeRepository.findPeriods(organizationId);
  }

  async createPeriod(organizationId: string, input: CreateAccountingPeriodInput, actor: AdminActor) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'finance.periods.manage')) {
      throw new AuthorizationError('Missing finance.periods.manage permission');
    }
    const start = new Date(input.startDate);
    const end = new Date(input.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      throw new ValidationError('Period endDate must be strictly later than startDate');
    }

    try {
      const period = await financeRepository.createPeriod({
        organizationId: new mongoose.Types.ObjectId(organizationId),
        financialYearLabel: input.financialYearLabel,
        periodName: input.periodName,
        startDate: start,
        endDate: end,
        status: 'OPEN',
        history: [
          {
            action: 'OPENED',
            actorId: new mongoose.Types.ObjectId(actor.id),
            actorName: actor.name,
            reason: 'Initial period creation',
            timestamp: new Date(),
          },
        ],
        createdBy: new mongoose.Types.ObjectId(actor.id),
      });

      await adminService.logAudit(
        actor,
        'FINANCE_PERIOD_CREATED',
        'AccountingPeriod',
        period._id.toString(),
        `Opened accounting period ${period.periodName} (${period.financialYearLabel})`
      );
      return period;
    } catch (err: unknown) {
      if ((err as { code?: number })?.code === 11000) {
        throw new ConflictError('An accounting period with this name already exists for this financial year');
      }
      throw err;
    }
  }

  async updatePeriodStatus(
    organizationId: string,
    input: UpdateAccountingPeriodStatusInput,
    actor: AdminActor
  ) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'finance.periods.manage')) {
      throw new AuthorizationError('Missing finance.periods.manage permission');
    }

    const period = await financeRepository.findPeriodById(input.periodId, organizationId);
    if (!period) throw new NotFoundError('Accounting period not found in this organization');

    if (input.action === 'REOPEN') {
      // Reopening a CLOSED or LOCKED period requires privileged governance role
      if (actor.role !== 'SUPER_ADMIN' && actor.role !== 'EXECUTIVE_DIRECTOR') {
        throw new AuthorizationError(
          'Reopening a closed or locked accounting period requires SUPER_ADMIN or EXECUTIVE_DIRECTOR authorization'
        );
      }
    }

    const nextStatus =
      input.action === 'CLOSE' ? 'CLOSED' : input.action === 'LOCK' ? 'LOCKED' : 'OPEN';
    const historyAction =
      input.action === 'CLOSE' ? 'CLOSED' : input.action === 'LOCK' ? 'LOCKED' : 'REOPENED';

    const updated = await financeRepository.updatePeriod(input.periodId, organizationId, {
      $set: {
        status: nextStatus,
        ...(input.action === 'CLOSE' ? { closedBy: new mongoose.Types.ObjectId(actor.id), closedAt: new Date() } : {}),
        ...(input.action === 'LOCK' ? { lockedBy: new mongoose.Types.ObjectId(actor.id), lockedAt: new Date() } : {}),
      },
      $push: {
        history: {
          action: historyAction,
          actorId: new mongoose.Types.ObjectId(actor.id),
          actorName: actor.name,
          reason: input.reason,
          timestamp: new Date(),
        },
      },
    });

    await adminService.logAudit(
      actor,
      `FINANCE_PERIOD_${historyAction}`,
      'AccountingPeriod',
      input.periodId,
      `Period ${period.periodName} -> ${nextStatus}: ${input.reason}`
    );
    return updated;
  }

  private async resolveOpenPeriod(organizationId: string, txDate: Date, periodId?: string) {
    const period = periodId
      ? await financeRepository.findPeriodById(periodId, organizationId)
      : await financeRepository.findPeriodCoveringDate(organizationId, txDate);

    if (!period) {
      throw new ValidationError(
        `No accounting period found covering date ${txDate.toISOString().slice(0, 10)}. Configure an open period first.`
      );
    }
    if (period.status !== 'OPEN') {
      throw new ValidationError(
        `Cannot create or post journal entries into ${period.status} accounting period "${period.periodName}"`
      );
    }
    if (txDate < new Date(period.startDate) || txDate > new Date(period.endDate)) {
      throw new ValidationError(
        `Transaction date ${txDate.toISOString().slice(0, 10)} falls outside period "${period.periodName}"`
      );
    }
    return period;
  }

  // ======================== DOUBLE-ENTRY JOURNALS ========================

  async createJournalEntry(
    organizationId: string,
    input: CreateJournalEntryInput,
    actor: AdminActor,
    options?: { skipPermissionCheck?: boolean }
  ) {
    if (
      !options?.skipPermissionCheck &&
      actor.role !== 'SUPER_ADMIN' &&
      !checkRolePermission(actor.role, 'finance.journals.create')
    ) {
      throw new AuthorizationError('Missing finance.journals.create permission');
    }

    // Idempotency guard for automated ledger events
    if (input.idempotencyKey) {
      const existing = await financeRepository.findJournalByIdempotencyKey(
        organizationId,
        input.idempotencyKey
      );
      if (existing) {
        return {
          journal: existing,
          lines: await financeRepository.findLinesByJournalId(existing._id.toString(), organizationId),
          idempotentReplay: true,
        };
      }
    }

    const { totalDebitMinor, totalCreditMinor } = assertBalancedJournalLines(input.lines);
    const txDate = new Date(input.transactionDate);
    if (Number.isNaN(txDate.getTime())) throw new ValidationError('Invalid transactionDate');

    const period = await this.resolveOpenPeriod(organizationId, txDate, input.periodId);

    // Resolve and validate all accounts within this tenant
    const accountsMap = new Map<string, IChartOfAccountDocument>();
    for (const line of input.lines) {
      if (!accountsMap.has(line.accountId)) {
        const acc = await financeRepository.findAccountById(line.accountId, organizationId);
        if (!acc) throw new ValidationError(`Account ${line.accountId} not found in this organization`);
        if (!acc.isActive) throw new ValidationError(`Account ${acc.code} (${acc.name}) is inactive`);
        accountsMap.set(line.accountId, acc);
      }
    }

    const journalNumber = generateJournalNumber();
    const initialStatus = input.submitForApproval ? 'PENDING_APPROVAL' : 'DRAFT';

    const tx = await runInFinancialTransaction(async (session) => {
      const journal = await financeRepository.createJournalEntry(
        {
          organizationId: new mongoose.Types.ObjectId(organizationId),
          journalNumber,
          periodId: period._id as mongoose.Types.ObjectId,
          transactionDate: txDate,
          description: input.description,
          referenceType: input.referenceType || 'MANUAL',
          referenceId: input.referenceId,
          idempotencyKey: input.idempotencyKey,
          status: initialStatus,
          totalDebitMinor,
          totalCreditMinor,
          currency: (input.currency || 'INR').toUpperCase(),
          isReversed: false,
          createdBy: new mongoose.Types.ObjectId(actor.id),
          auditNotes: input.auditNotes,
        },
        session
      );

      const lineDocs = input.lines.map((l) => {
        const acc = accountsMap.get(l.accountId)!;
        return {
          organizationId: new mongoose.Types.ObjectId(organizationId),
          journalEntryId: journal._id as mongoose.Types.ObjectId,
          periodId: period._id as mongoose.Types.ObjectId,
          transactionDate: txDate,
          accountId: acc._id as mongoose.Types.ObjectId,
          accountCodeSnapshot: acc.code,
          accountNameSnapshot: acc.name,
          accountTypeSnapshot: acc.accountType,
          debitMinor: l.debitMinor,
          creditMinor: l.creditMinor,
          currency: (input.currency || 'INR').toUpperCase(),
          description: l.description || input.description,
          isPosted: false,
          programId: l.programId ? new mongoose.Types.ObjectId(l.programId) : undefined,
          projectId: l.projectId ? new mongoose.Types.ObjectId(l.projectId) : undefined,
          departmentId: l.departmentId ? new mongoose.Types.ObjectId(l.departmentId) : undefined,
          campaignId: l.campaignId ? new mongoose.Types.ObjectId(l.campaignId) : undefined,
          grantId: l.grantId ? new mongoose.Types.ObjectId(l.grantId) : undefined,
          fundAllocationId: l.fundAllocationId ? new mongoose.Types.ObjectId(l.fundAllocationId) : undefined,
          vendorId: l.vendorId ? new mongoose.Types.ObjectId(l.vendorId) : undefined,
        };
      });

      const createdLines = await financeRepository.createJournalLines(lineDocs, session);
      return { journal, lines: createdLines };
    });

    await adminService.logAudit(
      actor,
      'FINANCE_JOURNAL_CREATED',
      'JournalEntry',
      tx.result.journal._id.toString(),
      `Created ${initialStatus} journal ${journalNumber} (${totalDebitMinor} minor units)`
    );

    return {
      ...tx.result,
      idempotentReplay: false,
      transactional: tx.transactional,
      transactionNote: tx.transactionNote,
    };
  }

  async approveJournalEntry(
    journalId: string,
    organizationId: string,
    input: ApproveJournalEntryInput,
    actor: AdminActor
  ) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'finance.journals.approve')) {
      throw new AuthorizationError('Missing finance.journals.approve permission');
    }

    const journal = await financeRepository.findJournalById(journalId, organizationId);
    if (!journal) throw new NotFoundError('Journal entry not found in this organization');

    if (journal.status === 'POSTED' || journal.status === 'REVERSED') {
      throw new ValidationError('Posted or reversed journal entries are immutable and cannot be modified');
    }
    if (journal.createdBy.toString() === actor.id && actor.role !== 'SUPER_ADMIN') {
      throw new AuthorizationError('Separation of duties: journal creator cannot approve their own journal entry');
    }

    const nextStatus = input.decision === 'APPROVE' ? 'APPROVED' : 'DRAFT';
    const updated = await financeRepository.updateJournalEntry(journalId, organizationId, {
      $set: {
        status: nextStatus,
        ...(input.decision === 'APPROVE'
          ? { approvedBy: new mongoose.Types.ObjectId(actor.id), approvedAt: new Date() }
          : {}),
        auditNotes: input.notes || journal.auditNotes,
      },
    });

    await adminService.logAudit(
      actor,
      `FINANCE_JOURNAL_${input.decision}`,
      'JournalEntry',
      journalId,
      `Journal ${journal.journalNumber} -> ${nextStatus}`
    );
    return updated;
  }

  async postJournalEntry(
    journalId: string,
    organizationId: string,
    actor: AdminActor,
    options?: { skipPermissionCheck?: boolean; allowUnapprovedAutomated?: boolean }
  ) {
    if (
      !options?.skipPermissionCheck &&
      actor.role !== 'SUPER_ADMIN' &&
      !checkRolePermission(actor.role, 'finance.journals.post')
    ) {
      throw new AuthorizationError('Missing finance.journals.post permission');
    }

    const journal = await financeRepository.findJournalById(journalId, organizationId);
    if (!journal) throw new NotFoundError('Journal entry not found in this organization');

    if (journal.status === 'POSTED') {
      throw new ConflictError(`Journal ${journal.journalNumber} is already posted`);
    }
    if (journal.status === 'REVERSED') {
      throw new ValidationError(`Journal ${journal.journalNumber} has been reversed`);
    }
    if (
      !options?.allowUnapprovedAutomated &&
      journal.status !== 'APPROVED' &&
      actor.role !== 'SUPER_ADMIN'
    ) {
      throw new ValidationError('Manual journal entries must be approved before posting');
    }

    // Re-verify period is still OPEN
    await this.resolveOpenPeriod(organizationId, new Date(journal.transactionDate), journal.periodId.toString());

    // Re-verify line balance directly from persisted lines
    const lines = await financeRepository.findLinesByJournalId(journalId, organizationId);
    assertBalancedJournalLines(
      lines.map((l) => ({
        accountId: l.accountId.toString(),
        debitMinor: l.debitMinor,
        creditMinor: l.creditMinor,
      }))
    );

    const tx = await runInFinancialTransaction(async (session) => {
      const updated = await financeRepository.updateJournalEntry(
        journalId,
        organizationId,
        {
          $set: {
            status: 'POSTED',
            postedBy: new mongoose.Types.ObjectId(actor.id),
            postedAt: new Date(),
          },
        },
        session
      );
      await financeRepository.markLinesPosted(journalId, organizationId, session);
      return updated;
    });

    await financeRepository.updateJournalEntry(journalId, organizationId, {
      $set: {
        transactionalPost: tx.transactional,
        transactionNote: tx.transactionNote,
      },
    });

    await adminService.logAudit(
      actor,
      'FINANCE_JOURNAL_POSTED',
      'JournalEntry',
      journalId,
      `Posted journal ${journal.journalNumber} (${journal.totalDebitMinor} minor units; transactional=${tx.transactional})`
    );

    return {
      journal: tx.result,
      transactional: tx.transactional,
      transactionNote: tx.transactionNote,
    };
  }

  /**
   * Traceable correction of a POSTED journal entry: creates an equal & opposite counter-journal
   * inside an OPEN period, posts it, and marks the original entry as REVERSED without mutating its lines.
   */
  async reverseJournalEntry(
    journalId: string,
    organizationId: string,
    input: ReverseJournalEntryInput,
    actor: AdminActor
  ) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'finance.journals.post')) {
      throw new AuthorizationError('Missing finance.journals.post permission to reverse a posted journal');
    }

    const original = await financeRepository.findJournalById(journalId, organizationId);
    if (!original) throw new NotFoundError('Journal entry not found in this organization');

    if (original.status !== 'POSTED') {
      throw new ValidationError('Only POSTED journal entries can be reversed');
    }
    if (original.isReversed) {
      throw new ConflictError(`Journal ${original.journalNumber} has already been reversed`);
    }

    const originalLines = await financeRepository.findLinesByJournalId(journalId, organizationId);
    const reversalDate = input.reversalDate ? new Date(input.reversalDate) : new Date();
    const openPeriod = await this.resolveOpenPeriod(organizationId, reversalDate);

    const reversalLines = originalLines.map((l) => ({
      accountId: l.accountId.toString(),
      debitMinor: l.creditMinor, // Swap debit <-> credit
      creditMinor: l.debitMinor,
      description: `Reversal of ${original.journalNumber}: ${l.description || original.description}`,
      programId: l.programId?.toString(),
      projectId: l.projectId?.toString(),
      departmentId: l.departmentId?.toString(),
      campaignId: l.campaignId?.toString(),
      grantId: l.grantId?.toString(),
      fundAllocationId: l.fundAllocationId?.toString(),
      vendorId: l.vendorId?.toString(),
    }));

    const createdReversal = await this.createJournalEntry(
      organizationId,
      {
        periodId: openPeriod._id.toString(),
        transactionDate: reversalDate.toISOString(),
        description: `REVERSAL of ${original.journalNumber} — ${input.reason}`,
        referenceType: 'REVERSAL',
        referenceId: original._id.toString(),
        idempotencyKey: `REVERSAL:${original._id.toString()}`,
        currency: original.currency,
        submitForApproval: false,
        lines: reversalLines,
      },
      actor,
      { skipPermissionCheck: true }
    );

    const posted = await this.postJournalEntry(
      createdReversal.journal._id.toString(),
      organizationId,
      actor,
      { skipPermissionCheck: true, allowUnapprovedAutomated: true }
    );

    await financeRepository.updateJournalEntry(journalId, organizationId, {
      $set: {
        status: 'REVERSED',
        isReversed: true,
        reversedByJournalId: createdReversal.journal._id,
        reversalReason: input.reason,
      },
    });
    await financeRepository.updateJournalEntry(createdReversal.journal._id.toString(), organizationId, {
      $set: {
        reversalOfJournalId: original._id,
        reversalReason: input.reason,
      },
    });

    await adminService.logAudit(
      actor,
      'FINANCE_JOURNAL_REVERSED',
      'JournalEntry',
      journalId,
      `Reversed ${original.journalNumber} via ${createdReversal.journal.journalNumber}: ${input.reason}`
    );

    return {
      originalJournalId: journalId,
      reversalJournal: posted.journal,
      transactional: posted.transactional,
      transactionNote: posted.transactionNote,
    };
  }

  // ======================== PHASE 08 DONATION & REFUND LEDGER INTEGRATION ========================

  private async ensureSystemAccountByCode(
    organizationId: string,
    code: string,
    fallbackName: string,
    accountType: AccountType,
    category: string
  ) {
    const existing = await financeRepository.findAccountByCode(code, organizationId);
    if (existing) return existing;
    return financeRepository.createAccount({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      code,
      name: fallbackName,
      accountType,
      category,
      normalBalance: getNormalBalanceForAccountType(accountType),
      isSystemAccount: true,
      isActive: true,
    });
  }

  /**
   * Idempotently posts a verified Phase 08 Donation into the Double-Entry General Ledger.
   * CRITICAL INVARIANTS:
   * - Rejects INITIATED, PENDING, FAILED, or CANCELLED donations (never recognized as income).
   * - Uses deterministic idempotencyKey `DONATION:<donationId>` so the same payment is never counted twice.
   */
  async syncVerifiedDonationToLedger(organizationId: string, donationId: string, actor: AdminActor) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'finance.income.manage')) {
      throw new AuthorizationError('Missing finance.income.manage permission');
    }

    const donation = await fundraisingRepository.findDonationById(donationId, organizationId);
    if (!donation) throw new NotFoundError('Donation not found in this organization');

    if (!['SUCCESSFUL', 'PARTIALLY_REFUNDED', 'REFUNDED'].includes(donation.status)) {
      throw new ValidationError(
        `Donation ${donation.donationCode} has status "${donation.status}" and cannot be recognized as received income`
      );
    }

    const idempotencyKey = `DONATION:${donation._id.toString()}`;
    const existing = await financeRepository.findJournalByIdempotencyKey(organizationId, idempotencyKey);
    if (existing) {
      return { journal: existing, idempotentReplay: true };
    }

    const bankAccount = await this.ensureSystemAccountByCode(
      organizationId,
      '1020',
      'Primary NGO Bank Account',
      'ASSET',
      'Bank Accounts'
    );
    const incomeAccount = await this.ensureSystemAccountByCode(
      organizationId,
      '4010',
      'Individual Donations Income',
      'INCOME',
      'Individual Donations'
    );

    const txDate = donation.verifiedAt || donation.createdAt || new Date();
    const created = await this.createJournalEntry(
      organizationId,
      {
        transactionDate: new Date(txDate).toISOString(),
        description: `Verified Donation ${donation.donationCode} (${donation.paymentProvider}) — ${donation.purpose}`,
        referenceType: 'DONATION',
        referenceId: donation._id.toString(),
        idempotencyKey,
        currency: donation.currency || 'INR',
        submitForApproval: false,
        lines: [
          {
            accountId: bankAccount._id.toString(),
            debitMinor: donation.amountMinor,
            creditMinor: 0,
            description: `Receipt of verified donation ${donation.donationCode}`,
            campaignId: donation.campaignId?.toString(),
            programId: donation.programId?.toString(),
            projectId: donation.projectId?.toString(),
          },
          {
            accountId: incomeAccount._id.toString(),
            debitMinor: 0,
            creditMinor: donation.amountMinor,
            description: `Donation income (${donation.donationCode})`,
            campaignId: donation.campaignId?.toString(),
            programId: donation.programId?.toString(),
            projectId: donation.projectId?.toString(),
          },
        ],
      },
      actor,
      { skipPermissionCheck: true }
    );

    const posted = await this.postJournalEntry(
      created.journal._id.toString(),
      organizationId,
      actor,
      { skipPermissionCheck: true, allowUnapprovedAutomated: true }
    );

    return { journal: posted.journal, idempotentReplay: false, transactional: posted.transactional };
  }

  /**
   * Idempotently posts a processed Phase 08 Refund into the Double-Entry General Ledger
   * as a traceable contra-income debit / bank credit entry.
   */
  async syncProcessedRefundToLedger(organizationId: string, refundId: string, actor: AdminActor) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'finance.income.manage')) {
      throw new AuthorizationError('Missing finance.income.manage permission');
    }

    const refund = await fundraisingRepository.findRefundById(refundId, organizationId);
    if (!refund) throw new NotFoundError('Refund not found in this organization');

    if (refund.status !== 'SUCCESSFUL') {
      throw new ValidationError(
        `Refund status is "${refund.status}"; only SUCCESSFUL refunds may be posted to the ledger`
      );
    }

    const idempotencyKey = `REFUND:${refund._id.toString()}`;
    const existing = await financeRepository.findJournalByIdempotencyKey(organizationId, idempotencyKey);
    if (existing) {
      return { journal: existing, idempotentReplay: true };
    }

    const bankAccount = await this.ensureSystemAccountByCode(
      organizationId,
      '1020',
      'Primary NGO Bank Account',
      'ASSET',
      'Bank Accounts'
    );
    const refundContraAccount = await this.ensureSystemAccountByCode(
      organizationId,
      '4090',
      'Donation Refunds & Adjustments (Contra-Income)',
      'INCOME',
      'Other Income'
    );

    const txDate = refund.processedAt || refund.updatedAt || new Date();
    const created = await this.createJournalEntry(
      organizationId,
      {
        transactionDate: new Date(txDate).toISOString(),
        description: `Processed Donation Refund (${refund.reason})`,
        referenceType: 'REFUND',
        referenceId: refund._id.toString(),
        idempotencyKey,
        currency: refund.currency || 'INR',
        submitForApproval: false,
        lines: [
          {
            accountId: refundContraAccount._id.toString(),
            debitMinor: refund.amountMinor,
            creditMinor: 0,
            description: `Refund reversal for donation ${refund.donationId.toString()}`,
          },
          {
            accountId: bankAccount._id.toString(),
            debitMinor: 0,
            creditMinor: refund.amountMinor,
            description: `Bank outflow for processed refund`,
          },
        ],
      },
      actor,
      { skipPermissionCheck: true }
    );

    const posted = await this.postJournalEntry(
      created.journal._id.toString(),
      organizationId,
      actor,
      { skipPermissionCheck: true, allowUnapprovedAutomated: true }
    );

    return { journal: posted.journal, idempotentReplay: false, transactional: posted.transactional };
  }

  /**
   * Internal helper used by Expense Payment & Grant Receipt workflows to post balanced ledger entries idempotently.
   */
  async postAutomatedLedgerEvent(
    organizationId: string,
    payload: {
      transactionDate: Date;
      description: string;
      referenceType: JournalReferenceType;
      referenceId: string;
      idempotencyKey: string;
      currency: string;
      debitAccountCode: { code: string; name: string; type: AccountType; category: string };
      creditAccountCode: { code: string; name: string; type: AccountType; category: string };
      amountMinor: number;
      debitAccountId?: string;
      creditAccountId?: string;
      dimensions?: {
        programId?: string;
        projectId?: string;
        departmentId?: string;
        grantId?: string;
        fundAllocationId?: string;
        vendorId?: string;
      };
    },
    actor: AdminActor
  ) {
    const debitAcc = payload.debitAccountId
      ? await financeRepository.findAccountById(payload.debitAccountId, organizationId)
      : await this.ensureSystemAccountByCode(
          organizationId,
          payload.debitAccountCode.code,
          payload.debitAccountCode.name,
          payload.debitAccountCode.type,
          payload.debitAccountCode.category
        );
    const creditAcc = payload.creditAccountId
      ? await financeRepository.findAccountById(payload.creditAccountId, organizationId)
      : await this.ensureSystemAccountByCode(
          organizationId,
          payload.creditAccountCode.code,
          payload.creditAccountCode.name,
          payload.creditAccountCode.type,
          payload.creditAccountCode.category
        );

    if (!debitAcc || !creditAcc) {
      throw new ValidationError('Unable to resolve debit or credit account within this organization');
    }

    const created = await this.createJournalEntry(
      organizationId,
      {
        transactionDate: payload.transactionDate.toISOString(),
        description: payload.description,
        referenceType: payload.referenceType,
        referenceId: payload.referenceId,
        idempotencyKey: payload.idempotencyKey,
        currency: payload.currency,
        submitForApproval: false,
        lines: [
          {
            accountId: debitAcc._id.toString(),
            debitMinor: payload.amountMinor,
            creditMinor: 0,
            description: payload.description,
            ...payload.dimensions,
          },
          {
            accountId: creditAcc._id.toString(),
            debitMinor: 0,
            creditMinor: payload.amountMinor,
            description: payload.description,
            ...payload.dimensions,
          },
        ],
      },
      actor,
      { skipPermissionCheck: true }
    );

    if (created.idempotentReplay) {
      return { journal: created.journal, idempotentReplay: true };
    }

    const posted = await this.postJournalEntry(
      created.journal._id.toString(),
      organizationId,
      actor,
      { skipPermissionCheck: true, allowUnapprovedAutomated: true }
    );
    return { journal: posted.journal, idempotentReplay: false, transactional: posted.transactional };
  }

  // ======================== GENERAL LEDGER & TRIAL BALANCE ========================

  async listJournals(
    organizationId: string,
    filters: { status?: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'POSTED' | 'REVERSED'; periodId?: string; referenceType?: string; from?: Date; to?: Date },
    pagination: { page?: number; limit?: number }
  ) {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(100, Math.max(1, pagination.limit || 25));
    const { items, total } = await financeRepository.findJournals(organizationId, filters, { page, limit });
    return {
      journals: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getJournalDetail(id: string, organizationId: string) {
    const journal = await financeRepository.findJournalById(id, organizationId);
    if (!journal) throw new NotFoundError('Journal entry not found in this organization');
    const lines = await financeRepository.findLinesByJournalId(id, organizationId);
    return { journal, lines };
  }

  async getGeneralLedger(
    organizationId: string,
    filters: {
      accountId?: string;
      accountType?: AccountType;
      periodId?: string;
      programId?: string;
      projectId?: string;
      departmentId?: string;
      from?: Date;
      to?: Date;
    }
  ) {
    const lines = await financeRepository.findPostedLedgerLines(organizationId, filters, 1000);
    let runningBalanceMinor = 0;
    const entries = lines.map((line) => {
      const normalDebit = line.accountTypeSnapshot === 'ASSET' || line.accountTypeSnapshot === 'EXPENSE';
      const delta = normalDebit
        ? subtractMinorUnits(line.debitMinor, line.creditMinor)
        : subtractMinorUnits(line.creditMinor, line.debitMinor);
      runningBalanceMinor = sumMinorUnits([runningBalanceMinor, delta]);
      return {
        id: line._id.toString(),
        journalEntryId: line.journalEntryId.toString(),
        transactionDate: line.transactionDate,
        accountId: line.accountId.toString(),
        accountCode: line.accountCodeSnapshot,
        accountName: line.accountNameSnapshot,
        accountType: line.accountTypeSnapshot,
        description: line.description,
        debitMinor: line.debitMinor,
        creditMinor: line.creditMinor,
        runningBalanceMinor,
        programId: line.programId?.toString(),
        projectId: line.projectId?.toString(),
        departmentId: line.departmentId?.toString(),
      };
    });

    return {
      entries,
      totalDebitMinor: sumMinorUnits(entries.map((e) => e.debitMinor)),
      totalCreditMinor: sumMinorUnits(entries.map((e) => e.creditMinor)),
    };
  }

  async getTrialBalance(organizationId: string, filters?: { periodId?: string; from?: Date; to?: Date }) {
    const lines = await financeRepository.findPostedLedgerLines(organizationId, filters || {}, 5000);
    return computeTrialBalanceFromLines(lines);
  }
}

export const accountingService = new AccountingService();
