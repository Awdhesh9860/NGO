import mongoose from 'mongoose';
import { User, IUserDocument } from '@/server/database/models/User';
import { Organization } from '@/server/database/models/Organization';
import { Session } from '@/server/database/models/Session';
import { EmailVerificationToken } from '@/server/database/models/EmailVerificationToken';
import { PasswordResetToken } from '@/server/database/models/PasswordResetToken';
import { EmailOTP, OTPPurpose } from '@/server/database/models/EmailOTP';
import { AuditLog } from '@/server/database/models/AuditLog';
import { hashPassword, verifyPassword } from '@/server/security/password';
import { generateCryptoToken, hashToken, generateOTP, hashOTP } from '@/server/security/tokens';
import { generate2FASecret, get2FAKeyURI, verify2FAToken } from '@/server/security/totp';
import { signAuthToken } from '@/server/auth/jwt';
import { createSession, revokeSession, revokeAllUserSessions } from '@/server/auth/session';
import { emailProvider } from '@/integrations/email/nodemailer.provider';
import {
  renderVerificationEmail,
  renderOTPEmail,
  renderPasswordResetEmail,
  renderWelcomeEmail,
  renderSecurityAlertEmail,
} from '@/integrations/email/templates';
import {
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  ConflictError,
  NotFoundError,
} from '@/server/errors';
import { UserRole } from '@/types';
import connectToDatabase from '@/server/database/connection';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  organizationId: string;
  phone?: string;
  givingInterests?: string[];
  givingFrequency?: string;
  panNumber?: string;
}

