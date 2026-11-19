import mongoose from 'mongoose';
import {
  ProjectApproval,
  IProjectApprovalDocument,
  ApprovalEntityType,
} from '@/server/database/models/ProjectApproval';
import {
  ProjectBudgetEntry,
  IProjectBudgetEntryDocument,
} from '@/server/database/models/ProjectBudgetEntry';
import {
  ProjectDocument,
  IProjectDocumentRecord,
} from '@/server/database/models/ProjectDocument';
import {
  ProjectRisk,
  IProjectRiskDocument,
} from '@/server/database/models/ProjectRisk';
import connectToDatabase from '@/server/database/connection';

export class ProjectOperationsRepository {
  // ---- Approvals ----
  async findApprovalsByEntity(
    organizationId: string,
    entityType: ApprovalEntityType,
    entityId: string
  ): Promise<IProjectApprovalDocument[]> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(organizationId) || !mongoose.Types.ObjectId.isValid(entityId)) {
      return [];
    }
    return await ProjectApproval.find({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      entityType,
      entityId: new mongoose.Types.ObjectId(entityId),
    })
      .populate('submittedBy', 'name email role')
      .populate('assignedApproverId', 'name email role')
      .populate('decidedBy', 'name email role')
      .sort({ createdAt: -1 });
  }

  async findApprovalById(
    approvalId: string,
    organizationId: string
  ): Promise<IProjectApprovalDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(approvalId) || !mongoose.Types.ObjectId.isValid(organizationId)) {
      return null;
    }
    return await ProjectApproval.findOne({
      _id: new mongoose.Types.ObjectId(approvalId),
      organizationId: new mongoose.Types.ObjectId(organizationId),
    })
      .populate('submittedBy', 'name email role')
      .populate('assignedApproverId', 'name email role');
  }

  async createApproval(data: Partial<IProjectApprovalDocument>): Promise<IProjectApprovalDocument> {
    await connectToDatabase();
    return await ProjectApproval.create(data);
  }

  async updateApproval(
    approvalId: string,
    organizationId: string,
    updates: Record<string, unknown>
  ): Promise<IProjectApprovalDocument | null> {
    await connectToDatabase();
    return await ProjectApproval.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(approvalId),
        organizationId: new mongoose.Types.ObjectId(organizationId),
      },
      updates,
      { new: true }
    )
      .populate('submittedBy', 'name email role')
      .populate('assignedApproverId', 'name email role')
      .populate('decidedBy', 'name email role');
  }

  // ---- Budget Entries ----
  async findBudgetEntries(
    organizationId: string,
    projectId: string
  ): Promise<IProjectBudgetEntryDocument[]> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(organizationId) || !mongoose.Types.ObjectId.isValid(projectId)) {
      return [];
    }
    return await ProjectBudgetEntry.find({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      projectId: new mongoose.Types.ObjectId(projectId),
    })
      .populate('recordedBy', 'name email')
      .sort({ createdAt: -1 });
  }

  async createBudgetEntry(data: Partial<IProjectBudgetEntryDocument>): Promise<IProjectBudgetEntryDocument> {
    await connectToDatabase();
    return await ProjectBudgetEntry.create(data);
  }

  async updateBudgetEntry(
    entryId: string,
    organizationId: string,
    projectId: string,
    updates: Partial<IProjectBudgetEntryDocument>
  ): Promise<IProjectBudgetEntryDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(entryId)) return null;
    return await ProjectBudgetEntry.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(entryId),
        organizationId: new mongoose.Types.ObjectId(organizationId),
        projectId: new mongoose.Types.ObjectId(projectId),
      },
      { $set: updates },
      { new: true }
    );
  }

  async deleteBudgetEntry(entryId: string, organizationId: string, projectId: string): Promise<boolean> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(entryId)) return false;
    const res = await ProjectBudgetEntry.deleteOne({
      _id: new mongoose.Types.ObjectId(entryId),
      organizationId: new mongoose.Types.ObjectId(organizationId),
      projectId: new mongoose.Types.ObjectId(projectId),
    });
    return (res.deletedCount || 0) > 0;
  }

  // ---- Documents ----
  async findDocuments(
    organizationId: string,
    projectId: string
  ): Promise<IProjectDocumentRecord[]> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(organizationId) || !mongoose.Types.ObjectId.isValid(projectId)) {
      return [];
    }
    return await ProjectDocument.find({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      projectId: new mongoose.Types.ObjectId(projectId),
    })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
  }

  async findDocumentById(
    documentId: string,
    organizationId: string,
    projectId: string
  ): Promise<IProjectDocumentRecord | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(documentId)) return null;
    return await ProjectDocument.findOne({
      _id: new mongoose.Types.ObjectId(documentId),
      organizationId: new mongoose.Types.ObjectId(organizationId),
      projectId: new mongoose.Types.ObjectId(projectId),
    });
  }

  async createDocument(data: Partial<IProjectDocumentRecord>): Promise<IProjectDocumentRecord> {
    await connectToDatabase();
    return await ProjectDocument.create(data);
  }

  async deleteDocument(documentId: string, organizationId: string, projectId: string): Promise<boolean> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(documentId)) return false;
    const res = await ProjectDocument.deleteOne({
      _id: new mongoose.Types.ObjectId(documentId),
      organizationId: new mongoose.Types.ObjectId(organizationId),
      projectId: new mongoose.Types.ObjectId(projectId),
    });
    return (res.deletedCount || 0) > 0;
  }

  // ---- Risks ----
  async findRisks(organizationId: string, projectId: string): Promise<IProjectRiskDocument[]> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(organizationId) || !mongoose.Types.ObjectId.isValid(projectId)) {
      return [];
    }
    return await ProjectRisk.find({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      projectId: new mongoose.Types.ObjectId(projectId),
    })
      .populate('ownerUserId', 'name email')
      .sort({ createdAt: -1 });
  }

  async createRisk(data: Partial<IProjectRiskDocument>): Promise<IProjectRiskDocument> {
    await connectToDatabase();
    return await ProjectRisk.create(data);
  }

  async updateRisk(
    riskId: string,
    organizationId: string,
    projectId: string,
    updates: Partial<IProjectRiskDocument>
  ): Promise<IProjectRiskDocument | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(riskId)) return null;
    return await ProjectRisk.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(riskId),
        organizationId: new mongoose.Types.ObjectId(organizationId),
        projectId: new mongoose.Types.ObjectId(projectId),
      },
      { $set: updates },
      { new: true }
    ).populate('ownerUserId', 'name email');
  }

  async deleteRisk(riskId: string, organizationId: string, projectId: string): Promise<boolean> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(riskId)) return false;
    const res = await ProjectRisk.deleteOne({
      _id: new mongoose.Types.ObjectId(riskId),
      organizationId: new mongoose.Types.ObjectId(organizationId),
      projectId: new mongoose.Types.ObjectId(projectId),
    });
    return (res.deletedCount || 0) > 0;
  }
}

export const projectOperationsRepository = new ProjectOperationsRepository();
