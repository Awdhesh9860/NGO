import { SignJWT, jwtVerify } from 'jose';
import { UserRole } from '@/types';

export interface AuthTokenPayload {
  userId: string;
  sessionId: string;
  email: string;
  role: UserRole;
  organizationId: string;
}

const DEFAULT_JWT_SECRET = 'hopehorizon-dev-insecure-jwt-secret-min-32-chars-key-2026';
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
const JWT_EXPIRATION = process.env.SESSION_MAX_AGE ? `${process.env.SESSION_MAX_AGE}s` : '7d';

function getJwtKey(): Uint8Array {
  // Use Uint8Array constructed in current execution context
  const buf = Buffer.from(JWT_SECRET, 'utf-8');
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
    .setExpirationTime(JWT_EXPIRATION)
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
