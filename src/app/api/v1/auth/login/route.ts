import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/features/authentication/schemas/auth.schema';
import { authService } from '@/server/services/auth.service';
import { resolveTenant } from '@/server/tenant/tenant-resolver';
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from '@/server/security/cookies';
import { enforceRateLimit } from '@/server/security/rate-limit';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function POST(req: NextRequest) {
  try {
    await enforceRateLimit(req, 'AUTH_LOGIN');
    const rawBody = await req.json();
    const validated = loginSchema.parse(rawBody);

    let organizationId = validated.organizationId;
    if (!organizationId) {
      const tenant = await resolveTenant(req);
      if (tenant) {
        organizationId = tenant._id.toString();
      }
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown Agent';

    const result = await authService.login({
      email: validated.email,
      password: validated.password,
      organizationId,
      ipAddress,
      userAgent,
    });

    if (result.requires2FA) {
      return NextResponse.json(
        successResponse({
          requires2FA: true,
          tempToken: result.tempToken,
        }),
        { status: HTTP_STATUS.OK }
      );
    }

    if (!result.user || !result.token) {
      throw new Error('Authentication process failed unexpectedly');
    }

    const response = NextResponse.json(
      successResponse({
        requires2FA: false,
        user: {
          id: result.user._id.toString(),
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          avatar: result.user.avatar,
          phone: result.user.phone,
          isEmailVerified: result.user.isEmailVerified,
          organizationId: result.user.organizationId.toString(),
        },
        sessionId: result.sessionId,
      }),
      { status: HTTP_STATUS.OK }
    );

    // Set secure HTTP-only cookie
    response.cookies.set(AUTH_COOKIE_NAME, result.token, getAuthCookieOptions());

    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
