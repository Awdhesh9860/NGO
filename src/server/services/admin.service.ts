import crypto from 'crypto';
import mongoose from 'mongoose';
import { userRepository, UserFilterOptions } from '@/server/repositories/user.repository';
import { departmentRepository, DepartmentFilterOptions } from '@/server/repositories/department.repository';
import { invitationRepository, InvitationFilterOptions } from '@/server/repositories/invitation.repository';
import { auditRepository, AuditLogFilterOptions } from '@/server/repositories/audit.repository';
import { organizationRepository } from '@/server/repositories/organization.repository';
import { roleRepository } from '@/server/repositories/role.repository';
import { User, IUserDocument } from '@/server/database/models/User';
import { Department, IDepartmentDocument } from '@/server/database/models/Department';
import { Invitation, IInvitationDocument } from '@/server/database/models/Invitation';
import { IAuditLogDocument } from '@/server/database/models/AuditLog';
import { IOrganizationDocument } from '@/server/database/models/Organization';
import { IRoleDocument } from '@/server/database/models/Role';
import { Session } from '@/server/database/models/Session';
import { emailProvider } from '@/integrations/email/nodemailer.provider';
import {
  renderInvitationEmail,
  renderAccountStatusEmail,
  renderRoleChangedEmail,
} from '@/integrations/email/templates';
import { generateCryptoToken, hashToken } from '@/server/security/tokens';
import { hashPassword } from '@/server/security/password';
import { getUserSessions, revokeSession, revokeAllUserSessions } from '@/server/auth/session';
import { PLATFORM_PROTECTED_PERMISSIONS, ROLE_PERMISSIONS } from '@/server/authorization/permissions';
import {
  NotFoundError,
  ConflictError,
  AuthorizationError,
  ValidationError,
  AppError,
} from '@/lib/error-handler';
import { UserRole, PermissionKey } from '@/types';
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
  correlationId?: string;
}

const SENSITIVE_AUDIT_KEYS = new Set([
  'password',
  'passwordhash',
  'otp',
  'otphash',
  'token',
  'rawtoken',
  'tokenhash',
  'secret',
  'backupcodes',
  'apikey',
  'authorization',
  'cookie',
  'paymentsecret',
  'pannumber',
]);

/**
 * Strips any sensitive fields recursively before persisting audit metadata.
 */
export function sanitizeAuditMetadata(
  input?: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!input) return undefined;
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (SENSITIVE_AUDIT_KEYS.has(key.toLowerCase())) {
      continue;
    }
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      clean[key] = sanitizeAuditMetadata(value as Record<string, unknown>);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

export function toAdminActor(
  user: {
    _id: mongoose.Types.ObjectId | string;
    name: string;
    email: string;
    role: UserRole;
    organizationId: mongoose.Types.ObjectId | string;
  },
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
    correlationId: req?.headers.get('x-request-id') || crypto.randomUUID(),
  };
}

