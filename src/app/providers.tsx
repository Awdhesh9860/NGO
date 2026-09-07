'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '../context/LanguageContext';
import { DatabaseProvider } from '../context/DatabaseContext';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { GlobalModals } from '../components/layout/GlobalModals';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <DatabaseProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
              <GlobalModals />
            </ToastProvider>
          </AuthProvider>
        </DatabaseProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
