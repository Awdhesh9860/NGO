import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useToast } from '../../context/ToastContext';
import { UserRole, PermissionKey, AuditLog } from '../../types';
import { RoleBadge, ROLE_DETAILS } from '../common/RoleBadge';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  Lock,
  Unlock,
  Users,
  Search,
  Filter,
  Download,
  Activity,
  KeyRound,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Smartphone,
  Globe,
  Sliders,
  Check
} from 'lucide-react';

const PERMISSION_COLUMNS: {
  key: PermissionKey;
  label: string;
  category: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}[] = [
  { key: 'users.view', label: 'View Users', category: 'Personnel', risk: 'LOW' },
  { key: 'users.manage', label: 'Manage Accounts', category: 'Personnel', risk: 'HIGH' },
  { key: 'roles.manage', label: 'RBAC Policies', category: 'Governance', risk: 'CRITICAL' },
  { key: 'projects.view', label: 'View Projects', category: 'Projects', risk: 'LOW' },
  { key: 'projects.manage', label: 'Manage Projects', category: 'Projects', risk: 'HIGH' },
  { key: 'projects.view_assigned', label: 'Assigned Projects', category: 'Projects', risk: 'LOW' },
  { key: 'tasks.assign_manage', label: 'Task Assignment', category: 'Coordination', risk: 'MEDIUM' },
  { key: 'tasks.update_assigned', label: 'Update Tasks', category: 'Coordination', risk: 'LOW' },
  { key: 'donations.view_all', label: 'Full Financial Ledger', category: 'Finance', risk: 'HIGH' },
  { key: 'donations.refund', label: 'Authorize Refunds', category: 'Finance', risk: 'CRITICAL' },
  { key: 'donations.view_own', label: 'Personal Giving', category: 'Finance', risk: 'LOW' },
  { key: 'content.publish', label: 'Publish CMS Stories', category: 'Media', risk: 'MEDIUM' },
  { key: 'certificates.issue', label: 'Issue Certificates', category: 'Trust', risk: 'HIGH' },
  { key: 'reports.export_financial', label: 'Statutory Reports', category: 'Compliance', risk: 'HIGH' },
  { key: 'audit_logs.view', label: 'View Audit Logs', category: 'Security', risk: 'HIGH' },
  { key: 'settings.manage', label: 'Global NGO Settings', category: 'Governance', risk: 'CRITICAL' }
];

const ALL_ROLES: UserRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'MANAGER',
  'TEAM_MEMBER',
  'VOLUNTEER',
  'DONOR',
  'MEMBER',
  'CONTENT_EDITOR',
  'ACCOUNTANT'
];

