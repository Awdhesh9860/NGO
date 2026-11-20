import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  PUBLIC_NAVIGATION_ITEMS,
  isPublicNavItemActive,
  computeScrollNavState,
  partitionNavigationItems,
  NAV_TOKENS,
} from '../features/navigation';
import { pathForView } from '../lib/navigation';
import {
  getAuthorizedAdminNav,
  getGroupedAdminNav,
} from '../features/admin/config/navigation';
import { UserRole } from '../types';

describe('Enterprise Responsive Smart Navigation: Scroll Auto-Hide Controller', () => {
  it('always stays visible near top of page (<= 24px)', () => {
    const res = computeScrollNavState({
      currentY: 16,
      lastY: 0,
      wasHidden: true,
      previousDirection: 'down',
    });
    expect(res.nextState.isHidden).toBe(false);
    expect(res.nextState.isScrolled).toBe(false);
    expect(res.nextState.direction).toBe('idle');
  });

  it('hides smoothly when scrolling downward past threshold beyond hideAfterY', () => {
    const res = computeScrollNavState({
      currentY: 140,
      lastY: 100,
      wasHidden: false,
      previousDirection: 'idle',
    });
    expect(res.nextState.isHidden).toBe(true);
    expect(res.nextState.isScrolled).toBe(true);
    expect(res.nextState.direction).toBe('down');
    expect(res.nextLastY).toBe(140);
  });

  it('immediately shows header when scrolling upward past upThreshold without needing top of page', () => {
    const res = computeScrollNavState({
      currentY: 420,
      lastY: 432,
      wasHidden: true,
      previousDirection: 'down',
    });
    expect(res.nextState.isHidden).toBe(false);
    expect(res.nextState.isScrolled).toBe(true);
    expect(res.nextState.direction).toBe('up');
    expect(res.nextLastY).toBe(420);
  });

  it('ignores tiny scroll jitter movements to prevent flicker', () => {
    const downJitter = computeScrollNavState({
      currentY: 205,
      lastY: 200,
      wasHidden: false,
      previousDirection: 'up',
    });
    expect(downJitter.nextState.isHidden).toBe(false);
    expect(downJitter.nextLastY).toBe(200);

    const upJitter = computeScrollNavState({
      currentY: 197,
      lastY: 200,
      wasHidden: true,
      previousDirection: 'down',
    });
    expect(upJitter.nextState.isHidden).toBe(true);
    expect(upJitter.nextLastY).toBe(200);
  });

  it('keeps header pinned visible when lockedVisible is true (dropdown or drawer open)', () => {
    const res = computeScrollNavState({
      currentY: 500,
      lastY: 200,
      wasHidden: false,
      previousDirection: 'down',
      lockedVisible: true,
    });
    expect(res.nextState.isHidden).toBe(false);
  });
});

describe('Enterprise Responsive Smart Navigation: Viewport Partitioning (360px - 1920px)', () => {
  it('uses mobile drawer layout on 360px, 390px, and 430px viewports', () => {
    for (const width of [360, 390, 430]) {
      const part = partitionNavigationItems(PUBLIC_NAVIGATION_ITEMS, width);
      expect(part.tier).toBe('mobile');
      expect(part.visibleItems).toHaveLength(0);
      expect(part.overflowItems).toHaveLength(PUBLIC_NAVIGATION_ITEMS.length);
      expect(part.showDrawerTrigger).toBe(true);
    }
  });

  it('uses compact tablet layout on 768px with essential items + drawer trigger', () => {
    const part = partitionNavigationItems(PUBLIC_NAVIGATION_ITEMS, 768);
    expect(part.tier).toBe('tablet');
    expect(part.visibleItems.length).toBeLessThanOrEqual(3);
    expect(part.visibleItems.length).toBeGreaterThan(0);
    expect(part.overflowItems.length).toBeGreaterThan(0);
    expect(part.showDrawerTrigger).toBe(true);
  });

  it('automatically collapses secondary items into More dropdown on 1024px small laptop', () => {
    const part = partitionNavigationItems(PUBLIC_NAVIGATION_ITEMS, 1024);
    expect(part.tier).toBe('small-laptop');
    expect(part.visibleItems.map((i) => i.id)).toEqual(['home', 'about', 'our-work', 'campaigns']);
    expect(part.overflowItems.map((i) => i.id)).toEqual(['get-involved', 'resources', 'contact']);
    expect(part.showDrawerTrigger).toBe(false);
  });

  it('shows all curated primary items cleanly on 1280px, 1440px, and 1920px desktops', () => {
    for (const width of [1280, 1440, 1920]) {
      const part = partitionNavigationItems(PUBLIC_NAVIGATION_ITEMS, width);
      expect(part.tier).toBe('desktop');
      expect(part.visibleItems).toHaveLength(PUBLIC_NAVIGATION_ITEMS.length);
      expect(part.overflowItems).toHaveLength(0);
      expect(part.showDrawerTrigger).toBe(false);
    }
  });
});

