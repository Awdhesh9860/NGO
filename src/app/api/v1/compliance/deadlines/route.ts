import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { budgetGrantComplianceService } from '@/server/services/budget-grant-compliance.service';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, [
      'compliance.view',
      'compliance.manage',
      'compliance.verify',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const deadlines = await budgetGrantComplianceService.getComplianceDeadlines(orgId);
    return NextResponse.json(successResponse(deadlines, undefined, orgId), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}
