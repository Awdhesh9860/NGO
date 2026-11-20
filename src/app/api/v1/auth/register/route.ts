import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/features/authentication/schemas/auth.schema';
import { authService } from '@/server/services/auth.service';
import { resolveTenant } from '@/server/tenant/tenant-resolver';
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from '@/server/security/cookies';
import { enforceRateLimit } from '@/server/security/rate-limit';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function POST(req: NextRequest) {
  try {
    await enforceRateLimit(req, 'AUTH_REGISTER');
    const rawBody = await req.json();
    const validated = registerSchema.parse(rawBody);

    let organizationId = validated.organizationId;
    if (!organizationId) {
      const tenant = await resolveTenant(req);
      if (!tenant) {
        throw new Error('Could not resolve host organization');
      }
      organizationId = tenant._id.toString();
    }

    const { user, token, sessionId } = await authService.register({
      name: validated.name,
      email: validated.email,
      password: validated.password,
      role: validated.role,
      organizationId,
      phone: validated.phone,
      givingInterests: validated.givingInterests,
      givingFrequency: validated.givingFrequency,
      panNumber: validated.panNumber,
    });

    const response = NextResponse.json(
      successResponse(
        {
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            isEmailVerified: user.isEmailVerified,
            organizationId: user.organizationId.toString(),
          },
          sessionId,
        },
        undefined,
        organizationId
      ),
      { status: HTTP_STATUS.CREATED }
    );

    // Set HTTP-only session cookie
    response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
