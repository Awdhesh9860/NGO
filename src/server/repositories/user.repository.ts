import mongoose from 'mongoose';
import { User, IUserDocument } from '@/server/database/models/User';
import connectToDatabase from '@/server/database/connection';

export interface UserFilterOptions {
  role?: string;
  departmentId?: string;
  status?: 'active' | 'inactive' | 'suspended';
  search?: string;
}

export class UserRepository {
  async findById(id: string | mongoose.Types.ObjectId): Promise<IUserDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return null;
    return await User.findById(id)
      .populate('departmentId', 'name slug')
      .populate('managerId', 'name email designation')
      .populate('customRoleId', 'name key permissions');
  }

  async findByEmail(email: string, organizationId?: string | mongoose.Types.ObjectId): Promise<IUserDocument | null> {
    await connectToDatabase();
    const query: Record<string, unknown> = {
      email: email.toLowerCase().trim(),
    };
    if (organizationId && mongoose.Types.ObjectId.isValid(organizationId.toString())) {
      query.organizationId = new mongoose.Types.ObjectId(organizationId.toString());
    }
    return await User.findOne(query).populate('departmentId', 'name slug');
  }

  async findMany(
    organizationId: string | mongoose.Types.ObjectId,
    filter: UserFilterOptions = {},
    options: { page?: number; limit?: number; sort?: Record<string, 1 | -1> } = {}
  ): Promise<IUserDocument[]> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(organizationId.toString())) return [];

    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
    };

    if (filter.role) {
      query.role = filter.role;
    }

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.departmentId && mongoose.Types.ObjectId.isValid(filter.departmentId)) {
      query.departmentId = new mongoose.Types.ObjectId(filter.departmentId);
    }

    if (filter.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: 'i' } },
        { email: { $regex: filter.search, $options: 'i' } },
        { phone: { $regex: filter.search, $options: 'i' } },
        { designation: { $regex: filter.search, $options: 'i' } },
      ];
    }

    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;
    const sort = options.sort || { createdAt: -1 };

    return await User.find(query)
      .populate('departmentId', 'name slug')
      .populate('managerId', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async count(
    organizationId: string | mongoose.Types.ObjectId,
    filter: UserFilterOptions = {}
  ): Promise<number> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(organizationId.toString())) return 0;

    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
    };

    if (filter.role) {
      query.role = filter.role;
    }

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.departmentId && mongoose.Types.ObjectId.isValid(filter.departmentId)) {
      query.departmentId = new mongoose.Types.ObjectId(filter.departmentId);
    }

    if (filter.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: 'i' } },
        { email: { $regex: filter.search, $options: 'i' } },
        { phone: { $regex: filter.search, $options: 'i' } },
        { designation: { $regex: filter.search, $options: 'i' } },
      ];
    }

    return await User.countDocuments(query);
  }

  async countActiveAdmins(organizationId: string | mongoose.Types.ObjectId): Promise<number> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(organizationId.toString())) return 0;

    return await User.countDocuments({
      organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
      role: { $in: ['SUPER_ADMIN', 'ADMIN'] },
      status: 'active',
    });
  }

  async create(data: Partial<IUserDocument>): Promise<IUserDocument> {
    await connectToDatabase();
    return await User.create(data);
  }

  async update(id: string | mongoose.Types.ObjectId, updates: Partial<IUserDocument>): Promise<IUserDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return null;
    return await User.findByIdAndUpdate(id, { $set: updates }, { new: true })
      .populate('departmentId', 'name slug')
      .populate('managerId', 'name email designation')
      .populate('customRoleId', 'name key permissions');
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

  async delete(
    id: string | mongoose.Types.ObjectId,
    organizationId: string | mongoose.Types.ObjectId
  ): Promise<boolean> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString()) || !mongoose.Types.ObjectId.isValid(organizationId.toString())) {
      return false;
    }

    const res = await User.deleteOne({
      _id: new mongoose.Types.ObjectId(id.toString()),
      organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
    });
    return (res.deletedCount || 0) > 0;
  }
}

export const userRepository = new UserRepository();
