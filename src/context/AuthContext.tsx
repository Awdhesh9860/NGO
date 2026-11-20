'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, PermissionKey } from '../types';
import { INITIAL_USERS } from '../data/mockDatabase';

export const IS_DEMO_PERSONAS_ENABLED =
  process.env.NODE_ENV !== 'production' &&
  process.env.NEXT_PUBLIC_ENABLE_DEMO_PERSONAS === 'true';

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  isDemoPersonasEnabled: boolean;
  permissions: PermissionKey[];
  refreshSession: () => Promise<User | null>;
  setAuthenticatedUser: (user: User | null, grantedPermissions?: PermissionKey[]) => void;
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
  hasPermission: (permission: PermissionKey) => boolean;
  allUsers: User[];
  updateCurrentUser: (updates: Partial<User>) => void;
  registerUser: (
    nameOrData: string | (Partial<User> & { name: string; email: string }),
    email?: string,
    role?: UserRole,
    phone?: string
  ) => User;
  register: (
    nameOrData: string | (Partial<User> & { name: string; email: string }),
    email?: string,
    role?: UserRole,
    phone?: string
  ) => User;

  // Modal states
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register' | 'forgot' | '2fa' | 'personas';
  openAuthModal: (tab?: 'login' | 'register' | 'forgot' | '2fa' | 'personas') => void;
  closeAuthModal: () => void;
  setAuthModalTab: (tab: 'login' | 'register' | 'forgot' | '2fa' | 'personas') => void;

  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;

  // Security & 2FA
  twoFactorEnabled: boolean;
  toggle2FA: () => boolean;
  changePassword: (oldPass: string, newPass: string) => boolean;

  // Sessions
  sessions: UserSession[];
  terminateSession: (sessionId: string) => void;
  terminateAllOtherSessions: () => void;
}

const ROLE_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  SUPER_ADMIN: [
    'users.view',
    'users.manage',
    'roles.manage',
    'projects.view',
    'projects.manage',
    'projects.view_assigned',
    'tasks.assign_manage',
    'tasks.update_assigned',
    'donations.view_all',
    'donations.refund',
    'donations.view_own',
    'content.publish',
    'certificates.issue',
    'reports.export_financial',
    'audit_logs.view',
    'settings.manage',
  ],
  ADMIN: [
    'users.view',
    'users.manage',
    'projects.view',
    'projects.manage',
    'projects.view_assigned',
    'tasks.assign_manage',
    'tasks.update_assigned',
    'donations.view_all',
    'donations.refund',
    'donations.view_own',
    'content.publish',
    'certificates.issue',
    'reports.export_financial',
    'audit_logs.view',
    'settings.manage',
  ],
  MANAGER: [
    'projects.view',
    'projects.manage',
    'projects.view_assigned',
    'tasks.assign_manage',
    'tasks.update_assigned',
    'donations.view_own',
    'certificates.issue',
  ],
  TEAM_MEMBER: ['projects.view_assigned', 'tasks.update_assigned', 'donations.view_own'],
  VOLUNTEER: ['projects.view_assigned', 'tasks.update_assigned', 'donations.view_own'],
  DONOR: ['donations.view_own'],
  MEMBER: ['donations.view_own'],
  CONTENT_EDITOR: ['content.publish', 'donations.view_own'],
  ACCOUNTANT: ['donations.view_all', 'donations.refund', 'donations.view_own', 'reports.export_financial'],
  GUEST: [],
  PROJECT_MANAGER: [
    'projects.view',
    'projects.manage',
    'projects.view_assigned',
    'tasks.assign_manage',
    'tasks.update_assigned',
    'donations.view_own',
    'certificates.issue',
  ],
  COMMUNICATIONS: ['content.publish', 'donations.view_own'],
  EXECUTIVE_DIRECTOR: [
    'users.view',
    'users.manage',
    'roles.manage',
    'projects.view',
    'projects.manage',
    'projects.view_assigned',
    'tasks.assign_manage',
    'tasks.update_assigned',
    'donations.view_all',
    'donations.refund',
    'donations.view_own',
    'content.publish',
    'certificates.issue',
    'reports.export_financial',
    'audit_logs.view',
    'settings.manage',
  ],
};

