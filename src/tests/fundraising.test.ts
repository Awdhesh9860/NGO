import crypto from 'crypto';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import {
  toMinorUnits,
  fromMinorUnits,
  sumMinorUnits,
  subtractMinorUnits,
  calculateMinorPercentage,
  formatMinorCurrency,
} from '../lib/money';
import {
  CampaignService,
  assertValidCampaignTransition,
  toPublicCampaignDTO,
} from '../server/services/campaign.service';
import {
  computeDonorSegments,
  toSafeDonorDTO,
  MAJOR_DONOR_THRESHOLD_MINOR,
} from '../server/services/donor.service';
import {
  DonationPaymentService,
  assertValidDonationTransition,
  evaluateTaxReceiptEligibility,
  computeFinancialTotalsFromRecords,
} from '../server/services/donation-payment.service';
import { fundraisingRepository } from '../server/repositories/fundraising.repository';
import { organizationRepository } from '../server/repositories/organization.repository';
import { auditRepository } from '../server/repositories/audit.repository';
import { userRepository } from '../server/repositories/user.repository';
import { donorService } from '../server/services/donor.service';
import { emailProvider } from '../integrations/email/nodemailer.provider';
import {
  verifyRazorpayCheckoutSignature,
  verifyRazorpayWebhookSignature,
  verifyStripeWebhookSignature,
  razorpayPaymentProvider,
  stripePaymentProvider,
  upiPaymentProvider,
  bankTransferPaymentProvider,
} from '../integrations/payment';
import {
  renderDonationInitiatedEmail,
  renderDonationSuccessEmail,
  renderDonationFailedEmail,
  renderDonationReceiptEmail,
  renderRefundRequestedEmail,
  renderRefundApprovedEmail,
  renderRefundProcessedEmail,
  renderRecurringConfirmationEmail,
  renderRecurringFailureEmail,
  renderCampaignApprovedEmail,
  renderCampaignPublishedEmail,
  renderCampaignGoalReachedEmail,
} from '../integrations/email/templates';
import {
  createCampaignSchema,
  createCampaignUpdateSchema,
} from '../features/campaigns/schemas/campaign.schema';
import { createDonorSchema } from '../features/donors/schemas/donor.schema';
import {
  createPaymentOrderSchema,
  requestRefundSchema,
  approveRefundSchema,
  createRecurringDonationSchema,
} from '../features/donations/schemas/donation.schema';
import { checkRolePermission } from '../server/authorization/permissions';
import { getAuthorizedAdminNav } from '../features/admin/config/navigation';
import { AdminActor } from '../server/services/admin.service';

const ORG_A = new mongoose.Types.ObjectId().toString();
const ORG_B = new mongoose.Types.ObjectId().toString();
const USER_MANAGER_ID = new mongoose.Types.ObjectId().toString();
const USER_ACCOUNTANT_ID = new mongoose.Types.ObjectId().toString();
const USER_COMMS_ID = new mongoose.Types.ObjectId().toString();

const managerActor: AdminActor = {
  id: USER_MANAGER_ID,
  name: 'Kavita Manager',
  email: 'manager@org-a.org',
  role: 'MANAGER',
  organizationId: ORG_A,
};

const accountantActor: AdminActor = {
  id: USER_ACCOUNTANT_ID,
  name: 'Ramesh Accountant',
  email: 'accountant@org-a.org',
  role: 'ACCOUNTANT',
  organizationId: ORG_A,
};

const commsActor: AdminActor = {
  id: USER_COMMS_ID,
  name: 'Neha Comms',
  email: 'comms@org-a.org',
  role: 'COMMUNICATIONS',
  organizationId: ORG_A,
};

describe('Phase 8: Precision-Safe Integer Minor Currency Arithmetic', () => {
  it('converts major/minor units safely and eliminates IEEE-754 floating-point drift', () => {
    // Classic JS float bug: 0.1 + 0.2 !== 0.3, whereas minor units stay exact integers
    const a = toMinorUnits(0.1, 'INR');
    const b = toMinorUnits(0.2, 'INR');
    expect(a).toBe(10);
    expect(b).toBe(20);
    expect(sumMinorUnits([a, b])).toBe(30);
    expect(fromMinorUnits(sumMinorUnits([a, b]), 'INR')).toBe(0.3);

    expect(toMinorUnits(1999.99, 'INR')).toBe(199999);
    expect(subtractMinorUnits(500000, 125000)).toBe(375000);
    expect(calculateMinorPercentage(250000, 1000000)).toBe(25);
    expect(calculateMinorPercentage(100, 0)).toBe(0);
    expect(formatMinorCurrency(150000, 'INR')).toBe('₹1,500');
    expect(formatMinorCurrency(150050, 'INR')).toBe('₹1,500.50');
    expect(formatMinorCurrency(2550, 'USD')).toBe('$25.50');
  });
});

