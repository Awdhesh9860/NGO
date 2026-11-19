import mongoose from 'mongoose';
import { Task, ITaskDocument, TaskStatus, TaskPriority } from '@/server/database/models/Task';
import connectToDatabase from '@/server/database/connection';

export interface TaskFilterOptions {
  projectId?: string;
  programId?: string;
  assignedUserId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  overdueOnly?: boolean;
  search?: string;
}

export class TaskRepository {
  async findById(
    id: string | mongoose.Types.ObjectId,
    organizationId: string | mongoose.Types.ObjectId
  ): Promise<ITaskDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString()) || !mongoose.Types.ObjectId.isValid(organizationId.toString())) {
      return null;
    }

    return await Task.findOne({
      _id: new mongoose.Types.ObjectId(id.toString()),
      organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
    })
      .populate('projectId', 'name code slug')
      .populate('assignedUserId', 'name email designation role')
      .populate('createdBy', 'name email');
  }

  async findMany(
    organizationId: string | mongoose.Types.ObjectId,
    filter: TaskFilterOptions = {},
    options: { page?: number; limit?: number; sort?: Record<string, 1 | -1> } = {}
  ): Promise<ITaskDocument[]> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(organizationId.toString())) return [];

    const query = this.buildQuery(organizationId, filter);
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 25));
    const skip = (page - 1) * limit;

    return await Task.find(query)
      .populate('projectId', 'name code slug')
      .populate('assignedUserId', 'name email designation role')
      .populate('createdBy', 'name email')
      .sort(options.sort || { dueDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async count(
    organizationId: string | mongoose.Types.ObjectId,
    filter: TaskFilterOptions = {}
  ): Promise<number> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(organizationId.toString())) return 0;
    return await Task.countDocuments(this.buildQuery(organizationId, filter));
  }

  async create(data: Partial<ITaskDocument>): Promise<ITaskDocument> {
    await connectToDatabase();
    return await Task.create(data);
  }

  async update(
    id: string | mongoose.Types.ObjectId,
    organizationId: string | mongoose.Types.ObjectId,
    updates: Partial<ITaskDocument>
  ): Promise<ITaskDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString()) || !mongoose.Types.ObjectId.isValid(organizationId.toString())) {
      return null;
    }

    return await Task.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id.toString()),
        organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
      },
      { $set: updates },
      { new: true }
    )
      .populate('projectId', 'name code slug')
      .populate('assignedUserId', 'name email designation role')
      .populate('createdBy', 'name email');
  }

  async delete(
    id: string | mongoose.Types.ObjectId,
    organizationId: string | mongoose.Types.ObjectId
  ): Promise<boolean> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString()) || !mongoose.Types.ObjectId.isValid(organizationId.toString())) {
      return false;
    }

    const res = await Task.deleteOne({
      _id: new mongoose.Types.ObjectId(id.toString()),
      organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
    });
    return (res.deletedCount || 0) > 0;
  }

  private buildQuery(
    organizationId: string | mongoose.Types.ObjectId,
    filter: TaskFilterOptions
  ): Record<string, unknown> {
    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
    };

    if (filter.projectId && mongoose.Types.ObjectId.isValid(filter.projectId)) {
      query.projectId = new mongoose.Types.ObjectId(filter.projectId);
    }
    if (filter.programId && mongoose.Types.ObjectId.isValid(filter.programId)) {
      query.programId = new mongoose.Types.ObjectId(filter.programId);
    }
    if (filter.assignedUserId && mongoose.Types.ObjectId.isValid(filter.assignedUserId)) {
      query.assignedUserId = new mongoose.Types.ObjectId(filter.assignedUserId);
    }
    if (filter.status) query.status = filter.status;
    if (filter.priority) query.priority = filter.priority;
    if (filter.overdueOnly) {
      query.dueDate = { $lt: new Date() };
      query.status = { $nin: ['COMPLETED', 'CANCELLED'] };
    }
    if (filter.search) {
      query.$or = [
        { title: { $regex: filter.search, $options: 'i' } },
        { description: { $regex: filter.search, $options: 'i' } },
      ];
    }

    return query;
  }
}

export const taskRepository = new TaskRepository();
