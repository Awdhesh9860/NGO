import { NextRequest, NextResponse } from 'next/server';
import { campaignService } from '@/server/services/campaign.service';
import { resolveTenant } from '@/server/tenant/tenant-resolver';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

/**
 * Public read-only fundraising campaigns listing.
 * Returns ONLY approved/active/completed publicly visible campaigns with verified net totals.
 * Internal notes, drafts, pending approvals, and donor PII are strictly excluded.
 */
export async function GET(req: NextRequest) {
  try {
    const tenant = await resolveTenant(req).catch(() => null);
    const sp = req.nextUrl.searchParams;
    const category = sp.get('category') || undefined;
    const status = sp.get('status') || undefined;
    const search = sp.get('search') || undefined;

    const campaigns = await campaignService.listPublicCampaigns(tenant?._id?.toString(), {
      category,
      status,
      search,
    });

    return NextResponse.json(successResponse(campaigns, undefined, tenant?._id?.toString()), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
