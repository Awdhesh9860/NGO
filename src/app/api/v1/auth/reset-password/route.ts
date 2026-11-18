import { NextRequest, NextResponse } from 'next/server';
import { resetPasswordSchema } from '@/features/authentication/schemas/auth.schema';
import { authService } from '@/server/services/auth.service';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const validated = resetPasswordSchema.parse(rawBody);

    await authService.resetPassword(validated.token, validated.email, validated.newPassword);

    return NextResponse.json(
      successResponse({ message: 'Password has been reset successfully. Please log in with your new credentials.' }),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
