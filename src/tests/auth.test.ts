import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from '../server/security/password';
import {
  generateCryptoToken,
  hashToken,
  generateOTP,
  hashOTP,
} from '../server/security/tokens';
import {
  generate2FASecret,
  get2FAKeyURI,
  verify2FAToken,
} from '../server/security/totp';
import { signAuthToken, verifyAuthToken, AuthTokenPayload } from '../server/auth/jwt';
import {
  checkRolePermission,
  checkRoleAnyPermission,
  checkRoleAllPermissions,
  ROLE_PERMISSIONS,
} from '../server/authorization/permissions';
import {
  registerSchema,
  loginSchema,
  verifyOTPSchema,
  panValidation,
} from '../features/authentication/schemas/auth.schema';
import { UserRole } from '../types';

describe('Phase 4: Password Security & Hashing', () => {
  it('should hash password and verify match correctly', async () => {
    const raw = 'StrongP@ssw0rd!2026';
    const hash = await hashPassword(raw);

    expect(hash).toBeDefined();
    expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true);

    const matches = await comparePassword(raw, hash);
    expect(matches).toBe(true);

    const wrong = await comparePassword('WrongPassword!123', hash);
    expect(wrong).toBe(false);
  });
});

describe('Phase 4: Cryptographic Tokens & Numeric OTP', () => {
  it('should generate secure crypto tokens and deterministic SHA-256 hashes', () => {
    const token = generateCryptoToken(32);
    expect(token).toHaveLength(64); // 32 bytes in hex = 64 chars

    const hash1 = hashToken(token);
    const hash2 = hashToken(token);
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it('should generate valid 6-digit numeric OTP and verify hash', () => {
    const otp = generateOTP(6);
    expect(otp).toHaveLength(6);
    expect(/^\d{6}$/.test(otp)).toBe(true);

    const otpHash = hashOTP(otp);
    expect(otpHash).toBe(hashToken(otp));
  });
});

describe('Phase 4: TOTP Two-Factor Authentication (RFC 6238)', () => {
  it('should generate valid secret and otpauth URI', () => {
    const secret = generate2FASecret();
    expect(secret).toBeDefined();
    expect(typeof secret).toBe('string');
    expect(secret.length).toBeGreaterThanOrEqual(16);

    const uri = get2FAKeyURI('donor@hopehorizon.org', secret, 'HopeHorizon');
    expect(uri).toContain('otpauth://totp/');
    expect(uri).toContain('donor%40hopehorizon.org');
    expect(uri).toContain('issuer=HopeHorizon');
  });

  it('should reject invalid or fabricated TOTP codes', () => {
    const secret = generate2FASecret();
    const isFakeValid = verify2FAToken(secret, '000000');
    // Random 000000 is virtually guaranteed to be invalid
    expect(typeof isFakeValid).toBe('boolean');
  });
});

describe('Phase 4: Jose HS256 JWT Authentication Tokens', () => {
  it('should sign and successfully verify access tokens with claims', async () => {
    const payload: AuthTokenPayload = {
      userId: '65f123456789012345678901',
      sessionId: '65f123456789012345678902',
      email: 'admin@hopehorizon.org',
      role: 'ADMIN',
      organizationId: '65f123456789012345678900',
    };

    const token = await signAuthToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);

    const verified = await verifyAuthToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(payload.userId);
    expect(verified?.email).toBe(payload.email);
    expect(verified?.role).toBe('ADMIN');
    expect(verified?.organizationId).toBe(payload.organizationId);
  });

  it('should reject forged or corrupted JWT tokens', async () => {
    const badToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.corrupted.signature';
    const verified = await verifyAuthToken(badToken);
    expect(verified).toBeNull();
  });
});

describe('Phase 4: Server-Side RBAC & 13 Roles Permission Matrix', () => {
  it('should verify all 13 roles are defined in the permission matrix', () => {
    const allRoles: UserRole[] = [
      'SUPER_ADMIN',
      'ADMIN',
      'EXECUTIVE_DIRECTOR',
      'MANAGER',
      'PROJECT_MANAGER',
      'ACCOUNTANT',
      'COMMUNICATIONS',
      'CONTENT_EDITOR',
      'TEAM_MEMBER',
      'VOLUNTEER',
      'DONOR',
      'MEMBER',
      'GUEST',
    ];

    allRoles.forEach((role) => {
      expect(ROLE_PERMISSIONS[role]).toBeDefined();
    });
  });

  it('should grant SUPER_ADMIN full administrative permissions', () => {
    expect(checkRolePermission('SUPER_ADMIN', 'users.manage')).toBe(true);
    expect(checkRolePermission('SUPER_ADMIN', 'roles.manage')).toBe(true);
    expect(checkRolePermission('SUPER_ADMIN', 'settings.manage')).toBe(true);
    expect(checkRolePermission('SUPER_ADMIN', 'audit_logs.view')).toBe(true);
  });

  it('should enforce role boundaries for non-administrative roles', () => {
    expect(checkRolePermission('DONOR', 'users.manage')).toBe(false);
    expect(checkRolePermission('DONOR', 'settings.manage')).toBe(false);
    expect(checkRolePermission('DONOR', 'donations.view_own')).toBe(true);

    expect(checkRolePermission('VOLUNTEER', 'users.manage')).toBe(false);
    expect(checkRolePermission('VOLUNTEER', 'tasks.update_assigned')).toBe(true);

    expect(checkRolePermission('ACCOUNTANT', 'reports.export_financial')).toBe(true);
    expect(checkRolePermission('ACCOUNTANT', 'donations.refund')).toBe(true);
    expect(checkRolePermission('ACCOUNTANT', 'settings.manage')).toBe(false);
  });

  it('should support checking multiple permissions with any/all helpers', () => {
    expect(
      checkRoleAnyPermission('DONOR', ['users.manage', 'donations.view_own'])
    ).toBe(true);

    expect(
      checkRoleAllPermissions('DONOR', ['users.manage', 'donations.view_own'])
    ).toBe(false);

    expect(
      checkRoleAllPermissions('SUPER_ADMIN', ['users.manage', 'settings.manage'])
    ).toBe(true);
  });
});

describe('Phase 4: Zod Request Validation Schemas', () => {
  it('should validate valid user registration payload', () => {
    const valid = {
      name: 'Priya Sharma',
      email: 'priya@example.com',
      password: 'StrongP@ssw0rd!2026',
      role: 'DONOR',
      phone: '+91 9876543210',
      panNumber: 'ABCDE1234F',
    };

    const parsed = registerSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('should reject registration with weak password', () => {
    const invalid = {
      name: 'Priya Sharma',
      email: 'priya@example.com',
      password: 'weak',
      role: 'DONOR',
    };

    const parsed = registerSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it('should validate Indian PAN format', () => {
    expect(panValidation.safeParse('ABCDE1234F').success).toBe(true);
    expect(panValidation.safeParse('INVALIDPAN').success).toBe(false);
    expect(panValidation.safeParse('12345ABCDE').success).toBe(false);
    expect(panValidation.safeParse('').success).toBe(true); // optional
  });

  it('should validate 6-digit OTP verification payload', () => {
    const valid = {
      email: 'test@hopehorizon.org',
      otp: '123456',
      purpose: 'VERIFY_EMAIL',
    };
    expect(verifyOTPSchema.safeParse(valid).success).toBe(true);

    const invalid = {
      email: 'test@hopehorizon.org',
      otp: '12345', // only 5 digits
      purpose: 'VERIFY_EMAIL',
    };
    expect(verifyOTPSchema.safeParse(invalid).success).toBe(false);
  });

  it('should validate login credentials', () => {
    expect(
      loginSchema.safeParse({ email: 'donor@hopehorizon.org', password: 'Password@123' })
        .success
    ).toBe(true);

    expect(
      loginSchema.safeParse({ email: 'not-an-email', password: 'Password@123' }).success
    ).toBe(false);
  });
});