describe('Phase 8: Zod Schemas & Fundraising RBAC Matrix', () => {
  it('validates fundraising input schemas and rejects fractional minor amounts or malformed PAN', () => {
    expect(
      createCampaignSchema.safeParse({
        title: 'Clean Water Drive',
        slug: 'clean-water-drive',
        code: 'CMP-CW-01',
        shortSummary: 'Installing solar handpumps across rural clusters.',
        category: 'Clean Water',
        targetAmountMinor: 5000000,
      }).success
    ).toBe(true);

    // Reject fractional minor units
    expect(
      createPaymentOrderSchema.safeParse({
        idempotencyKey: 'idem-12345678',
        amountMinor: 1000.5,
        paymentProvider: 'UPI',
        donor: { name: 'Asha', email: 'asha@example.org' },
      }).success
    ).toBe(false);

    // Reject invalid PAN
    expect(
      createDonorSchema.safeParse({
        name: 'Asha',
        email: 'asha@example.org',
        panNumber: 'BADPAN',
      }).success
    ).toBe(false);

    expect(
      createCampaignUpdateSchema.safeParse({
        title: 'Phase 1 Completed',
        content: 'First 12 water pumps installed and tested by engineers.',
      }).success
    ).toBe(true);

    expect(
      requestRefundSchema.safeParse({
        donationId: new mongoose.Types.ObjectId().toString(),
        amountMinor: 50000,
        reason: 'Duplicate debit confirmed',
        idempotencyKey: 'ref-key-0001',
      }).success
    ).toBe(true);

    expect(
      approveRefundSchema.safeParse({
        decision: 'APPROVE',
      }).success
    ).toBe(true);

    expect(
      createRecurringDonationSchema.safeParse({
        provider: 'RAZORPAY',
        planInterval: 'MONTHLY',
        amountMinor: 100000,
        donor: { name: 'Ravi', email: 'ravi@example.org' },
      }).success
    ).toBe(true);
  });

  it('enforces least-privilege RBAC separation across roles and Fundraising sidebar navigation', () => {
    // Refund separation: MANAGER can request but NOT approve; ACCOUNTANT can approve & verify
    expect(checkRolePermission('MANAGER', 'refunds.request')).toBe(true);
    expect(checkRolePermission('MANAGER', 'refunds.approve')).toBe(false);
    expect(checkRolePermission('ACCOUNTANT', 'refunds.approve')).toBe(true);
    expect(checkRolePermission('ACCOUNTANT', 'donations.verify')).toBe(true);
    expect(checkRolePermission('ACCOUNTANT', 'donors.view_sensitive')).toBe(true);

    // Communications has campaign publishing but ZERO sensitive donor/payment/refund access
    expect(checkRolePermission('COMMUNICATIONS', 'campaigns.publish')).toBe(true);
    expect(checkRolePermission('COMMUNICATIONS', 'donors.view_sensitive')).toBe(false);
    expect(checkRolePermission('COMMUNICATIONS', 'refunds.approve')).toBe(false);
    expect(checkRolePermission('COMMUNICATIONS', 'donations.verify')).toBe(false);

    // Navigation visibility
    const accountantNav = getAuthorizedAdminNav('ACCOUNTANT').map((i) => i.id);
    const commsNav = getAuthorizedAdminNav('COMMUNICATIONS').map((i) => i.id);
    expect(accountantNav).toContain('donations');
    expect(accountantNav).toContain('refunds');
    expect(accountantNav).toContain('receipts');
    expect(commsNav).toContain('campaigns');
    expect(commsNav).not.toContain('refunds');
    expect(commsNav).not.toContain('payments');
  });
});

