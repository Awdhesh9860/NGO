import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { PermissionKey } from '../../types';
import { Lock, ShieldAlert } from 'lucide-react';

interface PermissionGateProps {
  permission: PermissionKey | PermissionKey[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showRestrictedBanner?: boolean;
  bannerTitle?: string;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  requireAll = false,
  children,
  fallback = null,
  showRestrictedBanner = false,
  bannerTitle = 'Restricted Access'
}) => {
  const { hasPermission, currentUser } = useAuth();

  const permissions = Array.isArray(permission) ? permission : [permission];

  const hasAccess = requireAll
    ? permissions.every((p) => hasPermission(p))
    : permissions.some((p) => hasPermission(p));

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showRestrictedBanner) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-amber-900">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-200 text-amber-900">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider">{bannerTitle}</h4>
            <p className="text-xs text-amber-800 mt-0.5">
              Your active role (<strong>{currentUser?.role.replace('_', ' ')}</strong>) does not hold clearance for: {' '}
              <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-[11px]">
                {permissions.join(', ')}
              </code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{fallback}</>;
};
