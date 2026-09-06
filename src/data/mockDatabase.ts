import {
  User,
  Program,
  Project,
  Campaign,
  Donation,
  Volunteer,
  Member,
  Event,
  EventRegistration,
  StaffTask,
  AttendanceRecord,
  LeaveRequest,
  Certificate,
  CMSArticle,
  MediaAsset,
  TransparencyReport,
  FAQItem,
  ContactInquiry,
  CSRPartner,
  AuditLog,
  SystemSettings,
  NewsletterSubscriber
} from '../types';

export const INITIAL_SETTINGS: SystemSettings = {
  ngoName: '[NGO Name]',
  registrationNumber: '[Registration Number]',
  taxExemption80GNumber: '[Tax Exemption / 80G / 501(c)(3) Number]',
  fcraRegistrationNumber: '[FCRA / Regulatory Number]',
  darpanId: '[Government Portal ID]',
  panNumber: '[Tax ID / PAN Number]',
  primaryEmail: 'info@example-ngo.org',
  primaryPhone: '+1 [Phone Number]',
  headquartersAddress: '[Office Address, City, Country]',
  currencySymbol: '$',
  currencyCode: 'USD',
  razorpayEnabled: true,
  stripeEnabled: true,
  cashfreeEnabled: true,
  bankTransferEnabled: true,
  autoSendReceipts: true,
  emailNotificationsEnabled: true,
  smsNotificationsEnabled: true,
  maintenanceMode: false
};

export const INITIAL_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Dr. Evelyn Vance',
    email: 'admin@hopehorizon.org',
    role: 'SUPER_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 234-5678',
    department: 'Executive Board',
    designation: 'President & Executive Director',
    status: 'active',
    createdAt: '2021-01-10T08:00:00Z',
    lastLogin: '2026-09-02T03:45:00Z'
  },
  {
    id: 'user-2',
    name: 'Aarav Sharma',
    email: 'operations@hopehorizon.org',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98112 34567',
    department: 'Operations & Field Coordination',
    designation: 'Chief Operations Officer',
    status: 'active',
    createdAt: '2021-03-15T09:30:00Z',
    lastLogin: '2026-09-02T02:10:00Z'
  },
  {
    id: 'user-3',
    name: 'Sarah Jenkins',
    email: 'programs@hopehorizon.org',
    role: 'MANAGER',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 876-5432',
    department: 'Education & Healthcare Programs',
    designation: 'Senior Program Director',
    status: 'active',
    createdAt: '2022-05-01T10:00:00Z',
    lastLogin: '2026-09-01T18:20:00Z'
  },
  {
    id: 'user-4',
    name: 'David Chen',
    email: 'david.chen@hopehorizon.org',
    role: 'TEAM_MEMBER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 345-6789',
    department: 'Field Operations',
    designation: 'Field Lead - Clean Water Project',
    status: 'active',
    createdAt: '2023-02-15T11:00:00Z',
    lastLogin: '2026-09-02T01:15:00Z'
  },
  {
    id: 'user-5',
    name: 'Priya Patel',
    email: 'priya.volunteer@example.com',
    role: 'VOLUNTEER',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    phone: '+91 99887 11223',
    department: 'Community Outreach',
    designation: 'Senior Youth Volunteer',
    status: 'active',
    createdAt: '2023-08-10T14:20:00Z',
    lastLogin: '2026-09-01T16:00:00Z'
  },
  {
    id: 'user-6',
    name: 'Marcus Sterling',
    email: 'marcus.sterling@donor.com',
    role: 'DONOR',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 901-2345',
    department: 'Philanthropy Network',
    designation: 'Major Giving Donor',
    status: 'active',
    createdAt: '2022-11-20T16:45:00Z',
    lastLogin: '2026-08-30T10:12:00Z'
  },
  {
    id: 'user-7',
    name: 'Elena Rostova',
    email: 'elena.rostova@member.org',
    role: 'MEMBER',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+44 20 7946 0912',
    department: 'Global Council Member',
    designation: 'Lifetime Patron Member',
    status: 'active',
    createdAt: '2023-01-05T09:00:00Z',
    lastLogin: '2026-08-28T14:40:00Z'
  },
  {
    id: 'user-8',
    name: 'Maya Lin',
    email: 'content@hopehorizon.org',
    role: 'CONTENT_EDITOR',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 432-1098',
    department: 'Communications & Media',
    designation: 'Chief Storyteller & Editor',
    status: 'active',
    createdAt: '2023-04-12T13:10:00Z',
    lastLogin: '2026-09-02T02:50:00Z'
  },
  {
    id: 'user-9',
    name: 'Rajesh Singhania',
    email: 'finance@hopehorizon.org',
    role: 'ACCOUNTANT',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    phone: '+91 97110 44332',
    department: 'Finance & Compliance',
    designation: 'Head of Accounts & Taxation',
    status: 'active',
    createdAt: '2021-08-19T10:15:00Z',
    lastLogin: '2026-09-01T17:30:00Z'
  }
];

