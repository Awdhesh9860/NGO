'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { pathForView } from '../lib/navigation';

/**
 * Provides the `onNavigate(view, id?)` callback that every ported view/section
 * component expects, backed by real Next.js client-side routing.
 */
export function useViewNavigation() {
  const router = useRouter();

  return useCallback(
    (view: string, id?: string) => {
      router.push(pathForView(view, id));
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [router]
  );
}
