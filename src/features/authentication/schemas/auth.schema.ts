import { z } from 'zod';

export const passwordValidation = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password cannot exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const panValidation = z
  .string()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format. Must match 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)')
  .optional()
  .or(z.literal(''));

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: passwordValidation,
  role: z.enum(['DONOR', 'VOLUNTEER', 'MEMBER']).default('DONOR'),
  phone: z.string().trim().optional(),
  panNumber: panValidation,
  givingInterests: z.array(z.string()).optional(),
  givingFrequency: z.string().optional(),
  organizationId: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
  organizationId: z.string().optional(),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
});

export const sendOTPSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  purpose: z.enum(['VERIFY_EMAIL', 'PASSWORD_RESET', 'LOGIN_2FA']),
});

export const verifyOTPSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  otp: z.string().trim().length(6, 'OTP must be exactly 6 digits'),
  purpose: z.enum(['VERIFY_EMAIL', 'PASSWORD_RESET', 'LOGIN_2FA']),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  newPassword: passwordValidation,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordValidation,
});

export const verify2FASchema = z.object({
  code: z.string().trim().min(6, '2FA code must be at least 6 characters'),
  secret: z.string().optional(),
  userId: z.string().optional(),
});

export const disable2FASchema = z.object({
  password: z.string().min(1, 'Password is required to disable 2FA'),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>;
export type SendOTPSchema = z.infer<typeof sendOTPSchema>;
export type VerifyOTPSchema = z.infer<typeof verifyOTPSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
export type Verify2FASchema = z.infer<typeof verify2FASchema>;
export type Disable2FASchema = z.infer<typeof disable2FASchema>;
