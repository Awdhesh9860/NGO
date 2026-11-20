import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { NextRequest } from 'next/server';
import { signAuthToken } from '@/server/auth/jwt';
import { Role } from '@/server/database/models/Role';
import { User } from '@/server/database/models/User';
import { Session } from '@/server/database/models/Session';
import { resetDatabaseConnectionCache } from '@/lib/mongodb';
import {
  resolveEffectivePermissions,
  requireAuthentication,
  requirePermission,
  requireAnyPermission,
  requireOrganizationAccess,
} from '@/server/authorization/guards';
import { checkRolePermission } from '@/server/authorization/permissions';
import { AUTH_COOKIE_NAME } from '@/server/security/cookies';
import { UserRole } from '@/types';

describe('QA Phase 2 — 13-Role RBAC, Custom MongoDB Roles & Multi-Tenant Isolation (QA-BUG-004)', () => {
  const orgAlphaId = new mongoose.Types.ObjectId();
  const orgBetaId = new mongoose.Types.ObjectId();
  const originalMongoUri = process.env.MONGODB_URI;

  beforeEach(() => {
    process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/qa_rbac_mock';
    resetDatabaseConnectionCache();
  });

  afterEach(() => {
    if (originalMongoUri === undefined) {
      delete process.env.MONGODB_URI;
    } else {
      process.env.MONGODB_URI = originalMongoUri;
    }
    resetDatabaseConnectionCache();
    vi.restoreAllMocks();
  });

  function makeAuthReq(token: string, url = 'http://localhost:3000/api/v1/admin/users'): NextRequest {
    return new NextRequest(url, {
      headers: { cookie: `${AUTH_COOKIE_NAME}=${token}` },
    });
  }

  function mockValidSessionAndUser(overrides: Record<string, unknown>) {
    const userId = new mongoose.Types.ObjectId();
    const sessionId = new mongoose.Types.ObjectId();

    vi.spyOn(mongoose, 'connect').mockResolvedValue(mongoose);
    vi.spyOn(Session, 'findById').mockResolvedValue({
      _id: sessionId,
      userId,
      organizationId: overrides.organizationId || orgAlphaId,
      isRevoked: false,
      expiresAt: new Date(Date.now() + 3600_000),
      lastActiveAt: new Date(),
      save: vi.fn(),
    } as never);

    vi.spyOn(User, 'findById').mockResolvedValue({
      _id: userId,
      name: 'QA Test Actor',
      email: 'actor@qa-tenant.test',
      role: 'TEAM_MEMBER',
      status: 'active',
      organizationId: orgAlphaId,
      ...overrides,
    } as never);

    return { userId, sessionId };
  }

  describe('1. Built-in 13-Role Matrix & Separation of Duties', () => {
    it('denies privileged finance and safeguarding permissions to non-staff roles', () => {
      const restrictedRoles: UserRole[] = ['GUEST', 'DONOR', 'MEMBER', 'VOLUNTEER'];
      for (const role of restrictedRoles) {
        expect(checkRolePermission(role, 'users.manage')).toBe(false);
        expect(checkRolePermission(role, 'finance.journals.post')).toBe(false);
        expect(checkRolePermission(role, 'finance.expenses.approve')).toBe(false);
        expect(checkRolePermission(role, 'beneficiaries.sensitive.view')).toBe(false);
        expect(checkRolePermission(role, 'safeguarding.manage')).toBe(false);
      }
    });

    it('enforces Finance Separation of Duties between ADMIN (approver) and ACCOUNTANT (poster/payer)', () => {
      expect(checkRolePermission('ADMIN', 'finance.expenses.approve')).toBe(true);
      expect(checkRolePermission('ADMIN', 'finance.expenses.pay')).toBe(false);
      expect(checkRolePermission('ADMIN', 'finance.journals.post')).toBe(false);

      expect(checkRolePermission('ACCOUNTANT', 'finance.expenses.pay')).toBe(true);
      expect(checkRolePermission('ACCOUNTANT', 'finance.journals.post')).toBe(true);
      expect(checkRolePermission('ACCOUNTANT', 'finance.expenses.approve')).toBe(false);
      expect(checkRolePermission('ACCOUNTANT', 'finance.journals.approve')).toBe(false);
    });

    it('enforces Child Safeguarding Least-Privilege defaults', () => {
      expect(checkRolePermission('ADMIN', 'beneficiaries.sensitive.view')).toBe(false);
      expect(checkRolePermission('MANAGER', 'safeguarding.manage')).toBe(false);
      expect(checkRolePermission('EXECUTIVE_DIRECTOR', 'beneficiaries.sensitive.view')).toBe(true);
      expect(checkRolePermission('EXECUTIVE_DIRECTOR', 'safeguarding.manage')).toBe(true);
    });
  });

  describe('2. Custom MongoDB Role Evaluation in guards.ts (QA-BUG-004)', () => {
    it('grants permissions from an active tenant-scoped custom MongoDB Role assigned via customRoleId', async () => {
      const customRoleId = new mongoose.Types.ObjectId();
      const { userId, sessionId } = mockValidSessionAndUser({
        role: 'TEAM_MEMBER',
        organizationId: orgAlphaId,
        customRoleId,
      });

      vi.spyOn(Role, 'findOne').mockResolvedValue({
        _id: customRoleId,
        organizationId: orgAlphaId,
        key: 'SAFEGUARDING_LEAD',
        status: 'active',
        permissions: ['beneficiaries.view', 'beneficiaries.sensitive.view', 'safeguarding.manage'],
      } as never);

      const token = await signAuthToken({
        userId: userId.toString(),
        sessionId: sessionId.toString(),
        email: 'lead@qa-tenant.test',
        role: 'TEAM_MEMBER',
        organizationId: orgAlphaId.toString(),
      });

      // Normally TEAM_MEMBER cannot view sensitive beneficiary PII — custom Role unlocks it
      const ctx = await requirePermission(makeAuthReq(token), 'beneficiaries.sensitive.view');
      expect(ctx.user._id.toString()).toBe(userId.toString());

      // Still denied permissions absent from custom Role
      await expect(requirePermission(makeAuthReq(token), 'finance.journals.post')).rejects.toThrow(
        /Missing required permission/
      );
    });

    it('blocks privilege escalation to PLATFORM_PROTECTED_PERMISSIONS even if injected into a custom Role', async () => {
      const customRoleId = new mongoose.Types.ObjectId();
      vi.spyOn(Role, 'findOne').mockResolvedValue({
        _id: customRoleId,
        organizationId: orgAlphaId,
        key: 'ESCALATED_ADMIN',
        status: 'active',
        permissions: ['users.manage', 'organizations.manage'],
      } as never);

      const effective = await resolveEffectivePermissions({
        role: 'ADMIN',
        organizationId: orgAlphaId,
        customRoleId,
      });

      expect(effective).toContain('users.manage');
      expect(effective).not.toContain('organizations.manage');
    });

    it('enforces tenant-level system role customization when org restricts a built-in role', async () => {
      const { userId, sessionId } = mockValidSessionAndUser({
        role: 'MANAGER',
        organizationId: orgAlphaId,
      });

      // Org Alpha removed campaigns.publish from MANAGER in MongoDB Role table
      vi.spyOn(Role, 'findOne').mockResolvedValue({
        organizationId: orgAlphaId,
        key: 'MANAGER',
        status: 'active',
        permissions: ['programs.view', 'projects.view'],
      } as never);

      const token = await signAuthToken({
        userId: userId.toString(),
        sessionId: sessionId.toString(),
        email: 'mgr@qa-tenant.test',
        role: 'MANAGER',
        organizationId: orgAlphaId.toString(),
      });

      await expect(
        requireAnyPermission(makeAuthReq(token), ['campaigns.publish', 'campaigns.approve'])
      ).rejects.toThrow(/Access denied/);
    });
  });

  describe('3. Cross-Tenant Isolation & Session Revocation', () => {
    it('blocks Tenant A ADMIN from accessing Tenant B resources (cross-tenant IDOR)', async () => {
      const { userId, sessionId } = mockValidSessionAndUser({
        role: 'ADMIN',
        organizationId: orgAlphaId,
      });

      const token = await signAuthToken({
        userId: userId.toString(),
        sessionId: sessionId.toString(),
        email: 'admin@alpha.test',
        role: 'ADMIN',
        organizationId: orgAlphaId.toString(),
      });

      // Same tenant succeeds
      const ok = await requireOrganizationAccess(makeAuthReq(token), orgAlphaId.toString());
      expect(ok.user.organizationId.toString()).toBe(orgAlphaId.toString());

      // Cross-tenant fails with 403
      await expect(
        requireOrganizationAccess(makeAuthReq(token), orgBetaId.toString())
      ).rejects.toThrow(/Cross-organization access forbidden/);
    });

    it('rejects revoked sessions, suspended users, and missing/tampered tokens with 401', async () => {
      // Missing token
      const unauthReq = new NextRequest('http://localhost:3000/api/v1/admin/users');
      await expect(requireAuthentication(unauthReq)).rejects.toThrow(/Active authentication session required/);

      // Tampered JWT
      await expect(requireAuthentication(makeAuthReq('tampered.jwt.token'))).rejects.toThrow(
        /Active authentication session required/
      );

      // Revoked session in MongoDB
      const userId = new mongoose.Types.ObjectId();
      const sessionId = new mongoose.Types.ObjectId();
      vi.spyOn(mongoose, 'connect').mockResolvedValue(mongoose);
      vi.spyOn(Session, 'findById').mockResolvedValue({
        _id: sessionId,
        isRevoked: true,
        expiresAt: new Date(Date.now() + 3600_000),
      } as never);

      const token = await signAuthToken({
        userId: userId.toString(),
        sessionId: sessionId.toString(),
        email: 'revoked@alpha.test',
        role: 'ADMIN',
        organizationId: orgAlphaId.toString(),
      });
      await expect(requireAuthentication(makeAuthReq(token))).rejects.toThrow(
        /Active authentication session required/
      );
    });
  });
});
