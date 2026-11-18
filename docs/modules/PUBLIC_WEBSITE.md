# Public NGO Website Architecture

## HopeHorizon / Vikas NGO Ecosystem — Phase 5

### 1. Architectural Overview
The HopeHorizon Public Website is an international-standard digital platform designed to communicate humanitarian values, radical transparency, verified impact, and seamless community engagement.

Built with Next.js 16 App Router, TypeScript (strict mode), Tailwind CSS v4, and the Phase 3 design system tokens, it serves as the public front-door for donors, volunteers, institutional partners, and CSR committees.

---

### 2. Complete Public Route Architecture

```
/                                      -> Homepage (20 distinct editorial sections)
├── /about                             -> Organizational Overview & Story
│   ├── /about/our-story               -> Founding Journey, Milestones & Timeline
│   ├── /about/mission-vision          -> Strategic Charter & 2030 Transformation Goals
│   ├── /about/values                  -> 6 Core Humanitarian Pillars
│   ├── /about/founder                 -> Founder Message & Leadership Philosophy
│   ├── /about/leadership              -> Executive Leadership Team
│   ├── /about/board                   -> Board of Directors & Independent Trustees
│   ├── /about/team                    -> Full Operations & Field Coordinator Roster
│   └── /about/awards                  -> Verified Accreditations & Recognitions
├── /programs                          -> All 4 Sustainable Pillars
│   └── /programs/[slug]               -> Detailed Program Charter, Metrics & Projects
├── /projects                          -> Field Project Registry
│   ├── /projects/[slug]               -> Project Details, Milestones & Live Budgets
│   ├── /projects/ongoing              -> Active Deployments in Progress
│   ├── /projects/completed            -> Handed-Over Infrastructure
│   └── /projects/upcoming             -> Vetted Pipeline Initiatives
├── /campaigns                         -> Priority Ground Appeals
│   └── /campaigns/[slug]              -> Urgent Campaign Appeal with Real-time Thermometer
├── /impact                            -> Ground Transformation & Verification
│   ├── /impact/success-stories        -> Verified Case Studies with Consent
│   ├── /impact/beneficiary-stories    -> Frontline Voices from Villages
│   └── /impact/annual-highlights      -> Fiscal Year Impact Milestones
├── /donate                            -> Secure 80G Tax-Exempt Giving Journey
├── /volunteer                         -> Volunteer Pathways & Opportunities
│   └── /volunteer/apply               -> Comprehensive Volunteer Application Form
├── /membership                        -> Ambassador & Patron Circles
│   └── /membership/apply              -> Digital Membership Card Application
├── /events                            -> Community Townhalls & Field Camps
│   └── /events/[slug]                 -> Event Briefing & Free Digital Ticket Pass
├── /news                              -> Official Bulletins & Announcements
│   └── /news/[slug]                   -> News Article with Citation & Reading Time
├── /blog                              -> Field Dispatches & Policy Essays
│   └── /blog/[slug]                   -> Deep-Dive Thought Leadership Articles
├── /gallery                           -> Ground Photography & Video Showcase
│   └── /gallery/[slug]                -> Categorized Photo Archives with Lightbox
├── /press                             -> Media Kit & Spokesperson Contacts
│   └── /press/media-coverage          -> Independent Investigative Press Features
├── /partners                          -> Philanthropic Foundations & Institutional Allies
├── /csr                               -> Corporate Social Responsibility (CSR 2% Law)
├── /contact                           -> Direct Inquiries & Regional Office Coordinates
├── /faq                               -> Comprehensive Frequently Asked Questions
├── /transparency                      -> Open Governance & Fiduciary Disclosures
│   ├── /transparency/annual-reports   -> Full-Color PDF Annual Reports
│   ├── /transparency/financial-reports-> Audited Balance Sheets & Form 10BD Statements
│   ├── /transparency/audit-reports    -> Independent Auditor Opinions (Deloitte)
│   ├── /transparency/governance       -> Fiduciary Policies & Board Oversight Rules
│   └── /transparency/registrations    -> Section 80G, 12A, FCRA & NGO Darpan Orders
└── Legal & Safeguarding Pages
    ├── /privacy-policy                -> Data Encryption & Donor Privacy Commitment
    ├── /terms-and-conditions          -> Platform Access Terms & Creative Commons
    ├── /refund-policy                 -> 7-Day Erroneous Deduction Refund Framework
    ├── /donation-policy               -> Statutory 80G Tax Deductibility Guidelines
    ├── /child-protection-policy       -> Zero-Tolerance Child Safeguarding Framework
    ├── /safeguarding-policy           -> Vulnerable Community Field Protocol
    └── /code-of-conduct               -> Volunteer & Coordinator Field Ethical Standard
```

---

### 3. Key Design & Performance Principles
- **Editorial Cleanliness**: Standardized responsive typography scale (`Inter`), generous vertical whitespace, and authentic high-resolution field photography.
- **Radical Transparency**: Real-time spending percentages (88.4% direct program deployment, 7.2% operations, 4.4% outreach) certified by independent statutory auditors.
- **Strict Safeguarding**: No fabricated beneficiary stories or fake names; editable placeholders provided where verified releases are pending.
- **Mobile-First Execution**: Fully responsive layout verified from 320px screens up to 1536px monitors.
