import { NextRequest } from 'next/server';
import { verifyAuthToken, AuthTokenPayload } from '@/server/auth/jwt';
import { validateSession } from '@/server/auth/session';
import { User, IUserDocument } from '@/server/database/models/User';
import { AUTH_COOKIE_NAME } from '@/server/security/cookies';
import { AuthenticationError, AuthorizationError } from '@/server/errors';
import { UserRole, PermissionKey } from '@/types';
import { checkRolePermission } from './permissions';
import connectToDatabase from '@/server/database/connection';

export interface AuthenticatedContext {
  user: IUserDocument;
  payload: AuthTokenPayload;
  sessionId: string;
}

/**
 * Extracts auth token from request cookies or Authorization Bearer header
 */
export function extractAuthToken(req: NextRequest): string | null {
  // 1. From HTTP-only Cookie
  const cookieToken = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (cookieToken) return cookieToken;

  // 2. From Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  return null;
}

/**
 * Authenticates request, returning the user and session if valid, or null if unauthenticated
 */
export async function getAuthenticatedContext(req: NextRequest): Promise<AuthenticatedContext | null> {
  const token = extractAuthToken(req);
  if (!token) return null;

  const payload = await verifyAuthToken(token);
  if (!payload) return null;

  await connectToDatabase();

  const session = await validateSession(payload.sessionId);
  if (!session) return null;

  const user = await User.findById(payload.userId);
  if (!user || user.status !== 'active') return null;

  return {
    user,
    payload,
    sessionId: payload.sessionId,
  };
}

/**
 * Strict authentication guard: throws 401 AuthenticationError if not logged in
 */
export async function requireAuthentication(req: NextRequest): Promise<AuthenticatedContext> {
  const context = await getAuthenticatedContext(req);
  if (!context) {
    throw new AuthenticationError('Active authentication session required');
  }
  return context;
}

/**
 * Role-based access control guard: throws 403 AuthorizationError if user does not possess an allowed role
 */
export async function requireRole(
  req: NextRequest,
  allowedRoles: UserRole[]
): Promise<AuthenticatedContext> {
  const context = await requireAuthentication(req);

  // SUPER_ADMIN has access to everything
  if (context.user.role === 'SUPER_ADMIN') {
    return context;
  }

  if (!allowedRoles.includes(context.user.role)) {
    throw new AuthorizationError(
      `Access denied. Role '${context.user.role}' is not authorized to access this resource`
    );
  }

  return context;
}

/**
 * Permission-based access control guard: throws 403 AuthorizationError if user lacks permission
 */
export async function requirePermission(
  req: NextRequest,
  permission: PermissionKey
): Promise<AuthenticatedContext> {
  const context = await requireAuthentication(req);

  // SUPER_ADMIN has all permissions
  if (context.user.role === 'SUPER_ADMIN') {
    return context;
  }

  if (!checkRolePermission(context.user.role, permission)) {
    throw new AuthorizationError(
      `Access denied. Missing required permission '${permission}'`
    );
  }

  return context;
}

/**
 * Multi-tenant boundary guard: ensures user belongs to target organization
 */
export async function requireOrganizationAccess(
  req: NextRequest,
  targetOrganizationId: string
): Promise<AuthenticatedContext> {
  const context = await requireAuthentication(req);

  // SUPER_ADMIN can inspect across organizations
  if (context.user.role === 'SUPER_ADMIN') {
    return context;
  }

  if (context.user.organizationId.toString() !== targetOrganizationId) {
    throw new AuthorizationError('Cross-organization access forbidden');
  }

  return context;
}
