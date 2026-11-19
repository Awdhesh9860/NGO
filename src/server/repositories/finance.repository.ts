import mongoose from 'mongoose';
import connectToDatabase from '@/server/database/connection';
import { ChartOfAccount, IChartOfAccountDocument, AccountType } from '@/server/database/models/ChartOfAccount';
import { AccountingPeriod, IAccountingPeriodDocument } from '@/server/database/models/AccountingPeriod';
import { JournalEntry, IJournalEntryDocument, JournalEntryStatus } from '@/server/database/models/JournalEntry';
import { JournalLine, IJournalLineDocument } from '@/server/database/models/JournalLine';
import { Expense, IExpenseDocument, ExpenseStatus } from '@/server/database/models/Expense';
import { ExpenseApproval, IExpenseApprovalDocument } from '@/server/database/models/ExpenseApproval';
import { Vendor, IVendorDocument } from '@/server/database/models/Vendor';
import { VendorBill, IVendorBillDocument } from '@/server/database/models/VendorBill';
import { BankAccount, IBankAccountDocument } from '@/server/database/models/BankAccount';
import { BankTransaction, IBankTransactionDocument } from '@/server/database/models/BankTransaction';
import { BankReconciliation, IBankReconciliationDocument } from '@/server/database/models/BankReconciliation';
import { Budget, IBudgetDocument, BudgetLevel } from '@/server/database/models/Budget';
import { FundAllocation, IFundAllocationDocument } from '@/server/database/models/FundAllocation';
import { Grant, IGrantDocument, GrantStatus } from '@/server/database/models/Grant';
import { ComplianceRecord, IComplianceRecordDocument } from '@/server/database/models/ComplianceRecord';
import { FinancialDocument, IFinancialDocumentRecord } from '@/server/database/models/FinancialDocument';

export class FinanceRepository {
  // ======================== CHART OF ACCOUNTS ========================

  async findAccounts(organizationId: string, filters?: { accountType?: AccountType; includeInactive?: boolean }) {
    await connectToDatabase();
    const q: Record<string, unknown> = { organizationId: new mongoose.Types.ObjectId(organizationId) };
    if (filters?.accountType) q.accountType = filters.accountType;
    if (!filters?.includeInactive) q.isActive = true;
    return ChartOfAccount.find(q).sort({ code: 1 });
  }

  async findAccountById(id: string, organizationId: string) {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return ChartOfAccount.findOne({ _id: id, organizationId });
  }

  async findAccountByCode(code: string, organizationId: string) {
    await connectToDatabase();
    return ChartOfAccount.findOne({ organizationId, code: code.toUpperCase() });
  }

  async createAccount(data: Partial<IChartOfAccountDocument>) {
    await connectToDatabase();
    return ChartOfAccount.create(data);
  }

  async updateAccount(id: string, organizationId: string, update: Record<string, unknown>) {
    await connectToDatabase();
    return ChartOfAccount.findOneAndUpdate({ _id: id, organizationId }, update, { new: true });
  }

  async countPostedLinesForAccount(accountId: string, organizationId: string): Promise<number> {
    await connectToDatabase();
    return JournalLine.countDocuments({ organizationId, accountId, isPosted: true });
  }

  async deleteAccount(id: string, organizationId: string) {
    await connectToDatabase();
    return ChartOfAccount.findOneAndDelete({ _id: id, organizationId });
  }

  // ======================== ACCOUNTING PERIODS ========================

  async findPeriods(organizationId: string) {
    await connectToDatabase();
    return AccountingPeriod.find({ organizationId }).sort({ startDate: -1 });
  }

  async findPeriodById(id: string, organizationId: string) {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return AccountingPeriod.findOne({ _id: id, organizationId });
  }

  async findPeriodCoveringDate(organizationId: string, date: Date) {
    await connectToDatabase();
    return AccountingPeriod.findOne({
      organizationId,
      startDate: { $lte: date },
      endDate: { $gte: date },
    });
  }

  async createPeriod(data: Partial<IAccountingPeriodDocument>) {
    await connectToDatabase();
    return AccountingPeriod.create(data);
  }

  async updatePeriod(id: string, organizationId: string, update: Record<string, unknown>) {
    await connectToDatabase();
    return AccountingPeriod.findOneAndUpdate({ _id: id, organizationId }, update, { new: true });
  }

  // ======================== JOURNALS & GENERAL LEDGER ========================

