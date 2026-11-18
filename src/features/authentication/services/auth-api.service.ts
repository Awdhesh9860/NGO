import {
  RegisterSchema,
  LoginSchema,
  VerifyEmailSchema,
  SendOTPSchema,
  VerifyOTPSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ChangePasswordSchema,
} from '../schemas/auth.schema';
import { ApiResponse } from '@/lib/api-response';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...init?.headers,
    },
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({
    success: false,
    error: { code: 'HTTP_ERROR', message: `Request failed with status ${res.status}` },
  }));

  return data as ApiResponse<T>;
}

export class AuthApiService {
  async register(payload: RegisterSchema) {
    return await fetchJson<{
      user: {
        id: string;
        name: string;
        email: string;
        role: string;
        phone?: string;
        isEmailVerified: boolean;
        organizationId: string;
      };
      sessionId: string;
    }>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async login(payload: LoginSchema) {
    return await fetchJson<{
      requires2FA: boolean;
      tempToken?: string;
      user?: {
        id: string;
        name: string;
        email: string;
        role: string;
        avatar?: string;
        phone?: string;
        isEmailVerified: boolean;
        organizationId: string;
      };
      sessionId?: string;
    }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async logout() {
    return await fetchJson<{ message: string }>('/api/v1/auth/logout', {
      method: 'POST',
    });
  }

  async getSession() {
    return await fetchJson<{
      authenticated: boolean;
      user: {
        id: string;
        name: string;
        email: string;
        role: string;
        phone?: string;
        avatar?: string;
        designation?: string;
        isEmailVerified: boolean;
        twoFactorEnabled: boolean;
        organizationId: string;
      } | null;
      permissions: string[];
      sessionId?: string;
    }>('/api/v1/auth/session', {
      method: 'GET',
    });
  }

  async verifyEmail(payload: VerifyEmailSchema) {
    return await fetchJson<{ message: string }>('/api/v1/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async sendOTP(payload: SendOTPSchema) {
    return await fetchJson<{ message: string }>('/api/v1/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async verifyOTP(payload: VerifyOTPSchema) {
    return await fetchJson<{ message: string }>('/api/v1/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async forgotPassword(payload: ForgotPasswordSchema) {
    return await fetchJson<{ message: string }>('/api/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async resetPassword(payload: ResetPasswordSchema) {
    return await fetchJson<{ message: string }>('/api/v1/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async changePassword(payload: ChangePasswordSchema) {
    return await fetchJson<{ message: string }>('/api/v1/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getSessions() {
    return await fetchJson<
      Array<{
        id: string;
        device: string;
        browser: string;
        ip: string;
        lastActive: string;
        isCurrent: boolean;
      }>
    >('/api/v1/auth/sessions', {
      method: 'GET',
    });
  }

  async terminateSession(sessionId: string) {
    return await fetchJson<{ message: string }>(`/api/v1/auth/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  async terminateOtherSessions() {
    return await fetchJson<{ message: string }>('/api/v1/auth/sessions', {
      method: 'DELETE',
    });
  }

  async setup2FA() {
    return await fetchJson<{ secret: string; otpauthUrl: string }>('/api/v1/auth/two-factor/setup', {
      method: 'POST',
    });
  }

  async verify2FA(secret: string, code: string) {
    return await fetchJson<{ message: string; backupCodes: string[] }>('/api/v1/auth/two-factor/verify', {
      method: 'POST',
      body: JSON.stringify({ secret, code }),
    });
  }

  async disable2FA(password: string) {
    return await fetchJson<{ message: string }>('/api/v1/auth/two-factor/disable', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  async verify2FALogin(tempToken: string, code: string) {
    return await fetchJson<{
      user: {
        id: string;
        name: string;
        email: string;
        role: string;
        avatar?: string;
        phone?: string;
        isEmailVerified: boolean;
        organizationId: string;
      };
      sessionId: string;
    }>('/api/v1/auth/two-factor/login', {
      method: 'POST',
      body: JSON.stringify({ tempToken, code }),
    });
  }
}

export const authApi = new AuthApiService();
export default authApi;
