import mongoose from 'mongoose';
import { Session, ISessionDocument } from '@/server/database/models/Session';
import connectToDatabase from '@/server/database/connection';

export class SessionRepository {
  async findById(id: string | mongoose.Types.ObjectId): Promise<ISessionDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return null;
    return await Session.findById(id);
  }

  async findByTokenHash(tokenHash: string): Promise<ISessionDocument | null> {
    await connectToDatabase();
    return await Session.findOne({ tokenHash, isRevoked: false, expiresAt: { $gt: new Date() } });
  }

  async create(data: {
    userId: mongoose.Types.ObjectId;
    organizationId: mongoose.Types.ObjectId;
    tokenHash: string;
    device?: string;
    browser?: string;
    ipAddress?: string;
    expiresAt: Date;
  }): Promise<ISessionDocument> {
    await connectToDatabase();
    return await Session.create({
      ...data,
      lastActiveAt: new Date(),
      isRevoked: false,
    });
  }

  async revoke(id: string | mongoose.Types.ObjectId): Promise<boolean> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return false;
    const res = await Session.updateOne(
      { _id: new mongoose.Types.ObjectId(id.toString()) },
      { $set: { isRevoked: true, revokedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }

  async revokeAllForUser(
    userId: string | mongoose.Types.ObjectId,
    exceptSessionId?: string | mongoose.Types.ObjectId
  ): Promise<number> {
    await connectToDatabase();
    const query: Record<string, unknown> = {
      userId: new mongoose.Types.ObjectId(userId.toString()),
      isRevoked: false,
    };
    if (exceptSessionId && mongoose.Types.ObjectId.isValid(exceptSessionId.toString())) {
      query._id = { $ne: new mongoose.Types.ObjectId(exceptSessionId.toString()) };
    }
    const res = await Session.updateMany(query, {
      $set: { isRevoked: true, revokedAt: new Date() },
    });
    return res.modifiedCount;
  }

  async findActiveByUserId(userId: string | mongoose.Types.ObjectId): Promise<ISessionDocument[]> {
    await connectToDatabase();
    return await Session.find({
      userId: new mongoose.Types.ObjectId(userId.toString()),
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    }).sort({ lastActiveAt: -1 });
  }
}

export const sessionRepository = new SessionRepository();
