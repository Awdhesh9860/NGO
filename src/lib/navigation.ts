/**
 * Maps the view-name/id navigation contract (used throughout the
 * component tree via `onNavigate(view, id?)`) onto real Next.js
 * App Router paths, and back again for active-link highlighting.
 */

const VIEW_TO_PATH: Record<string, string> = {
  home: '/',
  about: '/about',
  'about-story': '/about/our-story',
  'about-mission-vision': '/about/mission-vision',
  'about-values': '/about/values',
  'about-founder': '/about/founder',
  'about-leadership': '/about/leadership',
  'about-board': '/about/board',
  'about-team': '/about/team',
  'about-awards': '/about/awards',
  programs: '/programs',
  projects: '/projects',
  'projects-ongoing': '/projects/ongoing',
  'projects-completed': '/projects/completed',
  'projects-upcoming': '/projects/upcoming',
  campaigns: '/campaigns',
  transparency: '/transparency',
  'transparency-annual': '/transparency/annual-reports',
  'transparency-financial': '/transparency/financial-reports',
  'transparency-audits': '/transparency/audit-reports',
  'transparency-governance': '/transparency/governance',
  'transparency-registrations': '/transparency/registrations',
  volunteers: '/volunteer',
  volunteer: '/volunteer',
  'volunteer-apply': '/volunteer/apply',
  membership: '/membership',
  'membership-apply': '/membership/apply',
  csr: '/csr',
  events: '/events',
  news: '/news',
  blog: '/blog',
  press: '/press',
  'press-coverage': '/press/media-coverage',
  'verify-certificate': '/verify-certificate',
  donate: '/donate',
  impact: '/impact',
  'impact-stories': '/impact/success-stories',
  'impact-beneficiaries': '/impact/beneficiary-stories',
  'impact-highlights': '/impact/annual-highlights',
  gallery: '/gallery',
  stories: '/stories',
  partners: '/partners',
  careers: '/careers',
  faq: '/faq',
  documents: '/documents',
  'google-sheets': '/google-sheets',
  contact: '/contact',
  legal: '/legal',
  'privacy-policy': '/privacy-policy',
  'terms-and-conditions': '/terms-and-conditions',
  'refund-policy': '/refund-policy',
  'donation-policy': '/donation-policy',
  'child-protection': '/child-protection-policy',
  safeguarding: '/safeguarding-policy',
  'code-of-conduct': '/code-of-conduct',
  login: '/login',
  'donor-register': '/donor-register',
  dashboard: '/dashboard',
};

const DETAIL_VIEW_PREFIX: Record<string, string> = {
  'program-detail': '/programs',
  'project-detail': '/projects',
  'campaign-detail': '/campaigns',
  'article-detail': '/news',
  'event-detail': '/events',
  'blog-detail': '/blog',
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

export function viewForPath(pathname: string | null): string {
  if (!pathname || pathname === '/') return 'home';

  const exact = PATH_TO_VIEW[pathname];
  if (exact) return exact;

  for (const [view, prefix] of Object.entries(DETAIL_VIEW_PREFIX)) {
    if (pathname.startsWith(`${prefix}/`)) return view;
  }

  for (const [path, view] of Object.entries(PATH_TO_VIEW)) {
    if (path !== '/' && pathname.startsWith(path)) return view;
  }

  return 'home';
}
