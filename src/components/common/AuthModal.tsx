import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDatabase } from '../../context/DatabaseContext';
import { UserRole } from '../../types';
import { RoleBadge } from './RoleBadge';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
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
  Award
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    login,
    registerUser,
    allUsers,
    switchUser,
    twoFactorEnabled
  } = useAuth();

  const { showToast } = useToast();
  const { recordAuditLog } = useDatabase();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('DONOR');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Forgot password & 2FA states
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'verify'>('request');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState(['', '', '', '', '', '']);

  // Loading indicator
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

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
        showToast('Successfully signed in! Welcome back.', 'success');
        recordAuditLog(
          'user-session',
          email,
          'AUTHENTICATED_USER',
          'USER_SIGN_IN',
          'AuthService',
          `Interactive login via Web Portal for ${email}`
        );
      } else {
        showToast('Account not found with this email. Try quick persona login below.', 'error');
      }
    }, 400);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail) {
      showToast('Please fill out all required fields', 'error');
      return;
    }

    if (!agreeTerms) {
      showToast('Please agree to terms & privacy policy to continue', 'error');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const newUser = registerUser(regName, regEmail, regRole, regPhone);
      showToast(`Welcome ${newUser.name}! Your account has been registered.`, 'success');
      recordAuditLog(
        newUser.id,
        newUser.name,
        newUser.role,
        'USER_REGISTRATION',
        'AuthService',
        `New ${newUser.role} self-registered with email ${newUser.email}`
      );
    }, 500);
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
      showToast('6-digit security code dispatched to your email.', 'info');
    }, 600);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.join('').length < 6) {
      showToast('Please enter the full 6-digit verification code', 'error');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast('Password successfully reset! You can now sign in.', 'success');
      setAuthModalTab('login');
      setEmail(forgotEmail);
      setForgotStep('request');
    }, 500);
  };

  const handleQuickPersonaSelect = (user: typeof allUsers[0]) => {
    switchUser(user.id);
    showToast(`Switched active session to ${user.name} (${user.role.replace('_', ' ')})`, 'success');
    recordAuditLog(
      user.id,
      user.name,
      user.role,
      'PERSONA_SWITCH',
      'AuthService',
      `Switched identity to ${user.name} (${user.role})`
    );
    closeAuthModal();
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val[0];
    const updated = [...otpCode];
    updated[index] = val;
    setOtpCode(updated);

    // Auto-advance
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={closeAuthModal}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden z-10 my-8">
        {/* Header Ribbon */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white tracking-wide flex items-center gap-1.5">
                HopeHorizon Secure Auth
                <span className="rounded bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.2 uppercase font-bold border border-emerald-500/30">
                  RBAC L4
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Encrypted session tokens & role-based security barriers
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-3 gap-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setAuthModalTab('login')}
            className={`pb-3 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              authModalTab === 'login'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </button>

          <button
            onClick={() => setAuthModalTab('register')}
            className={`pb-3 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              authModalTab === 'register'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserIcon className="h-3.5 w-3.5" />
            <span>Create Account</span>
          </button>

          <button
            onClick={() => setAuthModalTab('personas')}
            className={`pb-3 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              authModalTab === 'personas'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>9 Demo Personas</span>
          </button>

          {authModalTab === 'forgot' && (
            <button
              onClick={() => setAuthModalTab('forgot')}
              className="pb-3 px-3 border-b-2 border-emerald-600 text-emerald-800 transition flex items-center gap-1.5 whitespace-nowrap"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Password Recovery</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
          {/* TAB 1: SIGN IN */}
          {authModalTab === 'login' && (
            <div className="space-y-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@hopehorizon.org or donor@example.com"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Lock className="h-3.5 w-3.5 text-slate-400" />
                      <span>Password</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthModalTab('forgot')}
                      className="text-xs font-semibold text-emerald-700 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-900 shadow-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Remember this browser for 30 days</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition disabled:opacity-50"
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

              {/* Quick Persona 1-Click Login Chips */}
              <div className="border-t border-slate-200 pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>Instant 1-Click Demo Login</span>
                  </span>
                  <span className="text-[11px] text-slate-400">Click any persona</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {allUsers.slice(0, 6).map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleQuickPersonaSelect(user)}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 p-2 text-left hover:border-emerald-500 hover:bg-emerald-50/50 transition group"
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-7 w-7 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-900">
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

          {/* TAB 2: CREATE ACCOUNT */}
          {authModalTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                    <span>Full Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Dr. Maya Angelou"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>Email Address *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@organization.org"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>Mobile / WhatsApp</span>
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Lock className="h-3.5 w-3.5 text-slate-400" />
                    <span>Password *</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden"
                  />
                </div>
              </div>

              {/* Role Type Selection */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700">
                  Select Your Participation Profile:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { role: 'DONOR' as UserRole, label: 'Philanthropic Donor', icon: Heart },
                    { role: 'VOLUNTEER' as UserRole, label: 'Grassroots Volunteer', icon: Users },
                    { role: 'MEMBER' as UserRole, label: 'Assembly Member', icon: Award },
                    { role: 'TEAM_MEMBER' as UserRole, label: 'Field Staff Officer', icon: Shield },
                    { role: 'CONTENT_EDITOR' as UserRole, label: 'Media Journalist', icon: KeyRound },
                    { role: 'MANAGER' as UserRole, label: 'Program Director', icon: Sparkles }
                  ].map((item) => (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => setRegRole(item.role)}
                      className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition ${
                        regRole === item.role
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <item.icon className="h-4 w-4 mb-1 text-emerald-600" />
                      <span className="text-xs leading-tight">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>
                  I agree to HopeHorizon's Ethical Charter, Code of Conduct & Privacy Policy.
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Complete Registration & Authenticate</span>
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: ALL 9 DEMO PERSONAS EXPLORER */}
          {authModalTab === 'personas' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
                  Role-Based Access Control (RBAC) Simulator
                </p>
                <p className="text-amber-800 mt-0.5">
                  Select any persona below to simulate their exact permission clearance, role-specific navigation, and dashboard security gates.
                </p>
              </div>

              <div className="space-y-2.5">
                {allUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleQuickPersonaSelect(user)}
                    className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-10 w-10 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-slate-900 group-hover:text-emerald-950">
                            {user.name}
                          </h4>
                          <RoleBadge role={user.role} size="sm" />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {user.designation || user.department} &bull; {user.email}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 group-hover:bg-emerald-600 group-hover:text-white transition shrink-0"
                    >
                      Assume Identity
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: FORGOT PASSWORD */}
          {authModalTab === 'forgot' && (
            <div className="space-y-4">
              {forgotStep === 'request' ? (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <p className="text-xs text-slate-600">
                    Enter the email associated with your account. We will send an encrypted 6-digit security token to reset your credentials.
                  </p>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Registered Email Address</label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. admin@hopehorizon.org"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-xs focus:border-emerald-600 outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
                  >
                    {isLoading ? 'Transmitting Token...' : 'Dispatch Verification Code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900">
                    Security token sent to <strong>{forgotEmail}</strong>. (For demo verification, enter any 6 digits like <strong>123456</strong>).
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 text-center block">
                      6-Digit Security Code
                    </label>
                    <div className="flex justify-center gap-2">
                      {[0, 1, 2, 3, 4, 5].map((idx) => (
                        <input
                          key={idx}
                          id={`otp-${idx}`}
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
                    <label className="text-xs font-bold text-slate-700">New Secure Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 outline-hidden focus:border-emerald-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
                  >
                    Update Credentials & Return to Login
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