  async findJournals(
    organizationId: string,
    filters: { status?: JournalEntryStatus; periodId?: string; referenceType?: string; from?: Date; to?: Date },
    pagination: { page: number; limit: number }
  ) {
    await connectToDatabase();
    const q: Record<string, unknown> = { organizationId };
    if (filters.status) q.status = filters.status;
    if (filters.periodId && mongoose.Types.ObjectId.isValid(filters.periodId)) q.periodId = filters.periodId;
    if (filters.referenceType) q.referenceType = filters.referenceType;
    if (filters.from || filters.to) {
      q.transactionDate = {
        ...(filters.from ? { $gte: filters.from } : {}),
        ...(filters.to ? { $lte: filters.to } : {}),
      };
    }
    const skip = (pagination.page - 1) * pagination.limit;
    const [items, total] = await Promise.all([
      JournalEntry.find(q).sort({ transactionDate: -1, createdAt: -1 }).skip(skip).limit(pagination.limit),
      JournalEntry.countDocuments(q),
    ]);
    return { items, total };
  }

  async findJournalById(id: string, organizationId: string) {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return JournalEntry.findOne({ _id: id, organizationId });
  }

  async findJournalByIdempotencyKey(organizationId: string, idempotencyKey: string) {
    await connectToDatabase();
    return JournalEntry.findOne({ organizationId, idempotencyKey });
  }

  async createJournalEntry(data: Partial<IJournalEntryDocument>, session?: mongoose.ClientSession | null) {
    await connectToDatabase();
    if (session) {
      const [doc] = await JournalEntry.create([data], { session });
      return doc;
    }
    return JournalEntry.create(data);
  }

  async updateJournalEntry(
    id: string,
    organizationId: string,
    update: Record<string, unknown>,
    session?: mongoose.ClientSession | null
  ) {
    await connectToDatabase();
    return JournalEntry.findOneAndUpdate({ _id: id, organizationId }, update, {
      new: true,
      session: session || undefined,
    });
  }

  async createJournalLines(lines: Array<Partial<IJournalLineDocument>>, session?: mongoose.ClientSession | null) {
    await connectToDatabase();
    if (session) {
      return JournalLine.insertMany(lines, { session });
    }
    return JournalLine.insertMany(lines);
  }

  async findLinesByJournalId(journalEntryId: string, organizationId: string) {
    await connectToDatabase();
    return JournalLine.find({ organizationId, journalEntryId }).sort({ _id: 1 });
  }

  async markLinesPosted(journalEntryId: string, organizationId: string, session?: mongoose.ClientSession | null) {
    await connectToDatabase();
    return JournalLine.updateMany(
      { organizationId, journalEntryId },
      { $set: { isPosted: true } },
      { session: session || undefined }
    );
  }

  async findPostedLedgerLines(
    organizationId: string,
    filters: {
      accountId?: string;
      accountType?: AccountType;
      periodId?: string;
      programId?: string;
      projectId?: string;
      departmentId?: string;
      grantId?: string;
      fundAllocationId?: string;
      from?: Date;
      to?: Date;
    },
    limit = 500
  ) {
    await connectToDatabase();
    const q: Record<string, unknown> = { organizationId, isPosted: true };
    if (filters.accountId && mongoose.Types.ObjectId.isValid(filters.accountId)) q.accountId = filters.accountId;
    if (filters.accountType) q.accountTypeSnapshot = filters.accountType;
    if (filters.periodId && mongoose.Types.ObjectId.isValid(filters.periodId)) q.periodId = filters.periodId;
    if (filters.programId && mongoose.Types.ObjectId.isValid(filters.programId)) q.programId = filters.programId;
    if (filters.projectId && mongoose.Types.ObjectId.isValid(filters.projectId)) q.projectId = filters.projectId;
    if (filters.departmentId && mongoose.Types.ObjectId.isValid(filters.departmentId)) q.departmentId = filters.departmentId;
    if (filters.grantId && mongoose.Types.ObjectId.isValid(filters.grantId)) q.grantId = filters.grantId;
    if (filters.fundAllocationId && mongoose.Types.ObjectId.isValid(filters.fundAllocationId)) {
      q.fundAllocationId = filters.fundAllocationId;
    }
    if (filters.from || filters.to) {
      q.transactionDate = {
        ...(filters.from ? { $gte: filters.from } : {}),
        ...(filters.to ? { $lte: filters.to } : {}),
      };
    }
    return JournalLine.find(q).sort({ transactionDate: 1, createdAt: 1 }).limit(limit);
  }

  // ======================== EXPENSES & APPROVALS ========================

  async findExpenses(
    organizationId: string,
    filters: { status?: ExpenseStatus; category?: string; projectId?: string; departmentId?: string; submittedBy?: string },
    pagination: { page: number; limit: number }
  ) {
    await connectToDatabase();
    const q: Record<string, unknown> = { organizationId };
    if (filters.status) q.status = filters.status;
    if (filters.category) q.category = filters.category;
    if (filters.projectId && mongoose.Types.ObjectId.isValid(filters.projectId)) q.projectId = filters.projectId;
    if (filters.departmentId && mongoose.Types.ObjectId.isValid(filters.departmentId)) q.departmentId = filters.departmentId;
    if (filters.submittedBy && mongoose.Types.ObjectId.isValid(filters.submittedBy)) q.submittedBy = filters.submittedBy;

    const skip = (pagination.page - 1) * pagination.limit;
    const [items, total] = await Promise.all([
      Expense.find(q).sort({ expenseDate: -1, createdAt: -1 }).skip(skip).limit(pagination.limit),
      Expense.countDocuments(q),
    ]);
    return { items, total };
  }

