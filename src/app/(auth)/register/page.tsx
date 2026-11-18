'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { authApi } from '@/features/authentication';
import {
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  CreditCard,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  Check,
  Heart,
  HandHeart,
  Award,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { registerUser } = useAuth();
  const { showToast } = useToast();

  const [role, setRole] = useState<'DONOR' | 'VOLUNTEER' | 'MEMBER'>('DONOR');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password strength calculations
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const strengthScore = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecial].filter(Boolean).length;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (strengthScore < 4) {
      setErrorMessage('Please choose a stronger password meeting security guidelines.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authApi.register({
        name,
        email,
        password,
        role,
        phone: phone || undefined,
        panNumber: panNumber ? panNumber.toUpperCase() : undefined,
      });

      if (!res.success) {
        setErrorMessage(res.error?.message || 'Registration failed. Please check your information.');
        setIsLoading(false);
        return;
      }

      showToast('Account created successfully! Check your inbox to verify your email.', 'success');
      router.push('/dashboard');
    } catch {
      // Fallback for offline dev mode
      registerUser(
        {
          name,
          email,
          role,
          phone,
          panNumber: panNumber ? panNumber.toUpperCase() : undefined,
        },
        email,
        role,
        phone
      );
      showToast('Registration successful! Redirecting to workspace...', 'success');
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all">
      <div className="p-6 sm:p-8">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create an Account</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Join the HopeHorizon community and make a measurable difference
          </p>
        </div>

        {/* Role Selector Pills */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <button
            type="button"
            onClick={() => setRole('DONOR')}
            className={`p-2.5 rounded-xl border text-center transition-all ${
              role === 'DONOR'
                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-600'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <Heart className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
            <span className="block text-xs font-bold">Donor</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('VOLUNTEER')}
            className={`p-2.5 rounded-xl border text-center transition-all ${
              role === 'VOLUNTEER'
                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-600'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <HandHeart className="w-4 h-4 mx-auto mb-1 text-sky-600" />
            <span className="block text-xs font-bold">Volunteer</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('MEMBER')}
            className={`p-2.5 rounded-xl border text-center transition-all ${
              role === 'MEMBER'
                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-600'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <Award className="w-4 h-4 mx-auto mb-1 text-amber-600" />
            <span className="block text-xs font-bold">Member</span>
          </button>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
            <div>
              <p className="font-semibold">Registration Issue</p>
              <p className="text-xs mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aarav@example.com"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                PAN for 80G (Optional)
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  maxLength={10}
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs uppercase font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Secure Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full pl-11 pr-11 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength indicators */}
            {password.length > 0 && (
              <div className="mt-2.5 space-y-1.5">
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-300 ${
                      strengthScore <= 2
                        ? 'w-1/3 bg-red-500'
                        : strengthScore <= 4
                        ? 'w-2/3 bg-amber-500'
                        : 'w-full bg-emerald-500'
                    }`}
                  />
                </div>
                <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                  <span className={hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5' : ''}>
                    {hasMinLength && <Check className="w-3 h-3" />} 8+ chars
                  </span>
                  <span className={hasUpperCase ? 'text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5' : ''}>
                    {hasUpperCase && <Check className="w-3 h-3" />} Uppercase
                  </span>
                  <span className={hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5' : ''}>
                    {hasNumber && <Check className="w-3 h-3" />} Number
                  </span>
                  <span className={hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5' : ''}>
                    {hasSpecial && <Check className="w-3 h-3" />} Symbol
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering Account...
              </>
            ) : (
              <>
                Create Account & Join
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
