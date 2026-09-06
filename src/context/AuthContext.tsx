import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, PermissionKey } from '../types';
import { INITIAL_USERS } from '../data/mockDatabase';

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
    'settings.manage'
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
    'settings.manage'
  ],
  MANAGER: [
    'projects.view',
    'projects.manage',
    'projects.view_assigned',
    'tasks.assign_manage',
    'tasks.update_assigned',
    'donations.view_own',
    'certificates.issue'
  ],
  TEAM_MEMBER: [
    'projects.view_assigned',
    'tasks.update_assigned',
    'donations.view_own'
  ],
  VOLUNTEER: [
    'projects.view_assigned',
    'tasks.update_assigned',
    'donations.view_own'
  ],
  DONOR: [
    'donations.view_own'
  ],
  MEMBER: [
    'donations.view_own'
  ],
  CONTENT_EDITOR: [
    'content.publish',
    'donations.view_own'
  ],
  ACCOUNTANT: [
    'donations.view_all',
    'donations.refund',
    'donations.view_own',
    'reports.export_financial'
  ],
  GUEST: [],
  PROJECT_MANAGER: [
    'projects.view',
    'projects.manage',
    'projects.view_assigned',
    'tasks.assign_manage',
    'tasks.update_assigned',
    'donations.view_own',
    'certificates.issue'
  ],
  COMMUNICATIONS: [
    'content.publish',
    'donations.view_own'
  ],
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
    'settings.manage'
  ]
};

const INITIAL_SESSIONS: UserSession[] = [
  {
    id: 'sess-1',
    device: 'MacBook Pro 16" (Apple Silicon)',
    browser: 'Chrome 128.0 (macOS Sequoia)',
    ip: '103.241.192.44',
    location: 'New Delhi, India',
    lastActive: 'Just now (Active session)',
    isCurrent: true
  },
  {
    id: 'sess-2',
    device: 'iPhone 15 Pro Max',
    browser: 'Mobile Safari 17.4',
    ip: '157.48.210.12',
    location: 'Geneva, Switzerland',
    lastActive: '3 hours ago',
    isCurrent: false
  },
  {
    id: 'sess-3',
    device: 'ThinkPad X1 Carbon',
    browser: 'Firefox Developer 126.0',
    ip: '198.51.100.78',
    location: 'New York, USA',
    lastActive: 'Yesterday at 14:22',
    isCurrent: false
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('hh_ngo_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved users', e);
      }
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUserId = localStorage.getItem('hh_ngo_current_user_id');
    if (savedUserId) {
      const found = users.find((u) => u.id === savedUserId);
      if (found) return found;
    }
    // Default to Super Admin for immediate rich experience
    return users[0] || null;
  });

  // Modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot' | '2fa' | 'personas'>('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Security & 2FA states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(() => {
    return localStorage.getItem('hh_2fa_enabled') === 'true';
  });

  // Sessions
  const [sessions, setSessions] = useState<UserSession[]>(() => {
    const saved = localStorage.getItem('hh_user_sessions');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  useEffect(() => {
    localStorage.setItem('hh_ngo_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('hh_ngo_current_user_id', currentUser.id);
    } else {
      localStorage.removeItem('hh_ngo_current_user_id');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('hh_2fa_enabled', String(twoFactorEnabled));
  }, [twoFactorEnabled]);

  useEffect(() => {
    localStorage.setItem('hh_user_sessions', JSON.stringify(sessions));
  }, [sessions]);

  const openAuthModal = (tab: 'login' | 'register' | 'forgot' | '2fa' | 'personas' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const login = (email: string): boolean => {
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
      setIsAuthModalOpen(false);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const hasPermission = (permission: PermissionKey): boolean => {
    if (!currentUser) return false;
    const allowed = ROLE_PERMISSIONS[currentUser.role] || [];
    return allowed.includes(permission);
  };

  const updateCurrentUser = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
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
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      ...extraFields
    };
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    setIsAuthModalOpen(false);
    return newUser;
  };

  const toggle2FA = (): boolean => {
    const nextState = !twoFactorEnabled;
    setTwoFactorEnabled(nextState);
    return nextState;
  };

  const changePassword = (_oldPass: string, _newPass: string): boolean => {
    return true;
  };

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
        isAuthenticated: !!currentUser,
        login,
        logout,
        switchUser,
        hasPermission,
        allUsers: users,
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
        terminateAllOtherSessions
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

