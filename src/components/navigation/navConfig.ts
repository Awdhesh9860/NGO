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
    label: 'About',
    type: 'dropdown',
    children: [
      {
        id: 'about-who',
        label: 'Who We Are',
        view: 'about',
        subId: 'who-we-are',
        description: 'Our heritage, founding philosophy & grassroots journey',
        iconName: 'Building'
      },
      {
        id: 'about-story',
        label: 'Our Story',
        view: 'about-story',
        description: 'Our humble beginnings, key milestones & path forward',
        iconName: 'BookOpen'
      },
      {
        id: 'about-mission',
        label: 'Mission & Vision',
        view: 'about-mission-vision',
        description: 'Empowering families with education, water & opportunity',
        iconName: 'Compass'
      },
      {
        id: 'about-values',
        label: 'Our Values',
        view: 'about-values',
        description: 'Compassion, equality, honesty & responsibility in action',
        iconName: 'ShieldCheck'
      },
      {
        id: 'about-founder',
        label: 'Founder Message',
        view: 'about-founder',
        description: 'A personal note on service, purpose and our path ahead',
        iconName: 'HeartHandshake'
      },
      {
        id: 'about-leadership',
        label: 'Leadership',
        view: 'about-leadership',
        description: 'Executive directors & field program coordinators',
        iconName: 'Users'
      },
      {
        id: 'about-board',
        label: 'Board of Trustees',
        view: 'about-board',
        description: 'Honorary trustees & independent audit governance',
        iconName: 'Scale'
      },
      {
        id: 'about-team',
        label: 'Our Team',
        view: 'about-team',
        description: 'Frontline educators, coordinators & volunteers',
        iconName: 'Users2'
      },
      {
        id: 'about-awards',
        label: 'Awards & Recognition',
        view: 'about-awards',
        description: 'Statutory 80G, Darpan empanelment & clean audits',
        iconName: 'Award',
        badge: 'Verified'
      }
    ],
    featuredAction: {
      label: 'Explore Complete Foundation Story →',
      view: 'about'
    }
  },
  {
    id: 'programs',
    label: 'Programs',
    type: 'megamenu',
    megaColumns: [
      {
        title: 'Human Development Focus',
        description: 'Core initiatives driving generational change',
        items: [
          {
            id: 'prog-edu',
            label: 'Education',
            view: 'programs',
            subId: 'education',
            description: 'Digital schools, scholarship grants & remedial tutoring',
            iconName: 'GraduationCap'
          },
          {
            id: 'prog-skill',
            label: 'Skill Development',
            view: 'programs',
            subId: 'skill-dev',
            description: 'Vocational trades, computing & market-linked employment',
            iconName: 'Laptop'
          },
          {
            id: 'prog-health',
            label: 'Health & Safe Water',
            view: 'programs',
            subId: 'health',
            description: 'Mobile health clinics, clean RO filtration & maternal care',
            iconName: 'Activity'
          },
          {
            id: 'prog-women',
            label: 'Women Empowerment',
            view: 'programs',
            subId: 'women-empowerment',
            description: 'Micro-enterprises, SHG federations & artisan cooperatives',
            iconName: 'Heart'
          }
        ]
      },
      {
        title: 'Community & Resilience',
        description: 'Sustainable ecosystems and grassroots support',
        items: [
          {
            id: 'prog-child',
            label: 'Child Support',
            view: 'programs',
            subId: 'child-support',
            description: 'Nutrition meals, pediatric care & protective foster spaces',
            iconName: 'Smile'
          },
          {
            id: 'prog-livelihood',
            label: 'Livelihood & Farming',
            view: 'programs',
            subId: 'livelihood',
            description: 'Regenerative agri-training & organic farmer collectives',
            iconName: 'Sprout'
          },
          {
            id: 'prog-env',
            label: 'Environment & Climate',
            view: 'programs',
            subId: 'environment',
            description: 'Reforestation belts, solar minigrids & waste circularity',
            iconName: 'Trees'
          },
          {
            id: 'prog-comm',
            label: 'Community Development',
            view: 'programs',
            subId: 'community-dev',
            description: 'Rural infrastructure, sanitization facilities & youth centers',
            iconName: 'Home'
          }
        ]
      }
    ],
    featuredCard: {
      tag: 'Field Impact',
      title: 'Active in 24 Districts',
      description: 'Over 85,000 direct beneficiaries served across education, health, and livelihood programs.',
      ctaLabel: 'View All Programs →',
      view: 'programs'
    },
    featuredAction: {
      label: 'View All 8 Core Programs →',
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
        label: 'Ongoing Projects',
        view: 'projects',
        subId: 'ongoing',
        description: 'Currently deployed field operations with live milestones',
        iconName: 'Clock',
        badge: 'Live'
      },
      {
        id: 'proj-completed',
        label: 'Completed Projects',
        view: 'projects',
        subId: 'completed',
        description: 'Successfully handed-over community infrastructures',
        iconName: 'CheckCircle2'
      },
      {
        id: 'proj-upcoming',
        label: 'Upcoming Projects',
        view: 'projects',
        subId: 'upcoming',
        description: 'Upcoming pipeline initiatives awaiting funding deployment',
        iconName: 'Calendar'
      },
      {
        id: 'proj-campaigns',
        label: 'Active Relief Campaigns',
        view: 'campaigns',
        description: 'Time-sensitive emergency flood and hunger relief drives',
        iconName: 'Flame',
        badge: 'Urgent'
      }
    ],
    featuredAction: {
      label: 'Explore All Field Projects & Geo-Data →',
      view: 'projects'
    }
  },
  {
    id: 'impact',
    label: 'Impact',
    type: 'dropdown',
    children: [
      {
        id: 'imp-overview',
        label: 'Our Impact',
        view: 'impact',
        description: 'Measurable, audited outcomes across 12 United Nations SDGs',
        iconName: 'TrendingUp'
      },
      {
        id: 'imp-numbers',
        label: 'Impact Numbers',
        view: 'impact',
        subId: 'metrics',
        description: 'Real-time counters: beneficiaries, water liters & kits deployed',
        iconName: 'BarChart3'
      },
      {
        id: 'imp-stories',
        label: 'Success Stories',
        view: 'stories',
        description: 'Firsthand transformation narratives from beneficiary families',
        iconName: 'BookOpen'
      },
      {
        id: 'imp-reports',
        label: 'Annual Impact Reports',
        view: 'documents',
        description: 'Comprehensive external auditor evaluations and scorecards',
        iconName: 'FileText'
      },
      {
        id: 'imp-results',
        label: 'Project Results',
        view: 'impact',
        subId: 'results',
        description: 'Before & after indicators from field ground surveys',
        iconName: 'CheckSquare'
      }
    ],
    featuredAction: {
      label: 'Open Interactive Impact Dashboard →',
      view: 'impact'
    }
  },
  {
    id: 'involved',
    label: 'Get Involved',
    type: 'dropdown',
    children: [
      {
        id: 'inv-vol',
        label: 'Become a Volunteer',
        view: 'volunteers',
        description: 'Join 1,200+ active field volunteers & skill ambassadors',
        iconName: 'HandHeart',
        badge: 'Popular',
        highlight: true
      },
      {
        id: 'inv-csr',
        label: 'CSR Partnership',
        view: 'csr',
        description: 'Corporate social responsibility co-investment and audit compliance',
        iconName: 'Briefcase',
        badge: 'CSR 80G',
        highlight: true
      },
      {
        id: 'inv-member',
        label: 'Become a Member',
        view: 'membership',
        description: 'Annual supporter tiers with governance voting rights',
        iconName: 'UserCheck'
      },
      {
        id: 'inv-careers',
        label: 'Careers & Fellowships',
        view: 'careers',
        description: 'Open full-time development sector roles & youth fellowships',
        iconName: 'Sparkles'
      },
      {
        id: 'inv-campaign',
        label: 'Support a Campaign',
        view: 'campaigns',
        description: 'Pledge funds to urgent grassroots relief operations',
        iconName: 'Heart'
      }
    ],
    featuredAction: {
      label: 'Join HopeHorizon Movement Today →',
      view: 'volunteers'
    }
  },
  {
    id: 'resources',
    label: 'Resources',
    type: 'dropdown',
    children: [
      {
        id: 'res-events',
        label: 'Events & Workshops',
        view: 'events',
        description: 'Community townhalls, youth hackathons & health camps',
        iconName: 'CalendarDays'
      },
      {
        id: 'res-news',
        label: 'News & Media',
        view: 'news',
        description: 'Press releases, national media mentions & bulletins',
        iconName: 'Newspaper'
      },
      {
        id: 'res-gallery',
        label: 'Photo & Video Gallery',
        view: 'gallery',
        description: 'High-resolution field photography from ground missions',
        iconName: 'Image'
      },
      {
        id: 'res-docs',
        label: 'Documents & Reports',
        view: 'documents',
        description: 'Statutory 80G filings, balance sheets & audit disclosures',
        iconName: 'Files',
        badge: 'Audited'
      },
      {
        id: 'res-verify',
        label: 'Verify Certificate',
        view: 'verify-certificate',
        description: 'Cryptographically authenticate donor & volunteer credentials',
        iconName: 'BadgeCheck'
      },
      {
        id: 'res-faq',
        label: 'Supporter FAQs',
        view: 'faq',
        description: 'Common questions on 80G receipts, volunteering & funds',
        iconName: 'HelpCircle'
      }
    ],
    featuredAction: {
      label: 'Inspect Audited Reports & Transparency Hub →',
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
