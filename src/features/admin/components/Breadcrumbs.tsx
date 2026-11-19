'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbOverride {
  segment: string;
  label: string;
}

export interface BreadcrumbsProps {
  overrides?: BreadcrumbOverride[];
}

export function Breadcrumbs({ overrides = [] }: BreadcrumbsProps) {
  const pathname = usePathname();
  const router = useRouter();

  const parts = pathname.split('/').filter(Boolean);
  const overrideMap = new Map(overrides.map((o) => [o.segment, o.label]));

  const crumbs = parts.map((part, index) => {
    const href = '/' + parts.slice(0, index + 1).join('/');
    const label =
      overrideMap.get(part) ||
      (part.length === 24 && /^[a-f0-9]+$/i.test(part)
        ? `Detail (${part.slice(0, 6)}…)`
        : part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '));
    return { href, label, isLast: index === parts.length - 1 };
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
      <button
        type="button"
        onClick={() => router.push('/dashboard')}
        className="inline-flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
      >
        <Home className="h-3.5 w-3.5" />
        <span>Workspace</span>
      </button>

      {crumbs.map((crumb, idx) => (
        <React.Fragment key={crumb.href + idx}>
          <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
          {crumb.isLast ? (
            <span className="font-semibold text-slate-900 dark:text-white">{crumb.label}</span>
          ) : (
            <button
              type="button"
              onClick={() => router.push(crumb.href)}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              {crumb.label}
            </button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
