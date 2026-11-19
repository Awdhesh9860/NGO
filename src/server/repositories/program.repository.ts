import mongoose from 'mongoose';
import { Program, IProgramDocument, ProgramStatus } from '@/server/database/models/Program';
import connectToDatabase from '@/server/database/connection';

export interface ProgramFilterOptions {
  status?: ProgramStatus;
  category?: string;
  departmentId?: string;
  programManagerId?: string;
  search?: string;
  includeArchived?: boolean;
}

export class ProgramRepository {
  async findById(
    id: string | mongoose.Types.ObjectId,
    organizationId: string | mongoose.Types.ObjectId
  ): Promise<IProgramDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString()) || !mongoose.Types.ObjectId.isValid(organizationId.toString())) {
      return null;
    }

    return await Program.findOne({
      _id: new mongoose.Types.ObjectId(id.toString()),
      organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
      isDeleted: { $ne: true },
    })
      .populate('programManagerId', 'name email designation avatar')
      .populate('departmentId', 'name slug');
  }

  async findBySlugOrCode(
    organizationId: string | mongoose.Types.ObjectId,
    slug?: string,
    code?: string
  ): Promise<IProgramDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(organizationId.toString())) return null;

    const orClauses: Record<string, unknown>[] = [];
    if (slug) orClauses.push({ slug: slug.toLowerCase().trim() });
    if (code) orClauses.push({ code: code.toUpperCase().trim() });
    if (orClauses.length === 0) return null;

    return await Program.findOne({
      organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
      isDeleted: { $ne: true },
      $or: orClauses,
    });
  }

  async findMany(
    organizationId: string | mongoose.Types.ObjectId,
    filter: ProgramFilterOptions = {},
    options: { page?: number; limit?: number; sort?: Record<string, 1 | -1> } = {}
  ): Promise<IProgramDocument[]> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(organizationId.toString())) return [];

    const query = this.buildQuery(organizationId, filter);
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    return await Program.find(query)
      .populate('programManagerId', 'name email designation')
      .populate('departmentId', 'name slug')
      .sort(options.sort || { createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async count(
    organizationId: string | mongoose.Types.ObjectId,
    filter: ProgramFilterOptions = {}
  ): Promise<number> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(organizationId.toString())) return 0;
    return await Program.countDocuments(this.buildQuery(organizationId, filter));
  }

  async findPublicPublished(organizationId?: string): Promise<IProgramDocument[]> {
    await connectToDatabase();
    const query: Record<string, unknown> = {
      isPublicVisible: true,
      isDeleted: { $ne: true },
      status: { $in: ['APPROVED', 'ACTIVE', 'COMPLETED'] },
    };
    if (organizationId && mongoose.Types.ObjectId.isValid(organizationId)) {
      query.organizationId = new mongoose.Types.ObjectId(organizationId);
    }
    return await Program.find(query).sort({ createdAt: -1 });
  }

  async findPublicBySlug(slug: string, organizationId?: string): Promise<IProgramDocument | null> {
    await connectToDatabase();
    const query: Record<string, unknown> = {
      slug: slug.toLowerCase().trim(),
      isPublicVisible: true,
      isDeleted: { $ne: true },
      status: { $in: ['APPROVED', 'ACTIVE', 'COMPLETED'] },
    };
    if (organizationId && mongoose.Types.ObjectId.isValid(organizationId)) {
      query.organizationId = new mongoose.Types.ObjectId(organizationId);
    }
    return await Program.findOne(query);
  }

  async create(data: Partial<IProgramDocument>): Promise<IProgramDocument> {
    await connectToDatabase();
    return await Program.create(data);
  }

  async update(
    id: string | mongoose.Types.ObjectId,
    organizationId: string | mongoose.Types.ObjectId,
    updates: Partial<IProgramDocument>
  ): Promise<IProgramDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString()) || !mongoose.Types.ObjectId.isValid(organizationId.toString())) {
      return null;
    }

    return await Program.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id.toString()),
        organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
        isDeleted: { $ne: true },
      },
      { $set: updates },
      { new: true }
    )
      .populate('programManagerId', 'name email designation')
      .populate('departmentId', 'name slug');
  }

  private buildQuery(
    organizationId: string | mongoose.Types.ObjectId,
    filter: ProgramFilterOptions
  ): Record<string, unknown> {
    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
      isDeleted: { $ne: true },
    };

    if (filter.status) {
      query.status = filter.status;
    } else if (!filter.includeArchived) {
      query.status = { $ne: 'ARCHIVED' };
    }

    if (filter.category) query.category = filter.category;
    if (filter.departmentId && mongoose.Types.ObjectId.isValid(filter.departmentId)) {
      query.departmentId = new mongoose.Types.ObjectId(filter.departmentId);
    }
    if (filter.programManagerId && mongoose.Types.ObjectId.isValid(filter.programManagerId)) {
      query.programManagerId = new mongoose.Types.ObjectId(filter.programManagerId);
    }
    if (filter.search) {
      query.$or = [
        { title: { $regex: filter.search, $options: 'i' } },
        { code: { $regex: filter.search, $options: 'i' } },
        { shortDescription: { $regex: filter.search, $options: 'i' } },
        { focusArea: { $regex: filter.search, $options: 'i' } },
      ];
    }

    return query;
  }
}

export const programRepository = new ProgramRepository();
