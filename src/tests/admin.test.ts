import { describe, it, expect, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import {
  AdminService,
  AdminActor,
  sanitizeAuditMetadata,
} from '../server/services/admin.service';
import { userRepository } from '../server/repositories/user.repository';
import { departmentRepository } from '../server/repositories/department.repository';
import { invitationRepository } from '../server/repositories/invitation.repository';
import { auditRepository } from '../server/repositories/audit.repository';
import { organizationRepository } from '../server/repositories/organization.repository';
import { roleRepository } from '../server/repositories/role.repository';
import { emailProvider } from '../integrations/email/nodemailer.provider';
import { hashToken } from '../server/security/tokens';
import {
  createUserSchema,
  updateUserSchema,
  createDepartmentSchema,
  createInvitationSchema,
  updateOrganizationSchema,
  createRoleSchema,
} from '../features/admin/schemas/admin.schema';
import { getAuthorizedAdminNav } from '../features/admin/config/navigation';
import {
  renderInvitationEmail,
  renderInvitationAcceptedEmail,
  renderAccountStatusEmail,
  renderRoleChangedEmail,
} from '../integrations/email/templates';
import { PLATFORM_PROTECTED_PERMISSIONS, checkRolePermission } from '../server/authorization/permissions';

const ORG_A_ID = new mongoose.Types.ObjectId().toString();
const ORG_B_ID = new mongoose.Types.ObjectId().toString();
const ACTOR_ADMIN_ID = new mongoose.Types.ObjectId().toString();
const TARGET_USER_ID = new mongoose.Types.ObjectId().toString();

const adminActor: AdminActor = {
  id: ACTOR_ADMIN_ID,
  name: 'Org Admin',
  email: 'admin@org-a.org',
  role: 'ADMIN',
  organizationId: ORG_A_ID,
  ipAddress: '10.0.0.1',
  userAgent: 'Vitest-Runner',
};

const superAdminActor: AdminActor = {
  ...adminActor,
  name: 'Platform Super Admin',
  role: 'SUPER_ADMIN',
};

describe('Phase 6: Zod Input Validation Schemas', () => {
  it('validates user creation and rejects malformed email or short name', () => {
    expect(
      createUserSchema.safeParse({
        name: 'Asha Devi',
        email: 'asha@hopehorizon.org',
        role: 'PROJECT_MANAGER',
      }).success
    ).toBe(true);

    expect(
      createUserSchema.safeParse({
        name: 'A',
        email: 'not-an-email',
        role: 'PROJECT_MANAGER',
      }).success
    ).toBe(false);
  });

  it('validates PAN format on user update and enforces department slug rules', () => {
    expect(updateUserSchema.safeParse({ panNumber: 'ABCDE1234F' }).success).toBe(true);
    expect(updateUserSchema.safeParse({ panNumber: 'INVALID' }).success).toBe(false);

    expect(createDepartmentSchema.safeParse({ name: 'Finance & Accounts', slug: 'finance-accounts' }).success).toBe(
      true
    );
    expect(createDepartmentSchema.safeParse({ name: 'Finance', slug: 'Finance Spaces!' }).success).toBe(false);
  });

  it('enforces invitation expiry bounds (1-30 days) and role key pattern', () => {
    expect(
      createInvitationSchema.safeParse({
        email: 'newstaff@hopehorizon.org',
        role: 'MANAGER',
        expiryDays: 14,
      }).success
    ).toBe(true);

    expect(
      createInvitationSchema.safeParse({
        email: 'newstaff@hopehorizon.org',
        role: 'MANAGER',
        expiryDays: 90,
      }).success
    ).toBe(false);

    expect(
      createRoleSchema.safeParse({
        name: 'Regional Lead',
        key: 'REGIONAL_LEAD',
        permissions: ['projects.view'],
      }).success
    ).toBe(true);

    expect(
      createRoleSchema.safeParse({
        name: 'Bad Role',
        key: 'lowercase-key',
        permissions: [],
      }).success
    ).toBe(false);
  });

  it('validates organization settings including India/INR regional defaults and status enum', () => {
    const parsed = updateOrganizationSchema.safeParse({
      name: 'HopeHorizon Foundation',
      status: 'ACTIVE',
      regional: {
        country: 'India',
        timezone: 'Asia/Kolkata',
        currencyCode: 'INR',
        currencySymbol: '₹',
        dateFormat: 'DD/MM/YYYY',
        language: 'en',
      },
      securitySettings: {
        sessionTimeoutMinutes: 1440,
        minPasswordLength: 10,
        requireStrongPassword: true,
        maxFailedLoginAttempts: 5,
        invitationExpiryDays: 7,
        twoFactorPolicy: 'required_for_admins',
      },
    });
    expect(parsed.success).toBe(true);

    expect(updateOrganizationSchema.safeParse({ status: 'UNKNOWN_STATUS' }).success).toBe(false);
  });
});

describe('Phase 6: Role-Specific Navigation & RBAC Boundaries', () => {
  it('denies all admin navigation items to GUEST, DONOR, VOLUNTEER, and MEMBER', () => {
    expect(getAuthorizedAdminNav('GUEST')).toHaveLength(0);
    expect(getAuthorizedAdminNav('DONOR')).toHaveLength(0);
    expect(getAuthorizedAdminNav('VOLUNTEER')).toHaveLength(0);
    expect(getAuthorizedAdminNav('MEMBER')).toHaveLength(0);
  });

  it('gives differentiated navigation sets across administrative roles', () => {
    const superAdminNav = getAuthorizedAdminNav('SUPER_ADMIN').map((i) => i.id);
    const accountantNav = getAuthorizedAdminNav('ACCOUNTANT').map((i) => i.id);
    const managerNav = getAuthorizedAdminNav('MANAGER').map((i) => i.id);

    expect(superAdminNav).toContain('users');
    expect(superAdminNav).toContain('settings');
    expect(superAdminNav).toContain('audit-logs');

    expect(accountantNav).toContain('audit-logs');
    expect(accountantNav).not.toContain('invitations');
    expect(accountantNav).not.toContain('departments');

    expect(managerNav).toContain('departments');
    expect(managerNav).not.toContain('settings');
  });

  it('marks organizations.manage as platform-protected and restricts it to SUPER_ADMIN', () => {
    expect(PLATFORM_PROTECTED_PERMISSIONS).toContain('organizations.manage');
    expect(checkRolePermission('SUPER_ADMIN', 'organizations.manage')).toBe(true);
    expect(checkRolePermission('ADMIN', 'organizations.manage')).toBe(false);
    expect(checkRolePermission('ADMIN', 'settings.manage')).toBe(true);
  });
});

describe('Phase 6: Audit Log Sanitization', () => {
  it('strips sensitive credentials, tokens, OTPs, and PANs recursively while retaining safe metadata', () => {
    const sanitized = sanitizeAuditMetadata({
      role: 'MANAGER',
      password: 'plain-password',
      passwordHash: '$2a$12$hash',
      rawToken: 'secret-token-xyz',
      tokenHash: 'sha256-hash',
      otp: '123456',
      panNumber: 'ABCDE1234F',
      nested: {
        secret: 'totp-secret',
        backupCodes: ['1111'],
        changedFields: ['role', 'departmentId'],
      },
    });

    expect(sanitized).toEqual({
      role: 'MANAGER',
      nested: {
        changedFields: ['role', 'departmentId'],
      },
    });
  });
});

describe('Phase 6: AdminService Tenant Isolation, Privilege Escalation & Lifecycles', () => {
  const service = new AdminService();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(auditRepository, 'create').mockImplementation(async (data) => ({
      _id: new mongoose.Types.ObjectId(),
      ...data,
    }) as never);
    vi.spyOn(emailProvider, 'sendEmail').mockResolvedValue({ success: true, messageId: 'test-msg-1' });
  });

  it('enforces tenant isolation when fetching a user from another organization', async () => {
    vi.spyOn(userRepository, 'findById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(TARGET_USER_ID),
      organizationId: new mongoose.Types.ObjectId(ORG_B_ID),
      name: 'Foreign Org User',
      email: 'user@org-b.org',
      role: 'TEAM_MEMBER',
      status: 'active',
    } as never);

    await expect(service.getUserById(TARGET_USER_ID, ORG_A_ID)).rejects.toThrow(
      /not found in this organization/i
    );
  });

  it('prevents non-SUPER_ADMIN from creating, inviting, or elevating users to SUPER_ADMIN', async () => {
    await expect(
      service.createUser(
        ORG_A_ID,
        { name: 'Rogue', email: 'rogue@org-a.org', role: 'SUPER_ADMIN', status: 'active' },
        adminActor
      )
    ).rejects.toThrow(/Super Administrators/i);

    await expect(
      service.sendInvitation(
        ORG_A_ID,
        { email: 'rogue@org-a.org', role: 'SUPER_ADMIN', expiryDays: 7 },
        adminActor
      )
    ).rejects.toThrow(/Super Administrators/i);

    vi.spyOn(userRepository, 'findById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(TARGET_USER_ID),
      organizationId: new mongoose.Types.ObjectId(ORG_A_ID),
      name: 'Staff',
      email: 'staff@org-a.org',
      role: 'MANAGER',
      status: 'active',
    } as never);

    await expect(
      service.updateUser(TARGET_USER_ID, ORG_A_ID, { role: 'SUPER_ADMIN' }, adminActor)
    ).rejects.toThrow(/Super Administrators/i);
  });

  it('protects the last active organization administrator from accidental demotion or suspension', async () => {
    vi.spyOn(userRepository, 'findById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(TARGET_USER_ID),
      organizationId: new mongoose.Types.ObjectId(ORG_A_ID),
      name: 'Only Admin',
      email: 'only-admin@org-a.org',
      role: 'ADMIN',
      status: 'active',
    } as never);
    vi.spyOn(userRepository, 'countActiveAdmins').mockResolvedValue(1);

    await expect(
      service.updateUser(TARGET_USER_ID, ORG_A_ID, { role: 'MANAGER' }, adminActor)
    ).rejects.toThrow(/last active administrator/i);

    await expect(
      service.deactivateUser(TARGET_USER_ID, ORG_A_ID, adminActor)
    ).rejects.toThrow(/last active administrator/i);
  });

  it('prevents self-deactivation by an active administrator', async () => {
    vi.spyOn(userRepository, 'findById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(ACTOR_ADMIN_ID),
      organizationId: new mongoose.Types.ObjectId(ORG_A_ID),
      name: 'Org Admin',
      email: 'admin@org-a.org',
      role: 'ADMIN',
      status: 'active',
    } as never);

    await expect(service.deactivateUser(ACTOR_ADMIN_ID, ORG_A_ID, adminActor)).rejects.toThrow(
      /cannot deactivate your own/i
    );
  });

  it('prevents custom roles from overriding protected platform permissions or system role keys', async () => {
    await expect(
      service.createRole(
        ORG_A_ID,
        {
          name: 'Shadow Platform Admin',
          key: 'SHADOW_ADMIN',
          permissions: ['organizations.manage'],
        },
        adminActor
      )
    ).rejects.toThrow(/protected platform-level permission/i);

    await expect(
      service.createRole(
        ORG_A_ID,
        {
          name: 'Fake Admin',
          key: 'ADMIN',
          permissions: ['users.view'],
        },
        superAdminActor
      )
    ).rejects.toThrow(/reserved by a built-in system role/i);
  });

  it('blocks modification of built-in system roles', async () => {
    vi.spyOn(roleRepository, 'findById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      organizationId: new mongoose.Types.ObjectId(ORG_A_ID),
      name: 'Admin',
      key: 'ADMIN',
      isSystemRole: true,
      permissions: ['users.view'],
      status: 'active',
    } as never);

    await expect(
      service.updateRole(new mongoose.Types.ObjectId().toString(), ORG_A_ID, { name: 'Hacked' }, superAdminActor)
    ).rejects.toThrow(/System predefined roles cannot be modified/i);
  });

  it('prevents duplicate departments with the same slug in the same tenant', async () => {
    vi.spyOn(departmentRepository, 'findBySlug').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      organizationId: new mongoose.Types.ObjectId(ORG_A_ID),
      name: 'Programs',
      slug: 'programs',
    } as never);

    await expect(
      service.createDepartment(
        ORG_A_ID,
        { name: 'Programs Duplicate', slug: 'programs', budget: 0, status: 'active' },
        adminActor
      )
    ).rejects.toThrow(/already exists/i);
  });

  it('hashes invitation tokens securely, enforces cross-tenant boundary, and expires old tokens', async () => {
    vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
    vi.spyOn(invitationRepository, 'findMany').mockResolvedValue([]);
    vi.spyOn(organizationRepository, 'findById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(ORG_A_ID),
      name: 'HopeHorizon Foundation',
      securitySettings: { invitationExpiryDays: 7 },
    } as never);

    let storedTokenHash = '';
    vi.spyOn(invitationRepository, 'create').mockImplementation(async (data) => {
      storedTokenHash = data.tokenHash || '';
      return {
        _id: new mongoose.Types.ObjectId(),
        ...data,
      } as never;
    });

    const { rawToken } = await service.sendInvitation(
      ORG_A_ID,
      { email: 'invitee@org-a.org', role: 'VOLUNTEER', expiryDays: 5 },
      adminActor
    );

    expect(rawToken).toHaveLength(64);
    expect(storedTokenHash).toBe(hashToken(rawToken));
    expect(storedTokenHash).not.toBe(rawToken);
    expect(emailProvider.sendEmail).toHaveBeenCalledTimes(1);

    // Cross-tenant invitation acceptance must be rejected
    vi.spyOn(invitationRepository, 'findByTokenHash').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      organizationId: new mongoose.Types.ObjectId(ORG_A_ID),
      email: 'invitee@org-a.org',
      role: 'VOLUNTEER',
      tokenHash: storedTokenHash,
      status: 'pending',
      expiresAt: new Date(Date.now() + 86400000),
    } as never);

    await expect(service.validateInvitationToken(rawToken, ORG_B_ID)).rejects.toThrow(
      /Cross-tenant invitation acceptance is forbidden/i
    );

    // Expired invitation must be rejected and marked expired
    const updateStatusSpy = vi.spyOn(invitationRepository, 'updateStatus').mockResolvedValue(null);
    vi.spyOn(invitationRepository, 'findByTokenHash').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      organizationId: new mongoose.Types.ObjectId(ORG_A_ID),
      email: 'invitee@org-a.org',
      role: 'VOLUNTEER',
      tokenHash: storedTokenHash,
      status: 'pending',
      expiresAt: new Date(Date.now() - 1000),
    } as never);

    await expect(service.validateInvitationToken(rawToken, ORG_A_ID)).rejects.toThrow(/expired/i);
    expect(updateStatusSpy).toHaveBeenCalledWith(expect.any(String), 'expired');
  });

  it('prevents non-SUPER_ADMIN from mutating organization lifecycle status or listing all organizations', async () => {
    vi.spyOn(organizationRepository, 'findById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(ORG_A_ID),
      name: 'HopeHorizon Foundation',
      status: 'ACTIVE',
      verificationStatus: 'unverified',
    } as never);

    await expect(
      service.updateOrganization(ORG_A_ID, { status: 'SUSPENDED' }, adminActor)
    ).rejects.toThrow(/Super Administrators/i);

    await expect(
      service.updateOrganization(ORG_A_ID, { verificationStatus: 'verified' }, adminActor)
    ).rejects.toThrow(/Super Administrators/i);

    await expect(service.listOrganizationsForSuperAdmin(adminActor)).rejects.toThrow(
      /Super Administrators/i
    );
  });
});