export class AdminService {
  // ==========================================
  // AUDIT LOGGING HELPER (IMMUTABLE)
  // ==========================================
  async logAudit(
    actor: AdminActor,
    action: string,
    resource: string,
    resourceId?: string,
    details?: string,
    metadata?: Record<string, unknown>
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
      metadata: sanitizeAuditMetadata(metadata),
      correlationId: actor.correlationId || crypto.randomUUID(),
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
    pagination: { page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' } = {}
  ): Promise<{ users: IUserDocument[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(100, Math.max(1, pagination.limit || 20));

    const allowedSortFields = new Set(['name', 'email', 'role', 'status', 'lastLoginAt', 'createdAt']);
    const sortField = pagination.sortBy && allowedSortFields.has(pagination.sortBy) ? pagination.sortBy : 'createdAt';
    const sortDir: 1 | -1 = pagination.sortOrder === 'asc' ? 1 : -1;

    const [users, total] = await Promise.all([
      userRepository.findMany(organizationId, filter, { page, limit, sort: { [sortField]: sortDir } }),
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

    // 4. Verify manager if provided (same tenant)
    if (input.managerId) {
      const mgr = await userRepository.findById(input.managerId);
      if (!mgr || mgr.organizationId.toString() !== organizationId) {
        throw new ValidationError('Assigned manager does not exist in this organization');
      }
    }

    // 5. Verify custom role if provided (same tenant)
    if (input.customRoleId) {
      const customRole = await roleRepository.findById(input.customRoleId, organizationId);
      if (!customRole || customRole.status !== 'active') {
        throw new ValidationError('Assigned custom role does not exist or is inactive');
      }
    }

    // 6. Default password generation if not explicitly provided
    const plainPassword = input.password || generateCryptoToken(8);
    const passwordHash = await hashPassword(plainPassword);

    const created = await userRepository.create({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      name: input.name,
      email: input.email.toLowerCase().trim(),
      passwordHash,
      role: input.role,
      customRoleId: input.customRoleId ? new mongoose.Types.ObjectId(input.customRoleId) : undefined,
      departmentId: input.departmentId ? new mongoose.Types.ObjectId(input.departmentId) : undefined,
      managerId: input.managerId ? new mongoose.Types.ObjectId(input.managerId) : undefined,
      phone: input.phone || undefined,
      designation: input.designation || undefined,
      status: input.status || 'active',
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      twoFactor: { enabled: false },
    });

    await this.logAudit(
      actor,
      'USER_CREATE',
      'User',
      created._id.toString(),
      `Created user ${created.name} (${created.email}) with role ${created.role}`,
      { role: created.role, status: created.status }
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
    const previousRole = targetUser.role;
    const previousStatus = targetUser.status;

    // 1. Prevent privilege escalation & self-SUPER_ADMIN elevation
    if (updates.role && updates.role === 'SUPER_ADMIN' && actor.role !== 'SUPER_ADMIN') {
      throw new AuthorizationError('Only Super Administrators can assign the Super Administrator role');
    }

    if (actor.id === targetUser._id.toString() && updates.role === 'SUPER_ADMIN' && actor.role !== 'SUPER_ADMIN') {
      throw new AuthorizationError('Users cannot elevate their own account to Super Administrator');
    }

    if (targetUser.role === 'SUPER_ADMIN' && actor.role !== 'SUPER_ADMIN' && actor.id !== targetUser._id.toString()) {
      throw new AuthorizationError('You do not have permission to modify a Super Administrator account');
    }

    // 2. Protect last active administrator
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
    if (updates.departmentId) {
      const dept = await departmentRepository.findById(updates.departmentId, organizationId);
      if (!dept) {
        throw new ValidationError('Assigned department does not exist in this organization');
      }
    }

    // 4. Verify manager if changing
    if (updates.managerId) {
      if (updates.managerId === id) {
        throw new ValidationError('A user cannot be assigned as their own manager');
      }
      const mgr = await userRepository.findById(updates.managerId);
      if (!mgr || mgr.organizationId.toString() !== organizationId) {
        throw new ValidationError('Assigned manager does not exist in this organization');
      }
    }

    // 5. Verify custom role if changing
    if (updates.customRoleId) {
      const customRole = await roleRepository.findById(updates.customRoleId, organizationId);
      if (!customRole || customRole.status !== 'active') {
        throw new ValidationError('Assigned custom role does not exist or is inactive');
      }
    }

    const payload: Partial<IUserDocument> = { ...updates } as unknown as Partial<IUserDocument>;
    if (updates.departmentId === null) {
      payload.departmentId = undefined;
    } else if (updates.departmentId) {
      payload.departmentId = new mongoose.Types.ObjectId(updates.departmentId);
    }

    if (updates.managerId === null) {
      payload.managerId = undefined;
    } else if (updates.managerId) {
      payload.managerId = new mongoose.Types.ObjectId(updates.managerId);
    }

    if (updates.customRoleId === null) {
      payload.customRoleId = undefined;
    } else if (updates.customRoleId) {
      payload.customRoleId = new mongoose.Types.ObjectId(updates.customRoleId);
    }

    const updated = await userRepository.update(id, payload);
    if (!updated) {
      throw new NotFoundError('User not found');
    }

    // If user is suspended or deactivated, revoke active sessions immediately
    if (updates.status && updates.status !== 'active' && previousStatus === 'active') {
      await revokeAllUserSessions(id);
    }

    // Audit logging (role change / status change / general update)
    const actionType =
      updates.role && updates.role !== previousRole
        ? 'ROLE_CHANGE'
        : updates.status && updates.status !== previousStatus
        ? updates.status === 'suspended'
          ? 'USER_SUSPEND'
          : 'USER_STATUS_CHANGE'
        : 'USER_UPDATE';

    await this.logAudit(
      actor,
      actionType,
      'User',
      updated._id.toString(),
      `Updated user ${updated.name} (${updated.email}). Fields: ${Object.keys(updates).join(', ')}`,
      {
        changedFields: Object.keys(updates),
        ...(updates.role && updates.role !== previousRole ? { previousRole, newRole: updates.role } : {}),
        ...(updates.status && updates.status !== previousStatus
          ? { previousStatus, newStatus: updates.status }
          : {}),
      }
    );

    // Send email notifications on role or status changes
    const org = await organizationRepository.findById(organizationId);
    const orgName = org?.name || 'HopeHorizon Foundation';
    const sendEmailEnabled = org?.notificationSettings?.emailNotifications !== false;

    if (sendEmailEnabled && updates.role && updates.role !== previousRole) {
      const tpl = renderRoleChangedEmail({
        userName: updated.name,
        previousRole,
        newRole: updates.role,
        changedBy: actor.name,
        organizationName: orgName,
      });
      await emailProvider.sendEmail({
        to: updated.email,
        subject: tpl.subject,
        htmlContent: tpl.html,
        textContent: tpl.text,
      });
    }

    if (sendEmailEnabled && updates.status && updates.status !== previousStatus) {
      const tpl = renderAccountStatusEmail({
        userName: updated.name,
        status: updates.status,
        changedBy: actor.name,
        organizationName: orgName,
      });
      await emailProvider.sendEmail({
        to: updated.email,
        subject: tpl.subject,
        htmlContent: tpl.html,
        textContent: tpl.text,
      });
    }

    return updated;
  }

  async deactivateUser(id: string, organizationId: string, actor: AdminActor): Promise<IUserDocument> {
    const targetUser = await this.getUserById(id, organizationId);

    if (actor.id === targetUser._id.toString()) {
      throw new ValidationError('You cannot deactivate your own active account');
    }

    if (targetUser.role === 'SUPER_ADMIN' && actor.role !== 'SUPER_ADMIN') {
      throw new AuthorizationError('Only Super Administrators can suspend a Super Administrator');
    }

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

    await revokeAllUserSessions(id);

    await this.logAudit(
      actor,
      'USER_SUSPEND',
      'User',
      updated._id.toString(),
      `Suspended account access for ${updated.name} (${updated.email}) and terminated active sessions`
    );

    const org = await organizationRepository.findById(organizationId);
    if (org?.notificationSettings?.emailNotifications !== false) {
      const tpl = renderAccountStatusEmail({
        userName: updated.name,
        status: 'suspended',
        changedBy: actor.name,
        organizationName: org?.name || 'HopeHorizon Foundation',
      });
      await emailProvider.sendEmail({
        to: updated.email,
        subject: tpl.subject,
        htmlContent: tpl.html,
        textContent: tpl.text,
      });
    }

    return updated;
  }

  async getUserActivity(userId: string, organizationId: string, limit = 20): Promise<IAuditLogDocument[]> {
    await this.getUserById(userId, organizationId);
    return await auditRepository.findMany(
      organizationId,
      { actorId: userId },
      { page: 1, limit, sort: { timestamp: -1 } }
    );
  }

  async getUserSessionsForAdmin(userId: string, organizationId: string) {
    await this.getUserById(userId, organizationId);
    await connectToDatabase();
    return await getUserSessions(userId);
  }

  async revokeUserSessionForAdmin(
    userId: string,
    sessionId: string | 'all',
    organizationId: string,
    actor: AdminActor
  ): Promise<{ revokedCount: number }> {
    const targetUser = await this.getUserById(userId, organizationId);
    await connectToDatabase();

    if (sessionId === 'all') {
      const count = await revokeAllUserSessions(userId);
      await this.logAudit(
        actor,
        'USER_SESSIONS_REVOKE_ALL',
        'Session',
        userId,
        `Terminated ${count} active session(s) for ${targetUser.email}`
      );
      return { revokedCount: count };
    }

    // Verify session belongs to target user and organization
    const session = await Session.findOne({
      _id: new mongoose.Types.ObjectId(sessionId),
      userId: new mongoose.Types.ObjectId(userId),
      organizationId: new mongoose.Types.ObjectId(organizationId),
    });
    if (!session) {
      throw new NotFoundError('Active session not found for this user');
    }

    const revoked = await revokeSession(sessionId);
    if (revoked) {
      await this.logAudit(
        actor,
        'USER_SESSION_REVOKE',
        'Session',
        sessionId,
        `Terminated session ${sessionId} for ${targetUser.email}`
      );
    }
    return { revokedCount: revoked ? 1 : 0 };
  }

  // ==========================================
  // DEPARTMENT MANAGEMENT
  // ==========================================
  async getDepartments(
    organizationId: string,
    filter: DepartmentFilterOptions = {},
    pagination: { page?: number; limit?: number } = {}
  ): Promise<{
    departments: Array<IDepartmentDocument & { memberCount?: number }>;
    memberCounts: Record<string, number>;
    total: number;
  }> {
    await connectToDatabase();
    const orgObjId = new mongoose.Types.ObjectId(organizationId);

    const [departments, total, countsAgg] = await Promise.all([
      departmentRepository.findMany(organizationId, filter, pagination),
      departmentRepository.count(organizationId, filter),
      User.aggregate([
        { $match: { organizationId: orgObjId, departmentId: { $exists: true, $ne: null } } },
        { $group: { _id: '$departmentId', count: { $sum: 1 } } },
      ]),
    ]);

    const memberCounts: Record<string, number> = {};
    countsAgg.forEach((entry: { _id: mongoose.Types.ObjectId; count: number }) => {
      if (entry._id) {
        memberCounts[entry._id.toString()] = entry.count;
      }
    });

    return { departments, memberCounts, total };
  }

  async getDepartmentById(id: string, organizationId: string): Promise<IDepartmentDocument> {
    const dept = await departmentRepository.findById(id, organizationId);
    if (!dept) {
      throw new NotFoundError('Department not found in this organization');
    }
    return dept;
  }

  async getDepartmentMembers(departmentId: string, organizationId: string): Promise<IUserDocument[]> {
    await this.getDepartmentById(departmentId, organizationId);
    return await userRepository.findMany(organizationId, { departmentId }, { page: 1, limit: 100 });
  }

  async assignDepartmentMember(
    departmentId: string,
    userId: string,
    organizationId: string,
    actor: AdminActor
  ): Promise<IUserDocument> {
    const dept = await this.getDepartmentById(departmentId, organizationId);
    const user = await this.getUserById(userId, organizationId);

    const updated = await userRepository.update(userId, {
      departmentId: new mongoose.Types.ObjectId(departmentId),
    });
    if (!updated) {
      throw new NotFoundError('User not found');
    }

    await this.logAudit(
      actor,
      'DEPARTMENT_MEMBER_ASSIGN',
      'Department',
      departmentId,
      `Assigned ${user.name} (${user.email}) to department "${dept.name}"`
    );

    return updated;
  }

  async removeDepartmentMember(
    departmentId: string,
    userId: string,
    organizationId: string,
    actor: AdminActor
  ): Promise<IUserDocument> {
    const dept = await this.getDepartmentById(departmentId, organizationId);
    const user = await this.getUserById(userId, organizationId);

    await connectToDatabase();
    await User.updateOne(
      {
        _id: new mongoose.Types.ObjectId(userId),
        organizationId: new mongoose.Types.ObjectId(organizationId),
      },
      { $unset: { departmentId: 1 } }
    );

    const updated = await this.getUserById(userId, organizationId);

    await this.logAudit(
      actor,
      'DEPARTMENT_MEMBER_REMOVE',
      'Department',
      departmentId,
      `Removed ${user.name} (${user.email}) from department "${dept.name}"`
    );

    return updated;
  }

  async getDepartmentActivity(departmentId: string, organizationId: string): Promise<IAuditLogDocument[]> {
    await this.getDepartmentById(departmentId, organizationId);
    const logs = await auditRepository.findMany(
      organizationId,
      { resource: 'Department' },
      { page: 1, limit: 25, sort: { timestamp: -1 } }
    );
    return logs.filter((l) => l.resourceId === departmentId);
  }

  async createDepartment(
    organizationId: string,
    input: CreateDepartmentInput,
    actor: AdminActor
  ): Promise<IDepartmentDocument> {
    const normalizedSlug = input.slug.toLowerCase().trim();
    const existing = await departmentRepository.findBySlug(normalizedSlug, organizationId);
    if (existing) {
      throw new ConflictError(`Department with slug "${normalizedSlug}" already exists in this organization`);
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
      slug: normalizedSlug,
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
    if (input.role === 'SUPER_ADMIN' && actor.role !== 'SUPER_ADMIN') {
      throw new AuthorizationError('Only Super Administrators can invite users with the Super Administrator role');
    }

    const existingUser = await userRepository.findByEmail(input.email, organizationId);
    if (existingUser) {
      throw new ConflictError(`A registered user with email "${input.email}" already exists in this organization`);
    }

    let departmentId: mongoose.Types.ObjectId | undefined = undefined;
    if (input.departmentId) {
      const dept = await departmentRepository.findById(input.departmentId, organizationId);
      if (!dept) {
        throw new ValidationError('Department specified in invitation does not exist');
      }
      departmentId = new mongoose.Types.ObjectId(input.departmentId);
    }

    // Revoke any previous pending invitations for this email
    const pendingInvites = await invitationRepository.findMany(organizationId, {
      search: input.email,
      status: 'pending',
    });
    for (const inv of pendingInvites) {
      if (inv.email === input.email.toLowerCase()) {
        await invitationRepository.updateStatus(inv._id.toString(), 'revoked');
      }
    }

    const org = await organizationRepository.findById(organizationId);
    const expiryDays = input.expiryDays || org?.securitySettings?.invitationExpiryDays || 7;

    const rawToken = generateCryptoToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';
    const invitationUrl = `${appUrl}/register?invitation=${rawToken}&email=${encodeURIComponent(input.email)}`;

    const emailTemplate = renderInvitationEmail({
      inviterName: actor.name,
      role: input.role,
      invitationUrl,
      organizationName: org?.name || 'HopeHorizon Foundation',
    });

    await emailProvider.sendEmail({
      to: input.email,
      subject: emailTemplate.subject,
      htmlContent: emailTemplate.html,
      textContent: emailTemplate.text,
    });

    await this.logAudit(
      actor,
      'INVITATION_SEND',
      'Invitation',
      invitation._id.toString(),
      `Sent invitation to ${input.email} for role ${input.role} (expires in ${expiryDays} days)`,
      { role: input.role, expiryDays }
    );

    return { invitation, rawToken };
  }

  async resendInvitation(
    id: string,
    organizationId: string,
    actor: AdminActor
  ): Promise<{ invitation: IInvitationDocument; rawToken: string }> {
    const existing = await invitationRepository.findById(id, organizationId);
    if (!existing) {
      throw new NotFoundError('Invitation not found in this organization');
    }
    if (existing.status !== 'pending' && existing.status !== 'expired') {
      throw new ValidationError(`Cannot resend an invitation with status "${existing.status}"`);
    }

    const org = await organizationRepository.findById(organizationId);
    const expiryDays = org?.securitySettings?.invitationExpiryDays || 7;

    const rawToken = generateCryptoToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

    await connectToDatabase();
    const updated = await Invitation.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        organizationId: new mongoose.Types.ObjectId(organizationId),
      },
      { $set: { tokenHash, expiresAt, status: 'pending' } },
      { new: true }
    );

    if (!updated) {
      throw new NotFoundError('Invitation not found');
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';
    const invitationUrl = `${appUrl}/register?invitation=${rawToken}&email=${encodeURIComponent(updated.email)}`;

    const emailTemplate = renderInvitationEmail({
      inviterName: actor.name,
      role: updated.role,
      invitationUrl,
      organizationName: org?.name || 'HopeHorizon Foundation',
    });

    await emailProvider.sendEmail({
      to: updated.email,
      subject: emailTemplate.subject,
      htmlContent: emailTemplate.html,
      textContent: emailTemplate.text,
    });

    await this.logAudit(
      actor,
      'INVITATION_RESEND',
      'Invitation',
      updated._id.toString(),
      `Resent invitation to ${updated.email} for role ${updated.role}`
    );

    return { invitation: updated, rawToken };
  }

  async validateInvitationToken(rawToken: string, targetOrganizationId: string): Promise<IInvitationDocument> {
    const tokenHash = hashToken(rawToken);
    const invitation = await invitationRepository.findByTokenHash(tokenHash);
    if (!invitation) {
      throw new NotFoundError('Invitation token is invalid');
    }
    if (invitation.organizationId.toString() !== targetOrganizationId) {
      throw new AuthorizationError('Cross-tenant invitation acceptance is forbidden');
    }
    if (invitation.status !== 'pending') {
      throw new ValidationError(`Invitation is no longer active (status: ${invitation.status})`);
    }
    if (new Date() > invitation.expiresAt) {
      await invitationRepository.updateStatus(invitation._id.toString(), 'expired');
      throw new ValidationError('Invitation token has expired');
    }
    return invitation;
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

  async getRoleById(
    idOrKey: string,
    organizationId: string
  ): Promise<{
    id: string;
    name: string;
    key: string;
    description?: string;
    permissions: string[];
    isSystemRole: boolean;
    status: 'active' | 'inactive';
    assignedUserCount: number;
  }> {
    await connectToDatabase();
    const orgObjId = new mongoose.Types.ObjectId(organizationId);

    // Check if it matches a system role key first
    if (idOrKey in ROLE_PERMISSIONS) {
      const roleKey = idOrKey as UserRole;
      const assignedUserCount = await User.countDocuments({ organizationId: orgObjId, role: roleKey });
      return {
        id: roleKey,
        name: roleKey.replace(/_/g, ' '),
        key: roleKey,
        description: `Built-in system role (${roleKey})`,
        permissions: ROLE_PERMISSIONS[roleKey],
        isSystemRole: true,
        status: 'active',
        assignedUserCount,
      };
    }

    const customRole = await roleRepository.findById(idOrKey, organizationId);
    if (!customRole) {
      throw new NotFoundError('Role not found in this organization');
    }

    const assignedUserCount = await User.countDocuments({
      organizationId: orgObjId,
      customRoleId: customRole._id,
    });

    return {
      id: customRole._id.toString(),
      name: customRole.name,
      key: customRole.key,
      description: customRole.description,
      permissions: customRole.permissions,
      isSystemRole: customRole.isSystemRole,
      status: customRole.status,
      assignedUserCount,
    };
  }

  async createRole(organizationId: string, input: CreateRoleInput, actor: AdminActor): Promise<IRoleDocument> {
    // Prevent custom roles from overriding protected platform-level permissions
    const forbiddenPermissions = input.permissions.filter((p) =>
      PLATFORM_PROTECTED_PERMISSIONS.includes(p as PermissionKey)
    );
    if (forbiddenPermissions.length > 0 && actor.role !== 'SUPER_ADMIN') {
      throw new AuthorizationError(
        `Custom roles cannot include protected platform-level permission(s): ${forbiddenPermissions.join(', ')}`
      );
    }

    const normalizedKey = input.key.toUpperCase().trim();
    if (normalizedKey in ROLE_PERMISSIONS) {
      throw new ConflictError(`Role key "${normalizedKey}" is reserved by a built-in system role`);
    }

    const existing = await roleRepository.findByKey(normalizedKey, organizationId);
    if (existing) {
      throw new ConflictError(`A role with key "${normalizedKey}" already exists in this organization`);
    }

    const role = await roleRepository.create({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      name: input.name,
      key: normalizedKey,
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
      `Created custom role "${role.name}" (${role.key}) with ${role.permissions.length} permissions`,
      { key: role.key, permissions: role.permissions }
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

    if (updates.permissions) {
      const forbiddenPermissions = updates.permissions.filter((p) =>
        PLATFORM_PROTECTED_PERMISSIONS.includes(p as PermissionKey)
      );
      if (forbiddenPermissions.length > 0 && actor.role !== 'SUPER_ADMIN') {
        throw new AuthorizationError(
          `Custom roles cannot include protected platform-level permission(s): ${forbiddenPermissions.join(', ')}`
        );
      }
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
      `Updated custom role "${updated.name}"`,
      { status: updated.status, permissionCount: updated.permissions.length }
    );

    return updated;
  }

  // ==========================================
  // ORGANIZATION PROFILE & SETTINGS
  // ==========================================
  async listOrganizationsForSuperAdmin(actor: AdminActor): Promise<IOrganizationDocument[]> {
    if (actor.role !== 'SUPER_ADMIN') {
      throw new AuthorizationError('Only Super Administrators can list all platform organizations');
    }
    return await organizationRepository.findAll();
  }

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
    await this.getOrganization(organizationId);

    // Restrict tenant lifecycle status and verificationStatus changes to SUPER_ADMIN
    if ((updates.status || updates.verificationStatus) && actor.role !== 'SUPER_ADMIN') {
      throw new AuthorizationError(
        'Only Super Administrators can change organization lifecycle status or verification status'
      );
    }

    const updatePayload: Partial<IOrganizationDocument> = {};
    if (updates.name) updatePayload.name = updates.name;
    if (updates.legalName !== undefined) updatePayload.legalName = updates.legalName || undefined;
    if (updates.logo !== undefined) updatePayload.logo = updates.logo || undefined;
    if (updates.description !== undefined) updatePayload.description = updates.description || undefined;
    if (updates.website !== undefined) updatePayload.website = updates.website || undefined;
    if (updates.contactEmail) updatePayload.contactEmail = updates.contactEmail;
    if (updates.contactPhone !== undefined) updatePayload.contactPhone = updates.contactPhone || undefined;
    if (updates.headquartersAddress !== undefined)
      updatePayload.headquartersAddress = updates.headquartersAddress || undefined;

    if (updates.status) {
      updatePayload.status = updates.status;
      updatePayload.isActive = updates.status === 'ACTIVE';
    }
    if (updates.verificationStatus) {
      updatePayload.verificationStatus = updates.verificationStatus;
      if (updates.verificationStatus === 'verified') {
        updatePayload.verifiedAt = new Date();
      }
    }

    if (updates.identity) {
      await organizationRepository.updateNestedSection(organizationId, 'identity', {
        registrationType: updates.identity.registrationType || undefined,
        registrationNumber: updates.identity.registrationNumber || undefined,
        registeredAddress: updates.identity.registeredAddress || undefined,
        establishmentDate: updates.identity.establishmentDate || undefined,
      });
    }

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

    if (updates.regional) {
      await organizationRepository.updateNestedSection(organizationId, 'regional', {
        country: updates.regional.country,
        state: updates.regional.state || '',
        district: updates.regional.district || '',
        timezone: updates.regional.timezone,
        currencyCode: updates.regional.currencyCode,
        currencySymbol: updates.regional.currencySymbol,
        dateFormat: updates.regional.dateFormat,
        language: updates.regional.language,
      });
      // Synchronize legacy settings currency/locale fields
      await organizationRepository.updateSettings(organizationId, {
        currencyCode: updates.regional.currencyCode,
        currencySymbol: updates.regional.currencySymbol,
        defaultLocale: updates.regional.language,
      });
    }

    if (updates.securitySettings) {
      await organizationRepository.updateNestedSection(
        organizationId,
        'securitySettings',
        updates.securitySettings as unknown as Record<string, unknown>
      );
    }

    if (updates.notificationSettings) {
      await organizationRepository.updateNestedSection(
        organizationId,
        'notificationSettings',
        updates.notificationSettings as unknown as Record<string, unknown>
      );
    }

    if (updates.settings) {
      await organizationRepository.updateSettings(organizationId, updates.settings);
    }

    const updated =
      Object.keys(updatePayload).length > 0
        ? await organizationRepository.update(organizationId, updatePayload)
        : await organizationRepository.findById(organizationId);

    if (!updated) {
      throw new NotFoundError('Organization not found');
    }

    await this.logAudit(
      actor,
      'ORGANIZATION_UPDATE',
      'Organization',
      organizationId,
      `Updated organization profile and settings (${Object.keys(updates).join(', ')})`,
      { updatedSections: Object.keys(updates) }
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
  // GLOBAL TENANT-SCOPED SEARCH
  // ==========================================
  async globalSearch(organizationId: string, query: string) {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return { users: [], departments: [], invitations: [], roles: [] };
    }

    const [users, departments, invitations, customRoles] = await Promise.all([
      userRepository.findMany(organizationId, { search: trimmed }, { page: 1, limit: 5 }),
      departmentRepository.findMany(organizationId, { search: trimmed }, { page: 1, limit: 5 }),
      invitationRepository.findMany(organizationId, { search: trimmed }, { page: 1, limit: 5 }),
      roleRepository.findMany(organizationId),
    ]);

    const lower = trimmed.toLowerCase();
    const matchedRoles = customRoles
      .filter((r) => r.name.toLowerCase().includes(lower) || r.key.toLowerCase().includes(lower))
      .slice(0, 5);

    return {
      users: users.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
      })),
      departments: departments.map((d) => ({
        id: d._id.toString(),
        name: d.name,
        slug: d.slug,
        status: d.status,
      })),
      invitations: invitations.map((i) => ({
        id: i._id.toString(),
        email: i.email,
        role: i.role,
        status: i.status,
      })),
      roles: matchedRoles.map((r) => ({
        id: r._id.toString(),
        name: r.name,
        key: r.key,
        status: r.status,
      })),
    };
  }

  // ==========================================
  // ADMINISTRATIVE NOTIFICATIONS (REAL DATA)
  // ==========================================
  async getAdminNotifications(organizationId: string): Promise<
    Array<{
      id: string;
      type: 'security' | 'invitation' | 'compliance' | 'system';
      severity: 'info' | 'warning' | 'critical';
      title: string;
      message: string;
      timestamp: string;
      actionUrl?: string;
    }>
  > {
    const notifications: Array<{
      id: string;
      type: 'security' | 'invitation' | 'compliance' | 'system';
      severity: 'info' | 'warning' | 'critical';
      title: string;
      message: string;
      timestamp: string;
      actionUrl?: string;
    }> = [];

    const [org, recentLogs, pendingInvites] = await Promise.all([
      organizationRepository.findById(organizationId),
      auditRepository.findMany(organizationId, {}, { page: 1, limit: 15, sort: { timestamp: -1 } }),
      invitationRepository.findMany(organizationId, { status: 'pending' }, { page: 1, limit: 20 }),
    ]);

    // 1. Organization verification alert
    if (org && org.verificationStatus !== 'verified') {
      notifications.push({
        id: `org-verify-${org._id.toString()}`,
        type: 'compliance',
        severity: 'warning',
        title: 'Organization Verification Pending',
        message: `Organization profile "${org.name}" is currently marked as ${org.verificationStatus}. Verify legal registration details before publishing compliance records.`,
        timestamp: org.updatedAt.toISOString(),
        actionUrl: '/dashboard/admin/organization',
      });
    }

    // 2. Expiring invitations (within 48 hours)
    const now = Date.now();
    const fortyEightHoursMs = 48 * 60 * 60 * 1000;
    for (const inv of pendingInvites) {
      const timeLeft = inv.expiresAt.getTime() - now;
      if (timeLeft > 0 && timeLeft <= fortyEightHoursMs) {
        notifications.push({
          id: `inv-exp-${inv._id.toString()}`,
          type: 'invitation',
          severity: 'warning',
          title: 'Pending Invitation Expiring Soon',
          message: `Invitation to ${inv.email} (${inv.role}) expires on ${inv.expiresAt.toLocaleDateString()}.`,
          timestamp: inv.createdAt.toISOString(),
          actionUrl: '/dashboard/admin/invitations',
        });
      }
    }

    // 3. Security & privileged audit events
    const highPriorityActions = new Set([
      'USER_SUSPEND',
      'ROLE_CHANGE',
      'ROLE_CREATE',
      'ORGANIZATION_UPDATE',
      'USER_SESSIONS_REVOKE_ALL',
      'INVITATION_REVOKE',
    ]);
    for (const log of recentLogs) {
      if (highPriorityActions.has(log.action)) {
        notifications.push({
          id: `audit-${log._id.toString()}`,
          type: 'security',
          severity: log.action === 'USER_SUSPEND' ? 'critical' : 'info',
          title: log.action.replace(/_/g, ' '),
          message: `${log.actorName}: ${log.details || log.action}`,
          timestamp: log.timestamp.toISOString(),
          actionUrl: '/dashboard/admin/audit-logs',
        });
      }
    }

    return notifications.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // ==========================================
  // EXECUTIVE DASHBOARD STATISTICS (100% REAL DB)
  // ==========================================
  async getExecutiveStats(organizationId: string): Promise<{
    userMetrics: {
      total: number;
      active: number;
      inactive: number;
      suspended: number;
      byRole: Record<string, number>;
    };
    organizationMetrics: {
      departmentCount: number;
      activeDepartmentCount: number;
      pendingInvitationsCount: number;
      customRolesCount: number;
      recentAuditCount: number;
      volunteersCount: number;
      membersCount: number;
      donorsCount: number;
    };
    charts: {
      monthlyRegistrations: Array<{ month: string; count: number }>;
      departmentDistribution: Array<{ departmentId: string; name: string; count: number }>;
    };
    recentActivity: IAuditLogDocument[];
  }> {
    await connectToDatabase();
    const orgObjId = new mongoose.Types.ObjectId(organizationId);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      usersGroupedByRole,
      departmentCount,
      activeDepartmentCount,
      pendingInvitationsCount,
      customRoles,
      recentAuditLogs,
      monthlyAgg,
      deptAgg,
      allDepartments,
    ] = await Promise.all([
      User.countDocuments({ organizationId: orgObjId }),
      User.countDocuments({ organizationId: orgObjId, status: 'active' }),
      User.countDocuments({ organizationId: orgObjId, status: 'inactive' }),
      User.countDocuments({ organizationId: orgObjId, status: 'suspended' }),
      User.aggregate([
        { $match: { organizationId: orgObjId } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
      departmentRepository.count(organizationId),
      departmentRepository.count(organizationId, { status: 'active' }),
      invitationRepository.count(organizationId, { status: 'pending' }),
      roleRepository.findMany(organizationId),
      auditRepository.findMany(organizationId, {}, { page: 1, limit: 10, sort: { timestamp: -1 } }),
      User.aggregate([
        { $match: { organizationId: orgObjId, createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      User.aggregate([
        { $match: { organizationId: orgObjId, departmentId: { $exists: true, $ne: null } } },
        { $group: { _id: '$departmentId', count: { $sum: 1 } } },
      ]),
      Department.find({ organizationId: orgObjId }).select('_id name').lean(),
    ]);

    const byRole: Record<string, number> = {};
    usersGroupedByRole.forEach((item: { _id: string; count: number }) => {
      if (item._id) {
        byRole[item._id] = item.count;
      }
    });

    // Format monthly registration trends (real counts only)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRegistrations: Array<{ month: string; count: number }> = monthlyAgg.map(
      (entry: { _id: { year: number; month: number }; count: number }) => ({
        month: `${monthNames[(entry._id.month - 1) % 12]} ${entry._id.year}`,
        count: entry.count,
      })
    );

    // Format department distribution
    const deptNameMap = new Map<string, string>();
    allDepartments.forEach((d) => deptNameMap.set(d._id.toString(), d.name));

    const departmentDistribution: Array<{ departmentId: string; name: string; count: number }> = deptAgg
      .map((entry: { _id: mongoose.Types.ObjectId; count: number }) => ({
        departmentId: entry._id.toString(),
        name: deptNameMap.get(entry._id.toString()) || 'Unassigned',
        count: entry.count,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      userMetrics: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        suspended: suspendedUsers,
        byRole,
      },
      organizationMetrics: {
        departmentCount,
        activeDepartmentCount,
        pendingInvitationsCount,
        customRolesCount: customRoles.length,
        recentAuditCount: recentAuditLogs.length,
        volunteersCount: byRole.VOLUNTEER || 0,
        membersCount: byRole.MEMBER || 0,
        donorsCount: byRole.DONOR || 0,
      },
      charts: {
        monthlyRegistrations,
        departmentDistribution,
      },
      recentActivity: recentAuditLogs,
    };
  }
}

export const adminService = new AdminService();
