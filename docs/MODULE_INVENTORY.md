# Enterprise NGO Application — Master Module Inventory
**Project Name**: HopeHorizon / Vikas NGO Ecosystem  
**Scope**: Complete Functional Specification Across Public, Administrative, and Portal Surfaces  

---

## 1. Public Website Modules

| Module Name | Route Path | Core Components | Access | Features & Capabilities | Current Status |
| :--- | :--- | :--- | :---: | :--- | :---: |
| **Homepage** | `/` | `src/app/(public)/page.tsx`, `HeroSection`, `ActionAreasSection`, `TrustStatsBar` | Public | Hero impact stats, emergency appeal banner, verified 80G tax exemption badge, causes grid, success testimonials, newsletter lead capture. | ✅ UI Complete (Mock Data) |
| **About Suite** | `/about/*` | `src/app/(public)/about/*`, `AboutHero`, `StoryTimeline`, `LeadershipGrid`, `BoardMembersGrid`, `AwardsGrid` | Public | Multi-page storytelling: `/about/our-story`, `/about/mission-vision`, `/about/values`, `/about/leadership`, `/about/board-members`, `/about/our-team`, `/about/awards`, `/about/founder-message`. | ✅ UI Complete |
| **Programs & Causes**| `/programs` | `ProgramsView.tsx`, `FeaturedProgramsSection.tsx` | Public | Categorized listing of NGO thematic areas (Water Security, Education, Healthcare, Disaster Relief) with budgets and beneficiaries. | ✅ UI Complete |
| **Field Projects** | `/projects`, `/projects/[id]` | `ProjectsView.tsx`, `ProjectDetailView.tsx` | Public | Searchable/filterable field projects with interactive funding progress bars, location maps, milestone checklists, and image galleries. | ✅ UI Complete |
| **Urgent Campaigns** | `/campaigns`, `/campaigns/[id]` | `CampaignsView.tsx`, `CampaignDetailView.tsx`, `UrgentCampaignSection.tsx` | Public | Emergency fundraising appeals with countdown timers, beneficiary summaries, live field updates timeline, and direct donation triggers. | ✅ UI Complete |
| **Donation Center** | `/donate` | `DonateView.tsx`, `DonateModal.tsx`, `ReceiptModal.tsx` | Public | One-time vs. recurring giving, INR/USD currency selection, preset amount tiles, PAN collection for 80G, simulated gateway selection. | ⚠️ Needs Real Gateway |
| **Donor Registration**| `/donor-register` | `DonorRegisterPage.tsx` | Public | 4-step wizard for individual, corporate, and patron donors; captures PAN, 80G tax address preferences, and giving interests. | ⚠️ Needs DB Persistence |
| **Volunteer Onboard**| `/volunteer` | `VolunteerView.tsx`, `VolunteerCtaSection.tsx` | Public | Volunteer application wizard capturing availability, skills, location, and past non-profit experience. | ⚠️ Needs DB Persistence |
| **Membership Portal**| `/membership` | `MembershipView.tsx` | Public | Tiered membership plans (Youth, Annual, Lifetime, Corporate), digital member card preview, recurring contribution details. | ⚠️ Needs DB Persistence |
| **Certificate Ledger**| `/verify-certificate` | `CertificateVerifierView.tsx`, `CertificateViewModal.tsx` | Public | Public cryptographic lookup enabling verification of certificate numbers and QR codes against the official ledger. | ⚠️ Needs API Endpoint |
| **Transparency Hub** | `/transparency`, `/documents` | `TransparencyView.tsx`, `DocumentsView.tsx` | Public | Downloadable repository of audited financial returns, Form 10BE tax filings, Section 12A certificates, and governance bylaws. | ⚠️ Needs Object Storage |
| **Impact Telemetry** | `/impact` | `ImpactView.tsx`, `ImpactTracker.tsx` | Public | Comprehensive data visualizations, KPI cards (liters of clean water, students enrolled, meals distributed), interactive charts. | ✅ UI Complete (Mock Data) |
| **Events & Drives** | `/events` | `EventsView.tsx`, `UpcomingEventsSection.tsx` | Public | Calendar of community drives, medical camps, volunteer orientations; RSVP registration with QR ticket generation. | ⚠️ Needs DB Persistence |
| **News & CMS Blog** | `/news`, `/news/[id]`, `/stories` | `NewsBlogView.tsx`, `ArticleDetailView.tsx`, `SuccessStoriesView.tsx` | Public | Categorized news dispatches, press releases, field stories, author profiles, read-time counters, social sharing. | ✅ UI Complete |
| **CSR Partnerships** | `/csr`, `/partners` | `CSRView.tsx`, `PartnersView.tsx`, `CsrSection.tsx` | Public | Corporate partnership tiers (Platinum, Gold, Silver), Section 135 CSR compliance guidelines, partner inquiry form. | ✅ UI Complete |
| **Google Sheets Hub**| `/google-sheets` | `GoogleSheetsView.tsx`, `GoogleSheetsHub.tsx` | Authenticated | Live Google Drive & Sheets viewer powered by Firebase Auth; one-click collection sync to Google Spreadsheets. | ✅ Functional |
| **Utility & Legal** | `/careers`, `/faq`, `/contact`, `/legal` | `CareersView.tsx`, `FAQView.tsx`, `ContactView.tsx`, `LegalView.tsx` | Public | Job board, categorized FAQs with accordion search, department-routed contact form, terms of service, and privacy policy. | ✅ UI Complete |

