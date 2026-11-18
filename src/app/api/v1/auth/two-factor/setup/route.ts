import { NextRequest, NextResponse } from 'next/server';
import { requireAuthentication } from '@/server/authorization/guards';
import { authService } from '@/server/services/auth.service';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function POST(req: NextRequest) {
  try {
    const authContext = await requireAuthentication(req);
    const { secret, otpauthUrl } = await authService.setup2FA(authContext.user._id.toString());

    return NextResponse.json(
      successResponse({
        secret,
        otpauthUrl,
      }),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
