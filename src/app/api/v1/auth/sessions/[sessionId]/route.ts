import { NextRequest, NextResponse } from 'next/server';
import { requireAuthentication } from '@/server/authorization/guards';
import { revokeSession } from '@/server/auth/session';
import { Session } from '@/server/database/models/Session';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError, AuthorizationError, NotFoundError } from '@/server/errors';

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const authContext = await requireAuthentication(req);
    const { sessionId } = await context.params;

    const session = await Session.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Session not found');
    }

    if (session.userId.toString() !== authContext.user._id.toString()) {
      throw new AuthorizationError('You are not authorized to terminate this session');
    }

    await revokeSession(sessionId);

    return NextResponse.json(
      successResponse({ message: 'Session terminated successfully' }),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