export interface LoginInput {
  email: string;
  password: string;
  organizationId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginResult {
  requires2FA?: boolean;
  tempToken?: string;
  user?: IUserDocument;
  token?: string;
  sessionId?: string;
}

export class AuthService {
  /**
   * Register a new user (public signup restricted to DONOR, VOLUNTEER, MEMBER)
   */
  async register(input: RegisterInput): Promise<{ user: IUserDocument; token: string; sessionId: string }> {
    await connectToDatabase();

    const normalizedEmail = input.email.toLowerCase().trim();

    // 1. Validate Organization
    if (!mongoose.Types.ObjectId.isValid(input.organizationId)) {
      throw new ValidationError('Invalid organization ID provided');
    }
    const org = await Organization.findById(input.organizationId);
    if (!org || !org.isActive) {
      throw new NotFoundError('Target organization not found or inactive');
    }

    // 2. Enforce self-registration role restrictions
    const requestedRole: UserRole = input.role || 'DONOR';
    const allowedSelfSignupRoles: UserRole[] = ['DONOR', 'VOLUNTEER', 'MEMBER'];
    if (!allowedSelfSignupRoles.includes(requestedRole)) {
      throw new AuthorizationError(
        `Self-registration is restricted to DONOR, VOLUNTEER, or MEMBER. Staff roles require an administrative invitation.`
      );
    }

    // 3. Check for existing user
    const existing = await User.findOne({
      organizationId: org._id,
      email: normalizedEmail,
    });
    if (existing) {
      throw new ConflictError('An account with this email address already exists in this organization');
    }

    // 4. Hash password with bcrypt cost 12
    const passwordHash = await hashPassword(input.password);

    // 5. Create user record
    const user = await User.create({
      organizationId: org._id,
      name: input.name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: requestedRole,
      phone: input.phone,
      givingInterests: input.givingInterests || [],
      givingFrequency: input.givingFrequency,
      panNumber: input.panNumber,
      status: 'active',
      isEmailVerified: false,
      twoFactor: { enabled: false },
    });

    // 6. Generate email verification token (24h TTL)
    const rawVerificationToken = generateCryptoToken(32);
    const tokenHash = hashToken(rawVerificationToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await EmailVerificationToken.create({
      userId: user._id,
      email: normalizedEmail,
      tokenHash,
      expiresAt,
    });

    // 7. Dispatch verification & welcome emails (non-blocking)
    const verificationUrl = `${APP_URL}/verify-email?token=${rawVerificationToken}&email=${encodeURIComponent(
      normalizedEmail
    )}`;
    const verifyMail = renderVerificationEmail({
      name: user.name,
      verificationUrl,
    });
    emailProvider.sendEmail({
      to: normalizedEmail,
      subject: verifyMail.subject,
      htmlContent: verifyMail.html,
      textContent: verifyMail.text,
    }).catch(() => {});

    const welcomeMail = renderWelcomeEmail({
      name: user.name,
      role: user.role,
      portalUrl: `${APP_URL}/dashboard`,
    });
    emailProvider.sendEmail({
      to: normalizedEmail,
      subject: welcomeMail.subject,
      htmlContent: welcomeMail.html,
      textContent: welcomeMail.text,
    }).catch(() => {});

    // 8. Create session & sign JWT
    const { session } = await createSession({
      userId: user._id,
      organizationId: org._id,
      device: 'Registration session',
      browser: 'Web browser',
    });

    const token = await signAuthToken({
      userId: user._id.toString(),
      sessionId: session._id.toString(),
      email: user.email,
      role: user.role,
      organizationId: user.organizationId.toString(),
    });

    // 9. Record audit log
    await AuditLog.create({
      organizationId: org._id,
      actorId: user._id,
      actorName: user.name,
      actorRole: user.role,
      action: 'USER_REGISTERED',
      resource: 'User',
      resourceId: user._id.toString(),
      details: JSON.stringify({ role: user.role, email: user.email }),
    }).catch(() => {});

    return { user, token, sessionId: session._id.toString() };
  }

  /**
   * Authenticate user with email and password
   */
  async login(input: LoginInput): Promise<LoginResult> {
    await connectToDatabase();

    const normalizedEmail = input.email.toLowerCase().trim();
    const query: Record<string, unknown> = { email: normalizedEmail };

    if (input.organizationId && mongoose.Types.ObjectId.isValid(input.organizationId)) {
      query.organizationId = new mongoose.Types.ObjectId(input.organizationId);
    }

    const user = await User.findOne(query);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    if (user.status !== 'active') {
      throw new AuthorizationError('This account has been deactivated or suspended. Please contact administration.');
    }

    // Verify password hash
    const isPasswordValid = await verifyPassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // If 2FA is enabled, require TOTP verification
    if (user.twoFactor && user.twoFactor.enabled) {
      const tempToken = await signAuthToken({
        userId: user._id.toString(),
        sessionId: 'pre-2fa-temp',
        email: user.email,
        role: user.role,
        organizationId: user.organizationId.toString(),
      });
      return { requires2FA: true, tempToken };
    }

    // Create session
    const { session } = await createSession({
      userId: user._id,
      organizationId: user.organizationId,
      device: input.userAgent || 'Web browser',
      browser: input.userAgent,
      ipAddress: input.ipAddress || '127.0.0.1',
    });

    // Sign JWT
    const token = await signAuthToken({
      userId: user._id.toString(),
      sessionId: session._id.toString(),
      email: user.email,
      role: user.role,
      organizationId: user.organizationId.toString(),
    });

    // Update user last login
    user.lastLoginAt = new Date();
    await user.save();

    // Audit log
    await AuditLog.create({
      organizationId: user.organizationId,
      actorId: user._id,
      actorName: user.name,
      actorRole: user.role,
      action: 'USER_LOGIN',
      resource: 'User',
      resourceId: user._id.toString(),
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    }).catch(() => {});

    return {
      requires2FA: false,
      user,
      token,
      sessionId: session._id.toString(),
    };
  }

  /**
   * Complete 2FA login verification
   */
  async verify2FALogin(
    userId: string,
    code: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ user: IUserDocument; token: string; sessionId: string }> {
    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user || !user.twoFactor?.enabled || !user.twoFactor.secret) {
      throw new AuthenticationError('2FA is not enabled or user not found');
    }

    // Check TOTP code or backup codes
    const isTOTPValid = verify2FAToken(user.twoFactor.secret, code.trim());
    let isBackupCodeValid = false;

    if (!isTOTPValid && user.twoFactor.backupCodes && user.twoFactor.backupCodes.length > 0) {
      const backupIndex = user.twoFactor.backupCodes.indexOf(code.trim().toUpperCase());
      if (backupIndex !== -1) {
        isBackupCodeValid = true;
        // Consume backup code
        user.twoFactor.backupCodes.splice(backupIndex, 1);
        await user.save();
      }
    }

    if (!isTOTPValid && !isBackupCodeValid) {
      throw new AuthenticationError('Invalid 2FA code or backup code');
    }

    const { session } = await createSession({
      userId: user._id,
      organizationId: user.organizationId,
      device: userAgent || 'Web browser',
      browser: userAgent,
      ipAddress: ipAddress || '127.0.0.1',
    });

    const token = await signAuthToken({
      userId: user._id.toString(),
      sessionId: session._id.toString(),
      email: user.email,
      role: user.role,
      organizationId: user.organizationId.toString(),
    });

    user.lastLoginAt = new Date();
    await user.save();

    await AuditLog.create({
      organizationId: user.organizationId,
      actorId: user._id,
      actorName: user.name,
      actorRole: user.role,
      action: 'USER_LOGIN_2FA',
      resource: 'User',
      resourceId: user._id.toString(),
      ipAddress,
      userAgent,
    }).catch(() => {});

    return { user, token, sessionId: session._id.toString() };
  }