export const INITIAL_PROGRAMS: Program[] = [
  {
    id: 'prog-1',
    title: 'Universal Child Education & Digital Literacy',
    slug: 'child-education-literacy',
    category: 'Education',
    description: 'Transforming rural schooling by building high-tech solar smart classrooms, training local teachers, and providing comprehensive scholarship kits.',
    objectives: [
      'Bridge the rural-urban digital literacy divide for 50,000+ children',
      'Provide full STEM kits and digital tablet labs in 120 underserved schools',
      'Retain 98% girl-child attendance through mid-day nutrition and hygiene access'
    ],
    targetBeneficiaries: 'Underprivileged children aged 5-16 in marginalized rural districts',
    iconName: 'GraduationCap',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
    stats: [
      { label: 'Schools Equipped', value: '142' },
      { label: 'Students Enrolled', value: '48,500+' },
      { label: 'Literacy Rate Lift', value: '+34%' }
    ],
    budget: 850000,
    status: 'active'
  },
  {
    id: 'prog-2',
    title: 'Clean Water & Community Sanitation',
    slug: 'clean-water-sanitation',
    category: 'Healthcare & Water',
    description: 'Installing solar-powered deep borehole water filtration plants and hygienic sanitation blocks to eliminate waterborne diseases.',
    objectives: [
      'Deliver potable, WHO-certified drinking water within a 5-minute walk for 80 villages',
      'Eradicate recurring waterborne epidemics through community hygiene councils',
      'Empower local women-led water management committees'
    ],
    targetBeneficiaries: 'Drought-prone farming villages and remote tribal communities',
    iconName: 'Droplets',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80',
    stats: [
      { label: 'Filtration Plants', value: '96' },
      { label: 'Daily Water Output', value: '1.2M Liters' },
      { label: 'Villages Covered', value: '88' }
    ],
    budget: 1200000,
    status: 'active'
  },
  {
    id: 'prog-3',
    title: 'Women Empowerment & Artisan Livelihoods',
    slug: 'women-empowerment-livelihood',
    category: 'Livelihoods',
    description: 'Micro-grants, vocational craft training, and fair-trade global market linkages for rural women entrepreneurs.',
    objectives: [
      'Train 10,000 women in textile weaving, agro-processing, and financial bookkeeping',
      'Distribute zero-interest seed capital micro-loans to Self-Help Groups',
      'Connect artisan clusters directly to international e-commerce channels'
    ],
    targetBeneficiaries: 'Rural homemakers, single mothers, and indigenous craftswomen',
    iconName: 'HeartHandshake',
    image: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&auto=format&fit=crop&q=80',
    stats: [
      { label: 'Women Trained', value: '12,400' },
      { label: 'Micro-Enterprises', value: '840' },
      { label: 'Avg Income Surge', value: '+140%' }
    ],
    budget: 650000,
    status: 'active'
  },
  {
    id: 'prog-4',
    title: 'Emergency Disaster Relief & Rapid Response',
    slug: 'disaster-relief-rapid-response',
    category: 'Disaster Relief',
    description: '24/7 rapid deployment of medical emergency teams, food rations, shelter kits, and post-crisis psychological rehabilitation.',
    objectives: [
      'Deploy first-response aid packages within 18 hours of climate disasters',
      'Maintain emergency stockpiles across 4 regional disaster zones',
      'Rebuild climate-resilient permanent housing for affected families'
    ],
    targetBeneficiaries: 'Communities impacted by floods, earthquakes, cyclones, and conflicts',
    iconName: 'ShieldAlert',
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&auto=format&fit=crop&q=80',
    stats: [
      { label: 'Families Rescued', value: '35,000+' },
      { label: 'Relief Rations Sent', value: '180 Tons' },
      { label: 'Response Time', value: '< 18 hrs' }
    ],
    budget: 1500000,
    status: 'active'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-101',
    programId: 'prog-2',
    programTitle: 'Clean Water & Community Sanitation',
    title: 'Solar Aquifer Purification Hub - Rajasthan Thar Basin',
    slug: 'solar-aquifer-rajasthan',
    description: 'Constructing 15 heavy-duty solar-driven water purification hubs providing 25,000 villagers with safe arsenic-free drinking water.',
    objectives: [
      'Drill 15 solar-powered deep aquifers with reverse osmosis filtration',
      'Form village water panchayats led 60% by women',
      'Reduce fluorosis and gastrointestinal illness by 90%'
    ],
    location: 'Barmer & Jaisalmer Districts, India',
    startDate: '2025-01-15',
    endDate: '2026-11-30',
    status: 'active',
    budget: 320000,
    fundingGoal: 300000,
    amountRaised: 245000,
    beneficiariesCount: 25000,
    managerId: 'user-3',
    managerName: 'Sarah Jenkins',
    teamMemberIds: ['user-4'],
    images: [
      'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1574482620826-40685ca5ebd2?w=800&auto=format&fit=crop&q=80'
    ],
    milestones: [
      {
        id: 'm-1',
        projectId: 'proj-101',
        title: 'Geological Hydro-Survey & Site Permits',
        description: 'Complete soil testing and municipal clearance across 15 target villages.',
        targetDate: '2025-04-30',
        status: 'completed',
        progressPercentage: 100
      },
      {
        id: 'm-2',
        projectId: 'proj-101',
        title: 'Drilling & Solar Array Installation',
        description: 'Borehole drilling down to 220ft and photovoltaic inverter installation.',
        targetDate: '2025-10-15',
        status: 'completed',
        progressPercentage: 100
      },
      {
        id: 'm-3',
        projectId: 'proj-101',
        title: 'RO Filtration Plant Commissioning',
        description: 'Equip multi-stage membrane filtration and water quality sensors.',
        targetDate: '2026-06-30',
        status: 'in_progress',
        progressPercentage: 75
      },
      {
        id: 'm-4',
        projectId: 'proj-101',
        title: 'Community Handover & Maintenance Training',
        description: 'Full governance transfer to village panchayat council.',
        targetDate: '2026-11-30',
        status: 'pending',
        progressPercentage: 0
      }
    ],
    impactStats: [
      { label: 'Villages Impacted', value: '15' },
      { label: 'Clean Water/Day', value: '150,000 L' },
      { label: 'Reduction in Illness', value: '92%' }
    ],
    category: 'Clean Water'
  },
  {
    id: 'proj-102',
    programId: 'prog-1',
    programTitle: 'Universal Child Education & Digital Literacy',
    title: 'Smart STEM Labs & Mobile Classrooms for Rural Girls',
    slug: 'stem-labs-rural-girls',
    description: 'Equipping 40 remote secondary schools with offline-capable tablet learning stations, robotics kits, and female coding mentors.',
    objectives: [
      'Equip 40 schools with 1,200 tablets and interactive STEM curriculum',
      'Train 180 female science teachers on computational pedagogy',
      'Achieve 100% matriculation pass rate in STEM subjects'
    ],
    location: 'Eastern Province & Rift Valley',
    startDate: '2025-06-01',
    endDate: '2026-12-31',
    status: 'active',
    budget: 450000,
    fundingGoal: 400000,
    amountRaised: 368000,
    beneficiariesCount: 16000,
    managerId: 'user-3',
    managerName: 'Sarah Jenkins',
    teamMemberIds: ['user-4', 'user-8'],
    images: [
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80'
    ],
    milestones: [
      {
        id: 'm-201',
        projectId: 'proj-102',
        title: 'Tablet Hardware & Solar Inverter Procurement',
        description: 'Procure 1,200 ruggedized educational tablets and micro-solar setups.',
        targetDate: '2025-09-01',
        status: 'completed',
        progressPercentage: 100
      },
      {
        id: 'm-202',
        projectId: 'proj-102',
        title: 'Teacher Training Workshops in 40 Schools',
        description: 'Conduct 4-week intensive digital pedagogy modules.',
        targetDate: '2026-03-15',
        status: 'completed',
        progressPercentage: 100
      },
      {
        id: 'm-203',
        projectId: 'proj-102',
        title: 'Inter-School STEM Hackathon & Annual Review',
        description: 'Host regional showcase of student solar and robotic inventions.',
        targetDate: '2026-11-20',
        status: 'in_progress',
        progressPercentage: 60
      }
    ],
    impactStats: [
      { label: 'Schools Fitted', value: '40' },
      { label: 'Girl Students Enrolled', value: '16,200' },
      { label: 'Coding Mentors', value: '85' }
    ],
    category: 'Education'
  },
  {
    id: 'proj-103',
    programId: 'prog-3',
    programTitle: 'Women Empowerment & Artisan Livelihoods',
    title: 'Indigenous Handloom & Eco-Textiles Enterprise Hub',
    slug: 'handloom-artisan-hub',
    description: 'Providing sustainable looms, natural dye processing units, and direct export certification for 850 heritage silk and cotton weavers.',
    objectives: [
      'Establish 4 centralized organic dye and weaving centers',
      'Achieve Fair-Trade International Certification',
      'Triple direct artisan take-home income per finished garment'
    ],
    location: 'Assam & Odisha Textile Belt',
    startDate: '2024-03-01',
    endDate: '2025-12-15',
    status: 'completed',
    budget: 280000,
    fundingGoal: 280000,
    amountRaised: 295000,
    beneficiariesCount: 4200,
    managerId: 'user-2',
    managerName: 'Aarav Sharma',
    teamMemberIds: ['user-4'],
    images: [
      'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&auto=format&fit=crop&q=80'
    ],
    milestones: [
      {
        id: 'm-301',
        projectId: 'proj-103',
        title: 'Cooperative Registration & Land Lease',
        description: 'Legally incorporated 4 artisan weaver producer companies.',
        targetDate: '2024-06-30',
        status: 'completed',
        progressPercentage: 100
      },
      {
        id: 'm-302',
        projectId: 'proj-103',
        title: 'Sustainable Dye Lab & Loom Distribution',
        description: 'Supplied 400 ergonomic handlooms and zero-chemical dye plants.',
        targetDate: '2025-02-28',
        status: 'completed',
        progressPercentage: 100
      }
    ],
    impactStats: [
      { label: 'Artisans Employed', value: '850' },
      { label: 'Fair Trade Orders', value: '$480K' },
      { label: 'Eco-Garments Produced', value: '38,000' }
    ],
    category: 'Livelihoods'
  }
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    title: 'Emergency Flood Relief: Rebuilding 500 Submerged Village Homes',
    slug: 'emergency-flood-relief-2026',
    description: 'Flash floods have displaced 45,000 families. We are on the ground delivering food ration kits, water purifiers, temporary waterproof shelters, and emergency medical kits.',
    category: 'Disaster Relief',
    targetAmount: 250000,
    raisedAmount: 198450,
    startDate: '2026-08-01',
    endDate: '2026-10-15',
    image: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=80',
    donorCount: 1420,
    status: 'active',
    beneficiaryInfo: 'Direct aid for 45,000 flood victims across 32 marooned rural clusters',
    isUrgent: true,
    updates: [
      {
        id: 'cu-1',
        campaignId: 'camp-1',
        title: 'First Fleet of 12 Boats and 8,000 Rations Distributed',
        content: 'Our rescue team led by David Chen reached the isolated northern sectors yesterday, delivering 3 weeks of dry grains, baby formula, and oral rehydration salts.',
        date: '2026-08-28',
        author: 'David Chen'
      },
      {
        id: 'cu-2',
        campaignId: 'camp-1',
        title: 'Temporary Medical Camps Operational in 8 Relief Centres',
        content: 'Over 2,400 individuals received immediate wound treatment and waterborne vaccine inoculations today.',
        date: '2026-09-01',
        author: 'Dr. Evelyn Vance'
      }
    ]
  },
  {
    id: 'camp-2',
    title: 'Sponsor a Girl Child: 1-Year Scholarship & Digital Tablet',
    slug: 'sponsor-a-girl-education',
    description: 'For just $35/month or $420/year, you provide a young girl with school fees, daily nutritious meals, books, STEM tablet, and after-school tutoring.',
    category: 'Education',
    targetAmount: 180000,
    raisedAmount: 142300,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
    donorCount: 960,
    status: 'active',
    beneficiaryInfo: '450 underprivileged girl scholars in high-dropout districts',
    isUrgent: false,
    updates: [
      {
        id: 'cu-3',
        campaignId: 'camp-2',
        title: 'Mid-Year Academic Excellence Awards Handed Out',
        content: '94% of sponsored girls achieved top marks in science and mathematics during the term exams.',
        date: '2026-07-20',
        author: 'Sarah Jenkins'
      }
    ]
  },
  {
    id: 'camp-3',
    title: 'Clean Water Wells for 50 Arid African & Asian Villages',
    slug: 'clean-water-wells-initiative',
    description: 'Every well eliminates hours of hazardous walking for women and children, providing a lifetime of sparkling fresh, disease-free drinking water.',
    category: 'Clean Water',
    targetAmount: 300000,
    raisedAmount: 265000,
    startDate: '2026-03-01',
    endDate: '2026-11-30',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80',
    donorCount: 1840,
    status: 'active',
    beneficiaryInfo: '38,000 villagers gaining permanent tap water access',
    isUrgent: false,
    updates: [
      {
        id: 'cu-4',
        campaignId: 'camp-3',
        title: 'Well #34 Drilled Successfully in Barmer',
        content: 'Water flow tested at 85 liters per minute with zero contaminants detected.',
        date: '2026-08-15',
        author: 'Aarav Sharma'
      }
    ]
  }
];