const INITIAL_SESSIONS: UserSession[] = [
  {
    id: 'sess-1',
    device: 'Current Browser Session',
    browser: 'Web Client',
    ip: '127.0.0.1',
    location: 'Active Workspace',
    lastActive: 'Active now',
    isCurrent: true,
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(IS_DEMO_PERSONAS_ENABLED ? INITIAL_USERS : []);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [serverPermissions, setServerPermissions] = useState<PermissionKey[]>([]);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot' | '2fa' | 'personas'>('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Security & 2FA states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(false);

  // Sessions
  const [sessions, setSessions] = useState<UserSession[]>(INITIAL_SESSIONS);

  const setAuthenticatedUser = useCallback((user: User | null, grantedPermissions?: PermissionKey[]) => {
    setCurrentUser(user);
    if (grantedPermissions) {
      setServerPermissions(grantedPermissions);
    } else if (user) {
      setServerPermissions(ROLE_PERMISSIONS[user.role] || []);
    } else {
      setServerPermissions([]);
    }
  }, []);

  /**
   * Authoritative server session hydration via HTTP-only JWT cookie (`/api/v1/auth/session`).
   */
  const refreshSession = useCallback(async (): Promise<User | null> => {
    try {
      const res = await fetch('/api/v1/auth/session', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });

      if (res.ok) {
        const json = await res.json();
        if (json?.success && json.data?.authenticated && json.data?.user) {
          const apiUser = json.data.user;
          const hydratedUser: User = {
            id: apiUser.id,
            name: apiUser.name,
            email: apiUser.email,
            role: apiUser.role as UserRole,
            phone: apiUser.phone,
            avatar: apiUser.avatar,
            status: 'active',
            createdAt: new Date().toISOString(),
            organizationId: apiUser.organizationId,
          };
          setCurrentUser(hydratedUser);
          setServerPermissions(
            Array.isArray(json.data.permissions)
              ? (json.data.permissions as PermissionKey[])
              : ROLE_PERMISSIONS[hydratedUser.role] || []
          );
          setTwoFactorEnabled(Boolean(apiUser.twoFactorEnabled));
          return hydratedUser;
        }
      }
    } catch {
      // Network or server unavailable — remain unauthenticated unless demo mode explicitly enabled
    }

    // Only hydrate local demo personas when explicitly enabled in non-production environments
    if (IS_DEMO_PERSONAS_ENABLED && typeof window !== 'undefined') {
      try {
        const savedUsers = localStorage.getItem('hh_ngo_users');
        const parsedUsers: User[] = savedUsers ? JSON.parse(savedUsers) : INITIAL_USERS;
        setUsers(parsedUsers);
        const savedUserId = localStorage.getItem('hh_ngo_current_user_id');
        if (savedUserId) {
          const found = parsedUsers.find((u) => u.id === savedUserId);
          if (found) {
            setCurrentUser(found);
            setServerPermissions(ROLE_PERMISSIONS[found.role] || []);
            return found;
          }
        }
      } catch {
        // Ignore storage read failures
      }
    }

    setCurrentUser(null);
    setServerPermissions([]);
    return null;
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.resolve()
      .then(() => refreshSession())
      .finally(() => {
        if (active) setIsAuthLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshSession]);

  const openAuthModal = (tab: 'login' | 'register' | 'forgot' | '2fa' | 'personas' = 'login') => {
    const safeTab = tab === 'personas' && !IS_DEMO_PERSONAS_ENABLED ? 'login' : tab;
    setAuthModalTab(safeTab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);
  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  const login = (email: string): boolean => {
    if (!IS_DEMO_PERSONAS_ENABLED) {
      return false;
    }
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setAuthenticatedUser(found);
      if (typeof window !== 'undefined') {
        localStorage.setItem('hh_ngo_current_user_id', found.id);
      }
      setIsAuthModalOpen(false);
      return true;
    }
    return false;
  };

  const logout = () => {
    setAuthenticatedUser(null);
    setTwoFactorEnabled(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hh_ngo_current_user_id');
      fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    }
  };

  const switchUser = (userId: string) => {
    // Hard security gate: demo persona switching is completely disabled outside explicit dev sandbox mode
    if (!IS_DEMO_PERSONAS_ENABLED) {
      return;
    }
    const found = users.find((u) => u.id === userId);
    if (found) {
      setAuthenticatedUser(found);
      if (typeof window !== 'undefined') {
        localStorage.setItem('hh_ngo_current_user_id', found.id);
      }
    }
  };

  const hasPermission = (permission: PermissionKey): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'SUPER_ADMIN') return true;
    if (serverPermissions.length > 0) {
      return serverPermissions.includes(permission);
    }
    const allowed = ROLE_PERMISSIONS[currentUser.role] || [];
    return allowed.includes(permission);
  };

  const updateCurrentUser = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    if (IS_DEMO_PERSONAS_ENABLED) {
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    }
  };

  const registerUser = (
    nameOrData: string | (Partial<User> & { name: string; email: string }),
    email?: string,
    role?: UserRole,
    phone?: string
  ): User => {
    let name = '';
    let userEmail = '';
    let userRole: UserRole = 'DONOR';
    let userPhone = phone;
    let extraFields: Partial<User> = {};

    if (typeof nameOrData === 'string') {
      name = nameOrData;
      userEmail = email || '';
      userRole = role || 'DONOR';
    } else if (nameOrData && typeof nameOrData === 'object') {
      name = nameOrData.name;
      userEmail = nameOrData.email;
      userRole = nameOrData.role || 'DONOR';
      userPhone = nameOrData.phone;
      extraFields = nameOrData;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email: userEmail,
      role: userRole,
      phone: userPhone,
      status: 'active',
      createdAt: new Date().toISOString(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      ...extraFields,
    };

    if (IS_DEMO_PERSONAS_ENABLED) {
      setUsers((prev) => [newUser, ...prev]);
      setAuthenticatedUser(newUser);
    }
    setIsAuthModalOpen(false);
    return newUser;
  };

  const toggle2FA = (): boolean => {
    const nextState = !twoFactorEnabled;
    setTwoFactorEnabled(nextState);
    return nextState;
  };

  const changePassword = (): boolean => true;

  const terminateSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const terminateAllOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user: currentUser,
        isAuthenticated: Boolean(currentUser),
        isAuthLoading,
        isDemoPersonasEnabled: IS_DEMO_PERSONAS_ENABLED,
        permissions: serverPermissions,
        refreshSession,
        setAuthenticatedUser,
        login,
        logout,
        switchUser,
        hasPermission,
        allUsers: IS_DEMO_PERSONAS_ENABLED ? users : [],
        updateCurrentUser,
        registerUser,
        register: registerUser,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        setAuthModalTab,
        isProfileModalOpen,
        openProfileModal,
        closeProfileModal,
        twoFactorEnabled,
        toggle2FA,
        changePassword,
        sessions,
        terminateSession,
        terminateAllOtherSessions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