  /**
   * Verify email via link token
   */
  async verifyEmailByToken(token: string, email: string): Promise<boolean> {
    await connectToDatabase();

    const tokenHash = hashToken(token);
    const record = await EmailVerificationToken.findOne({
      email: email.toLowerCase().trim(),
      tokenHash,
      usedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      throw new ValidationError('Invalid or expired email verification token');
    }

    record.usedAt = new Date();
    await record.save();

    await User.updateOne(
      { _id: record.userId },
      { $set: { isEmailVerified: true, emailVerifiedAt: new Date() } }
    );

    return true;
  }

  /**
   * Send 6-digit numeric OTP
   */
  async sendOTP(email: string, purpose: OTPPurpose): Promise<boolean> {
    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Don't leak user existence; resolve true silently
      return true;
    }

    const otp = generateOTP(6);
    const otpHash = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate existing active OTPs for this email and purpose
    await EmailOTP.deleteMany({ email: normalizedEmail, purpose });

    await EmailOTP.create({
      email: normalizedEmail,
      otpHash,
      purpose,
      expiresAt,
      attempts: 0,
    });

    const otpMail = renderOTPEmail({
      name: user.name,
      otp,
      purpose,
      expiresInMinutes: 10,
    });

    await emailProvider.sendEmail({
      to: normalizedEmail,
      subject: otpMail.subject,
      htmlContent: otpMail.html,
      textContent: otpMail.text,
    });

    return true;
  }