describe('Phase 8: Campaign Lifecycle, Approval Separation & Public DTO Gating', () => {
  const service = new CampaignService();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(auditRepository, 'create').mockResolvedValue({ _id: new mongoose.Types.ObjectId() } as never);
    vi.spyOn(emailProvider, 'sendEmail').mockResolvedValue({ success: true, messageId: 'm1' });
  });

  it('blocks illegal lifecycle transitions and unauthorized approval or archiving', () => {
    expect(() => assertValidCampaignTransition('DRAFT', 'ACTIVE', managerActor)).toThrow(
      /Invalid campaign status transition/i
    );
    expect(() => assertValidCampaignTransition('PENDING_APPROVAL', 'APPROVED', commsActor)).toThrow(
      /campaigns\.approve/i
    );
    expect(() => assertValidCampaignTransition('DRAFT', 'ARCHIVED', commsActor)).toThrow(
      /campaigns\.archive/i
    );
  });

  it('prevents campaign submitters from self-approving and enforces tenant isolation', async () => {
    const cid = new mongoose.Types.ObjectId().toString();
    vi.spyOn(fundraisingRepository, 'findCampaignById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(cid),
      organizationId: new mongoose.Types.ObjectId(ORG_A),
      title: 'Rural School Libraries',
      code: 'CMP-LIB-01',
      status: 'PENDING_APPROVAL',
      submittedBy: new mongoose.Types.ObjectId(USER_MANAGER_ID),
      createdBy: new mongoose.Types.ObjectId(USER_MANAGER_ID),
    } as never);

    await expect(
      service.handleApprovalAction(cid, ORG_A, { action: 'APPROVE' }, managerActor)
    ).rejects.toThrow(/cannot approve or reject their own submission/i);

    // Cross-tenant query returns null -> NotFoundError
    vi.spyOn(fundraisingRepository, 'findCampaignById').mockResolvedValue(null);
    await expect(service.getCampaignDetail(cid, ORG_B)).rejects.toThrow(/not found in this organization/i);
  });

  it('blocks publishing DRAFT campaigns publicly and strips internal fields in public DTO', async () => {
    const cid = new mongoose.Types.ObjectId().toString();
    vi.spyOn(fundraisingRepository, 'findCampaignById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(cid),
      organizationId: new mongoose.Types.ObjectId(ORG_A),
      title: 'Draft Appeal',
      slug: 'draft-appeal',
      code: 'CMP-DRAFT',
      status: 'DRAFT',
      isPublicVisible: false,
      targetAmountMinor: 1000000,
      currency: 'INR',
    } as never);

    await expect(
      service.updateCampaign(cid, ORG_A, { isPublicVisible: true }, managerActor)
    ).rejects.toThrow(/Only APPROVED, ACTIVE, GOAL_REACHED, or COMPLETED/i);

    const dto = toPublicCampaignDTO(
      {
        _id: new mongoose.Types.ObjectId(cid),
        title: 'Clean Water',
        slug: 'clean-water',
        code: 'CMP-CW',
        shortSummary: 'Safe drinking water.',
        category: 'Clean Water',
        targetAmountMinor: 1000000,
        minimumDonationMinor: 10000,
        suggestedAmountsMinor: [50000],
        currency: 'INR',
        status: 'ACTIVE',
        isFeatured: true,
        rejectionReason: 'Internal review note',
      } as never,
      { netRaisedMinor: 250000, donorCount: 5, donationCount: 6 }
    );
    expect(dto.raisedAmountMinor).toBe(250000);
    expect(dto.progressPercentage).toBe(25);
    expect('rejectionReason' in dto).toBe(false);
  });
});

