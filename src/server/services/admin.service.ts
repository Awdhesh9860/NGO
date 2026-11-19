import mongoose from 'mongoose';
import { userRepository, UserFilterOptions } from '@/server/repositories/user.repository';
import { departmentRepository, DepartmentFilterOptions } from '@/server/repositories/department.repository';
import { invitationRepository, InvitationFilterOptions } from '@/server/repositories/invitation.repository';
import { auditRepository, AuditLogFilterOptions } from '@/server/repositories/audit.repository';
import { organizationRepository } from '@/server/repositories/organization.repository';
import { roleRepository } from '@/server/repositories/role.repository';
import { User, IUserDocument } from '@/server/database/models/User';
import { IDepartmentDocument } from '@/server/database/models/Department';
import { IInvitationDocument } from '@/server/database/models/Invitation';
import { IAuditLogDocument } from '@/server/database/models/AuditLog';
import { IOrganizationDocument } from '@/server/database/models/Organization';
import { IRoleDocument } from '@/server/database/models/Role';
import { NodemailerProvider } from '@/integrations/email/nodemailer.provider';
import { generateCryptoToken, hashToken } from '@/server/security/tokens';
import { hashPassword } from '@/server/security/password';
import {
  NotFoundError,
  ConflictError,
  AuthorizationError,
  ValidationError,
  AppError,
} from '@/lib/error-handler';
import { UserRole } from '@/types';
import {
  CreateUserInput,
  UpdateUserInput,
  CreateDepartmentInput,
  UpdateDepartmentInput,
  CreateInvitationInput,
  UpdateOrganizationInput,
  CreateRoleInput,
  UpdateRoleInput,
} from '@/features/admin/schemas/admin.schema';
import connectToDatabase from '@/server/database/connection';

export interface AdminActor {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  ipAddress?: string;
  userAgent?: string;
}

export function toAdminActor(
  user: { _id: mongoose.Types.ObjectId | string; name: string; email: string; role: UserRole; organizationId: mongoose.Types.ObjectId | string },
  req?: { headers: { get: (name: string) => string | null } }
): AdminActor {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId.toString(),
    ipAddress: req?.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1',
    userAgent: req?.headers.get('user-agent') || 'Unknown',
  };
}

export class AdminService {
  private emailProvider: NodemailerProvider;

  constructor() {
    this.emailProvider = new NodemailerProvider();
  }

  // ==========================================
  // AUDIT LOGGING HELPER
  // ==========================================
  async logAudit(
    actor: AdminActor,
    action: string,
    resource: string,
    resourceId?: string,
    details?: string
  ): Promise<IAuditLogDocument> {
    return await auditRepository.create({
      organizationId: new mongoose.Types.ObjectId(actor.organizationId),
      actorId: new mongoose.Types.ObjectId(actor.id),
      actorName: actor.name,
      actorRole: actor.role,
      action,
      resource,
      resourceId,
      details,
      ipAddress: actor.ipAddress || '127.0.0.1',
      userAgent: actor.userAgent || 'Unknown',
      timestamp: new Date(),
    });
  }

