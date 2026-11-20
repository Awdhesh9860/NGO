import { describe, it, expect, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import {
  AccountingService,
  assertBalancedJournalLines,
  computeTrialBalanceFromLines,
} from '../server/services/accounting.service';
import {
  ExpenseVendorService,
  getApprovalThresholdMinorForRole,
  toSafeBankAccountDTO,
  toSafeVendorDTO,
} from '../server/services/expense-vendor.service';
import {
  BudgetGrantComplianceService,
  assertRestrictedFundCompliance,
  computeBudgetUtilization,
  evaluateComplianceDeadline,
} from '../server/services/budget-grant-compliance.service';
import {
  FinancialReportsService,
  buildIncomeAndExpenseStatement,
  buildBalanceSheet,
} from '../server/services/financial-reports.service';
import {
  encryptFinancialSecret,
  decryptFinancialSecret,
  maskAccountNumber,
  parseBankStatementCsv,
  escapeCsvCell,
} from '../server/security/financial-crypto';
import { financeRepository } from '../server/repositories/finance.repository';
import { fundraisingRepository } from '../server/repositories/fundraising.repository';
import { auditRepository } from '../server/repositories/audit.repository';
import { checkRolePermission } from '../server/authorization/permissions';
import { getAuthorizedAdminNav } from '../features/admin/config/navigation';
import {
  toMinorUnits,
  sumMinorUnits,
  subtractMinorUnits,
  calculateMinorPercentage,
  formatMinorCurrency,
} from '../lib/money';
import { AdminActor } from '../server/services/admin.service';

const ORG_A = new mongoose.Types.ObjectId().toString();
const ORG_B = new mongoose.Types.ObjectId().toString();

const superAdminActor: AdminActor = {
  id: new mongoose.Types.ObjectId().toString(),
  name: 'Super Admin',
  email: 'super@org-a.org',
  role: 'SUPER_ADMIN',
  organizationId: ORG_A,
};

const adminActor: AdminActor = {
  id: new mongoose.Types.ObjectId().toString(),
  name: 'Org Admin',
  email: 'admin@org-a.org',
  role: 'ADMIN',
  organizationId: ORG_A,
};

const accountantActor: AdminActor = {
  id: new mongoose.Types.ObjectId().toString(),
  name: 'Chief Accountant',
  email: 'accounts@org-a.org',
  role: 'ACCOUNTANT',
  organizationId: ORG_A,
};

const managerActor: AdminActor = {
  id: new mongoose.Types.ObjectId().toString(),
  name: 'Dept Manager',
  email: 'manager@org-a.org',
  role: 'MANAGER',
  organizationId: ORG_A,
};

const staffActor: AdminActor = {
  id: new mongoose.Types.ObjectId().toString(),
  name: 'Field Coordinator',
  email: 'field@org-a.org',
  role: 'TEAM_MEMBER',
  organizationId: ORG_A,
};

describe('Phase 10: RBAC Separation of Duties, Money Precision & Crypto Masking', () => {
  it('enforces least-privilege separation of duties across finance and compliance roles', () => {
    // ADMIN approves expenses/journals/budgets but does NOT post journals, disburse payments, or independently verify compliance
    expect(checkRolePermission('ADMIN', 'finance.expenses.approve')).toBe(true);
    expect(checkRolePermission('ADMIN', 'finance.journals.approve')).toBe(true);
    expect(checkRolePermission('ADMIN', 'finance.expenses.pay')).toBe(false);
    expect(checkRolePermission('ADMIN', 'finance.journals.post')).toBe(false);
    expect(checkRolePermission('ADMIN', 'compliance.verify')).toBe(false);

    // ACCOUNTANT posts journals, pays expenses, reconciles banks & verifies compliance, but does NOT approve own expenses/journals/budgets
    expect(checkRolePermission('ACCOUNTANT', 'finance.journals.post')).toBe(true);
    expect(checkRolePermission('ACCOUNTANT', 'finance.expenses.pay')).toBe(true);
    expect(checkRolePermission('ACCOUNTANT', 'finance.reconciliation.manage')).toBe(true);
    expect(checkRolePermission('ACCOUNTANT', 'compliance.verify')).toBe(true);
    expect(checkRolePermission('ACCOUNTANT', 'finance.expenses.approve')).toBe(false);
    expect(checkRolePermission('ACCOUNTANT', 'finance.journals.approve')).toBe(false);

    // MANAGER cannot export financial reports or manage bank accounts
    expect(checkRolePermission('MANAGER', 'finance.reports.export')).toBe(false);
    expect(checkRolePermission('MANAGER', 'finance.bank_accounts.manage')).toBe(false);

    // Non-console roles keep empty admin navigation
    expect(getAuthorizedAdminNav('GUEST')).toHaveLength(0);
    expect(getAuthorizedAdminNav('DONOR')).toHaveLength(0);
    expect(getAuthorizedAdminNav('VOLUNTEER')).toHaveLength(0);
    expect(getAuthorizedAdminNav('MEMBER')).toHaveLength(0);
  });

  it('maintains integer minor-unit money precision with zero IEEE-754 drift', () => {
    // Classic JS float bug: 0.1 + 0.2 === 0.30000000000000004
    const a = toMinorUnits(0.1, 'INR');
    const b = toMinorUnits(0.2, 'INR');
    expect(sumMinorUnits([a, b])).toBe(30);
    expect(subtractMinorUnits(100000, 33333)).toBe(66667);
    expect(calculateMinorPercentage(7500, 10000)).toBe(75);
    expect(formatMinorCurrency(125050, 'INR')).toBe('₹1,250.50');
  });

  it('encrypts sensitive bank credentials with AES-256-GCM and strictly masks DTO output', () => {
    const rawAccount = '30987654321098';
    const encrypted = encryptFinancialSecret(rawAccount);
    expect(encrypted.startsWith('v1:')).toBe(true);
    expect(encrypted).not.toContain(rawAccount);
    expect(decryptFinancialSecret(encrypted)).toBe(rawAccount);

    const masked = maskAccountNumber(rawAccount);
    expect(masked.endsWith('1098')).toBe(true);
    expect(masked).not.toContain('309876');

    const safeBank = toSafeBankAccountDTO({
      _id: new mongoose.Types.ObjectId(),
      accountName: 'Main Operations',
      bankName: 'State Bank',
      accountType: 'CURRENT',
      accountNumberMasked: masked,
      accountNumberEncrypted: encrypted,
      currency: 'INR',
      openingBalanceMinor: 500000,
      status: 'ACTIVE',
      createdAt: new Date(),
    } as never);
    expect(safeBank.accountNumberMasked).toBe(masked);
    expect('accountNumberEncrypted' in safeBank).toBe(false);

    const safeVendorNoBank = toSafeVendorDTO(
      {
        _id: new mongoose.Types.ObjectId(),
        vendorCode: 'VND-2026-01',
        name: 'Acme Books',
        vendorType: 'SUPPLIER',
        bankName: 'HDFC',
        bankAccountMasked: masked,
        bankAccountEncrypted: encrypted,
        status: 'ACTIVE',
        documentRefs: [],
        createdAt: new Date(),
      } as never,
      false
    );
    expect(safeVendorNoBank.bankSummary).toBeUndefined();
    expect(safeVendorNoBank.hasBankDetailsOnFile).toBe(true);
  });
});

describe('Phase 10: Double-Entry Accounting, Closed Periods, Reversals & Donation/Refund Sync', () => {
  const accounting = new AccountingService();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(auditRepository, 'create').mockResolvedValue({ _id: new mongoose.Types.ObjectId() } as never);
  });

  it('validates balanced DR === CR journals and rejects unbalanced or fractional lines', () => {
    const acc1 = new mongoose.Types.ObjectId().toString();
    const acc2 = new mongoose.Types.ObjectId().toString();

    expect(
      assertBalancedJournalLines([
        { accountId: acc1, debitMinor: 50000, creditMinor: 0 },
        { accountId: acc2, debitMinor: 0, creditMinor: 50000 },
      ])
    ).toEqual({ totalDebitMinor: 50000, totalCreditMinor: 50000 });

    expect(() =>
      assertBalancedJournalLines([
        { accountId: acc1, debitMinor: 50000, creditMinor: 0 },
        { accountId: acc2, debitMinor: 0, creditMinor: 49999 },
      ])
    ).toThrow(/Unbalanced journal entry/i);

    expect(() =>
      assertBalancedJournalLines([
        { accountId: acc1, debitMinor: 100.5, creditMinor: 0 },
        { accountId: acc2, debitMinor: 0, creditMinor: 100.5 },
      ])
    ).toThrow(/integer minor currency units/i);
  });

  it('prevents posting into CLOSED or LOCKED accounting periods and enforces posting authorization', async () => {
    const acc1 = new mongoose.Types.ObjectId().toString();
    const acc2 = new mongoose.Types.ObjectId().toString();
    const closedPeriodId = new mongoose.Types.ObjectId();

    vi.spyOn(financeRepository, 'findPeriodById').mockResolvedValue({
      _id: closedPeriodId,
      periodName: 'FY 2025-26',
      startDate: new Date('2025-04-01'),
      endDate: new Date('2026-03-31'),
      status: 'CLOSED',
    } as never);

    await expect(
      accounting.createJournalEntry(
        ORG_A,
        {
          periodId: closedPeriodId.toString(),
          transactionDate: '2026-02-15',
          description: 'Attempted backdated entry in closed period',
          referenceType: 'MANUAL',
          currency: 'INR',
          submitForApproval: false,
          lines: [
            { accountId: acc1, debitMinor: 10000, creditMinor: 0 },
            { accountId: acc2, debitMinor: 0, creditMinor: 10000 },
          ],
        },
        accountantActor
      )
    ).rejects.toThrow(/CLOSED accounting period/i);

    // ADMIN lacks finance.journals.post permission
    const jrId = new mongoose.Types.ObjectId().toString();
    await expect(accounting.postJournalEntry(jrId, ORG_A, adminActor)).rejects.toThrow(
      /finance\.journals\.post/i
    );
  });

  it('enforces idempotent journal events, rejects pending donations, and posts verified donations & refunds once', async () => {
    const donationId = new mongoose.Types.ObjectId().toString();

    // Pending donation MUST NOT be recognized as received income
    vi.spyOn(fundraisingRepository, 'findDonationById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(donationId),
      donationCode: 'DON-2026-PEND',
      status: 'PENDING',
      amountMinor: 100000,
      currency: 'INR',
    } as never);

    await expect(
      accounting.syncVerifiedDonationToLedger(ORG_A, donationId, accountantActor)
    ).rejects.toThrow(/cannot be recognized as received income/i);

    // Verified donation already synced -> idempotent replay prevents duplicate income
    vi.spyOn(fundraisingRepository, 'findDonationById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(donationId),
      donationCode: 'DON-2026-OK',
      status: 'SUCCESSFUL',
      amountMinor: 250000,
      currency: 'INR',
      paymentProvider: 'RAZORPAY',
      purpose: 'Education Fund',
    } as never);

    const existingJournal = {
      _id: new mongoose.Types.ObjectId(),
      journalNumber: 'JE-2026-EXISTING',
      status: 'POSTED',
      totalDebitMinor: 250000,
      totalCreditMinor: 250000,
    };
    vi.spyOn(financeRepository, 'findJournalByIdempotencyKey').mockResolvedValue(existingJournal as never);

    const replay = await accounting.syncVerifiedDonationToLedger(ORG_A, donationId, accountantActor);
    expect(replay.idempotentReplay).toBe(true);
    expect(replay.journal?.journalNumber).toBe('JE-2026-EXISTING');

    // Non-successful refund rejected
    const refundId = new mongoose.Types.ObjectId().toString();
    vi.spyOn(fundraisingRepository, 'findRefundById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(refundId),
      status: 'APPROVED',
      amountMinor: 50000,
      currency: 'INR',
    } as never);

    await expect(
      accounting.syncProcessedRefundToLedger(ORG_A, refundId, accountantActor)
    ).rejects.toThrow(/only SUCCESSFUL refunds/i);
  });

  it('creates balanced reversal journals swapping debits and credits and preserves tenant isolation', async () => {
    const jrId = new mongoose.Types.ObjectId();
    const revId = new mongoose.Types.ObjectId();
    const periodId = new mongoose.Types.ObjectId();
    const acc1 = new mongoose.Types.ObjectId();
    const acc2 = new mongoose.Types.ObjectId();

    vi.spyOn(financeRepository, 'findJournalById').mockImplementation(async (id, orgId) => {
      if (orgId !== ORG_A) return null;
      if (id === jrId.toString()) {
        return {
          _id: jrId,
          journalNumber: 'JE-2026-ORIG',
          periodId,
          transactionDate: new Date('2026-11-10'),
          description: 'Original entry',
          status: 'POSTED',
          isReversed: false,
          currency: 'INR',
          totalDebitMinor: 150000,
          totalCreditMinor: 150000,
        } as never;
      }
      return {
        _id: revId,
        journalNumber: 'JE-2026-REV1',
        periodId,
        transactionDate: new Date('2026-11-19'),
        description: 'REVERSAL of JE-2026-ORIG',
        status: 'DRAFT',
        isReversed: false,
        currency: 'INR',
        totalDebitMinor: 150000,
        totalCreditMinor: 150000,
      } as never;
    });

    vi.spyOn(financeRepository, 'findPeriodCoveringDate').mockResolvedValue({
      _id: periodId,
      periodName: 'FY 2026-27',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2027-03-31'),
      status: 'OPEN',
    } as never);
    vi.spyOn(financeRepository, 'findPeriodById').mockResolvedValue({
      _id: periodId,
      periodName: 'FY 2026-27',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2027-03-31'),
      status: 'OPEN',
    } as never);
    vi.spyOn(financeRepository, 'findJournalByIdempotencyKey').mockResolvedValue(null);
    vi.spyOn(financeRepository, 'findAccountById').mockImplementation(async (id) => ({
      _id: new mongoose.Types.ObjectId(id),
      code: id === acc1.toString() ? '1020' : '4010',
      name: id === acc1.toString() ? 'Bank' : 'Donations',
      accountType: id === acc1.toString() ? 'ASSET' : 'INCOME',
      isActive: true,
    } as never));

    let createdRevLines: Array<{ accountId: mongoose.Types.ObjectId; debitMinor: number; creditMinor: number }> = [];
    vi.spyOn(financeRepository, 'findLinesByJournalId').mockImplementation(async (id) => {
      if (id === jrId.toString()) {
        return [
          { accountId: acc1, debitMinor: 150000, creditMinor: 0, description: 'DR Bank' },
          { accountId: acc2, debitMinor: 0, creditMinor: 150000, description: 'CR Income' },
        ] as never;
      }
      return createdRevLines as never;
    });
    vi.spyOn(financeRepository, 'createJournalEntry').mockResolvedValue({
      _id: revId,
      journalNumber: 'JE-2026-REV1',
      totalDebitMinor: 150000,
      totalCreditMinor: 150000,
      status: 'DRAFT',
    } as never);
    vi.spyOn(financeRepository, 'createJournalLines').mockImplementation(async (lines) => {
      createdRevLines = lines as never;
      return lines as never;
    });
    vi.spyOn(financeRepository, 'updateJournalEntry').mockResolvedValue({
      _id: revId,
      journalNumber: 'JE-2026-REV1',
      status: 'POSTED',
    } as never);
    vi.spyOn(financeRepository, 'markLinesPosted').mockResolvedValue({ modifiedCount: 2 } as never);

    const rev = await accounting.reverseJournalEntry(
      jrId.toString(),
      ORG_A,
      { reason: 'Duplicate manual booking correction' },
      accountantActor
    );
    expect(rev.reversalJournal?.status).toBe('POSTED');
    // Verify debit and credit were swapped cleanly
    expect(createdRevLines[0].creditMinor).toBe(150000);
    expect(createdRevLines[1].debitMinor).toBe(150000);

    // Cross-tenant lookup returns NotFoundError
    await expect(accounting.getJournalDetail(jrId.toString(), ORG_B)).rejects.toThrow(
      /not found in this organization/i
    );
  });
});

