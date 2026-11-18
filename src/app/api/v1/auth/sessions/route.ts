import { NextRequest, NextResponse } from 'next/server';
import { requireAuthentication } from '@/server/authorization/guards';
import { getUserSessions, revokeAllUserSessions } from '@/server/auth/session';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAuthentication(req);
    const sessions = await getUserSessions(authContext.user._id);

    const formattedSessions = sessions.map((s) => ({
      id: s._id.toString(),
      device: s.device || 'Desktop / Web Browser',
      browser: s.browser || 'Unknown Browser',
      ip: s.ipAddress || '127.0.0.1',
      lastActive: s.lastActiveAt ? new Date(s.lastActiveAt).toLocaleString() : 'Recently',
      isCurrent: s._id.toString() === authContext.sessionId,
    }));

    return NextResponse.json(
      successResponse(formattedSessions),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authContext = await requireAuthentication(req);
    // Revoke all sessions except current
    const count = await revokeAllUserSessions(authContext.user._id, authContext.sessionId);

    return NextResponse.json(
      successResponse({ message: `Successfully terminated ${count} other sessions` }),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
