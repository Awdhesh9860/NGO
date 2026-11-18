import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailSchema } from '@/features/authentication/schemas/auth.schema';
import { authService } from '@/server/services/auth.service';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const validated = verifyEmailSchema.parse(rawBody);

    await authService.verifyEmailByToken(validated.token, validated.email);

    return NextResponse.json(
      successResponse({ message: 'Email address verified successfully' }),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
