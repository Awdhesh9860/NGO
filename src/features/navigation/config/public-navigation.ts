/**
 * Centralized Public Website Navigation Hierarchy
 *
 * Design rules:
 * 1. Every entry maps strictly to an existing verified Next.js App Router route in `src/app/(public)/`.
 * 2. Zero duplicate destinations across menus.
 * 3. Clear 2-level hierarchy:
 *    - Priority 1 items stay visible on Small Laptop (1024px+) and Desktop (1280px+).
 *    - Priority 2 items stay visible on Desktop (1280px+) and automatically collapse into `More` on Small Laptop (1024px-1279px).
 *    - On Tablet (768px-1023px), top essential links stay directly accessible while full hierarchy opens in the responsive drawer.
 *    - On Mobile (< 768px), clean Logo + Drawer hamburger with expandable accordions.
 */

export interface PublicNavLeafItem {
  id: string;
  label: string;
  view: string;
  href: string;
  subId?: string;
  description: string;
  iconName: string;
  badge?: string;
  highlight?: boolean;
}

export interface PublicNavGroupSection {
  id: string;
  title: string;
  items: PublicNavLeafItem[];
}

export interface PublicPrimaryNavItem {
  id: string;
  label: string;
  /** 1 = always shown in desktop/laptop primary bar; 2 = moves to `More` dropdown on small laptops (1024px-1279px) */
  priority: 1 | 2;
  /** Whether shown as a quick link on tablet (768px-1023px) */
  showOnTablet?: boolean;
  type: 'link' | 'dropdown';
  view?: string;
  href?: string;
  /** Alignment preference to ensure dropdown panels stay strictly inside viewport */
  align?: 'left' | 'center' | 'right';
  groups?: PublicNavGroupSection[];
  featuredAction?: {
    label: string;
    view: string;
    href: string;
  };
}