export const INITIAL_DONATIONS: Donation[] = [
  {
    id: 'don-8001',
    donorName: 'Marcus Sterling',
    donorEmail: 'marcus.sterling@donor.com',
    donorPhone: '+1 (555) 901-2345',
    panOrTaxId: 'US-TAX-8891278',
    isAnonymous: false,
    amount: 5000,
    currency: 'USD',
    donationType: 'one-time',
    campaignId: 'camp-1',
    campaignTitle: 'Emergency Flood Relief: Rebuilding 500 Submerged Village Homes',
    paymentGateway: 'stripe',
    transactionId: 'ch_3N89xL2eZvKYlo2C19823',
    status: 'successful',
    receiptNumber: 'HH-REC-2026-0912',
    taxExemptionEligible: true,
    createdAt: '2026-09-01T14:30:00Z',
    notes: 'Please allocate towards immediate emergency water purification units.'
  },
  {
    id: 'don-8002',
    donorName: 'Dr. Alistair Finch',
    donorEmail: 'afinch@oxfordalumni.org',
    donorPhone: '+44 7911 123456',
    panOrTaxId: 'UK-HMRC-77218',
    isAnonymous: false,
    amount: 1200,
    currency: 'USD',
    donationType: 'recurring',
    frequency: 'monthly',
    campaignId: 'camp-2',
    campaignTitle: 'Sponsor a Girl Child: 1-Year Scholarship & Digital Tablet',
    paymentGateway: 'stripe',
    transactionId: 'sub_1P99aA2eZvKYlo2C01988',
    status: 'successful',
    receiptNumber: 'HH-REC-2026-0913',
    taxExemptionEligible: true,
    createdAt: '2026-09-01T09:15:00Z'
  },
  {
    id: 'don-8003',
    donorName: 'Anonymous Supporter',
    donorEmail: 'anonymous@donor.priv',
    isAnonymous: true,
    amount: 750,
    currency: 'USD',
    donationType: 'one-time',
    campaignId: 'camp-3',
    campaignTitle: 'Clean Water Wells for 50 Arid African & Asian Villages',
    paymentGateway: 'razorpay',
    transactionId: 'pay_Nz99L0x12aBcDe',
    status: 'successful',
    receiptNumber: 'HH-REC-2026-0914',
    taxExemptionEligible: false,
    createdAt: '2026-08-31T18:45:00Z'
  },
  {
    id: 'don-8004',
    donorName: 'Rohit K. Varma',
    donorEmail: 'rohit.varma@techconsult.in',
    donorPhone: '+91 98200 45678',
    panOrTaxId: 'AAAPV8912K',
    isAnonymous: false,
    amount: 2500,
    currency: 'USD',
    donationType: 'one-time',
    campaignId: 'camp-1',
    campaignTitle: 'Emergency Flood Relief: Rebuilding 500 Submerged Village Homes',
    paymentGateway: 'cashfree',
    transactionId: 'cf_order_99812739182',
    status: 'successful',
    receiptNumber: 'HH-REC-2026-0915',
    taxExemptionEligible: true,
    createdAt: '2026-08-30T11:20:00Z'
  },
  {
    id: 'don-8005',
    donorName: 'Sophia Lindqvist',
    donorEmail: 'sophia@nordicgreen.se',
    isAnonymous: false,
    amount: 350,
    currency: 'USD',
    donationType: 'recurring',
    frequency: 'monthly',
    campaignId: 'camp-2',
    campaignTitle: 'Sponsor a Girl Child: 1-Year Scholarship & Digital Tablet',
    paymentGateway: 'stripe',
    transactionId: 'sub_1P88bB2eZvKYlo2C88172',
    status: 'successful',
    receiptNumber: 'HH-REC-2026-0916',
    taxExemptionEligible: true,
    createdAt: '2026-08-29T16:00:00Z'
  }
];