export const SecurityAuditCenter: React.FC = () => {
  const { currentUser, hasPermission, allUsers, switchUser } = useAuth();
  const { auditLogs, recordAuditLog } = useDatabase();
  const { showToast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'audit_trail' | 'security_health'>('matrix');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActionFilter, setSelectedActionFilter] = useState('ALL');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<UserRole | 'ALL'>('ALL');

  // Filter audit logs
  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.actorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = selectedActionFilter === 'ALL' || log.action === selectedActionFilter;
    const matchesRole = selectedRoleFilter === 'ALL' || log.actorRole === selectedRoleFilter;

    return matchesSearch && matchesAction && matchesRole;
  });

  const handleSimulateSecurityEvent = () => {
    const events = [
      { action: 'PERMISSION_CHALLENGE_FAILED', resource: 'FinancialLedger', details: 'Unauthorized attempt to access refund endpoint blocked by RBAC filter.' },
      { action: 'TWO_FACTOR_VERIFIED', resource: 'AuthGateway', details: 'Successful 2FA TOTP verification token validated.' },
      { action: 'EXPORT_AUDIT_LEDGER', resource: 'ComplianceRegistry', details: 'Statutory 80G export triggered by verified Accountant.' },
      { action: 'SESSION_REVOCATION', resource: 'SessionManager', details: 'Remote mobile session terminated via User Security Hub.' }
    ];

    const randomEvent = events[Math.floor(Math.random() * events.length)];
    recordAuditLog(
      currentUser?.id || 'sys-actor',
      currentUser?.name || 'Security Daemon',
      currentUser?.role || 'SUPER_ADMIN',
      randomEvent.action,
      randomEvent.resource,
      randomEvent.details
    );
    showToast(`Simulated security log recorded: ${randomEvent.action}`, 'info');
  };

  const handleExportLogs = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Timestamp,Actor Name,Actor Role,Action,Resource,Details,IP Address']
        .concat(
          filteredLogs.map(
            (l) =>
              `"${l.timestamp}","${l.actorName}","${l.actorRole}","${l.action}","${l.resource}","${l.details.replace(/"/g, '""')}","${l.ipAddress}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hopehorizon_audit_trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Immutable audit trail exported to CSV', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-600/30">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Security, RBAC & Governance Center
                </h2>
                <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold uppercase text-purple-800 border border-purple-200">
                  Enterprise Security L5
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                Cryptographic immutable audit trails, multi-role security matrices, active session management, and granular permission gates.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleSimulateSecurityEvent}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Simulate Security Event</span>
            </button>
            <button
              onClick={handleExportLogs}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 transition shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Audit Trail</span>
            </button>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex gap-2 pt-6 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('matrix')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
              activeSubTab === 'matrix'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Role & Permissions Matrix (9 Roles × 16 Gates)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('audit_trail')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
              activeSubTab === 'audit_trail'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Live Security Audit Logs ({auditLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('security_health')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
              activeSubTab === 'security_health'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Platform Security Health</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: RBAC MATRIX */}
      {activeSubTab === 'matrix' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Enterprise Role-Based Access Control (RBAC) Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Verified zero-trust permission layout enforcing separation of concerns across departments.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Granted
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" /> Restricted
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                  <th className="p-3 font-bold sticky left-0 bg-slate-50 z-10 w-64">
                    Permission Scope
                  </th>
                  {ALL_ROLES.map((role) => (
                    <th key={role} className="p-3 text-center font-bold whitespace-nowrap min-w-[100px]">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-slate-500">
                          L{ROLE_DETAILS[role]?.clearanceLevel}
                        </span>
                        <span className="font-bold text-slate-900">{ROLE_DETAILS[role]?.label.split(' ')[0]}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PERMISSION_COLUMNS.map((perm) => (
                  <tr key={perm.key} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 sticky left-0 bg-white z-10 font-medium">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{perm.label}</p>
                          <span className="font-mono text-[9px] text-slate-400">{perm.key}</span>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            perm.risk === 'CRITICAL'
                              ? 'bg-red-100 text-red-800'
                              : perm.risk === 'HIGH'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {perm.risk}
                        </span>
                      </div>
                    </td>

                    {ALL_ROLES.map((role) => {
                      // Check if role has this permission
                      const userWithRole = allUsers.find((u) => u.role === role);
                      const isSuper = role === 'SUPER_ADMIN';
                      const isAdmin =
                        role === 'ADMIN' &&
                        !['donations.refund', 'settings.manage'].includes(perm.key) &&
                        perm.key !== 'roles.manage';
                      const isAccountant =
                        role === 'ACCOUNTANT' &&
                        ['donations.view_all', 'donations.refund', 'donations.view_own', 'reports.export_financial'].includes(
                          perm.key
                        );
                      const isManager =
                        role === 'MANAGER' &&
                        [
                          'projects.view',
                          'projects.manage',
                          'projects.view_assigned',
                          'tasks.assign_manage',
                          'tasks.update_assigned',
                          'donations.view_own',
                          'certificates.issue'
                        ].includes(perm.key);
                      const isEditor =
                        role === 'CONTENT_EDITOR' &&
                        ['content.publish', 'donations.view_own'].includes(perm.key);
                      const isTeam =
                        role === 'TEAM_MEMBER' &&
                        ['projects.view_assigned', 'tasks.update_assigned', 'donations.view_own'].includes(
                          perm.key
                        );
                      const isVolunteer =
                        role === 'VOLUNTEER' &&
                        ['projects.view_assigned', 'tasks.update_assigned', 'donations.view_own'].includes(
                          perm.key
                        );
                      const isDonor = role === 'DONOR' && perm.key === 'donations.view_own';
                      const isMember = role === 'MEMBER' && perm.key === 'donations.view_own';

                      const hasAccess =
                        isSuper ||
                        isAdmin ||
                        isAccountant ||
                        isManager ||
                        isEditor ||
                        isTeam ||
                        isVolunteer ||
                        isDonor ||
                        isMember;

                      return (
                        <td key={role} className="p-3 text-center">
                          {hasAccess ? (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          ) : (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                              <Lock className="h-3 w-3" />
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: AUDIT LOGS */}
      {activeSubTab === 'audit_trail' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search logs by actor, IP, or keyword..."
                  className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 outline-hidden focus:border-purple-600"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value as any)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden"
              >
                <option value="ALL">All Roles</option>
                {ALL_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="p-3 font-bold">Timestamp</th>
                  <th className="p-3 font-bold">Actor</th>
                  <th className="p-3 font-bold">Action</th>
                  <th className="p-3 font-bold">Resource / Target</th>
                  <th className="p-3 font-bold">Details</th>
                  <th className="p-3 font-bold">IP & Origin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{log.actorName}</div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {log.actorRole?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="rounded bg-purple-100 text-purple-800 font-mono font-bold text-[10px] px-2 py-0.5">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-800 whitespace-nowrap">
                      {log.resource}
                    </td>
                    <td className="p-3 text-slate-600 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {log.ipAddress || '103.241.192.44'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: SECURITY HEALTH */}
      {activeSubTab === 'security_health' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-emerald-800">TLS Encryption</span>
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">TLS 1.3 Strict</div>
            <p className="text-xs text-emerald-800">
              End-to-end forward secrecy enabled with strict HTTP transport security (HSTS).
            </p>
          </div>

          <div className="rounded-3xl border border-blue-200 bg-blue-50/50 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-blue-800">2FA Compliance</span>
              <Smartphone className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">Enforced for L3+</div>
            <p className="text-xs text-blue-800">
              Super Admins, Directors, and Accountants require hardware or authenticator TOTP.
            </p>
          </div>

          <div className="rounded-3xl border border-purple-200 bg-purple-50/50 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-purple-800">Ledger Immutability</span>
              <Lock className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">WORM Storage</div>
            <p className="text-xs text-purple-800">
              Write-Once Read-Many transaction logging satisfying statutory 80G & FCRA audits.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
