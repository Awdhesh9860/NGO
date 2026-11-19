import mongoose from 'mongoose';
import { Project, IProjectDocument, ProjectStatus } from '@/server/database/models/Project';
import connectToDatabase from '@/server/database/connection';

export interface ProjectFilterOptions {
  status?: ProjectStatus;
  programId?: string;
  departmentId?: string;
  projectManagerId?: string;
  assignedToUserId?: string; // Restricts to projects where user is manager or team member
  category?: string;
  state?: string;
  priority?: string;
  search?: string;
  includeArchived?: boolean;
}

export class ProjectRepository {
  async findById(
    id: string | mongoose.Types.ObjectId,
    organizationId: string | mongoose.Types.ObjectId
  ): Promise<IProjectDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString()) || !mongoose.Types.ObjectId.isValid(organizationId.toString())) {
      return null;
    }

    return await Project.findOne({
      _id: new mongoose.Types.ObjectId(id.toString()),
      organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
      isDeleted: { $ne: true },
    })
      .populate('programId', 'title slug code category')
      .populate('projectManagerId', 'name email designation avatar')
      .populate('departmentId', 'name slug')
      .populate('teamMembers.userId', 'name email role designation status');
  }

  async findBySlugOrCode(
    organizationId: string | mongoose.Types.ObjectId,
    slug?: string,
    code?: string
  ): Promise<IProjectDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(organizationId.toString())) return null;

    const orClauses: Record<string, unknown>[] = [];
    if (slug) orClauses.push({ slug: slug.toLowerCase().trim() });
    if (code) orClauses.push({ code: code.toUpperCase().trim() });
    if (orClauses.length === 0) return null;

    return await Project.findOne({
      organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
      isDeleted: { $ne: true },
      $or: orClauses,
    });
  }

  async findMany(
    organizationId: string | mongoose.Types.ObjectId,
    filter: ProjectFilterOptions = {},
    options: { page?: number; limit?: number; sort?: Record<string, 1 | -1> } = {}
  ): Promise<IProjectDocument[]> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(organizationId.toString())) return [];

    const query = this.buildQuery(organizationId, filter);
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    return await Project.find(query)
      .populate('programId', 'title slug code')
      .populate('projectManagerId', 'name email designation')
      .populate('departmentId', 'name slug')
      .sort(options.sort || { createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async count(
    organizationId: string | mongoose.Types.ObjectId,
    filter: ProjectFilterOptions = {}
  ): Promise<number> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(organizationId.toString())) return 0;
    return await Project.countDocuments(this.buildQuery(organizationId, filter));
  }

  async findPublicPublished(organizationId?: string, programId?: string): Promise<IProjectDocument[]> {
    await connectToDatabase();
    const query: Record<string, unknown> = {
      isPublicVisible: true,
      isDeleted: { $ne: true },
      status: { $in: ['APPROVED', 'PLANNED', 'ACTIVE', 'COMPLETED'] },
    };
    if (organizationId && mongoose.Types.ObjectId.isValid(organizationId)) {
      query.organizationId = new mongoose.Types.ObjectId(organizationId);
    }
    if (programId && mongoose.Types.ObjectId.isValid(programId)) {
      query.programId = new mongoose.Types.ObjectId(programId);
    }
    return await Project.find(query).populate('programId', 'title slug').sort({ createdAt: -1 });
  }

  async findPublicBySlugOrId(slugOrId: string, organizationId?: string): Promise<IProjectDocument | null> {
    await connectToDatabase();
    const orClauses: Record<string, unknown>[] = [{ slug: slugOrId.toLowerCase().trim() }];
    if (mongoose.Types.ObjectId.isValid(slugOrId)) {
      orClauses.push({ _id: new mongoose.Types.ObjectId(slugOrId) });
    }
    const query: Record<string, unknown> = {
      $or: orClauses,
      isPublicVisible: true,
      isDeleted: { $ne: true },
      status: { $in: ['APPROVED', 'PLANNED', 'ACTIVE', 'COMPLETED'] },
    };
    if (organizationId && mongoose.Types.ObjectId.isValid(organizationId)) {
      query.organizationId = new mongoose.Types.ObjectId(organizationId);
    }
    return await Project.findOne(query).populate('programId', 'title slug');
  }

  async create(data: Partial<IProjectDocument>): Promise<IProjectDocument> {
    await connectToDatabase();
    return await Project.create(data);
  }

  async update(
    id: string | mongoose.Types.ObjectId,
    organizationId: string | mongoose.Types.ObjectId,
    updates: Partial<IProjectDocument>
  ): Promise<IProjectDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString()) || !mongoose.Types.ObjectId.isValid(organizationId.toString())) {
      return null;
    }

    return await Project.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id.toString()),
        organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
        isDeleted: { $ne: true },
      },
      { $set: updates },
      { new: true }
    )
      .populate('programId', 'title slug code')
      .populate('projectManagerId', 'name email designation')
      .populate('departmentId', 'name slug')
      .populate('teamMembers.userId', 'name email role designation status');
  }

  private buildQuery(
    organizationId: string | mongoose.Types.ObjectId,
    filter: ProjectFilterOptions
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

    if (filter.programId && mongoose.Types.ObjectId.isValid(filter.programId)) {
      query.programId = new mongoose.Types.ObjectId(filter.programId);
    }
    if (filter.departmentId && mongoose.Types.ObjectId.isValid(filter.departmentId)) {
      query.departmentId = new mongoose.Types.ObjectId(filter.departmentId);
    }
    if (filter.projectManagerId && mongoose.Types.ObjectId.isValid(filter.projectManagerId)) {
      query.projectManagerId = new mongoose.Types.ObjectId(filter.projectManagerId);
    }
    if (filter.assignedToUserId && mongoose.Types.ObjectId.isValid(filter.assignedToUserId)) {
      const uid = new mongoose.Types.ObjectId(filter.assignedToUserId);
      query.$and = [
        {
          $or: [{ projectManagerId: uid }, { 'teamMembers.userId': uid }],
        },
      ];
    }
    if (filter.category) query.category = filter.category;
    if (filter.state) query.state = filter.state;
    if (filter.priority) query.priority = filter.priority;

    if (filter.search) {
      const searchCond = {
        $or: [
          { name: { $regex: filter.search, $options: 'i' } },
          { code: { $regex: filter.search, $options: 'i' } },
          { shortDescription: { $regex: filter.search, $options: 'i' } },
          { location: { $regex: filter.search, $options: 'i' } },
          { district: { $regex: filter.search, $options: 'i' } },
        ],
      };
      if (Array.isArray(query.$and)) {
        (query.$and as unknown[]).push(searchCond);
      } else {
        Object.assign(query, searchCond);
      }
    }

    return query;
  }
}

export const projectRepository = new ProjectRepository();