export const INITIAL_VOLUNTEERS: Volunteer[] = [
  {
    id: 'vol-1',
    userId: 'user-5',
    name: 'Priya Patel',
    email: 'priya.volunteer@example.com',
    phone: '+91 99887 11223',
    location: 'Mumbai & Remote',
    skills: ['Social Media & Storytelling', 'First Aid', 'Teaching & Tutoring', 'Photography'],
    interests: ['Education for Girls', 'Disaster Relief Operations', 'Youth Workshops'],
    availability: 'Weekends & Evenings (15 hrs/wk)',
    experience: '3 years active field experience across education drives and emergency flood response teams.',
    status: 'active',
    assignedProjectIds: ['proj-101', 'proj-102'],
    totalHoursLogged: 142,
    rating: 4.9,
    joinedDate: '2023-08-10',
    profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'vol-2',
    name: 'Lucas Dupont',
    email: 'lucas.dupont@healthaid.org',
    phone: '+33 6 12 34 56 78',
    location: 'Lyon / Field Deployable',
    skills: ['Paramedic / First Aid', 'Logistics Management', 'Water Testing'],
    interests: ['Emergency Disaster Response', 'Clean Water'],
    availability: 'Full-time field deployment during crises',
    experience: 'Certified EMT with 4 disaster response deployments in Asia and Africa.',
    status: 'active',
    assignedProjectIds: ['proj-101'],
    totalHoursLogged: 210,
    rating: 5.0,
    joinedDate: '2023-02-18',
    profilePhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'vol-3',
    name: 'Ananya Deshmukh',
    email: 'ananya.d@student.uni.edu',
    phone: '+91 91234 56789',
    location: 'New Delhi',
    skills: ['STEM Curriculum Design', 'Graphic Design', 'Youth Mentorship'],
    interests: ['Universal Child Education', 'Digital Inclusion'],
    availability: 'Weekends (8 hrs/wk)',
    experience: 'Computer Science undergrad organizing school robotics clubs.',
    status: 'under_review',
    assignedProjectIds: [],
    totalHoursLogged: 0,
    joinedDate: '2026-08-30'
  }
];

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'mem-101',
    userId: 'user-7',
    memberId: 'HH-PATRON-2023-042',
    name: 'Elena Rostova',
    email: 'elena.rostova@member.org',
    phone: '+44 20 7946 0912',
    tier: 'Lifetime Patron',
    status: 'active',
    startDate: '2023-01-05',
    expiryDate: '2099-12-31',
    contributionAmount: 25000,
    digitalCardQr: 'HH-MEMBER-VERIFIED-PATRON-042'
  },
  {
    id: 'mem-102',
    memberId: 'HH-ANNUAL-2026-118',
    name: 'Jonathan Miller',
    email: 'jonathan.m@horizonfin.com',
    phone: '+1 (555) 678-9012',
    tier: 'Annual Supporter',
    status: 'active',
    startDate: '2026-02-01',
    expiryDate: '2027-01-31',
    contributionAmount: 1200,
    digitalCardQr: 'HH-MEMBER-VERIFIED-ANNUAL-118'
  },
  {
    id: 'mem-103',
    memberId: 'HH-CORP-2025-009',
    name: 'Apex Innovations Global Group',
    email: 'csr@apexinnovations.com',
    phone: '+1 (800) 445-9988',
    tier: 'Corporate Member',
    status: 'active',
    startDate: '2025-06-01',
    expiryDate: '2027-05-31',
    contributionAmount: 50000,
    digitalCardQr: 'HH-MEMBER-VERIFIED-CORP-009'
  }
];

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'evt-1',
    title: 'Global Social Impact & Climate Resilience Summit 2026',
    slug: 'global-impact-summit-2026',
    description: 'Join international changemakers, UN delegates, and grassroots leaders to discuss scalable community-led climate adaptation and clean water sovereignty.',
    category: 'Conference & Summit',
    date: '2026-10-18',
    startTime: '09:00 AM EST',
    endTime: '05:30 PM EST',
    location: 'United Nations Plaza, New York & Global Virtual Livestream',
    isVirtual: true,
    virtualLink: 'https://live.hopehorizon.org/summit2026',
    capacity: 2500,
    registeredCount: 1840,
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
    speakers: [
      { name: 'Dr. Evelyn Vance', role: 'President, HopeHorizon Foundation', organization: 'HopeHorizon' },
      { name: 'Prof. Amara Okafor', role: 'Lead Climate Hydrologist', organization: 'Global Water Institute' },
      { name: 'Kavita Subramaniam', role: 'Grassroots Community Organizer', organization: 'Rural Women Collective' }
    ],
    status: 'upcoming'
  },
  {
    id: 'evt-2',
    title: 'Hands-on Volunteer Orientation & Field Disaster Preparedness',
    slug: 'volunteer-orientation-sept-2026',
    description: 'Comprehensive certification workshop covering emergency triage, relief supply distribution software, community psychological first aid, and field ethics.',
    category: 'Workshop & Training',
    date: '2026-09-24',
    startTime: '10:00 AM IST',
    endTime: '03:00 PM IST',
    location: 'HopeHorizon Training Pavilion, New Delhi HQ',
    isVirtual: false,
    capacity: 100,
    registeredCount: 82,
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
    speakers: [
      { name: 'Aarav Sharma', role: 'COO & Operations Lead', organization: 'HopeHorizon' },
      { name: 'Lucas Dupont', role: 'Emergency Field Specialist', organization: 'HopeHorizon Field Ops' }
    ],
    status: 'upcoming'
  },
  {
    id: 'evt-3',
    title: 'Annual Donor Appreciation Gala & Transparency Showcase',
    slug: 'annual-donor-gala-2026',
    description: 'An evening honoring our visionary donors, corporate CSR partners, and lifetime members with live beneficiary musical performances and the release of our Audited Annual Report.',
    category: 'Gala & Fundraiser',
    date: '2026-11-12',
    startTime: '06:30 PM CET',
    endTime: '10:00 PM CET',
    location: 'Palais des Nations Grand Ballroom, Geneva, Switzerland',
    isVirtual: false,
    capacity: 400,
    registeredCount: 290,
    image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&auto=format&fit=crop&q=80',
    speakers: [
      { name: 'Dr. Evelyn Vance', role: 'President', organization: 'HopeHorizon' },
      { name: 'Marcus Sterling', role: 'Keynote Supporter', organization: 'Sterling Philanthropies' }
    ],
    status: 'upcoming'
  }
];

