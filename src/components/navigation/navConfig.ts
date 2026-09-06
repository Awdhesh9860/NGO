export interface NavChildItem {
  id: string;
  label: string;
  view: string;
  subId?: string;
  description?: string;
  iconName?: string;
  badge?: string;
  highlight?: boolean;
}

export interface MegaMenuColumn {
  title: string;
  description?: string;
  items: NavChildItem[];
}

export interface NavItemConfig {
  id: string;
  label: string;
  view?: string;
  type: 'link' | 'dropdown' | 'megamenu';
  children?: NavChildItem[];
  megaColumns?: MegaMenuColumn[];
  featuredCard?: {
    tag: string;
    title: string;
    description: string;
    ctaLabel: string;
    view: string;
    subId?: string;
    image?: string;
  };
  featuredAction?: {
    label: string;
    view: string;
  };
}

export const NAVIGATION_CONFIG: NavItemConfig[] = [
  {
    id: 'home',
    label: 'Home',
    view: 'home',
    type: 'link'
  },
  {
    id: 'about',
    label: 'About Us',
    type: 'dropdown',
    children: [
      {
        id: 'about-who',
        label: 'Who We Are',
        view: 'about',
        subId: 'who-we-are',
        description: 'How we started and our direct work with poor families',
        iconName: 'Building'
      },
      {
        id: 'about-story',
        label: 'Our Story',
        view: 'about-story',
        description: 'Our simple journey from a few volunteers to helping thousands',
        iconName: 'BookOpen'
      },
      {
        id: 'about-mission',
        label: 'Mission & Vision',
        view: 'about-mission-vision',
        description: 'Bringing school education, clean water and food to all in need',
        iconName: 'Compass'
      },
      {
        id: 'about-values',
        label: 'Our Values',
        view: 'about-values',
        description: 'Honesty, kindness, respect and responsibility in all we do',
        iconName: 'ShieldCheck'
      },
      {
        id: 'about-founder',
        label: 'Founder Message',
        view: 'about-founder',
        description: 'A warm note on our purpose and promise to society',
        iconName: 'HeartHandshake'
      },
      {
        id: 'about-leadership',
        label: 'Leadership',
        view: 'about-leadership',
        description: 'The dedicated team managing our ground programs',
        iconName: 'Users'
      },
      {
        id: 'about-board',
        label: 'Board of Trustees',
        view: 'about-board',
        description: 'Respected elders ensuring every rupee is used honestly',
        iconName: 'Scale'
      },
      {
        id: 'about-team',
        label: 'Our Team',
        view: 'about-team',
        description: 'Teachers, field coordinators and ground volunteers',
        iconName: 'Users2'
      },
      {
        id: 'about-awards',
        label: 'Awards & Trust',
        view: 'about-awards',
        description: 'Government 80G tax exemption and clean audit certificates',
        iconName: 'Award',
        badge: 'Verified'
      }
    ],
    featuredAction: {
      label: 'Read Our Complete Story →',
      view: 'about'
    }
  },
  {
    id: 'programs',
    label: 'Our Causes',
    type: 'megamenu',
    megaColumns: [
      {
        title: 'Education & Health Care',
        description: 'Helping children and mothers live healthy, bright lives',
        items: [
          {
            id: 'prog-edu',
            label: 'Child Schooling',
            view: 'programs',
            subId: 'education',
            description: 'Free school books, bags, daily tuition and digital classes',
            iconName: 'GraduationCap'
          },
          {
            id: 'prog-skill',
            label: 'Youth Skill Training',
            view: 'programs',
            subId: 'skill-dev',
            description: 'Computer basics and practical job skills for young people',
            iconName: 'Laptop'
          },
          {
            id: 'prog-health',
            label: 'Clean Water & Health',
            view: 'programs',
            subId: 'health',
            description: 'Clean drinking water plants and free doctor clinics',
            iconName: 'Activity'
          },
          {
            id: 'prog-women',
            label: 'Women Empowerment',
            view: 'programs',
            subId: 'women-empowerment',
            description: 'Tailoring centers and micro-savings to help mothers earn',
            iconName: 'Heart'
          }
        ]
      },
      {
        title: 'Food & Village Support',
        description: 'Ensuring no child sleeps hungry and villages thrive',
        items: [
          {
            id: 'prog-child',
            label: 'Daily Food & Meals',
            view: 'programs',
            subId: 'child-support',
            description: 'Nutritious hot meals and warm clothes for poor kids',
            iconName: 'Smile'
          },
          {
            id: 'prog-livelihood',
            label: 'Helping Small Farmers',
            view: 'programs',
            subId: 'livelihood',
            description: 'Free seeds, natural farming tips and water-saving gear',
            iconName: 'Sprout'
          },
          {
            id: 'prog-env',
            label: 'Trees & Solar Lights',
            view: 'programs',
            subId: 'environment',
            description: 'Planting fruit trees and putting solar streetlights in villages',
            iconName: 'Trees'
          },
          {
            id: 'prog-comm',
            label: 'Village Infrastructure',
            view: 'programs',
            subId: 'community-dev',
            description: 'Building clean public toilets and learning centers',
            iconName: 'Home'
          }
        ]
      }
    ],
    featuredCard: {
      tag: 'Real Impact',
      title: 'Active in 24 Districts',
      description: 'Over 85,000 children and families directly helped with food, water, and schooling.',
      ctaLabel: 'View All Causes →',
      view: 'programs'
    },
    featuredAction: {
      label: 'Explore All Causes & Programs →',
      view: 'programs'
    }
  },
  {
    id: 'projects',
    label: 'Projects',
    type: 'dropdown',
    children: [
      {
        id: 'proj-ongoing',
        label: 'Ongoing Work',
        view: 'projects',
        subId: 'ongoing',
        description: 'Projects currently running on the ground with live updates',
        iconName: 'Clock',
        badge: 'Live'
      },
      {
        id: 'proj-completed',
        label: 'Completed Work',
        view: 'projects',
        subId: 'completed',
        description: 'Schools, water filters, and clinics built and running',
        iconName: 'CheckCircle2'
      },
      {
        id: 'proj-upcoming',
        label: 'Next Projects',
        view: 'projects',
        subId: 'upcoming',
        description: 'New villages and schools we are planning to help next',
        iconName: 'Calendar'
      },
      {
        id: 'proj-campaigns',
        label: 'Urgent Relief Appeals',
        view: 'campaigns',
        description: 'Emergency food, shelter and medical help needed right now',
        iconName: 'Flame',
        badge: 'Urgent'
      }
    ],
    featuredAction: {
      label: 'See All Field Projects & Proof →',
      view: 'projects'
    }
  },
  {
    id: 'impact',
    label: 'Our Impact',
    type: 'dropdown',
    children: [
      {
        id: 'imp-overview',
        label: 'How We Measure Impact',
        view: 'impact',
        description: 'Clear, simple overview of how many lives have improved',
        iconName: 'TrendingUp'
      },
      {
        id: 'imp-numbers',
        label: 'Impact Numbers',
        view: 'impact',
        subId: 'metrics',
        description: 'Live counts: children educated, water given & families fed',
        iconName: 'BarChart3'
      },
      {
        id: 'imp-stories',
        label: 'Stories of Hope',
        view: 'stories',
        description: 'Real stories from children and mothers whose lives changed',
        iconName: 'BookOpen'
      },
      {
        id: 'imp-reports',
        label: 'Yearly Audit Reports',
        view: 'documents',
        description: 'Public balance sheets and independent auditor reviews',
        iconName: 'FileText'
      },
      {
        id: 'imp-results',
        label: 'Before & After Proof',
        view: 'impact',
        subId: 'results',
        description: 'Real photos showing villages before and after our support',
        iconName: 'CheckSquare'
      }
    ],
    featuredAction: {
      label: 'Open Simple Impact Dashboard →',
      view: 'impact'
    }
  },
  {
    id: 'involved',
    label: 'Join Us',
    type: 'dropdown',
    children: [
      {
        id: 'inv-vol',
        label: 'Become a Volunteer',
        view: 'volunteers',
        description: 'Give 2 hours on weekends to teach or help in relief drives',
        iconName: 'HandHeart',
        badge: 'Join Us',
        highlight: true
      },
      {
        id: 'inv-csr',
        label: 'Company Partnerships (CSR)',
        view: 'csr',
        description: 'Join hands as a company with 100% 80G tax benefit',
        iconName: 'Briefcase',
        badge: '80G Tax Save',
        highlight: true
      },
      {
        id: 'inv-member',
        label: 'Monthly Supporter',
        view: 'membership',
        description: 'Support a child or family with a small monthly contribution',
        iconName: 'UserCheck'
      },
      {
        id: 'inv-careers',
        label: 'Work With Us',
        view: 'careers',
        description: 'Open jobs and paid internships for social work',
        iconName: 'Sparkles'
      },
      {
        id: 'inv-campaign',
        label: 'Help an Urgent Cause',
        view: 'campaigns',
        description: 'Send quick help to emergency relief funds',
        iconName: 'Heart'
      }
    ],
    featuredAction: {
      label: 'Sign Up to Volunteer Today →',
      view: 'volunteers'
    }
  },
  {
    id: 'resources',
    label: 'Transparency & Help',
    type: 'dropdown',
    children: [
      {
        id: 'res-events',
        label: 'Events & Drives',
        view: 'events',
        description: 'Free health camps, tree drives and school book distributions',
        iconName: 'CalendarDays'
      },
      {
        id: 'res-news',
        label: 'News & Updates',
        view: 'news',
        description: 'Short stories and news updates directly from field workers',
        iconName: 'Newspaper'
      },
      {
        id: 'res-gallery',
        label: 'Photos & Videos',
        view: 'gallery',
        description: 'See ground photos of smiling children and village projects',
        iconName: 'Image'
      },
      {
        id: 'res-docs',
        label: 'Where Money Goes',
        view: 'documents',
        description: 'Download 80G certificate, tax filings and expense sheets',
        iconName: 'Files',
        badge: 'Audited'
      },
      {
        id: 'res-sheets',
        label: 'Google Sheets Hub',
        view: 'google-sheets',
        description: 'Sync, export & view live NGO ledgers in Google Spreadsheets',
        iconName: 'FileSpreadsheet',
        badge: 'Live Sync'
      },
      {
        id: 'res-verify',
        label: 'Check Certificate',
        view: 'verify-certificate',
        description: 'Quickly verify any donation receipt or volunteer certificate',
        iconName: 'BadgeCheck'
      },
      {
        id: 'res-faq',
        label: 'Questions & Answers (FAQ)',
        view: 'faq',
        description: 'Simple answers on how to donate, save tax, and visit',
        iconName: 'HelpCircle'
      }
    ],
    featuredAction: {
      label: 'See Honest Accounts & 80G Receipts →',
      view: 'documents'
    }
  },
  {
    id: 'contact',
    label: 'Contact',
    view: 'contact',
    type: 'link'
  }
];
