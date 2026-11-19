import mongoose from 'mongoose';
import {
  ProjectMilestone,
  IProjectMilestoneDocument,
  MilestoneStatus,
} from '@/server/database/models/ProjectMilestone';
import connectToDatabase from '@/server/database/connection';

export interface MilestoneFilterOptions {
  projectId?: string;
  status?: MilestoneStatus;
  overdueOnly?: boolean;
}

export class MilestoneRepository {
  async findById(
    id: string | mongoose.Types.ObjectId,
    organizationId: string | mongoose.Types.ObjectId
  ): Promise<IProjectMilestoneDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString()) || !mongoose.Types.ObjectId.isValid(organizationId.toString())) {
      return null;
    }

    return await ProjectMilestone.findOne({
      _id: new mongoose.Types.ObjectId(id.toString()),
      organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
    })
      .populate('projectId', 'name code slug')
      .populate('responsibleUserId', 'name email designation');
  }

  async findMany(
    organizationId: string | mongoose.Types.ObjectId,
    filter: MilestoneFilterOptions = {}
  ): Promise<IProjectMilestoneDocument[]> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(organizationId.toString())) return [];

    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
    };
    if (filter.projectId && mongoose.Types.ObjectId.isValid(filter.projectId)) {
      query.projectId = new mongoose.Types.ObjectId(filter.projectId);
    }
    if (filter.status) query.status = filter.status;
    if (filter.overdueOnly) {
      query.targetDate = { $lt: new Date() };
      query.status = { $nin: ['COMPLETED', 'CANCELLED'] };
    }

    return await ProjectMilestone.find(query)
      .populate('projectId', 'name code slug')
      .populate('responsibleUserId', 'name email designation')
      .sort({ targetDate: 1 });
  }

  async create(data: Partial<IProjectMilestoneDocument>): Promise<IProjectMilestoneDocument> {
    await connectToDatabase();
    return await ProjectMilestone.create(data);
  }

  async update(
    id: string | mongoose.Types.ObjectId,
    organizationId: string | mongoose.Types.ObjectId,
    updates: Partial<IProjectMilestoneDocument>
  ): Promise<IProjectMilestoneDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString()) || !mongoose.Types.ObjectId.isValid(organizationId.toString())) {
      return null;
    }

    return await ProjectMilestone.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id.toString()),
        organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
      },
      { $set: updates },
      { new: true }
    )
      .populate('projectId', 'name code slug')
      .populate('responsibleUserId', 'name email designation');
  }

  async delete(
    id: string | mongoose.Types.ObjectId,
    organizationId: string | mongoose.Types.ObjectId
  ): Promise<boolean> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString()) || !mongoose.Types.ObjectId.isValid(organizationId.toString())) {
      return false;
    }

    const res = await ProjectMilestone.deleteOne({
      _id: new mongoose.Types.ObjectId(id.toString()),
      organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
    });
    return (res.deletedCount || 0) > 0;
  }
}

export const milestoneRepository = new MilestoneRepository();
