'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { PermissionKey, UserRole } from '@/types';
import { checkRoleAnyPermission, checkRolePermission } from '@/server/authorization/permissions';

export interface PermissionGateProps {
  permission?: PermissionKey;
  anyPermissions?: PermissionKey[];
  allowedRoles?: UserRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * UI-level permission helper.
 * IMPORTANT: Always paired with strict server-side authorization in API routes and services.
 */
export function PermissionGate({
  permission,
  anyPermissions,
  allowedRoles,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { currentUser } = useAuth();
  const role: UserRole = currentUser?.role || 'GUEST';

  if (role === 'GUEST') {
    return <>{fallback}</>;
  }

  if (role === 'SUPER_ADMIN') {
    return <>{children}</>;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  if (permission && !checkRolePermission(role, permission)) {
    return <>{fallback}</>;
  }

  if (anyPermissions && anyPermissions.length > 0 && !checkRoleAnyPermission(role, anyPermissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