export const PUBLIC_NAVIGATION_ITEMS: PublicPrimaryNavItem[] = [
  {
    id: 'home',
    label: 'Home',
    priority: 1,
    type: 'link',
    view: 'home',
    href: '/',
  },
  {
    id: 'about',
    label: 'About',
    priority: 1,
    type: 'dropdown',
    align: 'left',
    groups: [
      {
        id: 'about-identity',
        title: 'Who We Are',
        items: [
          {
            id: 'about-overview',
            label: 'About HopeHorizon',
            view: 'about',
            href: '/about',
            description: 'Organization overview, focus areas & grassroots footprint',
            iconName: 'Building',
          },
          {
            id: 'about-story',
            label: 'Our Story',
            view: 'about-story',
            href: '/about/our-story',
            description: 'Our journey from community volunteers to regional impact',
            iconName: 'BookOpen',
          },
          {
            id: 'about-mission-vision',
            label: 'Mission & Vision',
            view: 'about-mission-vision',
            href: '/about/mission-vision',
            description: 'Core humanitarian purpose and long-term community goals',
            iconName: 'Compass',
          },
          {
            id: 'about-values',
            label: 'Our Values',
            view: 'about-values',
            href: '/about/values',
            description: 'Accountability, dignity, and transparency principles',
            iconName: 'ShieldCheck',
          },
          {
            id: 'about-founder',
            label: 'Founder Message',
            view: 'about-founder',
            href: '/about/founder',
            description: 'Leadership reflection and community commitment',
            iconName: 'HeartHandshake',
          },
        ],
      },
      {
        id: 'about-governance',
        title: 'Leadership & People',
        items: [
          {
            id: 'about-leadership',
            label: 'Leadership',
            view: 'about-leadership',
            href: '/about/leadership',
            description: 'Executive team guiding field operations',
            iconName: 'Users',
          },
          {
            id: 'about-board',
            label: 'Board Members',
            view: 'about-board',
            href: '/about/board',
            description: 'Independent trustees overseeing governance',
            iconName: 'Scale',
          },
          {
            id: 'about-team',
            label: 'Our Team',
            view: 'about-team',
            href: '/about/team',
            description: 'Educators, health workers, and field coordinators',
            iconName: 'Users2',
          },
          {
            id: 'about-awards',
            label: 'Awards & Recognition',
            view: 'about-awards',
            href: '/about/awards',
            description: 'Independent recognition and milestones',
            iconName: 'Award',
          },
        ],
      },
    ],
    featuredAction: {
      label: 'Explore Full Organization Profile',
      view: 'about',
      href: '/about',
    },
  },
  {
    id: 'our-work',
    label: 'Our Work',
    priority: 1,
    showOnTablet: true,
    type: 'dropdown',
    align: 'center',
    groups: [
      {
        id: 'work-programs-projects',
        title: 'Programs & Projects',
        items: [
          {
            id: 'work-programs',
            label: 'Programs',
            view: 'programs',
            href: '/programs',
            description: 'Education, clean water, healthcare, and livelihood programs',
            iconName: 'GraduationCap',
          },
          {
            id: 'work-projects',
            label: 'All Field Projects',
            view: 'projects',
            href: '/projects',
            description: 'Complete directory of community projects and milestones',
            iconName: 'Home',
          },
          {
            id: 'work-projects-ongoing',
            label: 'Ongoing Projects',
            view: 'projects-ongoing',
            href: '/projects/ongoing',
            description: 'Active initiatives currently running on the ground',
            iconName: 'Clock',
            badge: 'Live',
          },
          {
            id: 'work-projects-completed',
            label: 'Completed Projects',
            view: 'projects-completed',
            href: '/projects/completed',
            description: 'Delivered infrastructure and completed community programs',
            iconName: 'CheckCircle2',
          },
          {
            id: 'work-projects-upcoming',
            label: 'Upcoming Projects',
            view: 'projects-upcoming',
            href: '/projects/upcoming',
            description: 'Planned regional initiatives preparing for launch',
            iconName: 'Calendar',
          },
        ],
      },
      {
        id: 'work-impact-stories',
        title: 'Impact & Gallery',
        items: [
          {
            id: 'work-impact',
            label: 'Impact Overview',
            view: 'impact',
            href: '/impact',
            description: 'Measured community reach and annual program outcomes',
            iconName: 'TrendingUp',
          },
          {
            id: 'work-success-stories',
            label: 'Impact Stories',
            view: 'impact-stories',
            href: '/impact/success-stories',
            description: 'Documented community transformations and outcomes',
            iconName: 'Sparkles',
          },
          {
            id: 'work-beneficiaries',
            label: 'Beneficiary Stories',
            view: 'impact-beneficiaries',
            href: '/impact/beneficiary-stories',
            description: 'Safeguarding-compliant stories shared with consent',
            iconName: 'Heart',
          },
          {
            id: 'work-annual-highlights',
            label: 'Annual Highlights',
            view: 'impact-highlights',
            href: '/impact/annual-highlights',
            description: 'Year-by-year operational progress summary',
            iconName: 'BarChart3',
          },
          {
            id: 'work-gallery',
            label: 'Photo Gallery',
            view: 'gallery',
            href: '/gallery',
            description: 'Field photography from drives, schools, and clinics',
            iconName: 'Image',
          },
        ],
      },
    ],
    featuredAction: {
      label: 'View All Programs & Field Impact',
      view: 'programs',
      href: '/programs',
    },
  },
  {
    id: 'campaigns',
    label: 'Campaigns',
    priority: 1,
    showOnTablet: true,
    type: 'link',
    view: 'campaigns',
    href: '/campaigns',
  },
  {
    id: 'get-involved',
    label: 'Get Involved',
    priority: 2,
    showOnTablet: true,
    type: 'dropdown',
    align: 'right',
    groups: [
      {
        id: 'involved-actions',
        title: 'Support & Participate',
        items: [
          {
            id: 'inv-volunteer',
            label: 'Volunteer',
            view: 'volunteer',
            href: '/volunteer',
            description: 'Join field teaching, health camps, and relief drives',
            iconName: 'HandHeart',
            highlight: true,
          },
          {
            id: 'inv-membership',
            label: 'Membership',
            view: 'membership',
            href: '/membership',
            description: 'Become a registered organization member',
            iconName: 'UserCheck',
          },
          {
            id: 'inv-csr',
            label: 'CSR Opportunities',
            view: 'csr',
            href: '/csr',
            description: 'Corporate social responsibility program collaborations',
            iconName: 'Briefcase',
          },
          {
            id: 'inv-partners',
            label: 'Partnerships',
            view: 'partners',
            href: '/partners',
            description: 'Institutional, academic, and grassroots alliances',
            iconName: 'HeartHandshake',
          },
          {
            id: 'inv-careers',
            label: 'Careers',
            view: 'careers',
            href: '/careers',
            description: 'Full-time roles and field fellowships',
            iconName: 'Users',
          },
        ],
      },
    ],
    featuredAction: {
      label: 'Apply to Volunteer Today',
      view: 'volunteer',
      href: '/volunteer',
    },
  },
  {
    id: 'resources',
    label: 'Resources',
    priority: 2,
    type: 'dropdown',
    align: 'right',
    groups: [
      {
        id: 'resources-media',
        title: 'Updates & Events',
        items: [
          {
            id: 'res-news',
            label: 'News',
            view: 'news',
            href: '/news',
            description: 'Field bulletins and organizational announcements',
            iconName: 'Newspaper',
          },
          {
            id: 'res-blog',
            label: 'Blog',
            view: 'blog',
            href: '/blog',
            description: 'In-depth articles on community development',
            iconName: 'BookOpen',
          },
          {
            id: 'res-events',
            label: 'Events',
            view: 'events',
            href: '/events',
            description: 'Upcoming community camps and volunteer drives',
            iconName: 'CalendarDays',
          },
          {
            id: 'res-press',
            label: 'Press & Media',
            view: 'press',
            href: '/press',
            description: 'Press releases and media coverage archive',
            iconName: 'Files',
          },
        ],
      },
      {
        id: 'resources-transparency',
        title: 'Transparency & Help',
        items: [
          {
            id: 'res-transparency',
            label: 'Transparency Hub',
            view: 'transparency',
            href: '/transparency',
            description: 'Governance disclosures, registrations & accountability',
            iconName: 'ShieldCheck',
          },
          {
            id: 'res-reports',
            label: 'Financial & Annual Reports',
            view: 'transparency-financial',
            href: '/transparency/financial-reports',
            description: 'Published financial statements and audit reports',
            iconName: 'FileText',
          },
          {
            id: 'res-documents',
            label: 'Public Documents',
            view: 'documents',
            href: '/documents',
            description: 'Downloadable organizational policies and filings',
            iconName: 'Files',
          },
          {
            id: 'res-verify',
            label: 'Verify Certificate',
            view: 'verify-certificate',
            href: '/verify-certificate',
            description: 'Check authenticity of issued volunteer certificates',
            iconName: 'BadgeCheck',
          },
          {
            id: 'res-sheets',
            label: 'Google Sheets Hub',
            view: 'google-sheets',
            href: '/google-sheets',
            description: 'Public ledger sync workspace',
            iconName: 'FileSpreadsheet',
          },
          {
            id: 'res-faq',
            label: 'FAQs',
            view: 'faq',
            href: '/faq',
            description: 'Answers on donations, volunteering, and policies',
            iconName: 'HelpCircle',
          },
        ],
      },
    ],
    featuredAction: {
      label: 'Visit Transparency Center',
      view: 'transparency',
      href: '/transparency',
    },
  },
  {
    id: 'contact',
    label: 'Contact',
    priority: 2,
    type: 'link',
    view: 'contact',
    href: '/contact',
  },
];

/**
 * Checks whether a primary nav item (or any of its nested leaves) matches the active view or pathname.
 */
export function isPublicNavItemActive(
  item: PublicPrimaryNavItem,
  currentView: string,
  pathname?: string | null
): boolean {
  if (item.view && currentView === item.view) return true;
  if (item.href && pathname) {
    if (item.href === '/') return pathname === '/';
    if (pathname === item.href || pathname.startsWith(`${item.href}/`)) return true;
  }
  if (item.groups) {
    return item.groups.some((group) =>
      group.items.some((leaf) => {
        if (leaf.view === currentView) return true;
        if (pathname && leaf.href !== '/') {
          return pathname === leaf.href || pathname.startsWith(`${leaf.href}/`);
        }
        return false;
      })
    );
  }
  return false;
}
