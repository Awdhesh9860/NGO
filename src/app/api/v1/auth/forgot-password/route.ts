import { NextRequest, NextResponse } from 'next/server';
import { forgotPasswordSchema } from '@/features/authentication/schemas/auth.schema';
import { authService } from '@/server/services/auth.service';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const validated = forgotPasswordSchema.parse(rawBody);

    await authService.forgotPassword(validated.email);

    return NextResponse.json(
      successResponse({
        message: 'If an account exists with this email address, password reset instructions have been sent.',
      }),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