describe('Phase 8: Donor CRM Segmentation & Sensitive Privacy Masking', () => {
  it('computes accurate donor segments from verified metrics and gates sensitive fields', () => {
    const now = new Date('2026-11-19T00:00:00Z');
    const majorRepeat = computeDonorSegments(
      {
        donationCount: 4,
        lifetimeAmountMinor: MAJOR_DONOR_THRESHOLD_MINOR + 100,
        lastDonationAt: new Date('2026-11-01T00:00:00Z'),
        hasActiveRecurring: true,
      },
      now
    );
    expect(majorRepeat).toEqual(
      expect.arrayContaining(['REPEAT', 'MONTHLY_RECURRING', 'MAJOR', 'RECENTLY_ACTIVE'])
    );

    const inactiveFirstTime = computeDonorSegments(
      {
        donationCount: 1,
        lifetimeAmountMinor: 50000,
        lastDonationAt: new Date('2025-01-01T00:00:00Z'),
        hasActiveRecurring: false,
      },
      now
    );
    expect(inactiveFirstTime).toEqual(expect.arrayContaining(['FIRST_TIME', 'INACTIVE']));

    const donorDoc = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Meera Kapoor',
      email: 'meera@example.org',
      phone: '+91-9876543210',
      donorType: 'INDIVIDUAL',
      address: { line1: '42 MG Road', city: 'Bengaluru', state: 'KA' },
      communicationPreferences: {
        emailReceipts: true,
        campaignUpdates: true,
        newsletters: false,
        smsAlerts: false,
      },
      anonymousDisplayDefault: false,
      taxDetails: { panNumber: 'ABCDE1234F' },
      lifetimeAmountMinor: 250000,
      donationCount: 2,
      hasActiveRecurring: false,
      status: 'ACTIVE',
      internalNotes: 'High-priority CSR contact',
      tags: ['csr'],
      createdAt: now,
    } as never;

    const restricted = toSafeDonorDTO(donorDoc, false);
    expect(restricted.taxDetails.panNumber).toBe('AB******4F');
    expect(restricted.internalNotes).toBeUndefined();
    expect(restricted.phone).toBe('Restricted');

    const authorized = toSafeDonorDTO(donorDoc, true);
    expect(authorized.taxDetails.panNumber).toBe('ABCDE1234F');
    expect(authorized.internalNotes).toBe('High-priority CSR contact');
    expect(authorized.phone).toBe('+91-9876543210');
  });
});

