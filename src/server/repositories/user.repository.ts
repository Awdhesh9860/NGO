import mongoose from 'mongoose';
import { User, IUserDocument } from '@/server/database/models/User';
import connectToDatabase from '@/server/database/connection';

export class UserRepository {
  async findById(id: string | mongoose.Types.ObjectId): Promise<IUserDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return null;
    return await User.findById(id);
  }

  async findByEmail(email: string, organizationId?: string | mongoose.Types.ObjectId): Promise<IUserDocument | null> {
    await connectToDatabase();
    const query: Record<string, unknown> = {
      email: email.toLowerCase().trim(),
    };
    if (organizationId && mongoose.Types.ObjectId.isValid(organizationId.toString())) {
      query.organizationId = new mongoose.Types.ObjectId(organizationId.toString());
    }
    return await User.findOne(query);
  }

  async create(data: Partial<IUserDocument>): Promise<IUserDocument> {
    await connectToDatabase();
    return await User.create(data);
  }

  async update(id: string | mongoose.Types.ObjectId, updates: Partial<IUserDocument>): Promise<IUserDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return null;
    return await User.findByIdAndUpdate(id, { $set: updates }, { new: true });
  }

  async updatePassword(id: string | mongoose.Types.ObjectId, passwordHash: string): Promise<boolean> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return false;
    const res = await User.updateOne(
      { _id: new mongoose.Types.ObjectId(id.toString()) },
      { $set: { passwordHash } }
    );
    return res.modifiedCount > 0;
  }

  async markEmailVerified(id: string | mongoose.Types.ObjectId): Promise<boolean> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return false;
    const res = await User.updateOne(
      { _id: new mongoose.Types.ObjectId(id.toString()) },
      { $set: { isEmailVerified: true, emailVerifiedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }

  async update2FASettings(
    id: string | mongoose.Types.ObjectId,
    twoFactor: { enabled: boolean; secret?: string; backupCodes?: string[] }
  ): Promise<boolean> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return false;
    const res = await User.updateOne(
      { _id: new mongoose.Types.ObjectId(id.toString()) },
      { $set: { twoFactor } }
    );
    return res.modifiedCount > 0;
  }

  async recordLogin(id: string | mongoose.Types.ObjectId): Promise<void> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return;
    await User.updateOne(
      { _id: new mongoose.Types.ObjectId(id.toString()) },
      { $set: { lastLoginAt: new Date() } }
    );
  }
}

export const userRepository = new UserRepository();
