import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedContext } from '@/server/authorization/guards';
import { authService } from '@/server/services/auth.service';
import { AUTH_COOKIE_NAME } from '@/server/security/cookies';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function POST(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedContext(req);
    if (authContext) {
      await authService.logout(authContext.sessionId);
    }

    const response = NextResponse.json(
      successResponse({ message: 'Logged out successfully' }),
      { status: HTTP_STATUS.OK }
    );

    // Delete session cookie
    response.cookies.set(AUTH_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
