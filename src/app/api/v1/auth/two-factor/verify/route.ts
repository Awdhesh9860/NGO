import { NextRequest, NextResponse } from 'next/server';
import { requireAuthentication } from '@/server/authorization/guards';
import { verify2FASchema } from '@/features/authentication/schemas/auth.schema';
import { authService } from '@/server/services/auth.service';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError, ValidationError } from '@/server/errors';

export async function POST(req: NextRequest) {
  try {
    const authContext = await requireAuthentication(req);
    const rawBody = await req.json();
    const validated = verify2FASchema.parse(rawBody);

    if (!validated.secret) {
      throw new ValidationError('Setup secret is required to verify and activate 2FA');
    }

    const { backupCodes } = await authService.confirm2FA(
      authContext.user._id.toString(),
      validated.secret,
      validated.code
    );

    return NextResponse.json(
      successResponse({
        message: 'Two-factor authentication has been successfully activated',
        backupCodes,
      }),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
