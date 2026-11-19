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

  async findAll(): Promise<IOrganizationDocument[]> {
    await connectToDatabase();
    return await Organization.find({}).sort({ name: 1 });
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

  async updateNestedSection(
    id: string | mongoose.Types.ObjectId,
    section: 'identity' | 'statutory' | 'regional' | 'securitySettings' | 'notificationSettings' | 'settings',
    data: Record<string, unknown>
  ): Promise<IOrganizationDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return null;
    const setPayload: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined) {
        setPayload[`${section}.${key}`] = val;
      }
    }
    if (Object.keys(setPayload).length === 0) {
      return await Organization.findById(id);
    }
    return await Organization.findByIdAndUpdate(id, { $set: setPayload }, { new: true });
  }

  async updateSettings(
    id: string | mongoose.Types.ObjectId,
    settings: Partial<IOrganizationDocument['settings']>
  ): Promise<IOrganizationDocument | null> {
    return this.updateNestedSection(id, 'settings', settings as Record<string, unknown>);
  }

  async updateStatutory(
    id: string | mongoose.Types.ObjectId,
    statutory: Partial<IOrganizationDocument['statutory']>
  ): Promise<IOrganizationDocument | null> {
    return this.updateNestedSection(id, 'statutory', statutory as Record<string, unknown>);
  }
}

export const organizationRepository = new OrganizationRepository();
