import { NextRequest, NextResponse } from 'next/server';
import { campaignService } from '@/server/services/campaign.service';
import { resolveTenant } from '@/server/tenant/tenant-resolver';
import { NotFoundError } from '@/lib/error-handler';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

/**
 * Public campaign detail by slug or ID.
 * Returns only verified raised figures, public updates, and anonymous-safe recent supporter display names.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const tenant = await resolveTenant(req).catch(() => null);
    const { slug } = await context.params;

    const detail = await campaignService.getPublicCampaignBySlug(slug, tenant?._id?.toString());
    if (!detail) {
      throw new NotFoundError('Public fundraising campaign not found');
    }

    return NextResponse.json(successResponse(detail, undefined, tenant?._id?.toString()), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