describe('Phase 8: Payment Cryptography, Webhooks, Idempotency & Manual Verification', () => {
  const service = new DonationPaymentService();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(auditRepository, 'create').mockResolvedValue({ _id: new mongoose.Types.ObjectId() } as never);
    vi.spyOn(emailProvider, 'sendEmail').mockResolvedValue({ success: true, messageId: 'm2' });
    vi.spyOn(donorService, 'recalculateDonorMetrics').mockResolvedValue(undefined);
  });

  it('verifies Razorpay checkout & webhook HMAC-SHA256 signatures and rejects tampered payloads', () => {
    const secret = 'rzp_test_secret_key_12345';
    const orderId = 'order_Test123';
    const paymentId = 'pay_Test999';
    const validSig = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    expect(verifyRazorpayCheckoutSignature(orderId, paymentId, validSig, secret)).toBe(true);
    expect(verifyRazorpayCheckoutSignature(orderId, paymentId, 'tampered_sig', secret)).toBe(false);

    const rawWebhook = JSON.stringify({ event: 'payment.captured', id: 'evt_1' });
    const whSig = crypto.createHmac('sha256', secret).update(rawWebhook).digest('hex');
    expect(verifyRazorpayWebhookSignature(rawWebhook, whSig, secret)).toBe(true);
    expect(verifyRazorpayWebhookSignature(rawWebhook + ' ', whSig, secret)).toBe(false);
  });

  it('verifies Stripe webhook timestamp + HMAC-SHA256 signature and rejects expired replay timestamps', () => {
    const whSecret = 'whsec_test_987654';
    const rawBody = JSON.stringify({ id: 'evt_stripe_1', type: 'payment_intent.succeeded' });
    const nowSec = 1763550000;
    const validSig = crypto
      .createHmac('sha256', whSecret)
      .update(`${nowSec}.${rawBody}`)
      .digest('hex');

    expect(
      verifyStripeWebhookSignature(rawBody, `t=${nowSec},v1=${validSig}`, whSecret, 300, nowSec + 10)
    ).toBe(true);

    // Expired timestamp outside 300s replay tolerance MUST fail
    expect(
      verifyStripeWebhookSignature(rawBody, `t=${nowSec},v1=${validSig}`, whSecret, 300, nowSec + 600)
    ).toBe(false);
  });

  it('keeps manual UPI & Bank Transfer strictly PENDING and rejects donor self-verification', async () => {
    expect(await upiPaymentProvider.verifyPayment({ gatewayOrderId: 'UPI-1', gatewayPaymentId: 'UTR1', gatewaySignature: '' })).toBe(false);
    expect(await bankTransferPaymentProvider.verifyPayment({ gatewayOrderId: 'BANK-1', gatewayPaymentId: 'NEFT1', gatewaySignature: '' })).toBe(false);

    const donorId = new mongoose.Types.ObjectId();
    const donationId = new mongoose.Types.ObjectId();
    vi.spyOn(fundraisingRepository, 'findDonationByIdempotencyKey').mockResolvedValue(null);
    vi.spyOn(donorService, 'findOrCreateDonorForDonation').mockResolvedValue({
      _id: donorId,
      name: 'Suresh',
      email: 'suresh@example.org',
      communicationPreferences: { emailReceipts: true },
    } as never);
    vi.spyOn(organizationRepository, 'findById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(ORG_A),
      name: 'HopeHorizon Foundation',
    } as never);
    vi.spyOn(fundraisingRepository, 'createPaymentAttempt').mockResolvedValue({} as never);
    vi.spyOn(fundraisingRepository, 'createPaymentTransaction').mockResolvedValue({} as never);

    let persistedStatus = '';
    vi.spyOn(fundraisingRepository, 'createDonation').mockImplementation(async (d) => {
      persistedStatus = String(d.status);
      return { _id: donationId, ...d } as never;
    });

    const created = await service.createPaymentOrder(ORG_A, {
      idempotencyKey: 'idem-upi-0001',
      amountMinor: 250000,
      currency: 'INR',
      paymentProvider: 'UPI',
      donationType: 'ONE_TIME',
      purpose: 'General Charitable Fund',
      isAnonymous: false,
      paymentReference: 'UTR9988776655',
      donor: { name: 'Suresh', email: 'suresh@example.org' },
    });

    expect(persistedStatus).toBe('PENDING');
    expect(created.donation.status).toBe('PENDING');

    // Duplicate idempotency key returns idempotentReplay without creating a second donation
    vi.spyOn(fundraisingRepository, 'findDonationByIdempotencyKey').mockResolvedValue(created.donation);
    const replayed = await service.createPaymentOrder(ORG_A, {
      idempotencyKey: 'idem-upi-0001',
      amountMinor: 250000,
      currency: 'INR',
      paymentProvider: 'UPI',
      donationType: 'ONE_TIME',
      purpose: 'General Charitable Fund',
      isAnonymous: false,
      donor: { name: 'Suresh', email: 'suresh@example.org' },
    });
    expect(replayed.idempotentReplay).toBe(true);

    // Online verify endpoint MUST reject manual UPI donation
    vi.spyOn(fundraisingRepository, 'findDonationById').mockResolvedValue(created.donation);
    await expect(
      service.verifyOnlinePayment(ORG_A, {
        donationId: donationId.toString(),
        paymentProvider: 'RAZORPAY',
        gatewayOrderId: 'UPI-1',
        gatewayPaymentId: 'UTR9988776655',
        gatewaySignature: 'fake',
      })
    ).rejects.toThrow(/remain PENDING until verified by an authorized staff member/i);
  });

  it('deduplicates repeated webhooks and protects settled donations from out-of-order failure events', async () => {
    const rawBody = JSON.stringify({
      id: 'evt_rzp_dup_1',
      event: 'payment.failed',
      payload: { payment: { entity: { id: 'pay_1', order_id: 'order_1' } } },
    });

    vi.spyOn(razorpayPaymentProvider, 'verifyWebhookSignature').mockReturnValue(true);

    // Duplicate webhook event returns duplicate: true with zero mutation
    vi.spyOn(fundraisingRepository, 'findWebhookEvent').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      provider: 'RAZORPAY',
      providerEventId: 'evt_rzp_dup_1',
      processingStatus: 'PROCESSED',
    } as never);

    const dupRes = await service.processRazorpayWebhook(rawBody, 'sig', 'evt_rzp_dup_1');
    expect(dupRes.duplicate).toBe(true);

    // Out-of-order payment.failed arriving AFTER SUCCESSFUL MUST be ignored and NEVER downgrade
    vi.spyOn(fundraisingRepository, 'findWebhookEvent').mockResolvedValue(null);
    vi.spyOn(fundraisingRepository, 'createWebhookEvent').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
    } as never);
    const updateWhSpy = vi.spyOn(fundraisingRepository, 'updateWebhookEvent').mockResolvedValue(null);
    const updateDonationSpy = vi.spyOn(fundraisingRepository, 'updateDonation').mockResolvedValue(null);
    vi.spyOn(fundraisingRepository, 'findDonationByProviderOrderId').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      organizationId: new mongoose.Types.ObjectId(ORG_A),
      status: 'SUCCESSFUL',
      amountMinor: 100000,
      currency: 'INR',
    } as never);

    const oooRes = await service.processRazorpayWebhook(rawBody, 'sig', 'evt_rzp_ooo_1');
    expect(oooRes.outOfOrder).toBe(true);
    expect(updateDonationSpy).not.toHaveBeenCalled();
    expect(updateWhSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        $set: expect.objectContaining({ processingStatus: 'IGNORED_OUT_OF_ORDER', outOfOrder: true }),
      })
    );

    // Invalid Stripe webhook signature rejected immediately
    vi.spyOn(stripePaymentProvider, 'verifyWebhookSignature').mockReturnValue(false);
    await expect(service.processStripeWebhook('{}', 'bad')).rejects.toThrow(/Invalid Stripe webhook signature/i);
  });

  it('enforces monotonic donation state transitions', () => {
    expect(() => assertValidDonationTransition('SUCCESSFUL', 'PENDING')).toThrow(/Invalid donation status transition/i);
    expect(() => assertValidDonationTransition('REFUNDED', 'SUCCESSFUL')).toThrow(/Invalid donation status transition/i);
    expect(() => assertValidDonationTransition('PENDING', 'SUCCESSFUL')).not.toThrow();
    expect(() => assertValidDonationTransition('SUCCESSFUL', 'PARTIALLY_REFUNDED')).not.toThrow();
  });
});

