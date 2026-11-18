import { NextRequest, NextResponse } from 'next/server';
import { verifyOTPSchema } from '@/features/authentication/schemas/auth.schema';
import { authService } from '@/server/services/auth.service';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const validated = verifyOTPSchema.parse(rawBody);

    await authService.verifyOTP(validated.email, validated.otp, validated.purpose);

    return NextResponse.json(
      successResponse({ message: 'OTP verified successfully' }),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