export const INITIAL_TASKS: StaffTask[] = [
  {
    id: 'task-101',
    title: 'Dispatch 4,000 Water Purification Tablets to Sector 4 Camps',
    description: 'Coordinate with local district magistrate to ensure secure transport and distribution log verification.',
    projectId: 'proj-101',
    projectTitle: 'Solar Aquifer Purification Hub - Rajasthan Thar Basin',
    assignedToId: 'user-4',
    assignedToName: 'David Chen',
    priority: 'urgent',
    status: 'in_progress',
    dueDate: '2026-09-04',
    createdAt: '2026-09-01T08:30:00Z',
    comments: [
      {
        id: 'c-1',
        author: 'Sarah Jenkins',
        text: 'Medical relief kits have arrived at the railhead. Please prioritize the northern shelter cluster first.',
        createdAt: '2026-09-01T10:00:00Z'
      }
    ]
  },
  {
    id: 'task-102',
    title: 'Finalize Audited Balance Sheet for Q3 Transparency Release',
    description: 'Review statutory tax reconciliations, 80G donations register, and foreign contribution ledger.',
    assignedToId: 'user-9',
    assignedToName: 'Rajesh Singhania',
    priority: 'high',
    status: 'in_progress',
    dueDate: '2026-09-10',
    createdAt: '2026-08-28T09:00:00Z',
    comments: []
  },
  {
    id: 'task-103',
    title: 'Publish Annual Impact Story: "Weaving Hope in Assam"',
    description: 'Compile high-res artisan portrait photography, audio transcript, and quote from master weaver Lalita Devi.',
    projectId: 'proj-103',
    projectTitle: 'Indigenous Handloom & Eco-Textiles Enterprise Hub',
    assignedToId: 'user-8',
    assignedToName: 'Maya Lin',
    priority: 'medium',
    status: 'review',
    dueDate: '2026-09-05',
    createdAt: '2026-08-30T11:45:00Z',
    comments: []
  },
  {
    id: 'task-104',
    title: 'Deliver 250 STEM Tablets to Girls Secondary School in Barmer',
    description: 'Verify preloaded curriculum software, configure child-safe MDM filters, and conduct hands-on training with faculty.',
    projectId: 'proj-102',
    projectTitle: 'Smart STEM Labs & Mobile Classrooms for Rural Girls',
    assignedToId: 'user-4',
    assignedToName: 'David Chen',
    priority: 'high',
    status: 'todo',
    dueDate: '2026-09-15',
    createdAt: '2026-09-02T02:00:00Z',
    comments: []
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    userId: 'user-4',
    userName: 'David Chen',
    date: '2026-09-02',
    checkInTime: '08:45 AM',
    status: 'present',
    location: 'Rajasthan Field Base Camp 3',
    hoursWorked: 8.5
  },
  {
    id: 'att-2',
    userId: 'user-4',
    userName: 'David Chen',
    date: '2026-09-01',
    checkInTime: '08:30 AM',
    checkOutTime: '05:45 PM',
    status: 'present',
    location: 'Rajasthan Field Base Camp 3',
    hoursWorked: 9.25
  },
  {
    id: 'att-3',
    userId: 'user-8',
    userName: 'Maya Lin',
    date: '2026-09-02',
    checkInTime: '09:05 AM',
    status: 'present',
    location: 'HQ Media Suite',
    hoursWorked: 8.0
  }
];

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'lvr-1',
    userId: 'user-4',
    userName: 'David Chen',
    leaveType: 'field_duty',
    startDate: '2026-09-18',
    endDate: '2026-09-22',
    reason: 'Remote flood damage assessment and logistics dispatch across northern border districts.',
    status: 'approved',
    appliedAt: '2026-08-25T10:00:00Z'
  }
];

