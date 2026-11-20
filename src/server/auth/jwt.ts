import { SignJWT, jwtVerify } from 'jose';
import { UserRole } from '@/types';
import { getJwtSecret } from '@/config/environment';

export interface AuthTokenPayload {
  userId: string;
  sessionId: string;
  email: string;
  role: UserRole;
  organizationId: string;
}

function getJwtExpiration(): string {
  return process.env.SESSION_MAX_AGE ? `${process.env.SESSION_MAX_AGE}s` : '7d';
}

function getJwtKey(): Uint8Array {
  // Resolve dynamically so production fail-closed checks and secret rotation are respected
  const secret = getJwtSecret();
  const buf = Buffer.from(secret, 'utf-8');
  const uint8 = new Uint8Array(buf.length);
  for (let i = 0; i < buf.length; i++) {
    uint8[i] = buf[i];
  }
  return uint8;
}

/**
 * Sign an authentication JWT with Jose HS256
 */
export async function signAuthToken(payload: AuthTokenPayload): Promise<string> {
  const key = getJwtKey();
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(getJwtExpiration())
    .setIssuer('hopehorizon-auth')
    .setAudience('hopehorizon-app')
    .sign(key);
}

/**
 * Verify an authentication JWT with Jose HS256
 */
export async function verifyAuthToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const key = getJwtKey();
    const { payload } = await jwtVerify(token, key, {
      issuer: 'hopehorizon-auth',
      audience: 'hopehorizon-app',
    });

    return {
      userId: payload.userId as string,
      sessionId: payload.sessionId as string,
      email: payload.email as string,
      role: payload.role as UserRole,
      organizationId: payload.organizationId as string,
    };
  } catch {
    return null;
  }
}
