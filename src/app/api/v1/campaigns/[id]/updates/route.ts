import { NextRequest, NextResponse } from 'next/server';
import { requireAnyPermission } from '@/server/authorization/guards';
import { campaignService } from '@/server/services/campaign.service';
import { toAdminActor } from '@/server/services/admin.service';
import { createCampaignUpdateSchema } from '@/features/campaigns/schemas/campaign.schema';
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

    const updates = await campaignService.listCampaignUpdates(id, orgId);
    return NextResponse.json(successResponse(updates, undefined, orgId), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireAnyPermission(req, ['campaigns.update', 'campaigns.publish']);
    const orgId = authContext.user.organizationId.toString();
    const actor = toAdminActor(authContext.user, req);
    const { id } = await context.params;

    const body = await req.json();
    const validated = createCampaignUpdateSchema.parse(body);
    const created = await campaignService.addCampaignUpdate(id, orgId, validated, actor);

    return NextResponse.json(successResponse(created, undefined, orgId), {
      status: HTTP_STATUS.CREATED,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