describe('Phase 8: Official Donation Receipts & Strict 80G/12A Eligibility Gate', () => {
  const service = new DonationPaymentService();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(auditRepository, 'create').mockResolvedValue({ _id: new mongoose.Types.ObjectId() } as never);
    vi.spyOn(emailProvider, 'sendEmail').mockResolvedValue({ success: true, messageId: 'm3' });
  });

  it('NEVER claims 80G tax benefit when org is unverified, 80G unverified, or validity dates expired', () => {
    const donationDate = new Date('2026-06-15T00:00:00Z');

    // 1. Unverified org
    expect(
      evaluateTaxReceiptEligibility(
        {
          verificationStatus: 'unverified',
          statutory: {
            is80GVerified: true,
            section80GNumber: '80G-123',
            section80GValidFrom: '2025-04-01',
            section80GValidTo: '2027-03-31',
            taxExemptionPercentage: 50,
          },
        },
        donationDate
      ).eligible
    ).toBe(false);

    // 2. Verified org but 80G not verified
    expect(
      evaluateTaxReceiptEligibility(
        {
          verificationStatus: 'verified',
          statutory: {
            is80GVerified: false,
            section80GNumber: '80G-123',
            section80GValidFrom: '2025-04-01',
            section80GValidTo: '2027-03-31',
            taxExemptionPercentage: 50,
          },
        },
        donationDate
      ).eligible
    ).toBe(false);

    // 3. Expired validity window
    expect(
      evaluateTaxReceiptEligibility(
        {
          verificationStatus: 'verified',
          statutory: {
            is80GVerified: true,
            section80GNumber: '80G-123',
            section80GValidFrom: '2023-04-01',
            section80GValidTo: '2025-03-31',
            taxExemptionPercentage: 50,
          },
        },
        donationDate
      ).eligible
    ).toBe(false);

    // 4. Verified org + verified 80G + valid date range -> ELIGIBLE
    const ok = evaluateTaxReceiptEligibility(
      {
        verificationStatus: 'verified',
        statutory: {
          is80GVerified: true,
          section80GNumber: '80G-VERIFIED-2026',
          section80GValidFrom: '2025-04-01',
          section80GValidTo: '2027-03-31',
          is12AVerified: true,
          section12ANumber: '12A-VERIFIED-2026',
          taxExemptionPercentage: 50,
        },
      },
      donationDate
    );
    expect(ok.eligible).toBe(true);
    expect(ok.verifiedStatutorySnapshot?.section80GNumber).toBe('80G-VERIFIED-2026');
  });

  it('blocks issuing receipts for PENDING donations and prevents duplicate active receipts', async () => {
    const donId = new mongoose.Types.ObjectId().toString();
    vi.spyOn(fundraisingRepository, 'findDonationById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(donId),
      status: 'PENDING',
    } as never);

    await expect(service.issueReceipt(ORG_A, donId, accountantActor)).rejects.toThrow(
      /only be issued for verified SUCCESSFUL donations/i
    );

    // Already has active receipt -> returns existing without creating duplicate
    vi.spyOn(fundraisingRepository, 'findDonationById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(donId),
      status: 'SUCCESSFUL',
    } as never);
    const existingReceipt = {
      _id: new mongoose.Types.ObjectId(),
      receiptNumber: 'RCP-2026-EXISTING',
      status: 'ISSUED',
    };
    vi.spyOn(fundraisingRepository, 'findActiveReceiptByDonation').mockResolvedValue(existingReceipt as never);
    const createReceiptSpy = vi.spyOn(fundraisingRepository, 'createReceipt');

    const res = await service.issueReceipt(ORG_A, donId, accountantActor);
    expect(res.receiptNumber).toBe('RCP-2026-EXISTING');
    expect(createReceiptSpy).not.toHaveBeenCalled();
  });
});

