import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { campaignService } from '@/server/services/campaign.service';
import { toAdminActor } from '@/server/services/admin.service';
import { updateCampaignSchema } from '@/features/campaigns/schemas/campaign.schema';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireAnyPermission(req, ['campaigns.view', 'campaigns.update']);
    const orgId = authContext.user.organizationId.toString();
    const { id } = await context.params;

    const detail = await campaignService.getCampaignDetail(id, orgId);
    return NextResponse.json(successResponse(detail, undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireAnyPermission(req, ['campaigns.update', 'campaigns.publish']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const { id } = await context.params;

    const body = await req.json();
    const validated = updateCampaignSchema.parse(body);
    const updated = await campaignService.updateCampaign(id, orgId, validated, actor);

    return NextResponse.json(successResponse(updated, undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireAnyPermission(req, ['campaigns.archive']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const { id } = await context.params;

    const archived = await campaignService.archiveCampaign(id, orgId, actor);
    return NextResponse.json(successResponse(archived, undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