  /**
   * Verify 6-digit numeric OTP
   */
  async verifyOTP(email: string, otp: string, purpose: OTPPurpose): Promise<boolean> {
    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();
    const record = await EmailOTP.findOne({
      email: normalizedEmail,
      purpose,
      verifiedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      throw new ValidationError('Invalid or expired OTP code');
    }

    if (record.attempts >= 5) {
      throw new ValidationError('Maximum OTP verification attempts exceeded. Please request a new code.');
    }

    const isMatch = hashOTP(otp.trim()) === record.otpHash;
    if (!isMatch) {
      record.attempts += 1;
      await record.save();
      throw new ValidationError('Invalid verification code');
    }

    record.verifiedAt = new Date();
    await record.save();

    if (purpose === 'VERIFY_EMAIL') {
      await User.updateOne(
        { email: normalizedEmail },
        { $set: { isEmailVerified: true, emailVerifiedAt: new Date() } }
      );
    }

    return true;
  }

  /**
   * Initiate forgot password flow
   */
  async forgotPassword(email: string): Promise<boolean> {
    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Do not reveal email existence to prevent user enumeration
      return true;
    }

    const rawToken = generateCryptoToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await PasswordResetToken.create({
      userId: user._id,
      email: normalizedEmail,
      tokenHash,
      expiresAt,
    });

    const resetUrl = `${APP_URL}/reset-password?token=${rawToken}&email=${encodeURIComponent(normalizedEmail)}`;
    const resetMail = renderPasswordResetEmail({
      name: user.name,
      resetUrl,
      expiresInMinutes: 60,
    });

    await emailProvider.sendEmail({
      to: normalizedEmail,
      subject: resetMail.subject,
      htmlContent: resetMail.html,
      textContent: resetMail.text,
    });

    return true;
  }

  /**
   * Complete password reset with token
   */
  async resetPassword(token: string, email: string, newPassword: string): Promise<boolean> {
    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();
    const tokenHash = hashToken(token);

    const record = await PasswordResetToken.findOne({
      email: normalizedEmail,
      tokenHash,
      usedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      throw new ValidationError('Invalid or expired password reset link');
    }

    const user = await User.findById(record.userId);
    if (!user) {
      throw new NotFoundError('User account not found');
    }

    const passwordHash = await hashPassword(newPassword);
    user.passwordHash = passwordHash;
    await user.save();

    record.usedAt = new Date();
    await record.save();

    // Invalidate all existing sessions for security
    await revokeAllUserSessions(user._id);

    // Send security alert
    const alertMail = renderSecurityAlertEmail({
      name: user.name,
      action: 'Password was reset via security link',
    });
    emailProvider.sendEmail({
      to: normalizedEmail,
      subject: alertMail.subject,
      htmlContent: alertMail.html,
      textContent: alertMail.text,
    }).catch(() => {});

    return true;
  }

  /**
   * Change password while authenticated
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    // Revoke other sessions
    await revokeAllUserSessions(user._id);

    const alertMail = renderSecurityAlertEmail({
      name: user.name,
      action: 'Password was changed from your account settings',
    });
    emailProvider.sendEmail({
      to: user.email,
      subject: alertMail.subject,
      htmlContent: alertMail.html,
      textContent: alertMail.text,
    }).catch(() => {});

    return true;
  }

  /**
   * Initialize 2FA TOTP setup
   */
  async setup2FA(userId: string): Promise<{ secret: string; otpauthUrl: string }> {
    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    const secret = generate2FASecret();
    const otpauthUrl = get2FAKeyURI(user.email, secret, 'HopeHorizon');

    return { secret, otpauthUrl };
  }

  /**
   * Confirm & activate 2FA
   */
  async confirm2FA(
    userId: string,
    secret: string,
    code: string
  ): Promise<{ backupCodes: string[] }> {
    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    const isValid = verify2FAToken(secret, code.trim());
    if (!isValid) {
      throw new ValidationError('Invalid authenticator verification code');
    }

    // Generate 8 alphanumeric backup codes
    const backupCodes: string[] = [];
    for (let i = 0; i < 8; i++) {
      backupCodes.push(generateCryptoToken(4).toUpperCase());
    }

    user.twoFactor = {
      enabled: true,
      secret,
      backupCodes,
    };
    await user.save();

    return { backupCodes };
  }

  /**
   * Disable 2FA
   */
  async disable2FA(userId: string, password: string): Promise<boolean> {
    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new AuthenticationError('Password verification failed');
    }

    user.twoFactor = {
      enabled: false,
      secret: undefined,
      backupCodes: [],
    };
    await user.save();

    return true;
  }

  /**
   * Terminate single session
   */
  async logout(sessionId: string): Promise<boolean> {
    return await revokeSession(sessionId);
  }
}

export const authService = new AuthService();
export default authService;
