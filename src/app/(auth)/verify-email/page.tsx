'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { authApi } from '@/features/authentication';
import { CheckCircle2, AlertCircle, Loader2, MailCheck, ArrowRight } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    token && email ? 'loading' : 'idle'
  );
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (!token || !email) {
      return;
    }

    let isMounted = true;

    authApi
      .verifyEmail({ token, email })
      .then((res) => {
        if (!isMounted) return;
        if (res.success) {
          setStatus('success');
          setMessage('Your email address has been verified successfully!');
        } else {
          setStatus('error');
          setMessage(res.error?.message || 'Verification token is invalid or has expired.');
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setStatus('error');
        setMessage('Network error occurred while verifying email address.');
      });

    return () => {
      isMounted = false;
    };
  }, [token, email]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all">
      <div className="p-6 sm:p-8 text-center space-y-6">
        {status === 'loading' && (
          <div className="py-8 space-y-4">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Verifying Your Email Address...
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Please wait while we confirm your security credentials.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-4 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Email Verified Successfully!
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
              {message} Your account is fully active and certified to access all features.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all"
              >
                Sign In to Your Workspace
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="py-4 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Verification Failed
            </h2>
            <p className="text-xs text-red-600 dark:text-red-400 max-w-sm mx-auto">
              {message}
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl font-semibold text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-all"
              >
                Return to Login
              </Link>
            </div>
          </div>
        )}

        {status === 'idle' && (
          <div className="py-4 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <MailCheck className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Verify Your Email
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
              A verification link was sent to your registered email when you signed up. Please check your inbox and click the link to activate your account.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all"
              >
                Return to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