export const INITIAL_CERTIFICATES: Certificate[] = [
  {
    id: 'cert-1001',
    certificateNumber: 'HH-CERT-VOL-2025-9921',
    recipientName: 'Priya Patel',
    recipientEmail: 'priya.volunteer@example.com',
    certificateType: 'Volunteer Service',
    issueDate: '2025-12-15',
    title: 'Distinguished Humanitarian Volunteer Service Award',
    description: 'In recognition of completing over 140 hours of selfless community education and rapid flood disaster relief field service with exceptional dedication.',
    issuedBy: 'Dr. Evelyn Vance',
    issuerRole: 'President & Executive Director',
    organizationName: 'HopeHorizon Global Foundation',
    verificationCode: 'VERIFY-HH-VOL-9921-X7K',
    qrData: 'https://hopehorizon.org/verify-certificate/HH-CERT-VOL-2025-9921',
    status: 'valid'
  },
  {
    id: 'cert-1002',
    certificateNumber: 'HH-CERT-TRG-2026-0412',
    recipientName: 'Lucas Dupont',
    recipientEmail: 'lucas.dupont@healthaid.org',
    certificateType: 'Training Completion',
    issueDate: '2026-04-10',
    title: 'Advanced Rapid Triage & Emergency Water Sanitation Masterclass',
    description: 'Successfully demonstrated mastery in solar water filtration commissioning and frontline emergency camp health protocols.',
    issuedBy: 'Aarav Sharma',
    issuerRole: 'Chief Operations Officer',
    organizationName: 'HopeHorizon Global Foundation',
    verificationCode: 'VERIFY-HH-TRG-0412-M2Q',
    qrData: 'https://hopehorizon.org/verify-certificate/HH-CERT-TRG-2026-0412',
    status: 'valid'
  },
  {
    id: 'cert-1003',
    certificateNumber: 'HH-CERT-HON-2024-0081',
    recipientName: 'Marcus Sterling',
    recipientEmail: 'marcus.sterling@donor.com',
    certificateType: 'Appreciation',
    issueDate: '2024-11-20',
    title: 'Global Philanthropy Champion & Visionary Benefactor',
    description: 'Conferred with highest gratitude for enabling clean water infrastructure across 20 villages, bringing health and dignity to 30,000 individuals.',
    issuedBy: 'Dr. Evelyn Vance',
    issuerRole: 'President & Executive Director',
    organizationName: 'HopeHorizon Global Foundation',
    verificationCode: 'VERIFY-HH-HON-0081-K9Z',
    qrData: 'https://hopehorizon.org/verify-certificate/HH-CERT-HON-2024-0081',
    status: 'valid'
  }
];

