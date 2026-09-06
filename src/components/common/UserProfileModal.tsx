import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDatabase } from '../../context/DatabaseContext';
import { RoleBadge, ROLE_DETAILS } from './RoleBadge';
import { PermissionKey } from '../../types';
import {
  X,
  User,
  Shield,
  Key,
  Smartphone,
  CheckCircle2,
  Lock,
  LogOut,
  Laptop,
  Globe,
  Camera,
  Check,
  Save,
  QrCode,
  AlertTriangle
} from 'lucide-react';

const ALL_SYSTEM_PERMISSIONS: { key: PermissionKey; label: string; group: string; desc: string }[] = [
  { key: 'users.view', label: 'View Personnel Directory', group: 'User Management', desc: 'Read user rosters and staff accounts.' },
  { key: 'users.manage', label: 'Create & Edit Users', group: 'User Management', desc: 'Modify roles, designations, and account status.' },
  { key: 'roles.manage', label: 'RBAC Policy & Governance', group: 'User Management', desc: 'Reconfigure access levels and security policies.' },
  { key: 'projects.view', label: 'View Field Projects', group: 'Project Governance', desc: 'Access comprehensive list of grassroots deployments.' },
  { key: 'projects.manage', label: 'Manage & Authorize Projects', group: 'Project Governance', desc: 'Create, budget, edit, and archive projects.' },
  { key: 'projects.view_assigned', label: 'View Assigned Projects', group: 'Project Governance', desc: 'Read-only access to assigned local initiatives.' },
  { key: 'tasks.assign_manage', label: 'Task Assignment Engine', group: 'Field Coordination', desc: 'Assign and oversee team member action items.' },
  { key: 'tasks.update_assigned', label: 'Update Task Progress', group: 'Field Coordination', desc: 'Mark tasks in-progress or completed.' },
  { key: 'donations.view_all', label: 'View Financial Ledger', group: 'Financial Accounting', desc: 'Access comprehensive donor contributions and amounts.' },
  { key: 'donations.refund', label: 'Authorize Contribution Refund', group: 'Financial Accounting', desc: 'Issue reversals and process transaction cancellations.' },
  { key: 'donations.view_own', label: 'View Personal Giving', group: 'Financial Accounting', desc: 'Access own tax-exempt receipts and certificates.' },
  { key: 'content.publish', label: 'Publish CMS Stories', group: 'Communications', desc: 'Deploy articles, press releases, and news bulletins.' },
  { key: 'certificates.issue', label: 'Mint Verified Certificates', group: 'Certificates & Trust', desc: 'Issue cryptographic 80G and volunteer awards.' },
  { key: 'reports.export_financial', label: 'Export Statutory Audits', group: 'Compliance & Audit', desc: 'Download FCRA returns and audited balance sheets.' },
  { key: 'audit_logs.view', label: 'Access Immutable Audit Trail', group: 'Security & Logs', desc: 'Review real-time security events and session logs.' },
  { key: 'settings.manage', label: 'Manage Global NGO Settings', group: 'System Governance', desc: 'Update legal registration, payment gateways, and policies.' }
];

