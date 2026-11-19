# Fundraising Analytics & Financial Reporting

## Real Database Integer Aggregations
`GET /api/v1/fundraising/analytics` computes live organization-scoped metrics directly from MongoDB integer minor-unit fields (`Donation`, `Donor`, `Campaign`, `RecurringDonation`):

- **Gross Verified Donations**: Sum of `amountMinor` across `SUCCESSFUL`, `PARTIALLY_REFUNDED`, and `REFUNDED` donations.
- **Total Refunded**: Sum of `refundedAmountMinor` across settled/refunded donations.
- **Net Donations**: `max(0, grossSuccessfulMinor - refundedAmountMinor)`.
- **Pending Verification**: Sum of `INITIATED` and `PENDING` donations — strictly excluded from gross and net fundraising totals.
- **Failed / Cancelled**: Tracked separately and never counted in raised figures.
- **Time Trends**: Daily (14 days), Monthly (12 months), and Yearly integer aggregations.
- **Donor Insights**: Total CRM donors, first-time vs repeat donors, major donors (≥ ₹50,000), and donor retention percentage.
- **Campaign & Payment Method Breakdown**: Verified net contribution totals per campaign and per payment provider.

## Empty-State Honesty
When an organization has zero verified donations, dashboards render clear empty states and `₹0` verified totals rather than placeholder or mock revenue figures.
