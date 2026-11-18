import { NextRequest, NextResponse } from 'next/server';
import { sendOTPSchema } from '@/features/authentication/schemas/auth.schema';
import { authService } from '@/server/services/auth.service';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const validated = sendOTPSchema.parse(rawBody);

    await authService.sendOTP(validated.email, validated.purpose);

    return NextResponse.json(
      successResponse({ message: 'Verification OTP sent to your email address' }),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
