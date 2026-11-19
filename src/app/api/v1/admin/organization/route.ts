import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/server/authorization/guards';
import { adminService, toAdminActor } from '@/server/services/admin.service';
import { updateOrganizationSchema } from '@/features/admin/schemas/admin.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

function serializeOrg(org: Awaited<ReturnType<typeof adminService.getOrganization>>) {
  return {
    id: org._id.toString(),
    name: org.name,
    legalName: org.legalName,
    slug: org.slug,
    customDomain: org.customDomain,
    logo: org.logo,
    description: org.description,
    website: org.website,
    contactEmail: org.contactEmail,
    contactPhone: org.contactPhone,
    headquartersAddress: org.headquartersAddress,
    status: org.status || (org.isActive ? 'ACTIVE' : 'INACTIVE'),
    verificationStatus: org.verificationStatus || 'unverified',
    verifiedAt: org.verifiedAt,
    identity: org.identity || {},
    statutory: org.statutory || { taxExemptionPercentage: 50 },
    regional: org.regional || {
      country: 'India',
      state: '',
      district: '',
      timezone: 'Asia/Kolkata',
      currencyCode: org.settings?.currencyCode || 'INR',
      currencySymbol: org.settings?.currencySymbol || '₹',
      dateFormat: 'DD/MM/YYYY',
      language: org.settings?.defaultLocale || 'en',
    },
    securitySettings: org.securitySettings || {
      sessionTimeoutMinutes: 10080,
      minPasswordLength: 8,
      requireStrongPassword: true,
      maxFailedLoginAttempts: 5,
      invitationExpiryDays: 7,
      twoFactorPolicy: 'recommended',
    },
    notificationSettings: org.notificationSettings || {
      emailNotifications: true,
      adminAlerts: true,
      invitationNotifications: true,
    },
    settings: org.settings,
    isActive: org.isActive,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
  };
}

export async function GET(req: NextRequest) {
  try {
    const authContext = await requirePermission(req, 'users.view');
    const orgId = authContext.user.organizationId.toString();

    const org = await adminService.getOrganization(orgId);

    return NextResponse.json(successResponse(serializeOrg(org), undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authContext = await requirePermission(req, 'settings.manage');
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const rawBody = await req.json();
    const validated = updateOrganizationSchema.parse(rawBody);

    const updated = await adminService.updateOrganization(orgId, validated, actor);

    return NextResponse.json(successResponse(serializeOrg(updated), undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