describe('Phase 8: Refund Separation of Duties, Balance Caps & Financial Aggregation', () => {
  const service = new DonationPaymentService();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(auditRepository, 'create').mockResolvedValue({ _id: new mongoose.Types.ObjectId() } as never);
    vi.spyOn(emailProvider, 'sendEmail').mockResolvedValue({ success: true, messageId: 'm4' });
  });

  it('caps refund requests at remaining refundable balance and prevents requester self-approval', async () => {
    const donId = new mongoose.Types.ObjectId().toString();
    vi.spyOn(fundraisingRepository, 'findRefundByIdempotencyKey').mockResolvedValue(null);
    vi.spyOn(fundraisingRepository, 'findDonationById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(donId),
      organizationId: new mongoose.Types.ObjectId(ORG_A),
      donationCode: 'DON-2026-TEST',
      status: 'PARTIALLY_REFUNDED',
      amountMinor: 100000,
      refundedAmountMinor: 60000,
      currency: 'INR',
      paymentProvider: 'UPI',
      donorSnapshot: { name: 'Donor', email: 'donor@example.org' },
    } as never);
    vi.spyOn(fundraisingRepository, 'findRefundsByDonation').mockResolvedValue([]);

    // Trying to refund 50,000 when only 40,000 remains MUST fail
    await expect(
      service.requestRefund(
        ORG_A,
        {
          donationId: donId,
          amountMinor: 50000,
          reason: 'Over-refund attempt',
          idempotencyKey: 'ref-over-001',
        },
        managerActor
      )
    ).rejects.toThrow(/exceeds remaining refundable balance/i);

    // Self-approval block (even if actor has refunds.approve)
    const refId = new mongoose.Types.ObjectId().toString();
    vi.spyOn(fundraisingRepository, 'findRefundById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(refId),
      organizationId: new mongoose.Types.ObjectId(ORG_A),
      donationId: new mongoose.Types.ObjectId(donId),
      requestedBy: new mongoose.Types.ObjectId(USER_ACCOUNTANT_ID),
      amountMinor: 20000,
      currency: 'INR',
      status: 'PENDING_APPROVAL',
    } as never);

    await expect(
      service.decideRefund(ORG_A, refId, { decision: 'APPROVE', processImmediately: false }, accountantActor)
    ).rejects.toThrow(/cannot approve or reject their own refund request/i);

    // Manager lacking refunds.approve cannot approve another person's refund
    await expect(
      service.decideRefund(ORG_A, refId, { decision: 'APPROVE', processImmediately: false }, managerActor)
    ).rejects.toThrow(/Missing refunds\.approve permission/i);
  });

  it('blocks simulated recurring donations when provider credentials are unconfigured', async () => {
    vi.spyOn(razorpayPaymentProvider, 'isConfigured').mockReturnValue(false);
    await expect(
      service.createRecurringDonation(ORG_A, {
        provider: 'RAZORPAY',
        planInterval: 'MONTHLY',
        amountMinor: 100000,
        currency: 'INR',
        purpose: 'Monthly Education Support',
        isAnonymous: false,
        donor: { name: 'Priya', email: 'priya@example.org' },
      })
    ).rejects.toThrow(/No simulated recurring charges are permitted/i);
  });

  it('computes gross, pending, failed, refunded, and net minor totals accurately', () => {
    const summary = computeFinancialTotalsFromRecords([
      { status: 'SUCCESSFUL', amountMinor: 500000, refundedAmountMinor: 0 },
      { status: 'PARTIALLY_REFUNDED', amountMinor: 300000, refundedAmountMinor: 100000 },
      { status: 'REFUNDED', amountMinor: 200000, refundedAmountMinor: 200000 },
      { status: 'PENDING', amountMinor: 900000, refundedAmountMinor: 0 },
      { status: 'INITIATED', amountMinor: 400000, refundedAmountMinor: 0 },
      { status: 'FAILED', amountMinor: 750000, refundedAmountMinor: 0 },
      { status: 'CANCELLED', amountMinor: 150000, refundedAmountMinor: 0 },
    ]);

    expect(summary.grossSuccessfulMinor).toBe(1000000);
    expect(summary.refundedAmountMinor).toBe(300000);
    expect(summary.netDonationsMinor).toBe(700000);
    expect(summary.pendingAmountMinor).toBe(1300000);
    expect(summary.failedAmountMinor).toBe(900000);
  });
});