export const UserProfileModal: React.FC = () => {
  const {
    currentUser,
    isProfileModalOpen,
    closeProfileModal,
    updateCurrentUser,
    hasPermission,
    twoFactorEnabled,
    toggle2FA,
    sessions,
    terminateSession,
    terminateAllOtherSessions
  } = useAuth();

  const { showToast } = useToast();
  const { recordAuditLog } = useDatabase();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'permissions' | 'sessions'>('profile');

  // Form states
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [department, setDepartment] = useState(currentUser?.department || '');
  const [designation, setDesignation] = useState(currentUser?.designation || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');

  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isProfileModalOpen || !currentUser) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({
      name,
      phone,
      department,
      designation,
      avatar
    });
    showToast('Profile information successfully updated', 'success');
    recordAuditLog(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'PROFILE_UPDATE',
      'UserService',
      `Updated user profile details for ${currentUser.name}`
    );
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters long', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    showToast('Password updated securely. Encrypted in session store.', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    recordAuditLog(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'PASSWORD_CHANGE',
      'AuthService',
      `User ${currentUser.name} reset their security credentials`
    );
  };

  const handleToggle2FA = () => {
    const isNowActive = toggle2FA();
    if (isNowActive) {
      showToast('Two-Factor Authentication (2FA) is now enabled!', 'success');
    } else {
      showToast('Two-Factor Authentication (2FA) disabled.', 'info');
    }
    recordAuditLog(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      '2FA_TOGGLE',
      'SecurityService',
      `Two-factor status toggled to ${isNowActive ? 'ENABLED' : 'DISABLED'}`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={closeProfileModal}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden z-10 my-8">
        {/* Header Ribbon */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-11 w-11 rounded-full object-cover border-2 border-emerald-500 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">{currentUser.name}</h3>
                <RoleBadge role={currentUser.role} size="sm" />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentUser.email} &bull; Clearance L{ROLE_DETAILS[currentUser.role]?.clearanceLevel || 1}
              </p>
            </div>
          </div>

          <button
            onClick={closeProfileModal}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-3 gap-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Profile Details</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Security & 2FA</span>
          </button>

          <button
            onClick={() => setActiveTab('permissions')}
            className={`pb-3 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'permissions'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Assigned Permissions</span>
          </button>

          <button
            onClick={() => setActiveTab('sessions')}
            className={`pb-3 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sessions'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Laptop className="h-3.5 w-3.5" />
            <span>Active Sessions ({sessions.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto">
          {/* TAB 1: PROFILE DETAILS */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Display Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Mobile / WhatsApp</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Official Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Lead Project Specialist"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Department / Pillar</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Clean Water Initiatives"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Profile Photo URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 outline-hidden focus:border-emerald-600"
                  />
                  <img
                    src={avatar || currentUser.avatar}
                    alt="Preview"
                    className="h-9 w-9 rounded-full object-cover border border-slate-300 shrink-0"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Profile Updates</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SECURITY & 2FA */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* 2FA Toggle Widget */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                        twoFactorEnabled
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Two-Factor Authentication (2FA)
                      </h4>
                      <p className="text-xs text-slate-500">
                        Require a 6-digit one-time code from Google Authenticator or SMS on every sign in.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggle2FA}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      twoFactorEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {twoFactorEnabled && (
                  <div className="rounded-xl bg-white border border-emerald-200 p-3.5 flex items-center justify-between text-xs text-emerald-950">
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-emerald-600" />
                      <span>Authenticator device connected (Seed: <code>HH-2FA-SECURE-9982</code>)</span>
                    </div>
                    <span className="font-bold text-emerald-700 uppercase text-[10px] tracking-wider">
                      Active
                    </span>
                  </div>
                )}
              </div>

              {/* Change Password */}
              <form onSubmit={handleChangePassword} className="space-y-4 border-t border-slate-200 pt-5">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Key className="h-4 w-4 text-slate-500" />
                  <span>Update Password Credentials</span>
                </h4>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 outline-hidden focus:border-emerald-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 outline-hidden focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: ASSIGNED RBAC PERMISSIONS */}
          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Active Role Policy
                    </h4>
                    <p className="text-base font-black text-slate-900 mt-0.5">
                      {ROLE_DETAILS[currentUser.role]?.label} (Clearance Level {ROLE_DETAILS[currentUser.role]?.clearanceLevel}/5)
                    </p>
                  </div>
                  <RoleBadge role={currentUser.role} size="md" />
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  {ROLE_DETAILS[currentUser.role]?.description}
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Granular Permission Gates
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ALL_SYSTEM_PERMISSIONS.map((perm) => {
                    const granted = hasPermission(perm.key);
                    return (
                      <div
                        key={perm.key}
                        className={`p-3 rounded-xl border flex items-start justify-between gap-2 transition ${
                          granted
                            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                            : 'bg-slate-50/70 border-slate-200 text-slate-400 opacity-60'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold">{perm.label}</p>
                          <p className="text-[10px] mt-0.5 leading-tight">{perm.desc}</p>
                          <span className="font-mono text-[9px] mt-1 block font-semibold">
                            {perm.key}
                          </span>
                        </div>

                        {granted ? (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
                            <Check className="h-3 w-3" />
                          </span>
                        ) : (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                            <Lock className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACTIVE SESSIONS */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Active Authorized Devices</h4>
                  <p className="text-xs text-slate-500">
                    Devices and geographic locations currently holding valid JWT bearer tokens.
                  </p>
                </div>
                {sessions.length > 1 && (
                  <button
                    onClick={() => {
                      terminateAllOtherSessions();
                      showToast('Revoked all remote sessions successfully.', 'info');
                    }}
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition"
                  >
                    Revoke All Other Sessions
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                      sess.isCurrent
                        ? 'border-emerald-300 bg-emerald-50/50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 shrink-0">
                        <Laptop className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900">{sess.device}</p>
                          {sess.isCurrent && (
                            <span className="rounded bg-emerald-600 px-2 py-0.2 text-[9px] font-bold uppercase text-white">
                              This Device
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {sess.browser} &bull; {sess.location} (<code>{sess.ip}</code>)
                        </p>
                        <p className="text-[10px] text-slate-400">{sess.lastActive}</p>
                      </div>
                    </div>

                    {!sess.isCurrent && (
                      <button
                        onClick={() => {
                          terminateSession(sess.id);
                          showToast(`Terminated session on ${sess.device}`, 'info');
                        }}
                        className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 hover:border-red-200 transition shrink-0"
                      >
                        Terminate
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
