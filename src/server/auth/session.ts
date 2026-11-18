import mongoose from 'mongoose';
import { Session, ISessionDocument } from '@/server/database/models/Session';
import { generateCryptoToken, hashToken } from '@/server/security/tokens';

export interface CreateSessionParams {
  userId: string | mongoose.Types.ObjectId;
  organizationId: string | mongoose.Types.ObjectId;
  device?: string;
  browser?: string;
  ipAddress?: string;
  maxAgeSeconds?: number;
}

export interface SessionResult {
  session: ISessionDocument;
  rawToken: string;
}

export async function createSession(params: CreateSessionParams): Promise<SessionResult> {
  const rawToken = generateCryptoToken(32);
  const tokenHash = hashToken(rawToken);
  const maxAge = params.maxAgeSeconds || (7 * 24 * 60 * 60); // 7 days default
  const expiresAt = new Date(Date.now() + maxAge * 1000);

  const session = await Session.create({
    userId: new mongoose.Types.ObjectId(params.userId.toString()),
    organizationId: new mongoose.Types.ObjectId(params.organizationId.toString()),
    tokenHash,
    device: params.device || 'Desktop / Web Browser',
    browser: params.browser || 'Unknown Browser',
    ipAddress: params.ipAddress || '127.0.0.1',
    lastActiveAt: new Date(),
    expiresAt,
    isRevoked: false,
  });

  return { session, rawToken };
}

export async function validateSession(sessionId: string): Promise<ISessionDocument | null> {
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    return null;
  }

  const session = await Session.findById(sessionId);
  if (!session) return null;

  if (session.isRevoked) return null;

  if (new Date() > session.expiresAt) return null;

  // Touch session lastActiveAt periodically (e.g. if older than 5 minutes)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  if (session.lastActiveAt < fiveMinutesAgo) {
    session.lastActiveAt = new Date();
    await session.save();
  }

  return session;
}

export async function revokeSession(sessionId: string): Promise<boolean> {
  if (!mongoose.Types.ObjectId.isValid(sessionId)) return false;

  const result = await Session.updateOne(
    { _id: new mongoose.Types.ObjectId(sessionId) },
    { $set: { isRevoked: true, revokedAt: new Date() } }
  );

  return result.modifiedCount > 0;
}

export async function revokeAllUserSessions(
  userId: string | mongoose.Types.ObjectId,
  exceptSessionId?: string
): Promise<number> {
  const query: Record<string, unknown> = {
    userId: new mongoose.Types.ObjectId(userId.toString()),
    isRevoked: false,
  };

  if (exceptSessionId && mongoose.Types.ObjectId.isValid(exceptSessionId)) {
    query._id = { $ne: new mongoose.Types.ObjectId(exceptSessionId) };
  }

  const result = await Session.updateMany(query, {
    $set: { isRevoked: true, revokedAt: new Date() },
  });

  return result.modifiedCount;
}

export async function getUserSessions(userId: string | mongoose.Types.ObjectId) {
  return await Session.find({
    userId: new mongoose.Types.ObjectId(userId.toString()),
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  })
    .sort({ lastActiveAt: -1 })
    .lean();
}
