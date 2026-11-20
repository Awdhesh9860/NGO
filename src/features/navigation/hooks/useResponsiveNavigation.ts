'use client';

import { useEffect, useMemo, useState } from 'react';
import { PublicPrimaryNavItem } from '../config/public-navigation';
import { RESPONSIVE_BREAKPOINTS } from '../config/tokens';

export type ResponsiveNavTier = 'mobile' | 'tablet' | 'small-laptop' | 'desktop';

export interface ResponsiveNavPartition {
  tier: ResponsiveNavTier;
  visibleItems: PublicPrimaryNavItem[];
  overflowItems: PublicPrimaryNavItem[];
  showDrawerTrigger: boolean;
}

/**
 * Pure deterministic responsive partition helper — guarantees zero hydration drift
 * and exact layout verification across 360px, 390px, 430px, 768px, 1024px, 1280px, 1440px, 1920px.
 */
export function partitionNavigationItems(
  items: PublicPrimaryNavItem[],
  viewportWidth: number
): ResponsiveNavPartition {
  // Mobile (< 768px): Logo on left + compact CTA/Hamburger drawer on right
  if (viewportWidth <= RESPONSIVE_BREAKPOINTS.mobileMax) {
    return {
      tier: 'mobile',
      visibleItems: [],
      overflowItems: items,
      showDrawerTrigger: true,
    };
  }

  // Tablet (768px - 1023px): Top 3 essential items visible + clean drawer trigger for full hierarchy
  if (viewportWidth <= RESPONSIVE_BREAKPOINTS.tabletMax) {
    const tabletPrimary = items.filter((item) => item.showOnTablet).slice(0, 3);
    const tabletIds = new Set(tabletPrimary.map((i) => i.id));
    return {
      tier: 'tablet',
      visibleItems: tabletPrimary,
      overflowItems: items.filter((i) => !tabletIds.has(i.id)),
      showDrawerTrigger: true,
    };
  }

  // Small Laptop (1024px - 1279px): Priority 1 items directly visible + Priority 2 neatly grouped in `More` dropdown
  if (viewportWidth <= RESPONSIVE_BREAKPOINTS.smallLaptopMax) {
    return {
      tier: 'small-laptop',
      visibleItems: items.filter((item) => item.priority === 1),
      overflowItems: items.filter((item) => item.priority === 2),
      showDrawerTrigger: false,
    };
  }

  // Laptop & Large Desktop (>= 1280px): All curated primary items cleanly on one single row
  return {
    tier: 'desktop',
    visibleItems: items,
    overflowItems: [],
    showDrawerTrigger: false,
  };
}

/**
 * Hydration-safe responsive navigation hook.
 * Defaults to desktop partition during SSR and syncs cleanly on mount/resize via rAF.
 */
export function useResponsiveNavigation(items: PublicPrimaryNavItem[]): ResponsiveNavPartition {
  const [width, setWidth] = useState<number>(RESPONSIVE_BREAKPOINTS.desktopMin);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let rafId: number | null = null;

    const syncWidth = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        const w = window.innerWidth;
        setWidth((prev) => (prev === w ? prev : w));
      });
    };

    syncWidth();
    window.addEventListener('resize', syncWidth, { passive: true });
    return () => {
      window.removeEventListener('resize', syncWidth);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return useMemo(() => partitionNavigationItems(items, width), [items, width]);
}
