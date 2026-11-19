import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { campaignService } from '@/server/services/campaign.service';
import { toAdminActor } from '@/server/services/admin.service';
import { createCampaignSchema } from '@/features/campaigns/schemas/campaign.schema';
import { CampaignStatus } from '@/server/database/models/Campaign';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, ['campaigns.view', 'campaigns.create', 'campaigns.update']);
    const orgId = authContext.user.organizationId.toString();

    const sp = req.nextUrl.searchParams;
    const page = parseInt(sp.get('page') || '1', 10);
    const limit = parseInt(sp.get('limit') || '20', 10);
    const status = (sp.get('status') as CampaignStatus) || undefined;
    const category = sp.get('category') || undefined;
    const programId = sp.get('programId') || undefined;
    const projectId = sp.get('projectId') || undefined;
    const search = sp.get('search') || undefined;
    const includeArchived = sp.get('includeArchived') === 'true';

    const result = await campaignService.listCampaigns(
      orgId,
      { status, category, programId, projectId, search, includeArchived },
      { page, limit }
    );

    const data = result.campaigns.map((item) => ({
      id: item.campaign._id.toString(),
      title: item.campaign.title,
      slug: item.campaign.slug,
      code: item.campaign.code,
      shortSummary: item.campaign.shortSummary,
      category: item.campaign.category,
      coverImage: item.campaign.coverImage,
      targetAmountMinor: item.campaign.targetAmountMinor,
      raisedAmountMinor: item.raisedAmountMinor,
      grossAmountMinor: item.grossAmountMinor,
      refundedAmountMinor: item.refundedAmountMinor,
      progressPercentage: item.progressPercentage,
      donorCount: item.donorCount,
      donationCount: item.donationCount,
      minimumDonationMinor: item.campaign.minimumDonationMinor,
      currency: item.campaign.currency,
      startDate: item.campaign.startDate,
      endDate: item.campaign.endDate,
      program: item.campaign.programId,
      project: item.campaign.projectId,
      campaignManager: item.campaign.campaignManagerId,
      status: item.campaign.status,
      isPublicVisible: item.campaign.isPublicVisible,
      isFeatured: item.campaign.isFeatured,
      createdAt: item.campaign.createdAt,
      updatedAt: item.campaign.updatedAt,
    }));

    return NextResponse.json(
      successResponse(
        data,
        {
          page: result.page,
          pageSize: result.limit,
          totalCount: result.total,
          totalPages: result.totalPages,
          hasNextPage: result.page < result.totalPages,
          hasPrevPage: result.page > 1,
        },
        orgId
      ),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authContext = await requireAnyPermission(req, ['campaigns.create']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);

    const body = await req.json();
    const validated = createCampaignSchema.parse(body);
    const created = await campaignService.createCampaign(orgId, validated, actor);

    return NextResponse.json(
      successResponse(
        {
          id: created._id.toString(),
          title: created.title,
          slug: created.slug,
          code: created.code,
          status: created.status,
          targetAmountMinor: created.targetAmountMinor,
          currency: created.currency,
          isPublicVisible: created.isPublicVisible,
          createdAt: created.createdAt,
        },
        undefined,
        orgId
      ),
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
