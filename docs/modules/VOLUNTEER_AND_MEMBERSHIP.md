# Volunteer & Membership Experience Architecture

## HopeHorizon / Vikas NGO Ecosystem — Phase 5

### 1. Community Engagement Pathways
HopeHorizon offers two structured public entry points for individuals wishing to dedicate time, skills, or annual stewardship:

---

### 2. Volunteer Experience (`/volunteer` & `/volunteer/apply`)
- **Pillars of Engagement**:
  - Educational Tutoring & STEM Mentorship.
  - Weekend Medical Camp Coordination.
  - Emergency Disaster Relief Logistics.
  - Digital Storytelling & Translation.
- **Application Workflow**:
  - Captures applicant name, email, phone, location, skills, and weekly availability (`Weekends`, `Weekdays`, `Flexible`).
  - Records application in database via `addVolunteerApplication`.
  - Fires interactive confetti confirmation feedback and generates applicant profile.
  - Integrates with Volunteer Certificate Verifier (`/verify-certificate`).

---

### 3. Membership Circles (`/membership` & `/membership/apply`)
- **Tier 1: Youth Ambassador** ($50 / ₹3,500/yr):
  - Geared towards university students and young leaders under 26.
  - Digital NGO Member ID card, quarterly virtual townhall with directors.
- **Tier 2: Annual Impact Patron** ($250 / ₹18,000/yr):
  - Full voting membership, official embossed patron seal, signed ground impact dispatch.
- **Tier 3: Lifetime Council Fellow** ($1,000 / ₹75,000 one-time):
  - Permanent council seat, invitation to annual governance retreat, direct advisory on project selection.
- **Application Flow**:
  - Tiers configured in `INITIAL_SETTINGS`.
  - Captures patron credentials and registers active membership in `memberships` store.