describe('Phase 8: All 12 Fundraising Email Templates', () => {
  it('renders all 12 fundraising templates cleanly with honest tax disclosures', () => {
    const t1 = renderDonationInitiatedEmail({
      donorName: 'Asha',
      donationCode: 'DON-2026-001',
      amountMinor: 150000,
      paymentProvider: 'UPI',
      purpose: 'Clean Water',
    });
    expect(t1.subject).toContain('Pending Verification');

    const t2 = renderDonationSuccessEmail({
      donorName: 'Asha',
      donationCode: 'DON-2026-001',
      amountMinor: 150000,
      purpose: 'Clean Water',
      paymentReference: 'PAY123',
    });
    expect(t2.html).toContain('₹1,500');

    const t3 = renderDonationFailedEmail({
      donorName: 'Asha',
      donationCode: 'DON-2026-002',
      amountMinor: 50000,
      reason: 'Bank declined',
    });
    expect(t3.html).toContain('Bank declined');

    const t4Unverified = renderDonationReceiptEmail({
      donorName: 'Asha',
      receiptNumber: 'RCP-2026-01',
      donationCode: 'DON-2026-001',
      amountMinor: 150000,
      purpose: 'Clean Water',
      donationDate: '2026-11-19',
      paymentReference: 'PAY123',
      taxBenefitEligible: false,
      taxEligibilityReason: 'Organization verification pending.',
    });
    expect(t4Unverified.html).toContain('Standard Charitable Receipt');
    expect(t4Unverified.html).not.toContain('Verified Tax Exemption Notice');

    expect(
      renderRefundRequestedEmail({
        recipientName: 'Finance',
        donationCode: 'DON-1',
        amountMinor: 50000,
        reason: 'Duplicate',
      }).subject
    ).toContain('Refund Request');

    expect(
      renderRefundApprovedEmail({
        recipientName: 'Asha',
        donationCode: 'DON-1',
        amountMinor: 50000,
        approvedBy: 'Ramesh',
      }).html
    ).toContain('Ramesh');

    expect(
      renderRefundProcessedEmail({
        donorName: 'Asha',
        donationCode: 'DON-1',
        amountMinor: 50000,
        providerRefundId: 'rfnd_123',
      }).html
    ).toContain('rfnd_123');

    expect(
      renderRecurringConfirmationEmail({
        donorName: 'Asha',
        planInterval: 'MONTHLY',
        amountMinor: 100000,
        provider: 'RAZORPAY',
      }).html
    ).toContain('MONTHLY');

    expect(
      renderRecurringFailureEmail({
        donorName: 'Asha',
        planInterval: 'MONTHLY',
        amountMinor: 100000,
        reason: 'Card expired',
      }).html
    ).toContain('Card expired');

    expect(
      renderCampaignApprovedEmail({
        recipientName: 'Manager',
        campaignTitle: 'Water Drive',
        campaignCode: 'CMP-1',
        approvedBy: 'Director',
      }).subject
    ).toContain('Approved');

    expect(
      renderCampaignPublishedEmail({
        recipientName: 'Manager',
        campaignTitle: 'Water Drive',
        targetAmountMinor: 500000,
        publicUrl: 'https://hopehorizon.org/campaigns/water-drive',
      }).html
    ).toContain('water-drive');

    expect(
      renderCampaignGoalReachedEmail({
        recipientName: 'Director',
        campaignTitle: 'Water Drive',
        raisedAmountMinor: 500000,
        targetAmountMinor: 500000,
      }).subject
    ).toContain('Goal Reached');

    // Keep userRepository referenced cleanly in suite
    expect(userRepository).toBeDefined();
  });
});
