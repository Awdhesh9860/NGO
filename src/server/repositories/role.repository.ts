import mongoose from 'mongoose';
import { Role, IRoleDocument } from '@/server/database/models/Role';
import connectToDatabase from '@/server/database/connection';

export class RoleRepository {
  async findById(
    id: string | mongoose.Types.ObjectId,
    organizationId?: string | mongoose.Types.ObjectId
  ): Promise<IRoleDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return null;

    const query: Record<string, unknown> = {
      _id: new mongoose.Types.ObjectId(id.toString()),
    };
    if (organizationId && mongoose.Types.ObjectId.isValid(organizationId.toString())) {
      query.organizationId = new mongoose.Types.ObjectId(organizationId.toString());
    }

    return await Role.findOne(query);
  }

  async findByKey(
    key: string,
    organizationId: string | mongoose.Types.ObjectId
  ): Promise<IRoleDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(organizationId.toString())) return null;

    return await Role.findOne({
      key: key.trim(),
      organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
    });
  }

  async findMany(
    organizationId: string | mongoose.Types.ObjectId,
    options: { status?: 'active' | 'inactive' } = {}
  ): Promise<IRoleDocument[]> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(organizationId.toString())) return [];

    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
    };
    if (options.status) {
      query.status = options.status;
    }

    return await Role.find(query).sort({ isSystemRole: -1, name: 1 });
  }

  async create(data: Partial<IRoleDocument>): Promise<IRoleDocument> {
    await connectToDatabase();
    return await Role.create(data);
  }

  async update(
    id: string | mongoose.Types.ObjectId,
    organizationId: string | mongoose.Types.ObjectId,
    updates: Partial<IRoleDocument>
  ): Promise<IRoleDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString()) || !mongoose.Types.ObjectId.isValid(organizationId.toString())) {
      return null;
    }

    return await Role.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id.toString()),
        organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
        isSystemRole: { $ne: true }, // Prevent mutating system roles
      },
      { $set: updates },
      { new: true }
    );
  }
}

export const roleRepository = new RoleRepository();
