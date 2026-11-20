import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAnyPermission } from '@/server/authorization/guards';
import { budgetGrantComplianceService } from '@/server/services/budget-grant-compliance.service';
import { toAdminActor } from '@/server/services/admin.service';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';
import { ValidationError } from '@/lib/error-handler';

const linkedEntityTypeEnum = z.enum([
  'EXPENSE',
  'VENDOR',
  'VENDOR_BILL',
  'BANK_ACCOUNT',
  'GRANT',
  'COMPLIANCE_RECORD',
  'JOURNAL_ENTRY',
]);

const registerDocumentSchema = z.object({
  documentType: z.enum([
    'EXPENSE_INVOICE',
    'VENDOR_BILL',
    'PAYMENT_PROOF',
    'BANK_STATEMENT',
    'GRANT_AGREEMENT',
    'AUDIT_REPORT',
    'FINANCIAL_STATEMENT',
    'COMPLIANCE_CERTIFICATE',
    'VOUCHER',
  ]),
  title: z.string().trim().min(2).max(160),
  fileName: z.string().trim().min(2).max(200),
  mimeType: z.string().trim().min(3).max(120),
  sizeBytes: z.number().int().positive(),
  storageKey: z.string().trim().min(3).max(300),
  linkedEntityType: linkedEntityTypeEnum,
  linkedEntityId: z.string().trim().min(2).max(120),
});

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, [
      'finance.expenses.view',
      'finance.vendors.view',
      'finance.grants.view',
      'finance.reports.view',
      'compliance.view',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const sp = req.nextUrl.searchParams;
    const rawEntityType = sp.get('linkedEntityType');
    const linkedEntityId = sp.get('linkedEntityId');

    if (!rawEntityType || !linkedEntityId) {
      throw new ValidationError('linkedEntityType and linkedEntityId query parameters are required');
    }
    const entityType = linkedEntityTypeEnum.parse(rawEntityType);
    const docs = await budgetGrantComplianceService.listFinancialDocumentsWithSignedUrls(
      orgId,
      entityType,
      linkedEntityId
    );
    return NextResponse.json(successResponse(docs, undefined, orgId), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, [
      'finance.expenses.create',
      'finance.vendors.manage',
      'finance.grants.manage',
      'finance.reconciliation.manage',
      'compliance.manage',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const body = await req.json();
    const input = registerDocumentSchema.parse(body);

    const created = await budgetGrantComplianceService.registerFinancialDocument(orgId, input, actor);
    return NextResponse.json(successResponse(created, undefined, orgId), { status: HTTP_STATUS.CREATED });
  } catch (error) {
    return handleRouteError(error);
  }
}