export const INITIAL_CMS_ARTICLES: CMSArticle[] = [
  {
    id: 'art-1',
    title: 'From Darkness to Digital Classrooms: How Solar Tablets Are Keeping Rural Girls in School',
    slug: 'solar-tablets-keeping-girls-in-school',
    excerpt: 'In remote villages where power cuts last for weeks, solar-powered smart classroom labs are sparking a STEM revolution for 16,000 young girls.',
    content: `When 14-year-old Meera used to study by kerosene lamp, her parents worried she would have to drop out like many before her. Today, seated inside the newly commissioned solar-powered smart lab at Barmer Girls Secondary School, she is writing her first lines of Python code.

Through our Universal Child Education initiative, HopeHorizon has installed 40 off-grid solar-powered STEM learning hubs across Eastern and Northern districts. Each lab features 30 ruggedized interactive tablets preloaded with local language science curricula, digital encyclopedias, and hands-on robotics simulations.

"The difference in confidence is palpable," explains Principal Sunita Devi. "Attendance in our science classes has surged from 55% to 98% this semester. Our students now dream of becoming software engineers, astrophysicists, and doctors."

With continued support from global donors, we aim to expand to an additional 80 schools over the coming academic year.`,
    category: 'success_story',
    author: 'Maya Lin',
    authorRole: 'Chief Storyteller',
    coverImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
    tags: ['Education', 'Girls in STEM', 'Solar Power', 'Digital Inclusion'],
    publishedAt: '2026-08-25',
    status: 'published',
    readTimeMinutes: 5
  },
  {
    id: 'art-2',
    title: 'HopeHorizon Responds: Frontline Relief Logistics in the Wake of Severe Northern Flooding',
    slug: 'frontline-relief-logistics-northern-floods',
    excerpt: 'A comprehensive operational update on how our emergency mobile teams deployed 180 tons of rations, clean water, and medical aid within 18 hours.',
    content: `When unprecedented torrential downpours triggered catastrophic river overflows across 32 rural clusters, our 24/7 Rapid Disaster Response command center activated immediately.

Led by Operations Chief Aarav Sharma and Field Lead David Chen, 14 motorized rescue boats loaded with water purification satchels, ready-to-eat calorie-dense meal packs, and portable medical kits breached isolated waters within 18 hours of the initial emergency call.

Key Milestone Numbers Achieved in Week 1:
- 45,000 individuals supplied with potable drinking water
- 8 temporary mobile clinics established in high-ground schools
- Zero cholera or dysentery outbreaks recorded in our managed relief zones

We thank our global donor community and dedicated volunteer network whose instant contributions made this lifesaving speed possible.`,
    category: 'press_release',
    author: 'Aarav Sharma',
    authorRole: 'Chief Operations Officer',
    coverImage: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&auto=format&fit=crop&q=80',
    tags: ['Emergency Response', 'Disaster Relief', 'Field Operations'],
    publishedAt: '2026-08-29',
    status: 'published',
    readTimeMinutes: 4
  },
  {
    id: 'art-3',
    title: 'Why Financial Transparency is the Backbone of 21st Century NGO Governance',
    slug: 'financial-transparency-ngo-governance',
    excerpt: 'Dr. Evelyn Vance breaks down why every dollar given must be verifiable down to the local project ledger and audited in real-time.',
    content: `In an era of rising global cynicism, donor trust is not given—it is earned through radical, uncompromised transparency.

At HopeHorizon, 88 cents of every dollar goes directly into field programs. Our open-ledger model ensures that whether you contribute $25 for a family hygiene kit or $50,000 for a deep aquifer well, you can inspect audited financials, view geotagged progress photos, and verify tax exemption certificates online at any hour.

Explore our Transparency Center to download our latest KPMG-audited financial returns and government statutory compliance filings.`,
    category: 'blog',
    author: 'Dr. Evelyn Vance',
    authorRole: 'President & Executive Director',
    coverImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
    tags: ['Transparency', 'Governance', 'Donor Trust', 'Accountability'],
    publishedAt: '2026-08-15',
    status: 'published',
    readTimeMinutes: 6
  }
];

export const INITIAL_TRANSPARENCY_REPORTS: TransparencyReport[] = [
  {
    id: 'rep-2025',
    title: 'Annual Audited Financial Statements & Impact Report 2024-2025',
    year: '2024-2025',
    category: 'annual_report',
    fileUrl: '/reports/HopeHorizon_Annual_Report_2024_2025.pdf',
    fileSize: '4.8 MB',
    publishedDate: '2025-07-15',
    auditedBy: 'Deloitte & Touche LLP / Singhania & Associates Chartered Accountants',
    summary: 'Comprehensive evaluation of $4.2M in donor fund deployment across 140 projects, achieving 99.4% clean financial audit rating and reaching 185,000 beneficiaries.'
  },
  {
    id: 'rep-fcra-2025',
    title: 'Statutory FCRA (Foreign Contribution Regulation) Return - FY 2024-25',
    year: '2024-2025',
    category: 'fcra_return',
    fileUrl: '/reports/FCRA_Annual_Filing_2025.pdf',
    fileSize: '1.9 MB',
    publishedDate: '2025-08-30',
    auditedBy: 'Ministry of Home Affairs & Statutory Auditor Panel',
    summary: 'Official certified filing of all international remittances, institutional foundation grants, and overseas donor allocations.'
  },
  {
    id: 'rep-tax-80g',
    title: 'Income Tax Exemption Approval (Section 80G & 12A) Certification Order',
    year: '2023-2028',
    category: 'statutory_compliance',
    fileUrl: '/reports/Tax_Exemption_80G_Certificate.pdf',
    fileSize: '850 KB',
    publishedDate: '2023-04-01',
    auditedBy: 'Directorate of Income Tax (Exemptions)',
    summary: 'Permanent 50% tax exemption entitlement certificate for Indian individual and corporate contributions under Section 80G.'
  }
];

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How do I receive my official 80G / 501(c)(3) tax exemption receipt?',
    answer: 'Immediately upon completing your donation online, an official digitally signed tax receipt (with unique serial number and registration codes) is generated and emailed to you. You can also access and download your lifetime tax receipts anytime through your Donor Dashboard.',
    category: 'tax_exemption'
  },
  {
    id: 'faq-2',
    question: 'How much of my contribution actually reaches field projects?',
    answer: 'Over 88% of every contribution is deployed directly into frontline programs and grassroots execution. Only 7% covers essential operational administration, and 5% supports transparent fundraising and audit governance.',
    category: 'donations'
  },
  {
    id: 'faq-3',
    question: 'How does the Volunteer application and certification process work?',
    answer: 'After filling out our online Volunteer Registration form, our coordination team reviews your skill profile within 48 hours. Once approved, you gain access to the Volunteer Portal to pick project shifts, log field hours, and earn digitally verifiable certificates.',
    category: 'volunteering'
  },
  {
    id: 'faq-4',
    question: 'How can our corporation partner with HopeHorizon for CSR compliance?',
    answer: 'We provide end-to-end CSR project planning, baseline impact studies, ESG compliance reporting, employee volunteering engagements, and audited utilization certificates compliant with national CSR mandates and UN SDGs.',
    category: 'csr'
  },
  {
    id: 'faq-5',
    question: 'How does the public certificate verification portal work?',
    answer: 'Every certificate issued by HopeHorizon contains a unique cryptographic verification ID and QR code. Anyone (universities, employers, embassies) can visit our /verify-certificate page, enter the code, and view live authentic records directly from our database.',
    category: 'general'
  }
];