---

## 2. Administration Modules (`/dashboard`)

| Module Name | Dashboard Tab | Target Roles | Core Administrative Capabilities | Current Status |
| :--- | :--- | :---: | :--- | :---: |
| **Admin Overview** | `overview` | `SUPER_ADMIN`, `ADMIN`, `EXEC_DIR` | Real-time KPI summary (total raised, total beneficiaries, active projects, pending volunteers), quick-action links. | ✅ UI Complete |
| **Donation Ledger** | `donations` | `SUPER_ADMIN`, `ADMIN`, `ACCOUNTANT` | Full transaction ledger, search by donor/PAN/TxID, refund processing with reason tracking, receipt re-issuance. | ⚠️ Needs DB & Gateway |
| **Project Control** | `projects` | `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `PROJ_MGR` | Project creation modal, budget tracking, milestone creation & status updates, field manager assignment. | ⚠️ Needs DB & Schemas |
| **Campaign Manager**| `campaigns` | `SUPER_ADMIN`, `ADMIN`, `COMMUNICATIONS` | Emergency appeal creator, target amount setting, urgent badge toggling, posting real-time field dispatch updates. | ⚠️ Needs DB & Schemas |
| **Volunteer Desk** | `volunteers` | `SUPER_ADMIN`, `ADMIN`, `MANAGER` | Application review table, status transition (`applied` → `approved` → `active`), direct certificate issuance trigger. | ⚠️ Needs DB & Schemas |
| **Certificate Desk**| `certificates` | `SUPER_ADMIN`, `ADMIN` | Manual certificate generation wizard, custom award title/description, cryptographic verification code generation. | ⚠️ Needs DB & Signatures |
| **Compliance Desk** | `transparency` | `SUPER_ADMIN`, `ADMIN`, `ACCOUNTANT` | Statutory report uploader, financial year categorization, FCRA filing management, audited PDF attachment. | ⚠️ Needs Object Storage |
| **Lead & CRM Center**| `leads` | `SUPER_ADMIN`, `ADMIN`, `COMMUNICATIONS` | Newsletter subscriber table, filtering by interest (`donor`, `volunteer`, `both`), export to CSV/Sheets. | ⚠️ Needs DB & Export API |
| **Security Center** | `audit_logs` | `SUPER_ADMIN`, `ADMIN` | Immutable security audit stream, 16-permission RBAC matrix viewer, active session terminator, 2FA toggle. | ⚠️ Needs Server Logging |
| **Google Sheets Sync**| `google-sheets` | `SUPER_ADMIN`, `ADMIN` | Direct in-dashboard export of Donations, Volunteers, and Projects into new or existing Google Spreadsheets. | ✅ Functional |

---

## 3. Dedicated User Portals (`/dashboard`)

| Portal Name | Target Role | Key Features | Current Status |
| :--- | :---: | :--- | :---: |
| **Donor Portal** | `DONOR` | Personal philanthropic portfolio, total impact summary, real-time Section 80G tax savings estimator, downloadable historical PDF receipts. | ⚠️ Needs Auth Sessions |
| **Volunteer Portal** | `VOLUNTEER` | Logged service hours counter, interactive hour submission form with celebratory confetti, earned service credentials showcase. | ⚠️ Needs DB Persistence |
| **Member Portal** | `MEMBER` | Digital membership pass with dynamic QR code, annual renewal date tracker, governance council standing, AGM voting records. | ⚠️ Needs DB Persistence |
| **Staff Portal** | `PROJECT_MANAGER`, `COMMUNICATIONS`, `TEAM_MEMBER` | Field project milestone progress toggle, field dispatch broadcast editor with photo upload placeholder. | ⚠️ Needs DB Persistence |
