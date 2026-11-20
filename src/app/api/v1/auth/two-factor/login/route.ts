import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuthToken } from '@/server/auth/jwt';
import { authService } from '@/server/services/auth.service';
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from '@/server/security/cookies';
import { enforceRateLimit } from '@/server/security/rate-limit';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError, AuthenticationError } from '@/server/errors';

const twoFactorLoginSchema = z.object({
  tempToken: z.string().min(10, 'Temporary 2FA token is required'),
  code: z
    .string()
    .trim()
    .min(6, '2FA verification code must be at least 6 characters')
    .max(16, '2FA verification code is too long'),
});

export async function POST(req: NextRequest) {
  try {
    await enforceRateLimit(req, 'AUTH_2FA');
    const rawBody = await req.json();
    const { tempToken, code } = twoFactorLoginSchema.parse(rawBody);

    const payload = await verifyAuthToken(tempToken);
    if (!payload || payload.sessionId !== 'pre-2fa-temp') {
      throw new AuthenticationError('Invalid or expired 2FA login session. Please log in again.');
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown Agent';

    const { user, token, sessionId } = await authService.verify2FALogin(
      payload.userId,
      code,
      ipAddress,
      userAgent
    );

    const response = NextResponse.json(
      successResponse({
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          isEmailVerified: user.isEmailVerified,
          organizationId: user.organizationId.toString(),
        },
        sessionId,
      }),
      { status: HTTP_STATUS.OK }
    );

    response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