export const INITIAL_CSR_PARTNERS: CSRPartner[] = [
  {
    id: 'csr-1',
    companyName: 'Global Tech Foundation / Microsoft Philanthropies',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    tier: 'Platinum Impact Partner',
    projectsSupported: ['Smart STEM Labs & Mobile Classrooms for Rural Girls'],
    totalContributed: 350000,
    partnershipYear: '2023 - Present',
    website: 'https://microsoft.com/philanthropies'
  },
  {
    id: 'csr-2',
    companyName: 'Tata Sustainability & Community Trust',
    logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&auto=format&fit=crop&q=80',
    tier: 'Platinum Impact Partner',
    projectsSupported: ['Solar Aquifer Purification Hub - Rajasthan Thar Basin'],
    totalContributed: 500000,
    partnershipYear: '2021 - Present',
    website: 'https://tata.com/sustainability'
  },
  {
    id: 'csr-3',
    companyName: 'Nordic Eco-Apparel Alliance',
    logo: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=200&auto=format&fit=crop&q=80',
    tier: 'Gold Community Leader',
    projectsSupported: ['Indigenous Handloom & Eco-Textiles Enterprise Hub'],
    totalContributed: 180000,
    partnershipYear: '2024 - Present'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-9901',
    actorId: 'user-1',
    actorName: 'Dr. Evelyn Vance',
    actorRole: 'SUPER_ADMIN',
    action: 'CAMPAIGN_ACTIVATED',
    resource: 'Campaign',
    resourceId: 'camp-1',
    details: 'Activated emergency appeal "Emergency Flood Relief: Rebuilding 500 Submerged Village Homes" with $250,000 target.',
    ipAddress: '192.168.1.104',
    timestamp: '2026-08-01T08:00:00Z'
  },
  {
    id: 'aud-9902',
    actorId: 'user-2',
    actorName: 'Aarav Sharma',
    actorRole: 'ADMIN',
    action: 'VOLUNTEER_APPROVED',
    resource: 'Volunteer',
    resourceId: 'vol-1',
    details: 'Approved volunteer application for Priya Patel and assigned to Barmer STEM project.',
    ipAddress: '103.21.144.92',
    timestamp: '2026-08-11T10:15:00Z'
  },
  {
    id: 'aud-9903',
    actorId: 'user-9',
    actorName: 'Rajesh Singhania',
    actorRole: 'ACCOUNTANT',
    action: 'TAX_RECEIPT_GENERATED',
    resource: 'Donation',
    resourceId: 'don-8001',
    details: 'Generated official 80G Tax Exemption Receipt #HH-REC-2026-0912 for $5,000 donation by Marcus Sterling.',
    ipAddress: '103.21.144.110',
    timestamp: '2026-09-01T14:31:00Z'
  },
  {
    id: 'aud-9904',
    actorId: 'user-1',
    actorName: 'Dr. Evelyn Vance',
    actorRole: 'SUPER_ADMIN',
    action: 'CERTIFICATE_ISSUED',
    resource: 'Certificate',
    resourceId: 'cert-1001',
    details: 'Digitally signed and issued Volunteer Service Award certificate #HH-CERT-VOL-2025-9921 to Priya Patel.',
    ipAddress: '192.168.1.104',
    timestamp: '2026-09-02T01:30:00Z'
  }
];

export const INITIAL_NEWSLETTER_SUBSCRIBERS: NewsletterSubscriber[] = [
  {
    id: 'sub-101',
    email: 'marcus.sterling@sterlingcap.com',
    fullName: 'Marcus Sterling',
    phone: '+1 415-555-0199',
    interest: 'donor',
    frequency: 'monthly',
    subscribedAt: '2026-08-15T09:30:00Z',
    status: 'active',
    source: 'footer',
    leadTags: ['High Net Worth', '80G Tax Exemption', 'Clean Water Benefactor'],
    consentGiven: true,
    notes: 'Interested in major gift matching and clean water borehole progress.'
  },
  {
    id: 'sub-102',
    email: 'ananya.deshmukh@gmail.com',
    fullName: 'Ananya Deshmukh',
    phone: '+91 98201 54321',
    interest: 'volunteer',
    frequency: 'weekly',
    subscribedAt: '2026-08-20T14:15:00Z',
    status: 'active',
    source: 'footer',
    leadTags: ['Youth Volunteer', 'STEM Educator', 'Fieldwork Ready'],
    consentGiven: true,
    notes: 'Looking for weekend teaching opportunities in rural girls schools.'
  },
  {
    id: 'sub-103',
    email: 'elena.rostova@genevafoundation.org',
    fullName: 'Elena Rostova',
    phone: '+41 22 791 2111',
    interest: 'both',
    frequency: 'monthly',
    subscribedAt: '2026-08-28T11:45:00Z',
    status: 'active',
    source: 'footer',
    leadTags: ['Institutional Lead', 'CSR Liaison', 'Disaster Rapid Response'],
    consentGiven: true,
    notes: 'Coordinates European partnership grants and disaster relief observer missions.'
  },
  {
    id: 'sub-104',
    email: 'vikram.mehta@techcorp.io',
    fullName: 'Vikram Mehta',
    interest: 'donor',
    frequency: 'quarterly',
    subscribedAt: '2026-09-01T16:20:00Z',
    status: 'active',
    source: 'footer',
    leadTags: ['CSR Lead', 'Tech for Good'],
    consentGiven: true
  }
];

