import mongoose from 'mongoose';
import { Department, IDepartmentDocument } from '@/server/database/models/Department';
import connectToDatabase from '@/server/database/connection';

export interface DepartmentFilterOptions {
  status?: 'active' | 'inactive';
  search?: string;
}

export class DepartmentRepository {
  async findById(
    id: string | mongoose.Types.ObjectId,
    organizationId?: string | mongoose.Types.ObjectId
  ): Promise<IDepartmentDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return null;

    const query: Record<string, unknown> = {
      _id: new mongoose.Types.ObjectId(id.toString()),
    };
    if (organizationId && mongoose.Types.ObjectId.isValid(organizationId.toString())) {
      query.organizationId = new mongoose.Types.ObjectId(organizationId.toString());
    }

    return await Department.findOne(query).populate('headUserId', 'name email avatar designation');
  }

  async findBySlug(
    slug: string,
    organizationId: string | mongoose.Types.ObjectId
  ): Promise<IDepartmentDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(organizationId.toString())) return null;

    return await Department.findOne({
      slug: slug.toLowerCase().trim(),
      organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
    });
  }

  async findMany(
    organizationId: string | mongoose.Types.ObjectId,
    filter: DepartmentFilterOptions = {},
    options: { page?: number; limit?: number; sort?: Record<string, 1 | -1> } = {}
  ): Promise<IDepartmentDocument[]> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(organizationId.toString())) return [];

    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
    };

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: 'i' } },
        { description: { $regex: filter.search, $options: 'i' } },
      ];
    }

    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;
    const sort = options.sort || { createdAt: -1 };

    return await Department.find(query)
      .populate('headUserId', 'name email avatar designation')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async count(
    organizationId: string | mongoose.Types.ObjectId,
    filter: DepartmentFilterOptions = {}
  ): Promise<number> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(organizationId.toString())) return 0;

    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
    };

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: 'i' } },
        { description: { $regex: filter.search, $options: 'i' } },
      ];
    }

    return await Department.countDocuments(query);
  }

  async create(data: Partial<IDepartmentDocument>): Promise<IDepartmentDocument> {
    await connectToDatabase();
    return await Department.create(data);
  }

  async update(
    id: string | mongoose.Types.ObjectId,
    organizationId: string | mongoose.Types.ObjectId,
    updates: Partial<IDepartmentDocument>
  ): Promise<IDepartmentDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString()) || !mongoose.Types.ObjectId.isValid(organizationId.toString())) {
      return null;
    }

    return await Department.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id.toString()),
        organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
      },
      { $set: updates },
      { new: true }
    ).populate('headUserId', 'name email avatar designation');
  }

  async delete(
    id: string | mongoose.Types.ObjectId,
    organizationId: string | mongoose.Types.ObjectId
  ): Promise<boolean> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString()) || !mongoose.Types.ObjectId.isValid(organizationId.toString())) {
      return false;
    }

    const res = await Department.deleteOne({
      _id: new mongoose.Types.ObjectId(id.toString()),
      organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
    });
    return (res.deletedCount || 0) > 0;
  }
}

export const departmentRepository = new DepartmentRepository();
