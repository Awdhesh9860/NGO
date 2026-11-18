import { NextRequest, NextResponse } from 'next/server';
import { requireAuthentication } from '@/server/authorization/guards';
import { disable2FASchema } from '@/features/authentication/schemas/auth.schema';
import { authService } from '@/server/services/auth.service';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function POST(req: NextRequest) {
  try {
    const authContext = await requireAuthentication(req);
    const rawBody = await req.json();
    const validated = disable2FASchema.parse(rawBody);

    await authService.disable2FA(authContext.user._id.toString(), validated.password);

    return NextResponse.json(
      successResponse({ message: 'Two-factor authentication has been disabled' }),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
