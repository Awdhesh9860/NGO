import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { volunteerService } from '@/server/services/volunteer.service';
import { membershipService } from '@/server/services/membership.service';
import { beneficiaryService } from '@/server/services/beneficiary.service';
import { checkRolePermission } from '@/server/authorization/permissions';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

/**
 * Role-authorized, aggregated Stakeholder Analytics endpoint.
 * Strictly returns anonymized aggregate counts — NEVER individual beneficiary PII.
 */
export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, [
      'volunteers.view',
      'members.view',
      'beneficiaries.view',
      'privacy.reports.view',
    ]);
    const orgId = authContext.user.organizationId.toString();
    const role = authContext.user.role;
    const isSuper = role === 'SUPER_ADMIN';

    const canVol = isSuper || checkRolePermission(role, 'volunteers.view');
    const canMem = isSuper || checkRolePermission(role, 'members.view');
    const canBen =
      isSuper ||
      checkRolePermission(role, 'beneficiaries.view') ||
      checkRolePermission(role, 'privacy.reports.view');

    const [volunteers, membership, beneficiaries] = await Promise.all([
      canVol ? volunteerService.getVolunteerAnalytics(orgId) : Promise.resolve(null),
      canMem ? membershipService.getMembershipAnalytics(orgId) : Promise.resolve(null),
      canBen ? beneficiaryService.getBeneficiaryAnalytics(orgId) : Promise.resolve(null),
    ]);

    return NextResponse.json(
      successResponse({ volunteers, membership, beneficiaries }, undefined, orgId),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
