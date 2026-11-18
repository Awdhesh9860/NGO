# Programs and Projects Architecture

## HopeHorizon / Vikas NGO Ecosystem — Phase 5

### 1. Hierarchy & Relationship Model
In HopeHorizon, **Programs** represent long-term thematic strategic pillars, while **Projects** represent localized, time-bound ground interventions executing under those programs:

```
[Program: Clean Water & Community Sanitation]
    ├── [Project: Solar Aquifer Purification Hub - Rajasthan Thar Basin]
    │       ├── Milestone 1: Hydro-Survey & Permits (Completed)
    │       ├── Milestone 2: Drilling & Solar Inverters (Completed)
    │       ├── Milestone 3: RO Filtration Commissioning (75% In Progress)
    │       └── Milestone 4: Village Panchayat Handover (Pending)
    └── [Project: Deep Borehole Gravity System - Eastern Ghats]
```

---

### 2. Verified Program Catalog
- **Child Education & Digital Literacy (`child-education-literacy`)**:
  - Focus: Rural smart classrooms, offline tablet STEM labs, mid-day nutrition.
  - Verified Metrics: 142 schools equipped, 48,500+ students, +34% literacy lift.
- **Clean Water & Community Sanitation (`clean-water-sanitation`)**:
  - Focus: Solar reverse-osmosis filtration plants, arsenic/fluoride eradication.
  - Verified Metrics: 96 filtration plants, 1.2M liters daily, 88 villages covered.
- **Women Empowerment & Artisan Livelihoods (`women-empowerment-livelihood`)**:
  - Focus: Handloom cooperatives, textile micro-loans, e-commerce linkages.
  - Verified Metrics: 12,400 women trained, 840 micro-enterprises, +140% avg income surge.
- **Emergency Disaster Relief & Rapid Response (`disaster-relief-rapid-response`)**:
  - Focus: 18-hour rapid deployment food, shelter kits, mobile clinics.
  - Verified Metrics: 35,000+ families assisted, 180 tons rations delivered.

---

### 3. Project Registry Views
- `/projects`: Complete searchable registry with category and status filter toolbar.
- `/projects/ongoing`: Direct view of active ground works currently undergoing construction or training.
- `/projects/completed`: Finished infrastructure successfully transferred to community councils.
- `/projects/upcoming`: Pre-approved pipeline sites undergoing geological hydro-surveys.
- `/projects/[slug]`: Rich project dashboard showcasing funding progress, geotagged location, milestones timeline, and manager contact.
