/**
 * Maps the legacy view-name/id navigation contract (used throughout the
 * ported component tree via `onNavigate(view, id?)`) onto real Next.js
 * App Router paths, and back again for active-link highlighting.
 */

const VIEW_TO_PATH: Record<string, string> = {
  home: '/',
  about: '/about',
  'about-story': '/about/our-story',
  'about-mission-vision': '/about/mission-vision',
  'about-values': '/about/values',
  'about-founder': '/about/founder-message',
  'about-leadership': '/about/leadership',
  'about-board': '/about/board-members',
  'about-team': '/about/our-team',
  'about-awards': '/about/awards',
  programs: '/programs',
  projects: '/projects',
  campaigns: '/campaigns',
  transparency: '/transparency',
  volunteers: '/volunteer',
  membership: '/membership',
  csr: '/csr',
  events: '/events',
  news: '/news',
  'verify-certificate': '/verify-certificate',
  donate: '/donate',
  impact: '/impact',
  gallery: '/gallery',
  stories: '/stories',
  partners: '/partners',
  careers: '/careers',
  faq: '/faq',
  documents: '/documents',
  'google-sheets': '/google-sheets',
  contact: '/contact',
  legal: '/legal',
  login: '/login',
  'donor-register': '/donor-register',
  dashboard: '/dashboard',
};

const DETAIL_VIEW_PREFIX: Record<string, string> = {
  'project-detail': '/projects',
  'campaign-detail': '/campaigns',
  'article-detail': '/news',
};

/** Views that accept an optional id as a query/hash param rather than a path segment. */
const TAB_VIEWS = new Set(['legal']);

export function pathForView(view: string, id?: string): string {
  if (view in DETAIL_VIEW_PREFIX) {
    return id ? `${DETAIL_VIEW_PREFIX[view]}/${id}` : DETAIL_VIEW_PREFIX[view];
  }

  const base = VIEW_TO_PATH[view] ?? '/';

  if (id && TAB_VIEWS.has(view)) {
    return `${base}?tab=${encodeURIComponent(id)}`;
  }

  return base;
}

const PATH_TO_VIEW: Record<string, string> = Object.entries(VIEW_TO_PATH).reduce(
  (acc, [view, path]) => {
    acc[path] = view;
    return acc;
  },
  {} as Record<string, string>
);

/** Reverse-maps a pathname back to the legacy view name, for nav active-state highlighting. */
export function viewForPath(pathname: string): string {
  if (PATH_TO_VIEW[pathname]) return PATH_TO_VIEW[pathname];

  if (pathname.startsWith('/projects/')) return 'project-detail';
  if (pathname.startsWith('/campaigns/')) return 'campaign-detail';
  if (pathname.startsWith('/news/')) return 'article-detail';
  if (pathname.startsWith('/about/')) {
    const match = Object.entries(VIEW_TO_PATH).find(([, path]) => path === pathname);
    if (match) return match[0];
  }
  if (pathname.startsWith('/dashboard')) return 'dashboard';

  return 'home';
}