  // ==========================================
  // USER MANAGEMENT
  // ==========================================
  async getUsers(
    organizationId: string,
    filter: UserFilterOptions = {},
    pagination: { page?: number; limit?: number } = {}
  ): Promise<{ users: IUserDocument[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(100, Math.max(1, pagination.limit || 20));

    const [users, total] = await Promise.all([
      userRepository.findMany(organizationId, filter, { page, limit, sort: { createdAt: -1 } }),
      userRepository.count(organizationId, filter),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getUserById(id: string, organizationId: string): Promise<IUserDocument> {
    const user = await userRepository.findById(id);
    if (!user || user.organizationId.toString() !== organizationId) {
      throw new NotFoundError('User not found in this organization');
    }
    return user;
  }

  async createUser(organizationId: string, input: CreateUserInput, actor: AdminActor): Promise<IUserDocument> {
    // 1. Check privilege escalation
    if (input.role === 'SUPER_ADMIN' && actor.role !== 'SUPER_ADMIN') {
      throw new AuthorizationError('Only Super Administrators can create or grant Super Administrator roles');
    }

    // 2. Check for duplicate email in this organization
    const existing = await userRepository.findByEmail(input.email, organizationId);
    if (existing) {
      throw new ConflictError(`A user with email "${input.email}" already exists in this organization`);
    }

    // 3. Verify department if provided
    if (input.departmentId) {
      const dept = await departmentRepository.findById(input.departmentId, organizationId);
      if (!dept) {
        throw new ValidationError('Assigned department does not exist in this organization');
      }
    }

    // 4. Default password generation if not explicitly provided
    const plainPassword = input.password || generateCryptoToken(8);
    const passwordHash = await hashPassword(plainPassword);

    const created = await userRepository.create({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      name: input.name,
      email: input.email.toLowerCase().trim(),
      passwordHash,
      role: input.role,
      departmentId: input.departmentId ? new mongoose.Types.ObjectId(input.departmentId) : undefined,
      phone: input.phone || undefined,
      designation: input.designation || undefined,
      status: input.status || 'active',
      isEmailVerified: true, // Created by admin directly
      emailVerifiedAt: new Date(),
      twoFactor: { enabled: false },
    });

    await this.logAudit(
      actor,
      'USER_CREATE',
      'User',
      created._id.toString(),
      `Created user ${created.name} (${created.email}) with role ${created.role}`
    );

    return created;
  }

  async updateUser(
    id: string,
    organizationId: string,
    updates: UpdateUserInput,
    actor: AdminActor
  ): Promise<IUserDocument> {
    const targetUser = await this.getUserById(id, organizationId);

    // 1. Prevent privilege escalation
    if (updates.role && updates.role === 'SUPER_ADMIN' && actor.role !== 'SUPER_ADMIN') {
      throw new AuthorizationError('Only Super Administrators can assign the Super Administrator role');
    }

    if (targetUser.role === 'SUPER_ADMIN' && actor.role !== 'SUPER_ADMIN' && actor.id !== targetUser._id.toString()) {
      throw new AuthorizationError('You do not have permission to modify a Super Administrator account');
    }

    // 2. Protect last active administrator:
    const isTargetAdmin = targetUser.role === 'SUPER_ADMIN' || targetUser.role === 'ADMIN';
    const isDemotingAdmin = updates.role && !['SUPER_ADMIN', 'ADMIN'].includes(updates.role);
    const isDeactivatingAdmin = updates.status && updates.status !== 'active';

    if (isTargetAdmin && (isDemotingAdmin || isDeactivatingAdmin)) {
      const activeAdminCount = await userRepository.countActiveAdmins(organizationId);
      if (activeAdminCount <= 1) {
        throw new AppError(
          'Cannot demote or suspend the last active administrator of the organization',
          400,
          'LAST_ADMIN_PROTECTED'
        );
      }
    }

    // 3. Verify department if changing
    if (updates.departmentId !== undefined) {
      if (updates.departmentId) {
        const dept = await departmentRepository.findById(updates.departmentId, organizationId);
        if (!dept) {
          throw new ValidationError('Assigned department does not exist in this organization');
        }
      }
    }

    const payload: Partial<IUserDocument> = { ...updates } as unknown as Partial<IUserDocument>;
    if (updates.departmentId === null) {
      payload.departmentId = undefined;
    } else if (updates.departmentId) {
      payload.departmentId = new mongoose.Types.ObjectId(updates.departmentId);
    }

    const updated = await userRepository.update(id, payload);
    if (!updated) {
      throw new NotFoundError('User not found');
    }

    await this.logAudit(
      actor,
      'USER_UPDATE',
      'User',
      updated._id.toString(),
      `Updated user ${updated.name} (${updated.email}). Fields: ${Object.keys(updates).join(', ')}`
    );

    return updated;
  }

  async deactivateUser(id: string, organizationId: string, actor: AdminActor): Promise<IUserDocument> {
    const targetUser = await this.getUserById(id, organizationId);

    // Cannot deactivate yourself directly through this method
    if (actor.id === targetUser._id.toString()) {
      throw new ValidationError('You cannot deactivate your own active account');
    }

    // Check last active admin
    if (targetUser.role === 'SUPER_ADMIN' || targetUser.role === 'ADMIN') {
      const activeAdminCount = await userRepository.countActiveAdmins(organizationId);
      if (activeAdminCount <= 1) {
        throw new AppError(
          'Cannot suspend or deactivate the last active administrator of the organization',
          400,
          'LAST_ADMIN_PROTECTED'
        );
      }
    }

    const updated = await userRepository.update(id, { status: 'suspended' });
    if (!updated) {
      throw new NotFoundError('User not found');
    }

    await this.logAudit(
      actor,
      'USER_SUSPEND',
      'User',
      updated._id.toString(),
      `Suspended account access for ${updated.name} (${updated.email})`
    );

    return updated;
  }

  // ==========================================
  // DEPARTMENT MANAGEMENT
  // ==========================================
  async getDepartments(
    organizationId: string,
    filter: DepartmentFilterOptions = {},
    pagination: { page?: number; limit?: number } = {}
  ): Promise<{ departments: IDepartmentDocument[]; total: number }> {
    const [departments, total] = await Promise.all([
      departmentRepository.findMany(organizationId, filter, pagination),
      departmentRepository.count(organizationId, filter),
    ]);
    return { departments, total };
  }

  async getDepartmentById(id: string, organizationId: string): Promise<IDepartmentDocument> {
    const dept = await departmentRepository.findById(id, organizationId);
    if (!dept) {
      throw new NotFoundError('Department not found in this organization');
    }
    return dept;
  }

  async createDepartment(
    organizationId: string,
    input: CreateDepartmentInput,
    actor: AdminActor
  ): Promise<IDepartmentDocument> {
    const existing = await departmentRepository.findBySlug(input.slug, organizationId);
    if (existing) {
      throw new ConflictError(`Department with slug "${input.slug}" already exists in this organization`);
    }

    let headUserId: mongoose.Types.ObjectId | undefined = undefined;
    if (input.headUserId) {
      const headUser = await userRepository.findById(input.headUserId);
      if (!headUser || headUser.organizationId.toString() !== organizationId) {
        throw new ValidationError('Designated department head does not belong to this organization');
      }
      headUserId = new mongoose.Types.ObjectId(input.headUserId);
    }

    const dept = await departmentRepository.create({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      name: input.name,
      slug: input.slug.toLowerCase().trim(),
      description: input.description,
      headUserId,
      budget: input.budget || 0,
      status: input.status || 'active',
    });

    await this.logAudit(
      actor,
      'DEPARTMENT_CREATE',
      'Department',
      dept._id.toString(),
      `Created department "${dept.name}" (${dept.slug})`
    );

    return dept;
  }

  async updateDepartment(
    id: string,
    organizationId: string,
    updates: UpdateDepartmentInput,
    actor: AdminActor
  ): Promise<IDepartmentDocument> {
    await this.getDepartmentById(id, organizationId);

    if (updates.slug) {
      const existing = await departmentRepository.findBySlug(updates.slug, organizationId);
      if (existing && existing._id.toString() !== id) {
        throw new ConflictError(`Department slug "${updates.slug}" is already in use`);
      }
    }

    const payload: Partial<IDepartmentDocument> = { ...updates } as unknown as Partial<IDepartmentDocument>;
    if (updates.headUserId !== undefined) {
      if (updates.headUserId) {
        const head = await userRepository.findById(updates.headUserId);
        if (!head || head.organizationId.toString() !== organizationId) {
          throw new ValidationError('Department head user not found in this organization');
        }
        payload.headUserId = new mongoose.Types.ObjectId(updates.headUserId);
      } else {
        payload.headUserId = undefined;
      }
    }

    const updated = await departmentRepository.update(id, organizationId, payload);
    if (!updated) {
      throw new NotFoundError('Department not found');
    }

    await this.logAudit(
      actor,
      'DEPARTMENT_UPDATE',
      'Department',
      updated._id.toString(),
      `Updated department "${updated.name}"`
    );

    return updated;
  }

  async deleteDepartment(id: string, organizationId: string, actor: AdminActor): Promise<boolean> {
    const dept = await this.getDepartmentById(id, organizationId);

    // Unassign members assigned to this department
    await connectToDatabase();
    await User.updateMany(
      { organizationId: new mongoose.Types.ObjectId(organizationId), departmentId: new mongoose.Types.ObjectId(id) },
      { $unset: { departmentId: 1 } }
    );

    const deleted = await departmentRepository.delete(id, organizationId);
    if (deleted) {
      await this.logAudit(
        actor,
        'DEPARTMENT_DELETE',
        'Department',
        id,
        `Deleted department "${dept.name}" (${dept.slug}) and unassigned members`
      );
    }
    return deleted;
  }

  // ==========================================
  // INVITATION MANAGEMENT
  // ==========================================
  async getInvitations(
    organizationId: string,
    filter: InvitationFilterOptions = {},
    pagination: { page?: number; limit?: number } = {}
  ): Promise<{ invitations: IInvitationDocument[]; total: number }> {
    const [invitations, total] = await Promise.all([
      invitationRepository.findMany(organizationId, filter, pagination),
      invitationRepository.count(organizationId, filter),
    ]);
    return { invitations, total };
  }

  async sendInvitation(
    organizationId: string,
    input: CreateInvitationInput,
    actor: AdminActor
  ): Promise<{ invitation: IInvitationDocument; rawToken: string }> {
    // 1. Privilege escalation check
    if (input.role === 'SUPER_ADMIN' && actor.role !== 'SUPER_ADMIN') {
      throw new AuthorizationError('Only Super Administrators can invite users with the Super Administrator role');
    }

    // 2. Check if user already exists
    const existingUser = await userRepository.findByEmail(input.email, organizationId);
    if (existingUser) {
      throw new ConflictError(`A registered user with email "${input.email}" already exists in this organization`);
    }

    // 3. Department validation
    let departmentId: mongoose.Types.ObjectId | undefined = undefined;
    if (input.departmentId) {
      const dept = await departmentRepository.findById(input.departmentId, organizationId);
      if (!dept) {
        throw new ValidationError('Department specified in invitation does not exist');
      }
      departmentId = new mongoose.Types.ObjectId(input.departmentId);
    }

    // 4. Revoke any previous pending invitations for this email
    const pendingInvites = await invitationRepository.findMany(organizationId, {
      search: input.email,
      status: 'pending',
    });
    for (const inv of pendingInvites) {
      if (inv.email === input.email.toLowerCase()) {
        await invitationRepository.updateStatus(inv._id.toString(), 'revoked');
      }
    }

    // 5. Generate secure token
    const rawToken = generateCryptoToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await invitationRepository.create({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      email: input.email.toLowerCase().trim(),
      role: input.role,
      departmentId,
      tokenHash,
      invitedBy: new mongoose.Types.ObjectId(actor.id),
      expiresAt,
      status: 'pending',
    });

    // 6. Send invitation email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const acceptUrl = `${appUrl}/register?invitation=${rawToken}&email=${encodeURIComponent(input.email)}`;

    await this.emailProvider.sendEmail({
      to: input.email,
      subject: `You have been invited to join the HopeHorizon / Vikas NGO Platform`,
      textContent: `Hello,\n\nYou have been invited by ${actor.name} to join HopeHorizon NGO as a ${input.role}.\n\nPlease accept your invitation and activate your account by visiting the link below:\n${acceptUrl}\n\nThis invitation expires in 7 days.\n\nWarm regards,\nHopeHorizon Foundation Team`,
      htmlContent: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E5E7EB; border-radius: 8px;">
          <h2 style="color: #087F5B; margin-top: 0;">Welcome to HopeHorizon NGO</h2>
          <p>Hello,</p>
          <p><strong>${actor.name}</strong> has invited you to join the organization as <strong>${input.role}</strong>.</p>
          <p style="margin: 24px 0;">
            <a href="${acceptUrl}" style="background-color: #087F5B; color: #FFFFFF; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Accept Invitation & Activate Account</a>
          </p>
          <p style="color: #6B7280; font-size: 14px;">This invitation link will expire in 7 days. If you did not expect this invitation, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
          <p style="color: #9CA3AF; font-size: 12px;">HopeHorizon Foundation &bull; Vikas NGO Ecosystem</p>
        </div>
      `,
    });

    await this.logAudit(
      actor,
      'INVITATION_SEND',
      'Invitation',
      invitation._id.toString(),
      `Sent invitation to ${input.email} for role ${input.role}`
    );

    return { invitation, rawToken };
  }

  async revokeInvitation(id: string, organizationId: string, actor: AdminActor): Promise<IInvitationDocument> {
    const revoked = await invitationRepository.revoke(id, organizationId);
    if (!revoked) {
      throw new NotFoundError('Pending invitation not found to revoke');
    }

    await this.logAudit(
      actor,
      'INVITATION_REVOKE',
      'Invitation',
      id,
      `Revoked invitation for ${revoked.email}`
    );

    return revoked;
  }

  // ==========================================
  // ROLE & PERMISSIONS MANAGEMENT
  // ==========================================
  async getRoles(organizationId: string): Promise<IRoleDocument[]> {
    return await roleRepository.findMany(organizationId);
  }

  async createRole(organizationId: string, input: CreateRoleInput, actor: AdminActor): Promise<IRoleDocument> {
    const existing = await roleRepository.findByKey(input.key, organizationId);
    if (existing) {
      throw new ConflictError(`A role with key "${input.key}" already exists in this organization`);
    }

    const role = await roleRepository.create({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      name: input.name,
      key: input.key.toUpperCase().trim(),
      description: input.description,
      permissions: input.permissions,
      isSystemRole: false,
      status: 'active',
    });

    await this.logAudit(
      actor,
      'ROLE_CREATE',
      'Role',
      role._id.toString(),
      `Created custom role "${role.name}" (${role.key}) with ${role.permissions.length} permissions`
    );

    return role;
  }

  async updateRole(
    id: string,
    organizationId: string,
    updates: UpdateRoleInput,
    actor: AdminActor
  ): Promise<IRoleDocument> {
    const existing = await roleRepository.findById(id, organizationId);
    if (!existing) {
      throw new NotFoundError('Role not found');
    }

    if (existing.isSystemRole) {
      throw new AuthorizationError('System predefined roles cannot be modified');
    }

    const rolePayload: Partial<IRoleDocument> = {
      ...(updates.name && { name: updates.name }),
      ...(updates.description !== undefined && { description: updates.description || undefined }),
      ...(updates.permissions && { permissions: updates.permissions }),
      ...(updates.status && { status: updates.status }),
    };

    const updated = await roleRepository.update(id, organizationId, rolePayload);
    if (!updated) {
      throw new NotFoundError('Role not found or could not be updated');
    }

    await this.logAudit(
      actor,
      'ROLE_UPDATE',
      'Role',
      id,
      `Updated custom role "${updated.name}"`
    );

    return updated;
  }

  // ==========================================
  // ORGANIZATION PROFILE & SETTINGS
  // ==========================================
  async getOrganization(organizationId: string): Promise<IOrganizationDocument> {
    const org = await organizationRepository.findById(organizationId);
    if (!org) {
      throw new NotFoundError('Organization not found');
    }
    return org;
  }

  async updateOrganization(
    organizationId: string,
    updates: UpdateOrganizationInput,
    actor: AdminActor
  ): Promise<IOrganizationDocument> {
    const org = await this.getOrganization(organizationId);

    const updatePayload: Partial<IOrganizationDocument> = {};
    if (updates.name) updatePayload.name = updates.name;
    if (updates.logo !== undefined) updatePayload.logo = updates.logo || undefined;
    if (updates.contactEmail) updatePayload.contactEmail = updates.contactEmail;
    if (updates.contactPhone !== undefined) updatePayload.contactPhone = updates.contactPhone || undefined;
    if (updates.headquartersAddress !== undefined) updatePayload.headquartersAddress = updates.headquartersAddress || undefined;

    if (updates.statutory) {
      await organizationRepository.updateStatutory(organizationId, {
        panNumber: updates.statutory.panNumber || undefined,
        section80GNumber: updates.statutory.section80GNumber || undefined,
        section12ANumber: updates.statutory.section12ANumber || undefined,
        fcraNumber: updates.statutory.fcraNumber || undefined,
        darpanId: updates.statutory.darpanId || undefined,
        taxExemptionPercentage: updates.statutory.taxExemptionPercentage,
      });
    }

    if (updates.settings) {
      await organizationRepository.updateSettings(organizationId, updates.settings);
    }

    const updated = await organizationRepository.update(organizationId, updatePayload);
    if (!updated) {
      throw new NotFoundError('Organization not found');
    }

    await this.logAudit(
      actor,
      'ORGANIZATION_UPDATE',
      'Organization',
      organizationId,
      `Updated organization profile and statutory settings`
    );

    return updated;
  }

  // ==========================================
  // AUDIT LOGS RETRIEVAL
  // ==========================================
  async getAuditLogs(
    organizationId: string,
    filter: AuditLogFilterOptions = {},
    pagination: { page?: number; limit?: number } = {}
  ): Promise<{ logs: IAuditLogDocument[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(100, Math.max(1, pagination.limit || 25));

    const [logs, total] = await Promise.all([
      auditRepository.findMany(organizationId, filter, { page, limit, sort: { timestamp: -1 } }),
      auditRepository.count(organizationId, filter),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  // ==========================================
  // EXECUTIVE DASHBOARD STATISTICS
  // ==========================================
  async getExecutiveStats(organizationId: string): Promise<{
    userMetrics: {
      total: number;
      active: number;
      suspended: number;
      byRole: Record<string, number>;
    };
    organizationMetrics: {
      departmentCount: number;
      pendingInvitationsCount: number;
      recentAuditCount: number;
    };
    recentActivity: IAuditLogDocument[];
  }> {
    await connectToDatabase();
    const orgObjId = new mongoose.Types.ObjectId(organizationId);

    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      usersGroupedByRole,
      departmentCount,
      pendingInvitationsCount,
      recentAuditLogs,
    ] = await Promise.all([
      User.countDocuments({ organizationId: orgObjId }),
      User.countDocuments({ organizationId: orgObjId, status: 'active' }),
      User.countDocuments({ organizationId: orgObjId, status: 'suspended' }),
      User.aggregate([
        { $match: { organizationId: orgObjId } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
      departmentRepository.count(organizationId),
      invitationRepository.count(organizationId, { status: 'pending' }),
      auditRepository.findMany(organizationId, {}, { page: 1, limit: 10, sort: { timestamp: -1 } }),
    ]);

    const byRole: Record<string, number> = {};
    usersGroupedByRole.forEach((item: { _id: string; count: number }) => {
      if (item._id) {
        byRole[item._id] = item.count;
      }
    });

    return {
      userMetrics: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers,
        byRole,
      },
      organizationMetrics: {
        departmentCount,
        pendingInvitationsCount,
        recentAuditCount: recentAuditLogs.length,
      },
      recentActivity: recentAuditLogs,
    };
  }
}

export const adminService = new AdminService();
