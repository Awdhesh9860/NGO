import { NextRequest, NextResponse } from 'next/server';
import { requireAuthentication } from '@/server/authorization/guards';
import { changePasswordSchema } from '@/features/authentication/schemas/auth.schema';
import { authService } from '@/server/services/auth.service';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function POST(req: NextRequest) {
  try {
    const authContext = await requireAuthentication(req);
    const rawBody = await req.json();
    const validated = changePasswordSchema.parse(rawBody);

    await authService.changePassword(
      authContext.user._id.toString(),
      validated.currentPassword,
      validated.newPassword
    );

    return NextResponse.json(
      successResponse({ message: 'Password changed successfully' }),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
