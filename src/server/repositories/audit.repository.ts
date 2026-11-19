import mongoose from 'mongoose';
import { AuditLog, IAuditLogDocument } from '@/server/database/models/AuditLog';
import connectToDatabase from '@/server/database/connection';

export interface AuditLogFilterOptions {
  actorId?: string;
  action?: string;
  resource?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

export class AuditRepository {
  async create(data: Partial<IAuditLogDocument>): Promise<IAuditLogDocument> {
    await connectToDatabase();
    return await AuditLog.create({
      ...data,
      timestamp: data.timestamp || new Date(),
    });
  }

  async findMany(
    organizationId: string | mongoose.Types.ObjectId,
    filter: AuditLogFilterOptions = {},
    options: { page?: number; limit?: number; sort?: Record<string, 1 | -1> } = {}
  ): Promise<IAuditLogDocument[]> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(organizationId.toString())) return [];

    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
    };

    if (filter.actorId && mongoose.Types.ObjectId.isValid(filter.actorId)) {
      query.actorId = new mongoose.Types.ObjectId(filter.actorId);
    }

    if (filter.action) {
      query.action = filter.action;
    }

    if (filter.resource) {
      query.resource = filter.resource;
    }

    if (filter.startDate || filter.endDate) {
      query.timestamp = {};
      if (filter.startDate) {
        (query.timestamp as Record<string, unknown>).$gte = filter.startDate;
      }
      if (filter.endDate) {
        (query.timestamp as Record<string, unknown>).$lte = filter.endDate;
      }
    }

    if (filter.search) {
      query.$or = [
        { actorName: { $regex: filter.search, $options: 'i' } },
        { action: { $regex: filter.search, $options: 'i' } },
        { details: { $regex: filter.search, $options: 'i' } },
      ];
    }

    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 25));
    const skip = (page - 1) * limit;
    const sort = options.sort || { timestamp: -1 };

    return await AuditLog.find(query).sort(sort).skip(skip).limit(limit);
  }

  async count(
    organizationId: string | mongoose.Types.ObjectId,
    filter: AuditLogFilterOptions = {}
  ): Promise<number> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(organizationId.toString())) return 0;

    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
    };

    if (filter.actorId && mongoose.Types.ObjectId.isValid(filter.actorId)) {
      query.actorId = new mongoose.Types.ObjectId(filter.actorId);
    }

    if (filter.action) {
      query.action = filter.action;
    }

    if (filter.resource) {
      query.resource = filter.resource;
    }

    if (filter.startDate || filter.endDate) {
      query.timestamp = {};
      if (filter.startDate) {
        (query.timestamp as Record<string, unknown>).$gte = filter.startDate;
      }
      if (filter.endDate) {
        (query.timestamp as Record<string, unknown>).$lte = filter.endDate;
      }
    }

    if (filter.search) {
      query.$or = [
        { actorName: { $regex: filter.search, $options: 'i' } },
        { action: { $regex: filter.search, $options: 'i' } },
        { details: { $regex: filter.search, $options: 'i' } },
      ];
    }

    return await AuditLog.countDocuments(query);
  }
}

export const auditRepository = new AuditRepository();
