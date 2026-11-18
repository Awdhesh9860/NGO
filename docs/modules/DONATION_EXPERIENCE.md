# Public Donation Experience & Statutory 80G Receipts

## HopeHorizon / Vikas NGO Ecosystem — Phase 5

### 1. Overview
The Donation Experience (`/donate` and modal `DonateModal.tsx`) is designed for maximum donor trust, minimal cognitive friction, and statutory tax compliance under Section 80G of the Indian Income Tax Act 1961.

---

### 2. Core Donation Capabilities
1. **Giving Frequencies**:
   - One-Time Contribution.
   - Monthly Sustained Impact Partner.
   - Annual Patron Gift.
2. **Preset & Custom Tiers**:
   - ₹1,000 / $25: Provides 1 month of educational kits for 2 children.
   - ₹2,500 / $50: Delivers 10,000 liters of purified solar drinking water.
   - ₹5,000 / $100: Seeds 1 woman artisan micro-enterprise seed kit.
   - Custom Amount: Any donor-specified sum.
3. **Statutory Tax Benefit Disclosures**:
   - Indian donors entering their 10-character Permanent Account Number (PAN) automatically receive an official 80G tax rebate receipt.
   - Annual donations are reported directly to the Income Tax Department via Form 10BD.
4. **Anonymous Philanthropy**:
   - Donors can check *"Make my donation anonymous"* to withhold their names from public leaderboards.
5. **Gateway Integrations**:
   - Razorpay (UPI, Netbanking, Rupay, Wallets).
   - Stripe (International Credit Cards, Apple Pay, Google Pay).
   - Direct Bank Wire (NEFT/RTGS/SWIFT) with downloadable invoice.

---

### 3. Server-Side Safety Principles
- In accordance with Phase 5 guidelines, payment verification **never occurs solely on client confirmation**.
- Webhook signature verification and payment capture are executed strictly within backend adapters to prevent fraudulent receipt generation.
