import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { Organization, IOrganizationDocument } from '@/server/database/models/Organization';
import connectToDatabase from '@/server/database/connection';

const DEFAULT_ORGANIZATION_SLUG = 'hopehorizon';

/**
 * Resolve the active organization context for the incoming request
 */
export async function resolveTenant(
  req: NextRequest,
  authenticatedOrgId?: string
): Promise<IOrganizationDocument | null> {
  await connectToDatabase();

  // 1. If an authenticated organization ID is provided, trust it explicitly
  if (authenticatedOrgId && mongoose.Types.ObjectId.isValid(authenticatedOrgId)) {
    const org = await Organization.findById(authenticatedOrgId);
    if (org && org.isActive) return org;
  }

  // 2. Check for tenant headers (useful for internal or partner API calls)
  const headerOrgId = req.headers.get('x-organization-id');
  if (headerOrgId && mongoose.Types.ObjectId.isValid(headerOrgId)) {
    const org = await Organization.findById(headerOrgId);
    if (org && org.isActive) return org;
  }

  const headerSlug = req.headers.get('x-organization-slug');
  if (headerSlug) {
    const org = await Organization.findOne({ slug: headerSlug.toLowerCase(), isActive: true });
    if (org) return org;
  }

  // 3. Resolve by hostname / custom domain
  const host = req.headers.get('host')?.split(':')[0]?.toLowerCase();
  if (host && !['localhost', '127.0.0.1'].includes(host)) {
    const orgByDomain = await Organization.findOne({
      $or: [{ customDomain: host }, { slug: host }],
      isActive: true,
    });
    if (orgByDomain) return orgByDomain;
  }

  // 4. Fallback to default organization
  let defaultOrg = await Organization.findOne({ slug: DEFAULT_ORGANIZATION_SLUG });
  if (!defaultOrg) {
    // If not found, attempt to find any active organization or create the seed organization
    defaultOrg = await Organization.findOne({ isActive: true });
    if (!defaultOrg) {
      defaultOrg = await Organization.create({
        name: 'HopeHorizon Foundation',
        slug: DEFAULT_ORGANIZATION_SLUG,
        contactEmail: 'contact@hopehorizon.org',
        statutory: {
          taxExemptionPercentage: 50,
        },
        settings: {
          currencyCode: 'INR',
          currencySymbol: '₹',
          defaultLocale: 'en',
          autoSendReceipts: true,
          maintenanceMode: false,
        },
        isActive: true,
      });
    }
  }

  return defaultOrg;
}