describe('Phase 6: Administrative Email Templates', () => {
  it('renders invitation, acceptance, account status, and role change templates cleanly', () => {
    const invite = renderInvitationEmail({
      inviterName: 'Meera Nair',
      role: 'PROJECT_MANAGER',
      invitationUrl: 'https://hopehorizon.org/register?invitation=abc',
    });
    expect(invite.html).toContain('Meera Nair');
    expect(invite.html).toContain('PROJECT_MANAGER');

    const accepted = renderInvitationAcceptedEmail({
      inviterName: 'Meera Nair',
      acceptedUserName: 'Rohan Kumar',
      acceptedUserEmail: 'rohan@hopehorizon.org',
      role: 'PROJECT_MANAGER',
    });
    expect(accepted.subject).toContain('Rohan Kumar');

    const suspended = renderAccountStatusEmail({
      userName: 'Rohan Kumar',
      status: 'suspended',
      changedBy: 'Org Admin',
    });
    expect(suspended.subject).toContain('Suspended');
    expect(suspended.html).toContain('SUSPENDED');

    const roleChanged = renderRoleChangedEmail({
      userName: 'Rohan Kumar',
      previousRole: 'TEAM_MEMBER',
      newRole: 'MANAGER',
      changedBy: 'Org Admin',
    });
    expect(roleChanged.html).toContain('TEAM_MEMBER');
    expect(roleChanged.html).toContain('MANAGER');
  });
});
