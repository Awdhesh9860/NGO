import { NextRequest, NextResponse } from 'next/server';
import { programService } from '@/server/services/program.service';
import { resolveTenant } from '@/server/tenant/tenant-resolver';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError, NotFoundError } from '@/server/errors';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const tenant = await resolveTenant(req).catch(() => null);
    const data = await programService.getPublicProgramBySlug(slug, tenant?._id?.toString());
    if (!data) {
      throw new NotFoundError('Published program not found');
    }
    return NextResponse.json(successResponse(data, undefined, tenant?._id?.toString()), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
