import mongoose from 'mongoose';
import { Invitation, IInvitationDocument } from '@/server/database/models/Invitation';
import connectToDatabase from '@/server/database/connection';

export interface InvitationFilterOptions {
  status?: 'pending' | 'accepted' | 'revoked' | 'expired';
  role?: string;
  search?: string;
}

export class InvitationRepository {
  async findById(
    id: string | mongoose.Types.ObjectId,
    organizationId?: string | mongoose.Types.ObjectId
  ): Promise<IInvitationDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return null;

    const query: Record<string, unknown> = {
      _id: new mongoose.Types.ObjectId(id.toString()),
    };
    if (organizationId && mongoose.Types.ObjectId.isValid(organizationId.toString())) {
      query.organizationId = new mongoose.Types.ObjectId(organizationId.toString());
    }

    return await Invitation.findOne(query)
      .populate('invitedBy', 'name email')
      .populate('departmentId', 'name slug');
  }

  async findByTokenHash(tokenHash: string): Promise<IInvitationDocument | null> {
    await connectToDatabase();
    return await Invitation.findOne({ tokenHash })
      .populate('invitedBy', 'name email')
      .populate('departmentId', 'name slug');
  }

  async findMany(
    organizationId: string | mongoose.Types.ObjectId,
    filter: InvitationFilterOptions = {},
    options: { page?: number; limit?: number; sort?: Record<string, 1 | -1> } = {}
  ): Promise<IInvitationDocument[]> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(organizationId.toString())) return [];

    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
    };

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.role) {
      query.role = filter.role;
    }

    if (filter.search) {
      query.email = { $regex: filter.search, $options: 'i' };
    }

    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;
    const sort = options.sort || { createdAt: -1 };

    return await Invitation.find(query)
      .populate('invitedBy', 'name email')
      .populate('departmentId', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async count(
    organizationId: string | mongoose.Types.ObjectId,
    filter: InvitationFilterOptions = {}
  ): Promise<number> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(organizationId.toString())) return 0;

    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
    };

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.role) {
      query.role = filter.role;
    }

    if (filter.search) {
      query.email = { $regex: filter.search, $options: 'i' };
    }

    return await Invitation.countDocuments(query);
  }

  async create(data: Partial<IInvitationDocument>): Promise<IInvitationDocument> {
    await connectToDatabase();
    return await Invitation.create(data);
  }

  async updateStatus(
    id: string | mongoose.Types.ObjectId,
    status: 'pending' | 'accepted' | 'revoked' | 'expired',
    acceptedAt?: Date
  ): Promise<IInvitationDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return null;

    const updates: Record<string, unknown> = { status };
    if (acceptedAt) updates.acceptedAt = acceptedAt;

    return await Invitation.findByIdAndUpdate(id, { $set: updates }, { new: true });
  }

  async revoke(
    id: string | mongoose.Types.ObjectId,
    organizationId: string | mongoose.Types.ObjectId
  ): Promise<IInvitationDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString()) || !mongoose.Types.ObjectId.isValid(organizationId.toString())) {
      return null;
    }

    return await Invitation.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id.toString()),
        organizationId: new mongoose.Types.ObjectId(organizationId.toString()),
        status: 'pending',
      },
      { $set: { status: 'revoked' } },
      { new: true }
    );
  }
}

export const invitationRepository = new InvitationRepository();