describe('Phase 10: Expense Approvals, Vendor Bills, Bank Reconciliation, Restricted Funds, Reports & Compliance', () => {
  const expenseVendor = new ExpenseVendorService();
  const budgetGrantCompliance = new BudgetGrantComplianceService();
  const reports = new FinancialReportsService();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(auditRepository, 'create').mockResolvedValue({ _id: new mongoose.Types.ObjectId() } as never);
  });

  it('prevents self-approval, enforces role monetary approval thresholds, and blocks duplicate vendor bills', async () => {
    const expId = new mongoose.Types.ObjectId().toString();

    // Self-approval blocked even when actor holds finance.expenses.approve
    vi.spyOn(financeRepository, 'findExpenseById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(expId),
      expenseNumber: 'EXP-2026-01',
      amountMinor: 200000, // ₹2,000
      status: 'SUBMITTED',
      submittedBy: new mongoose.Types.ObjectId(managerActor.id),
      allowSelfApprovalPolicy: false,
    } as never);

    await expect(
      expenseVendor.decideExpenseApproval(
        expId,
        ORG_A,
        { decision: 'APPROVED', stage: 'FINAL_APPROVAL' },
        managerActor
      )
    ).rejects.toThrow(/Self-approval is prohibited/i);

    // Threshold enforcement: MANAGER limit is ₹50,000 (5,000,000 minor); ₹1,00,000 (10,000,000 minor) MUST be blocked
    expect(getApprovalThresholdMinorForRole('MANAGER')).toBe(5_000_000);
    vi.spyOn(financeRepository, 'findExpenseById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(expId),
      expenseNumber: 'EXP-2026-BIG',
      amountMinor: 10_000_000, // ₹1,00,000
      status: 'SUBMITTED',
      submittedBy: new mongoose.Types.ObjectId(staffActor.id),
    } as never);

    await expect(
      expenseVendor.decideExpenseApproval(
        expId,
        ORG_A,
        { decision: 'APPROVED', stage: 'FINAL_APPROVAL' },
        managerActor
      )
    ).rejects.toThrow(/exceeds approval threshold/i);

    // Duplicate vendor bill blocked
    const vendorId = new mongoose.Types.ObjectId().toString();
    vi.spyOn(financeRepository, 'findVendorById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(vendorId),
      name: 'MedSupply Ltd',
    } as never);
    vi.spyOn(financeRepository, 'findDuplicateVendorBill').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      billNumber: 'INV-900',
    } as never);

    await expect(
      expenseVendor.createVendorBill(
        vendorId,
        ORG_A,
        {
          billNumber: 'INV-900',
          billDate: '2026-11-10',
          dueDate: '2026-12-10',
          subtotalMinor: 500000,
          taxAmountMinor: 0,
          currency: 'INR',
          description: 'Medical kits',
        },
        accountantActor
      )
    ).rejects.toThrow(/Duplicate vendor bill/i);
  });

  it('parses bank CSV safely, detects duplicate rows, and never auto-marks unmatched rows reconciled', async () => {
    const csv = [
      'Date,Description,Reference,Debit,Credit,Balance',
      '2026-11-01,=CMD() Donation Settlement,UTR1001,0,50000,150000',
      '2026-11-01,=CMD() Donation Settlement,UTR1001,0,50000,150000',
      '2026-11-02,Vendor Payout,UTR1002,12500.50,0,137499.50',
    ].join('\n');

    const parsed = parseBankStatementCsv(csv, 'INR');
    expect(parsed).toHaveLength(3);
    // Formula prefix stripped
    expect(parsed[0].description.startsWith('=')).toBe(false);
    expect(parsed[0].creditMinor).toBe(5_000_000);
    expect(parsed[2].debitMinor).toBe(1_250_050);
    // Identical rows yield identical SHA-256 fingerprints
    expect(parsed[0].rowFingerprint).toBe(parsed[1].rowFingerprint);

    const bankId = new mongoose.Types.ObjectId().toString();
    vi.spyOn(financeRepository, 'findBankAccountById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(bankId),
      accountName: 'Main Ops',
      currency: 'INR',
    } as never);
    vi.spyOn(financeRepository, 'findExistingBankFingerprints').mockResolvedValue(new Set());
    let insertedRows: Array<{ reconciliationStatus: string }> = [];
    vi.spyOn(financeRepository, 'createBankTransactions').mockImplementation(async (rows) => {
      insertedRows = rows as never;
      return rows as never;
    });

    const imported = await expenseVendor.importBankStatementCsv(
      ORG_A,
      { bankAccountId: bankId, csvContent: csv },
      accountantActor
    );
    expect(imported.importedCount).toBe(2);
    expect(imported.duplicatesSkipped).toBe(1);
    expect(insertedRows.every((r) => r.reconciliationStatus === 'UNMATCHED')).toBe(true);
  });

  it('enforces restricted fund compliance, computes budget utilization, and evaluates compliance deadlines honestly', async () => {
    const progA = new mongoose.Types.ObjectId().toString();
    const progB = new mongoose.Types.ObjectId().toString();

    // Restricted fund allocated to wrong program -> BLOCKED
    expect(() =>
      assertRestrictedFundCompliance({
        restrictionType: 'RESTRICTED',
        permittedPurposes: ['Child Education'],
        permittedProgramId: progA,
        allocatedProgramId: progB,
        purpose: 'Child Education Scholarships',
      })
    ).toThrow(/Restricted fund violation/i);

    // Restricted fund allocated to unauthorized purpose -> BLOCKED
    expect(() =>
      assertRestrictedFundCompliance({
        restrictionType: 'RESTRICTED',
        permittedPurposes: ['Clean Water'],
        allocatedProgramId: progA,
        purpose: 'Office Furniture Purchase',
      })
    ).toThrow(/Restricted fund violation/i);

    // Budget utilization calculation
    const util = computeBudgetUtilization(1_000_000, 1_000_000, 900_000, 85);
    expect(util.remainingAmountMinor).toBe(100_000);
    expect(util.utilizationPercent).toBe(90);
    expect(util.isAlertTriggered).toBe(true);
    expect(util.isOverBudget).toBe(false);

    // Compliance deadline evaluation & verification separation
    const now = new Date('2026-11-19T00:00:00Z');
    const overdueEval = evaluateComplianceDeadline(
      {
        _id: new mongoose.Types.ObjectId(),
        complianceType: '80G',
        title: '80G Certificate',
        jurisdiction: 'India',
        validityStatus: 'DOCUMENT_RECORDED',
        expiryDate: new Date('2026-11-01T00:00:00Z'),
      } as never,
      now
    );
    expect(overdueEval.urgency).toBe('OVERDUE');
    expect(overdueEval.isIndependentlyVerified).toBe(false);

    // ADMIN lacking compliance.verify cannot mark compliance record INDEPENDENTLY_VERIFIED
    const recId = new mongoose.Types.ObjectId().toString();
    vi.spyOn(financeRepository, 'findComplianceRecordById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(recId),
      complianceType: '12A',
      title: '12A Registration',
      registrationNumber: 'AAATH1234E20261',
      validityStatus: 'DOCUMENT_RECORDED',
    } as never);

    await expect(
      budgetGrantCompliance.updateComplianceRecord(
        recId,
        ORG_A,
        { action: 'VERIFY', verificationNotes: 'Attempted without compliance.verify' },
        adminActor
      )
    ).rejects.toThrow(/compliance\.verify/i);
  });

  it('computes accurate Trial Balance, Income/Expense Statement, Balance Sheet, and blocks unauthorized CSV exports', async () => {
    const bankAcc = new mongoose.Types.ObjectId();
    const incomeAcc = new mongoose.Types.ObjectId();
    const expenseAcc = new mongoose.Types.ObjectId();
    const payableAcc = new mongoose.Types.ObjectId();

    const postedLines = [
      // Verified Donation received: DR Bank 500,000 / CR Donation Income 500,000
      { accountId: bankAcc, accountCodeSnapshot: '1020', accountNameSnapshot: 'Bank', accountTypeSnapshot: 'ASSET' as const, debitMinor: 500_000, creditMinor: 0 },
      { accountId: incomeAcc, accountCodeSnapshot: '4010', accountNameSnapshot: 'Donations', accountTypeSnapshot: 'INCOME' as const, debitMinor: 0, creditMinor: 500_000 },
      // Paid Program Expense: DR Expense 180,000 / CR Bank 180,000
      { accountId: expenseAcc, accountCodeSnapshot: '5010', accountNameSnapshot: 'Program Expense', accountTypeSnapshot: 'EXPENSE' as const, debitMinor: 180_000, creditMinor: 0 },
      { accountId: bankAcc, accountCodeSnapshot: '1020', accountNameSnapshot: 'Bank', accountTypeSnapshot: 'ASSET' as const, debitMinor: 0, creditMinor: 180_000 },
      // Accrued Vendor Bill: DR Expense 20,000 / CR Accounts Payable 20,000
      { accountId: expenseAcc, accountCodeSnapshot: '5010', accountNameSnapshot: 'Program Expense', accountTypeSnapshot: 'EXPENSE' as const, debitMinor: 20_000, creditMinor: 0 },
      { accountId: payableAcc, accountCodeSnapshot: '2010', accountNameSnapshot: 'Accounts Payable', accountTypeSnapshot: 'LIABILITY' as const, debitMinor: 0, creditMinor: 20_000 },
    ];

    const tb = computeTrialBalanceFromLines(postedLines);
    expect(tb.isBalanced).toBe(true);
    expect(tb.totalDebitMinor).toBe(520_000);
    expect(tb.totalCreditMinor).toBe(520_000);

    const ie = buildIncomeAndExpenseStatement(postedLines);
    expect(ie.totalIncomeMinor).toBe(500_000);
    expect(ie.totalExpenseMinor).toBe(200_000);
    expect(ie.netSurplusOrDeficitMinor).toBe(300_000);

    const bs = buildBalanceSheet(postedLines);
    expect(bs.totalAssetsMinor).toBe(320_000); // 500k - 180k Bank
    expect(bs.totalLiabilitiesMinor).toBe(20_000); // Accounts Payable
    expect(bs.totalEquityWithSurplusMinor).toBe(300_000); // Net Surplus
    expect(bs.isBalanced).toBe(true); // 320,000 === 20,000 + 300,000

    // Unauthorized CSV export denied to MANAGER
    await expect(
      reports.exportStatementCsv(ORG_A, 'TRIAL_BALANCE', managerActor)
    ).rejects.toThrow(/finance\.reports\.export/i);

    // Formula injection neutralization on CSV cells
    expect(escapeCsvCell('=HYPERLINK("http://evil")')).toBe('"\'=HYPERLINK(""http://evil"")"');

    // Authorized SUPER_ADMIN export succeeds
    vi.spyOn(financeRepository, 'findPostedLedgerLines').mockResolvedValue(postedLines as never);
    const csv = await reports.exportStatementCsv(ORG_A, 'TRIAL_BALANCE', superAdminActor);
    expect(csv).toContain('Account Code');
    expect(csv).toContain('1020');
  });

  it('validates financial document MIME types, enforces size caps, versions uploads, and generates signed download URLs', async () => {
    const entityId = new mongoose.Types.ObjectId().toString();

    // Disallowed executable MIME type rejected
    await expect(
      budgetGrantCompliance.registerFinancialDocument(
        ORG_A,
        {
          documentType: 'EXPENSE_INVOICE',
          title: 'Suspicious File',
          fileName: 'invoice.exe',
          mimeType: 'application/x-msdownload',
          sizeBytes: 1024,
          storageKey: 'finance/invoice.exe',
          linkedEntityType: 'EXPENSE',
          linkedEntityId: entityId,
        },
        accountantActor
      )
    ).rejects.toThrow(/Unsupported file MIME type/i);

    // Oversized file (> 15 MB) rejected
    await expect(
      budgetGrantCompliance.registerFinancialDocument(
        ORG_A,
        {
          documentType: 'AUDIT_REPORT',
          title: 'Huge PDF',
          fileName: 'audit.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 25 * 1024 * 1024,
          storageKey: 'finance/audit.pdf',
          linkedEntityType: 'COMPLIANCE_RECORD',
          linkedEntityId: entityId,
        },
        accountantActor
      )
    ).rejects.toThrow(/File size must be between/i);

    // Valid PDF versions cleanly and produces HMAC signed download URLs
    vi.spyOn(financeRepository, 'findFinancialDocuments').mockResolvedValue([
      {
        _id: new mongoose.Types.ObjectId(),
        documentType: 'EXPENSE_INVOICE',
        title: 'Vendor Invoice',
        fileName: 'inv-1.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 4096,
        storageKey: 'finance/inv-1.pdf',
        version: 1,
        isPrivate: true,
        createdAt: new Date(),
      },
    ] as never);

    let capturedVersion = 0;
    vi.spyOn(financeRepository, 'createFinancialDocument').mockImplementation(async (doc) => {
      capturedVersion = doc.version || 0;
      return { _id: new mongoose.Types.ObjectId(), ...doc } as never;
    });

    await budgetGrantCompliance.registerFinancialDocument(
      ORG_A,
      {
        documentType: 'EXPENSE_INVOICE',
        title: 'Vendor Invoice',
        fileName: 'inv-1-revised.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 4096,
        storageKey: 'finance/inv-1-revised.pdf',
        linkedEntityType: 'EXPENSE',
        linkedEntityId: entityId,
      },
      accountantActor
    );
    expect(capturedVersion).toBe(2);

    const signedList = await budgetGrantCompliance.listFinancialDocumentsWithSignedUrls(
      ORG_A,
      'EXPENSE',
      entityId
    );
    expect(signedList).toHaveLength(1);
    expect(signedList[0].signedDownloadUrl).toContain('sig=');
    expect(signedList[0].signedDownloadUrl).toContain('expires=');
  });
});
