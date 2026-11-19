import mongoose from 'mongoose';
import { Organization, IOrganizationDocument } from '@/server/database/models/Organization';
import connectToDatabase from '@/server/database/connection';

export class OrganizationRepository {
  async findById(id: string | mongoose.Types.ObjectId): Promise<IOrganizationDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return null;
    return await Organization.findById(id);
  }

  async findBySlug(slug: string): Promise<IOrganizationDocument | null> {
    await connectToDatabase();
    return await Organization.findOne({ slug: slug.toLowerCase().trim() });
  }

  async create(data: Partial<IOrganizationDocument>): Promise<IOrganizationDocument> {
    await connectToDatabase();
    return await Organization.create(data);
  }

  async update(
    id: string | mongoose.Types.ObjectId,
    updates: Partial<IOrganizationDocument>
  ): Promise<IOrganizationDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return null;
    return await Organization.findByIdAndUpdate(id, { $set: updates }, { new: true });
  }

  async updateSettings(
    id: string | mongoose.Types.ObjectId,
    settings: Partial<IOrganizationDocument['settings']>
  ): Promise<IOrganizationDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return null;
    return await Organization.findByIdAndUpdate(
      id,
      {
        $set: Object.entries(settings).reduce((acc, [key, val]) => {
          acc[`settings.${key}`] = val;
          return acc;
        }, {} as Record<string, unknown>),
      },
      { new: true }
    );
  }

  async updateStatutory(
    id: string | mongoose.Types.ObjectId,
    statutory: Partial<IOrganizationDocument['statutory']>
  ): Promise<IOrganizationDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return null;
    return await Organization.findByIdAndUpdate(
      id,
      {
        $set: Object.entries(statutory).reduce((acc, [key, val]) => {
          acc[`statutory.${key}`] = val;
          return acc;
        }, {} as Record<string, unknown>),
      },
      { new: true }
    );
  }
}

export const organizationRepository = new OrganizationRepository();