  async findExpenseById(id: string, organizationId: string) {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Expense.findOne({ _id: id, organizationId });
  }

  async createExpense(data: Partial<IExpenseDocument>) {
    await connectToDatabase();
    return Expense.create(data);
  }

  async updateExpense(id: string, organizationId: string, update: Record<string, unknown>) {
    await connectToDatabase();
    return Expense.findOneAndUpdate({ _id: id, organizationId }, update, { new: true });
  }

  async createExpenseApproval(data: Partial<IExpenseApprovalDocument>) {
    await connectToDatabase();
    return ExpenseApproval.create(data);
  }

  async findExpenseApprovals(expenseId: string, organizationId: string) {
    await connectToDatabase();
    return ExpenseApproval.find({ organizationId, expenseId }).sort({ decidedAt: -1 });
  }

  // ======================== VENDORS & BILLS ========================

  async findVendors(organizationId: string, status?: string) {
    await connectToDatabase();
    const q: Record<string, unknown> = { organizationId };
    if (status) q.status = status;
    return Vendor.find(q).sort({ name: 1 });
  }

  async findVendorById(id: string, organizationId: string) {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Vendor.findOne({ _id: id, organizationId });
  }

  async createVendor(data: Partial<IVendorDocument>) {
    await connectToDatabase();
    return Vendor.create(data);
  }

  async updateVendor(id: string, organizationId: string, update: Record<string, unknown>) {
    await connectToDatabase();
    return Vendor.findOneAndUpdate({ _id: id, organizationId }, update, { new: true });
  }

  async findVendorBills(organizationId: string, vendorId?: string) {
    await connectToDatabase();
    const q: Record<string, unknown> = { organizationId };
    if (vendorId && mongoose.Types.ObjectId.isValid(vendorId)) q.vendorId = vendorId;
    return VendorBill.find(q).sort({ dueDate: 1, createdAt: -1 });
  }

  async findDuplicateVendorBill(organizationId: string, vendorId: string, billNumber: string) {
    await connectToDatabase();
    return VendorBill.findOne({
      organizationId,
      vendorId,
      billNumber: billNumber.toUpperCase().trim(),
    });
  }

  async createVendorBill(data: Partial<IVendorBillDocument>) {
    await connectToDatabase();
    return VendorBill.create(data);
  }

  // ======================== BANK ACCOUNTS & RECONCILIATION ========================

  async findBankAccounts(organizationId: string) {
    await connectToDatabase();
    return BankAccount.find({ organizationId }).sort({ accountName: 1 });
  }

  async findBankAccountById(id: string, organizationId: string) {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return BankAccount.findOne({ _id: id, organizationId });
  }

  async createBankAccount(data: Partial<IBankAccountDocument>) {
    await connectToDatabase();
    return BankAccount.create(data);
  }

  async updateBankAccount(id: string, organizationId: string, update: Record<string, unknown>) {
    await connectToDatabase();
    return BankAccount.findOneAndUpdate({ _id: id, organizationId }, update, { new: true });
  }

  async findBankTransactions(organizationId: string, bankAccountId?: string, status?: string) {
    await connectToDatabase();
    const q: Record<string, unknown> = { organizationId };
    if (bankAccountId && mongoose.Types.ObjectId.isValid(bankAccountId)) q.bankAccountId = bankAccountId;
    if (status) q.reconciliationStatus = status;
    return BankTransaction.find(q).sort({ transactionDate: -1, createdAt: -1 }).limit(500);
  }

  async findBankTransactionById(id: string, organizationId: string) {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return BankTransaction.findOne({ _id: id, organizationId });
  }

  async findExistingBankFingerprints(organizationId: string, bankAccountId: string, fingerprints: string[]) {
    await connectToDatabase();
    const docs = await BankTransaction.find(
      { organizationId, bankAccountId, rowFingerprint: { $in: fingerprints } },
      { rowFingerprint: 1 }
    );
    return new Set(docs.map((d) => d.rowFingerprint));
  }

  async createBankTransactions(rows: Array<Partial<IBankTransactionDocument>>) {
    await connectToDatabase();
    return BankTransaction.insertMany(rows, { ordered: false });
  }

  async updateBankTransaction(id: string, organizationId: string, update: Record<string, unknown>) {
    await connectToDatabase();
    return BankTransaction.findOneAndUpdate({ _id: id, organizationId }, update, { new: true });
  }

