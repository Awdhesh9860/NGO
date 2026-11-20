import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedContext, resolveEffectivePermissions } from '@/server/authorization/guards';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedContext(req);

    if (!authContext) {
      return NextResponse.json(
        successResponse({
          authenticated: false,
          user: null,
          permissions: [],
        }),
        { status: HTTP_STATUS.OK }
      );
    }

    const { user, sessionId } = authContext;
    const permissions = await resolveEffectivePermissions(user);

    return NextResponse.json(
      successResponse({
        authenticated: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          designation: user.designation,
          isEmailVerified: user.isEmailVerified,
          twoFactorEnabled: user.twoFactor?.enabled || false,
          organizationId: user.organizationId.toString(),
          givingInterests: user.givingInterests,
          givingFrequency: user.givingFrequency,
          panNumber: user.panNumber,
        },
        permissions,
        sessionId,
      }),
      { status: HTTP_STATUS.OK }
    );
  } catch {
    return NextResponse.json(
      successResponse({
        authenticated: false,
        user: null,
        permissions: [],
      }),
      { status: HTTP_STATUS.OK }
    );
  }
}
