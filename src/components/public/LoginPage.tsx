import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDatabase } from '../../context/DatabaseContext';
import { RoleBadge, ROLE_DETAILS } from '../common/RoleBadge';
import { UserRole } from '../../types';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  KeyRound,
  Shield,
  Smartphone,
  RefreshCw,
  Heart,
  Users,
  Award,
  ChevronRight,
  Building,
  Check,
  Globe,
  HelpCircle
} from 'lucide-react';

interface LoginPageProps {
  onNavigate: (view: string, id?: string) => void;
  onOpenDonate?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onOpenDonate }) => {
  const { login, allUsers, switchUser, twoFactorEnabled } = useAuth();
  const { showToast } = useToast();
  const { recordAuditLog } = useDatabase();

  const [activeTab, setActiveTab] = useState<'login' | 'personas' | 'forgot' | '2fa'>('login');
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password & OTP state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'verify'>('request');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');

  // 2FA state
  const [twoFactorCode, setTwoFactorCode] = useState(['', '', '', '', '', '']);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email address', 'error');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const success = login(email, password);
      if (success) {
        showToast('Signed in successfully! Redirecting to your workspace...', 'success');
        recordAuditLog(
          'usr-session',
          email,
          'AUTHENTICATED_USER',
          'PAGE_LOGIN_SUCCESS',
          'AuthGateway',
          `Full-page login completed for user ${email}`
        );
        onNavigate('dashboard');
      } else {
        showToast('Account not found with this email. Try quick demo persona login below or register as a donor.', 'error');
      }
    }, 450);
  };

  const handlePersonaSelect = (user: typeof allUsers[0]) => {
    switchUser(user.id);
    showToast(`Switched active session to ${user.name} (${user.role.replace('_', ' ')})`, 'success');
    recordAuditLog(
      user.id,
      user.name,
      user.role,
      'PERSONA_LOGIN',
      'AuthGateway',
      `Direct persona authentication executed for ${user.name} (${user.role})`
    );
    onNavigate('dashboard');
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      showToast('Please enter your registered email address', 'error');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setForgotStep('verify');
      showToast('6-digit security reset code sent to your inbox.', 'info');
    }, 500);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.join('').length < 6) {
      showToast('Please enter the 6-digit code', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters long', 'error');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast('Password successfully reset! You can now log in.', 'success');
      setActiveTab('login');
      setEmail(forgotEmail);
      setForgotStep('request');
    }, 500);
  };

  const handleOtpChange = (index: number, val: string, is2FA = false) => {
    if (val.length > 1) val = val[0];
    if (is2FA) {
      const updated = [...twoFactorCode];
      updated[index] = val;
      setTwoFactorCode(updated);
      if (val && index < 5) {
        document.getElementById(`2fa-otp-${index + 1}`)?.focus();
      }
    } else {
      const updated = [...otpCode];
      updated[index] = val;
      setOtpCode(updated);
      if (val && index < 5) {
        document.getElementById(`reset-otp-${index + 1}`)?.focus();
      }
    }
  };

  return (
    <div id="login-page-root" className="min-h-[calc(100vh-140px)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT COLUMN: HERO & TRUST PILLARS (Desktop 5 cols, Mobile full) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden border border-slate-800">
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Identity */}
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-900/40">
                <Heart className="h-6 w-6 fill-white" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white">HopeHorizon</h1>
                <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                  Global Impact & Philanthropy
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Enterprise RBAC Clearance Gateway
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Secure Access for Donors, Volunteers & Leadership
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Log in to monitor your tax-exempt 80G donations, track live field projects in real time, or manage community programs with zero-trust security.
              </p>
            </div>

            {/* Trust Badges */}
            <div className="space-y-3 pt-4 border-t border-slate-800/80">
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-900/50 text-emerald-400 border border-emerald-700/50">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span><strong>Instant 80G Certificates</strong> — Automated tax-deductible generation</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-900/50 text-emerald-400 border border-emerald-700/50">
                  <Shield className="h-4 w-4" />
                </div>
                <span><strong>AES-256 & 2FA Enforced</strong> — Banking-grade credential protection</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-900/50 text-emerald-400 border border-emerald-700/50">
                  <Award className="h-4 w-4" />
                </div>
                <span><strong>100% Transparency Score</strong> — FCRA & Statutory audit compliance</span>
              </div>
            </div>
          </div>

          {/* Bottom Callout to Donor Registration */}
          <div className="relative z-10 pt-8 mt-8 border-t border-slate-800/80">
            <div className="rounded-2xl bg-white/5 p-4 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  First-Time Supporter?
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">100% Tax Deductible</span>
              </div>
              <p className="text-xs text-slate-300">
                Register as a Philanthropic Donor to unlock your private giving ledger, recurring pledges, and impact portfolio.
              </p>
              <button
                id="btn-goto-donor-reg"
                onClick={() => onNavigate('donor-register')}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-2.5 text-xs font-black transition shadow-md"
              >
                <span>Open Donor Registration</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE AUTH CARD (Desktop 7 cols, Mobile full) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl flex flex-col justify-between">
          <div>
            {/* Top Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-2 overflow-x-auto">
                <button
                  id="tab-btn-signin"
                  onClick={() => setActiveTab('login')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    activeTab === 'login'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  id="tab-btn-personas"
                  onClick={() => setActiveTab('personas')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    activeTab === 'personas'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>9 Demo Personas (1-Click)</span>
                </button>

                {activeTab === 'forgot' && (
                  <button
                    onClick={() => setActiveTab('forgot')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300"
                  >
                    Reset Password
                  </button>
                )}
              </div>

              <button
                onClick={() => onNavigate('donor-register')}
                className="hidden sm:flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                <span>Donor Sign Up</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* TAB 1: STANDARD CREDENTIAL LOGIN */}
            {activeTab === 'login' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Welcome Back to HopeHorizon</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter your registered email and credentials to enter your role-specific dashboard.
                  </p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-slate-400" /> Email Address
                      </span>
                      <span className="text-[11px] font-normal text-slate-400">e.g., admin@hopehorizon.org</span>
                    </label>
                    <input
                      id="input-login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="donor@example.com or director@hopehorizon.org"
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 shadow-xs focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-slate-400" /> Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setActiveTab('forgot')}
                        className="text-xs font-bold text-emerald-700 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="input-login-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 px-4 py-3 pr-11 text-sm text-slate-900 shadow-xs focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Keep me authenticated on this device</span>
                    </label>
                  </div>

                  <button
                    id="btn-submit-login"
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <span>Sign In to Protected Workspace</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Quick Persona Access Fast-Row */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      Quick 1-Click Persona Simulator:
                    </span>
                    <button
                      onClick={() => setActiveTab('personas')}
                      className="text-[11px] font-bold text-emerald-700 hover:underline"
                    >
                      View all 9 Roles &rarr;
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {allUsers.slice(0, 3).map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handlePersonaSelect(user)}
                        className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition group"
                      >
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-7 w-7 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-950">
                            {user.name.split(' ')[0]}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">{user.role.replace('_', ' ')}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ALL 9 DEMO PERSONAS FULL EXPLORER */}
            {activeTab === 'personas' && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900">
                  <p className="font-bold flex items-center gap-1.5 text-amber-950">
                    <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
                    Instant Multi-Role RBAC Simulator
                  </p>
                  <p className="text-amber-800 mt-1">
                    Click on any profile below to instantly log in with their assigned role clearance level (L1–L5), private dashboards, and authorized action gates.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {allUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handlePersonaSelect(user)}
                      className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition cursor-pointer group bg-white"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-9 w-9 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-xs text-slate-900 truncate group-hover:text-emerald-950">
                              {user.name}
                            </h4>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                          <div className="mt-1">
                            <RoleBadge role={user.role} size="sm" />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-700 group-hover:bg-emerald-600 group-hover:text-white transition shrink-0 ml-2"
                      >
                        Enter &rarr;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: PASSWORD RECOVERY */}
            {activeTab === 'forgot' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Reset Your Security Credentials</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Recover your HopeHorizon account securely via a 6-digit one-time cryptographic token.
                  </p>
                </div>

                {forgotStep === 'request' ? (
                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Registered Email Address</label>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="e.g. donor@example.com"
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-600 focus:bg-white outline-hidden"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full rounded-2xl bg-emerald-600 py-3.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                    >
                      {isLoading ? 'Transmitting Token...' : 'Send Verification OTP'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900">
                      Security token dispatched to <strong>{forgotEmail}</strong>. (For demo verification, enter any 6 digits like <strong>123456</strong>).
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 text-center block">
                        6-Digit Verification Token
                      </label>
                      <div className="flex justify-center gap-2">
                        {[0, 1, 2, 3, 4, 5].map((idx) => (
                          <input
                            key={idx}
                            id={`reset-otp-${idx}`}
                            type="text"
                            maxLength={1}
                            value={otpCode[idx]}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            className="h-11 w-11 rounded-xl border border-slate-300 text-center font-mono font-bold text-base text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">New Password</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-hidden focus:border-emerald-600"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 transition"
                    >
                      Update Password & Sign In
                    </button>
                  </form>
                )}

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    &larr; Return to Standard Sign In
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Security Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              TLS 1.3 Strict &bull; Zero Knowledge Ledger
            </span>
            <div className="flex items-center gap-3">
              <button onClick={() => onNavigate('legal')} className="hover:underline text-slate-500">
                Privacy Policy
              </button>
              <span>&bull;</span>
              <button onClick={() => onNavigate('contact')} className="hover:underline text-slate-500">
                Security Support
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