  async createBankReconciliation(data: Partial<IBankReconciliationDocument>) {
    await connectToDatabase();
    return BankReconciliation.create(data);
  }

  async findBankReconciliations(organizationId: string, bankAccountId?: string) {
    await connectToDatabase();
    const q: Record<string, unknown> = { organizationId };
    if (bankAccountId && mongoose.Types.ObjectId.isValid(bankAccountId)) q.bankAccountId = bankAccountId;
    return BankReconciliation.find(q).sort({ reconciledAt: -1 }).limit(50);
  }

  // ======================== BUDGETS, FUNDS & GRANTS ========================

  async findBudgets(organizationId: string, filters?: { financialYear?: string; level?: BudgetLevel; projectId?: string }) {
    await connectToDatabase();
    const q: Record<string, unknown> = { organizationId };
    if (filters?.financialYear) q.financialYear = filters.financialYear;
    if (filters?.level) q.level = filters.level;
    if (filters?.projectId && mongoose.Types.ObjectId.isValid(filters.projectId)) q.projectId = filters.projectId;
    return Budget.find(q).sort({ financialYear: -1, level: 1, createdAt: -1 });
  }

  async findBudgetById(id: string, organizationId: string) {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Budget.findOne({ _id: id, organizationId });
  }

  async createBudget(data: Partial<IBudgetDocument>) {
    await connectToDatabase();
    return Budget.create(data);
  }

  async updateBudget(id: string, organizationId: string, update: Record<string, unknown>) {
    await connectToDatabase();
    return Budget.findOneAndUpdate({ _id: id, organizationId }, update, { new: true });
  }

  async findFundAllocations(organizationId: string, restrictionType?: string) {
    await connectToDatabase();
    const q: Record<string, unknown> = { organizationId };
    if (restrictionType) q.restrictionType = restrictionType;
    return FundAllocation.find(q).sort({ allocatedDate: -1 });
  }

  async findFundAllocationById(id: string, organizationId: string) {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return FundAllocation.findOne({ _id: id, organizationId });
  }

  async createFundAllocation(data: Partial<IFundAllocationDocument>) {
    await connectToDatabase();
    return FundAllocation.create(data);
  }

  async updateFundAllocation(id: string, organizationId: string, update: Record<string, unknown>) {
    await connectToDatabase();
    return FundAllocation.findOneAndUpdate({ _id: id, organizationId }, update, { new: true });
  }

  async findGrants(organizationId: string, status?: GrantStatus) {
    await connectToDatabase();
    const q: Record<string, unknown> = { organizationId };
    if (status) q.status = status;
    return Grant.find(q).sort({ createdAt: -1 });
  }

  async findGrantById(id: string, organizationId: string) {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Grant.findOne({ _id: id, organizationId });
  }

  async createGrant(data: Partial<IGrantDocument>) {
    await connectToDatabase();
    return Grant.create(data);
  }

  async updateGrant(id: string, organizationId: string, update: Record<string, unknown>) {
    await connectToDatabase();
    return Grant.findOneAndUpdate({ _id: id, organizationId }, update, { new: true });
  }

  // ======================== COMPLIANCE & FINANCIAL DOCUMENTS ========================

  async findComplianceRecords(organizationId: string, filters?: { complianceType?: string; validityStatus?: string }) {
    await connectToDatabase();
    const q: Record<string, unknown> = { organizationId };
    if (filters?.complianceType) q.complianceType = filters.complianceType;
    if (filters?.validityStatus) q.validityStatus = filters.validityStatus;
    return ComplianceRecord.find(q).sort({ expiryDate: 1, filingDeadline: 1, createdAt: -1 });
  }

  async findComplianceRecordById(id: string, organizationId: string) {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return ComplianceRecord.findOne({ _id: id, organizationId });
  }

  async createComplianceRecord(data: Partial<IComplianceRecordDocument>) {
    await connectToDatabase();
    return ComplianceRecord.create(data);
  }

  async updateComplianceRecord(id: string, organizationId: string, update: Record<string, unknown>) {
    await connectToDatabase();
    return ComplianceRecord.findOneAndUpdate({ _id: id, organizationId }, update, { new: true });
  }

  async createFinancialDocument(data: Partial<IFinancialDocumentRecord>) {
    await connectToDatabase();
    return FinancialDocument.create(data);
  }

  async findFinancialDocuments(
    organizationId: string,
    linkedEntityType: IFinancialDocumentRecord['linkedEntityType'],
    linkedEntityId: string
  ) {
    await connectToDatabase();
    return FinancialDocument.find({ organizationId, linkedEntityType, linkedEntityId }).sort({ createdAt: -1 });
  }
}

export const financeRepository = new FinanceRepository();
