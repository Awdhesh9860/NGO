'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { authApi } from '@/features/authentication';
import { UserRole } from '@/types';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  KeyRound,
  AlertCircle,
  Loader2,
  Users,
} from 'lucide-react';
import { RoleBadge } from '@/components/common/RoleBadge';

function getSafeRedirectTarget(): string {
  if (typeof window === 'undefined') return '/dashboard';
  const redirect = new URLSearchParams(window.location.search).get('redirect');
  // Prevent open-redirect attacks: only allow single-slash internal paths
  if (redirect && redirect.startsWith('/') && !redirect.startsWith('//') && !redirect.includes('://')) {
    return redirect;
  }
  return '/dashboard';
}

export default function LoginPage() {
  const router = useRouter();
  const {
    switchUser,
    allUsers,
    isDemoPersonasEnabled,
    refreshSession,
    setAuthenticatedUser,
  } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'credentials' | 'personas'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await authApi.login({ email, password });

      if (!res.success) {
        setErrorMessage(res.error?.message || 'Invalid email or password. Please verify your credentials.');
        return;
      }

      if (res.data?.requires2FA) {
        setRequires2FA(true);
        setTempToken(res.data.tempToken || null);
        showToast('Two-factor authentication required. Enter your code.', 'info');
        return;
      }

      if (res.data?.user) {
        setAuthenticatedUser({
          id: res.data.user.id,
          name: res.data.user.name,
          email: res.data.user.email,
          role: res.data.user.role as UserRole,
          phone: res.data.user.phone,
          avatar: res.data.user.avatar,
          status: 'active',
          createdAt: new Date().toISOString(),
          organizationId: res.data.user.organizationId,
        });
      }

      // Authoritatively hydrate permissions from the newly issued HTTP-only JWT cookie
      await refreshSession();

      showToast('Logged in successfully! Redirecting...', 'success');
      router.push(getSafeRedirectTarget());
    } catch {
      // Never fall back to passwordless mock login when authentication API is unreachable
      setErrorMessage('Unable to complete sign-in. Please verify your credentials or try again shortly.');
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempToken || !twoFactorCode) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await authApi.verify2FALogin(tempToken, twoFactorCode);
      if (!res.success) {
        setErrorMessage(res.error?.message || 'Invalid 2FA code. Please retry.');
        return;
      }

      await refreshSession();
      showToast('Two-factor authentication verified! Redirecting...', 'success');
      router.push(getSafeRedirectTarget());
    } catch {
      setErrorMessage('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPersona = (user: (typeof allUsers)[0]) => {
    if (!isDemoPersonasEnabled) return;
    switchUser(user.id);
    showToast(`Switched active sandbox session to ${user.name} (${user.role})`, 'success');
    router.push('/dashboard');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all">
      {/* Tab Switcher: Direct Sign In (+ Dev Sandbox Personas ONLY when explicitly enabled) */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <button
          type="button"
          onClick={() => {
            setActiveTab('credentials');
            setErrorMessage(null);
          }}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider text-center transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'credentials'
              ? 'text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-600 bg-white dark:bg-slate-900'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          Sign In
        </button>

        {isDemoPersonasEnabled && (
          <button
            type="button"
            onClick={() => {
              setActiveTab('personas');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider text-center transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'personas'
                ? 'text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-600 bg-white dark:bg-slate-900'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Dev Personas
          </button>
        )}
      </div>

      <div className="p-6 sm:p-8">
        {errorMessage && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
            <div>
              <p className="font-semibold">Authentication Error</p>
              <p className="text-xs mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {activeTab === 'credentials' && !requires2FA && (
          <form onSubmit={handleCredentialsLogin} className="space-y-5">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.org"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying Credentials...
                </>
              ) : (
                <>
                  Sign In to Workspace
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Don&apos;t have an account?{' '}
                <Link
                  href="/register"
                  className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Register as Supporter / Volunteer
                </Link>
              </p>
            </div>
          </form>
        )}

        {activeTab === 'credentials' && requires2FA && (
          <form onSubmit={handle2FASubmit} className="space-y-5">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Two-Factor Verification
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter the 6-digit verification code from your authenticator app or backup codes.
              </p>
            </div>

            <div>
              <label
                htmlFor="login-2fa-code"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 text-center"
              >
                Security Code
              </label>
              <input
                id="login-2fa-code"
                type="text"
                required
                maxLength={12}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.trim())}
                placeholder="000000"
                className="w-full text-center tracking-widest font-mono text-2xl py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !twoFactorCode}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying Code...
                </>
              ) : (
                <>
                  Confirm Code &amp; Sign In
                  <ShieldCheck className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setRequires2FA(false);
                  setTempToken(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {isDemoPersonasEnabled && activeTab === 'personas' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Local Development Sandbox Only:</strong> Demo persona switching is disabled in production builds.
              </p>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {allUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelectPersona(user)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 flex items-center justify-between text-left transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <RoleBadge role={user.role} size="sm" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