describe('Enterprise Responsive Smart Navigation: Public Route Integrity & Deduplication', () => {
  it('contains zero duplicate destination paths and maps strictly to existing Next.js App Router pages', () => {
    const seenHrefs = new Set<string>();
    const publicAppDir = path.resolve(process.cwd(), 'src', 'app', '(public)');

    const checkDestination = (view: string, href: string) => {
      // Zero duplicate destination links
      expect(seenHrefs.has(href)).toBe(false);
      seenHrefs.add(href);

      // View maps accurately via existing pathForView contract
      expect(pathForView(view)).toBe(href);

      // Actual Next.js App Router page.tsx exists on disk (no fake routes)
      const relDir = href === '/' ? '' : href.replace(/^\//, '');
      const pageFile = path.join(publicAppDir, relDir, 'page.tsx');
      expect(fs.existsSync(pageFile)).toBe(true);
    };

    for (const item of PUBLIC_NAVIGATION_ITEMS) {
      if (item.type === 'link' && item.view && item.href) {
        checkDestination(item.view, item.href);
      }
      for (const group of item.groups || []) {
        for (const leaf of group.items) {
          checkDestination(leaf.view, leaf.href);
        }
      }
    }

    // Ensure key destinations are preserved
    expect(seenHrefs.has('/')).toBe(true);
    expect(seenHrefs.has('/about')).toBe(true);
    expect(seenHrefs.has('/programs')).toBe(true);
    expect(seenHrefs.has('/projects')).toBe(true);
    expect(seenHrefs.has('/campaigns')).toBe(true);
    expect(seenHrefs.has('/volunteer')).toBe(true);
    expect(seenHrefs.has('/membership')).toBe(true);
    expect(seenHrefs.has('/transparency')).toBe(true);
    expect(seenHrefs.has('/contact')).toBe(true);
  });

  it('highlights active primary & nested routes accurately and keeps fixed design tokens', () => {
    const aboutItem = PUBLIC_NAVIGATION_ITEMS.find((i) => i.id === 'about')!;
    const workItem = PUBLIC_NAVIGATION_ITEMS.find((i) => i.id === 'our-work')!;
    const homeItem = PUBLIC_NAVIGATION_ITEMS.find((i) => i.id === 'home')!;

    expect(isPublicNavItemActive(homeItem, 'home', '/')).toBe(true);
    expect(isPublicNavItemActive(homeItem, 'about', '/about')).toBe(false);
    expect(isPublicNavItemActive(aboutItem, 'about-story', '/about/our-story')).toBe(true);
    expect(isPublicNavItemActive(workItem, 'project-detail', '/projects/solar-water')).toBe(true);
    expect(NAV_TOKENS.headerHeightPx).toBe(64);
    expect(NAV_TOKENS.autoHideTransitionClass).toContain('motion-reduce:transition-none');
  });
});

describe('Enterprise Responsive Smart Navigation: All 13 Roles Dashboard RBAC Verification', () => {
  const ALL_13_ROLES: UserRole[] = [
    'SUPER_ADMIN',
    'ADMIN',
    'EXECUTIVE_DIRECTOR',
    'MANAGER',
    'PROJECT_MANAGER',
    'ACCOUNTANT',
    'COMMUNICATIONS',
    'CONTENT_EDITOR',
    'TEAM_MEMBER',
    'VOLUNTEER',
    'DONOR',
    'MEMBER',
    'GUEST',
  ];

  it('verifies grouped dashboard navigation strictly enforces RBAC across all 13 roles', () => {
    for (const role of ALL_13_ROLES) {
      const flat = getAuthorizedAdminNav(role);
      const grouped = getGroupedAdminNav(role);
      const flattenedFromGroups = grouped.flatMap((g) => g.items);

      expect(flattenedFromGroups).toHaveLength(flat.length);
      // Every returned group must be non-empty
      expect(grouped.every((g) => g.items.length > 0)).toBe(true);
    }

    // Non-console roles + GUEST NEVER receive admin console groups
    for (const restrictedRole of ['GUEST', 'DONOR', 'VOLUNTEER', 'MEMBER'] as UserRole[]) {
      expect(getGroupedAdminNav(restrictedRole)).toHaveLength(0);
    }

    // COMMUNICATIONS never sees Finance, Users, or Settings
    const commsIds = getAuthorizedAdminNav('COMMUNICATIONS').map((i) => i.id);
    expect(commsIds).not.toContain('users');
    expect(commsIds).not.toContain('finance-dashboard');
    expect(commsIds).not.toContain('settings');

    // ACCOUNTANT sees Finance & Fundraising groups, not Invitations or Departments
    const acctGroups = getGroupedAdminNav('ACCOUNTANT').map((g) => g.group);
    const acctIds = getAuthorizedAdminNav('ACCOUNTANT').map((i) => i.id);
    expect(acctGroups).toContain('Finance');
    expect(acctGroups).toContain('Fundraising');
    expect(acctIds).not.toContain('invitations');
    expect(acctIds).not.toContain('departments');

    // SUPER_ADMIN sees all 7 groups
    expect(getGroupedAdminNav('SUPER_ADMIN').map((g) => g.group)).toEqual([
      'Core',
      'Operations',
      'Fundraising',
      'Stakeholders',
      'Finance',
      'Organization',
      'Security',
    ]);
  });
});
