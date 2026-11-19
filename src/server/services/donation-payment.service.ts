import crypto from 'crypto';
import mongoose from 'mongoose';
import connectToDatabase from '@/server/database/connection';
import {
  fundraisingRepository,
  DonationFilterOptions,
} from '@/server/repositories/fundraising.repository';
import { organizationRepository } from '@/server/repositories/organization.repository';
import {
  Donation,
  DonationStatus,
  IDonationDocument,
  PaymentProviderType,
} from '@/server/database/models/Donation';
import { IOrganizationDocument } from '@/server/database/models/Organization';
import { IVerifiedStatutorySnapshot } from '@/server/database/models/DonationReceipt';
import { Donor } from '@/server/database/models/Donor';
import { RecurringDonation } from '@/server/database/models/RecurringDonation';
import { Campaign } from '@/server/database/models/Campaign';
import { donorService } from '@/server/services/donor.service';
import { adminService, AdminActor } from '@/server/services/admin.service';
import { checkRolePermission } from '@/server/authorization/permissions';
import {
  getPaymentGateway,
  getPaymentProviderStatuses,
  razorpayPaymentProvider,
  stripePaymentProvider,
} from '@/integrations/payment';
import { emailProvider } from '@/integrations/email/nodemailer.provider';
import {
  renderDonationFailedEmail,
  renderDonationInitiatedEmail,
  renderDonationReceiptEmail,
  renderDonationSuccessEmail,
  renderRecurringConfirmationEmail,
  renderRecurringFailureEmail,
  renderRefundApprovedEmail,
  renderRefundProcessedEmail,
  renderRefundRequestedEmail,
  renderCampaignGoalReachedEmail,
} from '@/integrations/email/templates';
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from '@/lib/error-handler';
import {
  calculateMinorPercentage,
  subtractMinorUnits,
  sumMinorUnits,
} from '@/lib/money';
import {
  ApproveRefundInput,
  CreatePaymentOrderInput,
  CreateRecurringDonationInput,
  ManualDonationVerificationInput,
  RequestRefundInput,
  UpdateRecurringDonationInput,
  VerifyPaymentInput,
} from '@/features/donations/schemas/donation.schema';

// ======================== STATE MACHINE & PURE FINANCIAL HELPERS ========================

export const DONATION_STATUS_TRANSITIONS: Record<DonationStatus, DonationStatus[]> = {
  INITIATED: ['PENDING', 'SUCCESSFUL', 'FAILED', 'CANCELLED'],
  PENDING: ['SUCCESSFUL', 'FAILED', 'CANCELLED'],
  SUCCESSFUL: ['PARTIALLY_REFUNDED', 'REFUNDED'],
  FAILED: ['PENDING', 'SUCCESSFUL'], // allowed only via verified retry / authoritative late capture
  CANCELLED: [],
  PARTIALLY_REFUNDED: ['PARTIALLY_REFUNDED', 'REFUNDED'],
  REFUNDED: [],
};

export const SETTLED_DONATION_STATUSES: DonationStatus[] = [
  'SUCCESSFUL',
  'PARTIALLY_REFUNDED',
  'REFUNDED',
];

export function assertValidDonationTransition(current: DonationStatus, next: DonationStatus): void {
  if (current === next) return;
  const allowed = DONATION_STATUS_TRANSITIONS[current] || [];
  if (!allowed.includes(next)) {
    throw new ValidationError(
      `Invalid donation status transition from "${current}" to "${next}". Allowed: ${
        allowed.length > 0 ? allowed.join(', ') : 'none'
      }`
    );
  }
}

export interface TaxReceiptEligibilityResult {
  eligible: boolean;
  reason: string;
  verifiedStatutorySnapshot?: IVerifiedStatutorySnapshot;
}

/**
 * STRICT 80G/12A RECEIPT COMPLIANCE GATE
 * Never claims tax-exemption eligibility unless:
 * 1. Organization `verificationStatus === 'verified'`
 * 2. `statutory.is80GVerified === true` AND `section80GNumber` is present
 * 3. Validity dates (`section80GValidFrom` & `section80GValidTo`) are configured AND contain `donationDate`.
 */
export function evaluateTaxReceiptEligibility(
  org: Pick<IOrganizationDocument, 'verificationStatus' | 'statutory'> | null | undefined,
  donationDate: Date
): TaxReceiptEligibilityResult {
  if (!org) {
    return {
      eligible: false,
      reason:
        'Standard charitable acknowledgment receipt. Organization statutory verification profile is unavailable.',
    };
  }

  if (org.verificationStatus !== 'verified') {
    return {
      eligible: false,
      reason: `Standard charitable acknowledgment receipt. Organization verification status is "${org.verificationStatus}" (80G tax benefit claims require verified status).`,
    };
  }

  const statutory = org.statutory;
  if (!statutory?.is80GVerified || !statutory.section80GNumber?.trim()) {
    return {
      eligible: false,
      reason:
        'Standard charitable acknowledgment receipt. Verified Section 80G approval is not active on this organization profile.',
    };
  }

  if (!statutory.section80GValidFrom || !statutory.section80GValidTo) {
    return {
      eligible: false,
      reason:
        'Standard charitable acknowledgment receipt. Section 80G validity period dates are incomplete.',
    };
  }

  const validFrom = new Date(statutory.section80GValidFrom);
  const validTo = new Date(statutory.section80GValidTo);
  if (Number.isNaN(validFrom.getTime()) || Number.isNaN(validTo.getTime())) {
    return {
      eligible: false,
      reason:
        'Standard charitable acknowledgment receipt. Section 80G validity dates could not be parsed.',
    };
  }

  // Inclusive end-of-day check for validTo
  const endOfValidTo = new Date(validTo);
  endOfValidTo.setUTCHours(23, 59, 59, 999);

  if (donationDate < validFrom || donationDate > endOfValidTo) {
    return {
      eligible: false,
      reason: `Standard charitable acknowledgment receipt. Donation date falls outside verified Section 80G validity window (${statutory.section80GValidFrom} to ${statutory.section80GValidTo}).`,
    };
  }

  const snapshot: IVerifiedStatutorySnapshot = {
    section80GNumber: statutory.section80GNumber.trim(),
    section80GValidFrom: statutory.section80GValidFrom,
    section80GValidTo: statutory.section80GValidTo,
    taxExemptionPercentage: statutory.taxExemptionPercentage ?? 50,
  };

  if (statutory.is12AVerified && statutory.section12ANumber?.trim()) {
    snapshot.section12ANumber = statutory.section12ANumber.trim();
    snapshot.section12AValidFrom = statutory.section12AValidFrom;
    snapshot.section12AValidTo = statutory.section12AValidTo;
  }

  return {
    eligible: true,
    reason: `Eligible for Section 80G tax deduction (${snapshot.taxExemptionPercentage}%) under verified registration ${snapshot.section80GNumber}.`,
    verifiedStatutorySnapshot: snapshot,
  };
}

/**
 * Pure integer minor-unit financial summary computation.
 * Strictly counts only SUCCESSFUL, PARTIALLY_REFUNDED, and REFUNDED towards gross/refunded;
 * Pending, Initiated, Failed, and Cancelled are NEVER counted in gross or net totals.
 */
export function computeFinancialTotalsFromRecords(
  records: Array<{ status: DonationStatus; amountMinor: number; refundedAmountMinor?: number }>
) {
  let grossSuccessfulMinor = 0;
  let pendingAmountMinor = 0;
  let failedAmountMinor = 0;
  let refundedAmountMinor = 0;
  let successfulCount = 0;
  let pendingCount = 0;
  let failedCount = 0;
  let refundedCount = 0;

  for (const r of records) {
    const amount = Math.trunc(r.amountMinor || 0);
    const refunded = Math.trunc(r.refundedAmountMinor || 0);

    if (r.status === 'SUCCESSFUL' || r.status === 'PARTIALLY_REFUNDED' || r.status === 'REFUNDED') {
      grossSuccessfulMinor = sumMinorUnits([grossSuccessfulMinor, amount]);
      refundedAmountMinor = sumMinorUnits([refundedAmountMinor, refunded]);
      successfulCount += 1;
      if (refunded > 0) refundedCount += 1;
    } else if (r.status === 'PENDING' || r.status === 'INITIATED') {
      pendingAmountMinor = sumMinorUnits([pendingAmountMinor, amount]);
      pendingCount += 1;
    } else if (r.status === 'FAILED' || r.status === 'CANCELLED') {
      failedAmountMinor = sumMinorUnits([failedAmountMinor, amount]);
      failedCount += 1;
    }
  }

  const netDonationsMinor = Math.max(0, subtractMinorUnits(grossSuccessfulMinor, refundedAmountMinor));

  return {
    grossSuccessfulMinor,
    pendingAmountMinor,
    failedAmountMinor,
    refundedAmountMinor,
    netDonationsMinor,
    successfulCount,
    pendingCount,
    failedCount,
    refundedCount,
  };
}

function generateDonationCode(): string {
  const year = new Date().getUTCFullYear();
  const suffix = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `DON-${year}-${suffix}`;
}

function generateReceiptNumber(): string {
  const year = new Date().getUTCFullYear();
  const suffix = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `RCP-${year}-${suffix}`;
}

export class DonationPaymentService {
  // ======================== CREATE PAYMENT ORDER ========================

  async createPaymentOrder(
    organizationId: string,
    input: CreatePaymentOrderInput,
    requestMeta?: { ipAddress?: string; userAgent?: string }
  ) {
    // 1. Idempotency check: prevent duplicate donations on double-click / retry
    const existing = await fundraisingRepository.findDonationByIdempotencyKey(
      organizationId,
      input.idempotencyKey
    );
    if (existing) {
      return {
        idempotentReplay: true,
        donation: existing,
        paymentOrder: {
          gatewayOrderId: existing.providerOrderId || existing.donationCode,
          amount: existing.amountMinor,
          currency: existing.currency,
          manualVerificationRequired:
            existing.paymentProvider === 'UPI' || existing.paymentProvider === 'BANK_TRANSFER',
        },
      };
    }

    // 2. Validate campaign if provided
    let campaignId: mongoose.Types.ObjectId | undefined;
    let programId: mongoose.Types.ObjectId | undefined;
    let projectId: mongoose.Types.ObjectId | undefined;
    let purpose = input.purpose || 'General Charitable Fund';

    if (input.campaignId) {
      const campaign = await fundraisingRepository.findCampaignById(input.campaignId, organizationId);
      if (!campaign) {
        throw new NotFoundError('Selected fundraising campaign not found in this organization');
      }
      if (!['APPROVED', 'ACTIVE', 'GOAL_REACHED'].includes(campaign.status)) {
        throw new ValidationError(
          `Campaign "${campaign.title}" is not currently accepting donations (status: ${campaign.status})`
        );
      }
      if (input.amountMinor < campaign.minimumDonationMinor) {
        throw new ValidationError(
          `Minimum donation for this campaign is ${campaign.minimumDonationMinor} minor units`
        );
      }
      campaignId = campaign._id as mongoose.Types.ObjectId;
      programId = campaign.programId;
      projectId = campaign.projectId;
      if (!input.purpose || input.purpose === 'General Charitable Fund') {
        purpose = campaign.title;
      }
    }

    // 3. Upsert Donor CRM profile
    const donor = await donorService.findOrCreateDonorForDonation(organizationId, input.donor);

    // 4. Create gateway order (for online providers check config BEFORE creating donation)
    const gateway = getPaymentGateway(input.paymentProvider);
    const isManual = input.paymentProvider === 'UPI' || input.paymentProvider === 'BANK_TRANSFER';
    if (!isManual && !gateway.isConfigured()) {
      throw new ValidationError(
        `${input.paymentProvider} gateway is not configured in this environment. Choose UPI / Bank Transfer or configure ${input.paymentProvider} credentials.`
      );
    }

    const donationCode = generateDonationCode();
    const orderResult = await gateway.createOrder({
      amount: input.amountMinor,
      currency: input.currency,
      receiptId: donationCode,
      idempotencyKey: input.idempotencyKey,
      notes: {
        organizationId,
        donationCode,
        purpose,
        ...(campaignId ? { campaignId: campaignId.toString() } : {}),
      },
      customer: {
        name: input.donor.name,
        email: input.donor.email,
        contact: input.donor.phone,
      },
    });

    // 5. Persist Donation record — ALWAYS PENDING for manual UPI/Bank Transfer, INITIATED for online
    const initialStatus: DonationStatus = isManual ? 'PENDING' : 'INITIATED';
    const donation = await fundraisingRepository.createDonation({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      donationCode,
      idempotencyKey: input.idempotencyKey,
      donorId: donor._id as mongoose.Types.ObjectId,
      campaignId,
      programId,
      projectId,
      amountMinor: input.amountMinor,
      refundedAmountMinor: 0,
      currency: input.currency,
      donationType: input.donationType || 'ONE_TIME',
      paymentProvider: input.paymentProvider,
      providerOrderId: orderResult.gatewayOrderId,
      paymentReference: input.paymentReference || undefined,
      manualProofUrl: input.manualProofUrl || undefined,
      paymentStatus: isManual ? 'PENDING_MANUAL_VERIFICATION' : 'ORDER_CREATED',
      status: initialStatus,
      isAnonymous: input.isAnonymous ?? false,
      donorSnapshot: {
        name: input.donor.name,
        email: input.donor.email,
        phone: input.donor.phone,
        panNumber: input.donor.panNumber || undefined,
        address: input.donor.address,
      },
      purpose,
      receiptStatus: 'NOT_ISSUED',
      refundStatus: 'NONE',
    });

    // 6. Log PaymentAttempt #1 & immutable PaymentTransaction
    await Promise.all([
      fundraisingRepository.createPaymentAttempt({
        organizationId: new mongoose.Types.ObjectId(organizationId),
        donationId: donation._id as mongoose.Types.ObjectId,
        attemptNumber: 1,
        provider: input.paymentProvider,
        providerOrderId: orderResult.gatewayOrderId,
        status: 'STARTED',
        ipAddress: requestMeta?.ipAddress,
        userAgent: requestMeta?.userAgent,
      }),
      fundraisingRepository.createPaymentTransaction({
        organizationId: new mongoose.Types.ObjectId(organizationId),
        donationId: donation._id as mongoose.Types.ObjectId,
        provider: input.paymentProvider,
        providerOrderId: orderResult.gatewayOrderId,
        providerPaymentId: input.paymentReference || undefined,
        amountMinor: input.amountMinor,
        currency: input.currency,
        status: isManual ? 'PENDING_MANUAL' : 'CREATED',
        signatureVerified: false,
        eventSource: 'CHECKOUT_CREATE',
        sanitizedMetadata: {
          donationCode,
          mode: orderResult.mode,
          manualVerificationRequired: isManual,
        },
      }),
    ]);

    // 7. Notify donor respectfully
    if (donor.communicationPreferences?.emailReceipts !== false) {
      const org = await organizationRepository.findById(organizationId);
      const tpl = renderDonationInitiatedEmail({
        donorName: donor.name,
        donationCode,
        amountMinor: donation.amountMinor,
        currency: donation.currency,
        paymentProvider: donation.paymentProvider,
        purpose: donation.purpose,
        organizationName: org?.name || 'HopeHorizon Foundation',
      });
      await emailProvider.sendEmail({
        to: donor.email,
        subject: tpl.subject,
        htmlContent: tpl.html,
        textContent: tpl.text,
      });
    }

    return {
      idempotentReplay: false,
      donation,
      paymentOrder: orderResult,
    };
  }

  // ======================== ONLINE PAYMENT VERIFICATION ========================

  async verifyOnlinePayment(organizationId: string, input: VerifyPaymentInput) {
    const donation = await fundraisingRepository.findDonationById(input.donationId, organizationId);
    if (!donation) {
      throw new NotFoundError('Donation record not found in this organization');
    }

    if (donation.paymentProvider === 'UPI' || donation.paymentProvider === 'BANK_TRANSFER') {
      throw new ValidationError(
        'UPI and Bank Transfer donations cannot be self-verified. They remain PENDING until verified by an authorized staff member.'
      );
    }

    if (donation.paymentProvider !== input.paymentProvider) {
      throw new ValidationError('Payment provider mismatch for this donation');
    }

    if (donation.providerOrderId && donation.providerOrderId !== input.gatewayOrderId) {
      throw new ValidationError('Gateway order ID does not match the donation order');
    }

    // Already verified? Return idempotently without re-issuing receipts or emails.
    if (SETTLED_DONATION_STATUSES.includes(donation.status)) {
      const existingReceipt = await fundraisingRepository.findActiveReceiptByDonation(
        organizationId,
        donation._id.toString()
      );
      return {
        verified: true,
        alreadySettled: true,
        donation,
        receipt: existingReceipt,
      };
    }

    const gateway = getPaymentGateway(input.paymentProvider);
    const signatureValid = await gateway.verifyPayment({
      gatewayOrderId: input.gatewayOrderId,
      gatewayPaymentId: input.gatewayPaymentId,
      gatewaySignature: input.gatewaySignature,
    });

    if (!signatureValid) {
      await fundraisingRepository.createPaymentTransaction({
        organizationId: new mongoose.Types.ObjectId(organizationId),
        donationId: donation._id as mongoose.Types.ObjectId,
        provider: input.paymentProvider,
        providerOrderId: input.gatewayOrderId,
        providerPaymentId: input.gatewayPaymentId,
        amountMinor: donation.amountMinor,
        currency: donation.currency,
        status: 'FAILED',
        signatureVerified: false,
        eventSource: 'CHECKOUT_VERIFY',
        failureReason: 'Invalid gateway payment signature or unpaid checkout session',
      });
      throw new ValidationError('Payment verification failed: invalid gateway signature or uncaptured payment');
    }

    const result = await this.markDonationSuccessful({
      organizationId,
      donation,
      providerOrderId: input.gatewayOrderId,
      providerPaymentId: input.gatewayPaymentId,
      signatureVerified: true,
      eventSource: 'CHECKOUT_VERIFY',
    });

    return {
      verified: true,
      alreadySettled: false,
      ...result,
    };
  }

  // ======================== AUTHORIZED MANUAL VERIFICATION (UPI / BANK) ========================

  async verifyManualDonation(
    organizationId: string,
    donationId: string,
    input: ManualDonationVerificationInput,
    actor: AdminActor
  ) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'donations.verify')) {
      throw new AuthorizationError('Missing donations.verify permission');
    }

    const donation = await fundraisingRepository.findDonationById(donationId, organizationId);
    if (!donation) throw new NotFoundError('Donation not found in this organization');

    if (donation.paymentProvider !== 'UPI' && donation.paymentProvider !== 'BANK_TRANSFER') {
      throw new ValidationError('Manual verification applies only to UPI and Bank Transfer donations');
    }

    if (!['INITIATED', 'PENDING'].includes(donation.status)) {
      throw new ValidationError(
        `Manual donation has already been finalized (current status: ${donation.status})`
      );
    }

    if (input.decision === 'REJECT') {
      if (!input.rejectionReason?.trim()) {
        throw new ValidationError('Rejection reason is required when rejecting a manual donation');
      }
      assertValidDonationTransition(donation.status, 'FAILED');

      const updated = await fundraisingRepository.updateDonation(donationId, organizationId, {
        $set: {
          status: 'FAILED',
          paymentStatus: 'REJECTED_MANUAL',
          rejectionReason: input.rejectionReason.trim(),
          verifiedBy: new mongoose.Types.ObjectId(actor.id),
          verifiedAt: new Date(),
        },
      });

      await fundraisingRepository.createPaymentTransaction({
        organizationId: new mongoose.Types.ObjectId(organizationId),
        donationId: donation._id as mongoose.Types.ObjectId,
        provider: donation.paymentProvider,
        providerOrderId: donation.providerOrderId,
        providerPaymentId: input.paymentReference || donation.paymentReference,
        amountMinor: donation.amountMinor,
        currency: donation.currency,
        status: 'REJECTED_MANUAL',
        signatureVerified: false,
        eventSource: 'MANUAL_VERIFICATION',
        failureReason: input.rejectionReason.trim(),
        recordedBy: new mongoose.Types.ObjectId(actor.id),
      });

      await adminService.logAudit(
        actor,
        'DONATION_MANUAL_REJECT',
        'Donation',
        donationId,
        `Rejected manual ${donation.paymentProvider} donation ${donation.donationCode}`,
        { reason: input.rejectionReason.trim() }
      );

      const tpl = renderDonationFailedEmail({
        donorName: donation.donorSnapshot.name,
        donationCode: donation.donationCode,
        amountMinor: donation.amountMinor,
        currency: donation.currency,
        reason: input.rejectionReason.trim(),
      });
      await emailProvider.sendEmail({
        to: donation.donorSnapshot.email,
        subject: tpl.subject,
        htmlContent: tpl.html,
        textContent: tpl.text,
      });

      return { donation: updated, receipt: null };
    }

    // APPROVE
    const paymentRef = input.paymentReference || donation.paymentReference || donation.providerOrderId || donation.donationCode;
    const settled = await this.markDonationSuccessful({
      organizationId,
      donation,
      providerOrderId: donation.providerOrderId,
      providerPaymentId: paymentRef,
      signatureVerified: true,
      eventSource: 'MANUAL_VERIFICATION',
      actor,
    });

    await adminService.logAudit(
      actor,
      'DONATION_MANUAL_VERIFY',
      'Donation',
      donationId,
      `Verified manual ${donation.paymentProvider} donation ${donation.donationCode}`,
      { paymentReference: paymentRef, amountMinor: donation.amountMinor }
    );

    return settled;
  }

  // ======================== RECONCILIATION ========================

  async reconcilePendingPayment(organizationId: string, donationId: string, actor: AdminActor) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'payments.reconcile')) {
      throw new AuthorizationError('Missing payments.reconcile permission');
    }

    const donation = await fundraisingRepository.findDonationById(donationId, organizationId);
    if (!donation) throw new NotFoundError('Donation not found in this organization');

    if (donation.paymentProvider === 'UPI' || donation.paymentProvider === 'BANK_TRANSFER') {
      throw new ValidationError(
        'Manual UPI/Bank Transfer donations require staff verification via the manual verification action.'
      );
    }

    if (!donation.providerOrderId) {
      throw new ValidationError('Donation does not have a gateway order ID to reconcile');
    }

    const gateway = getPaymentGateway(donation.paymentProvider);
    const status = await gateway.fetchOrderStatus(donation.providerOrderId);

    if (status.status === 'SUCCESSFUL' && !SETTLED_DONATION_STATUSES.includes(donation.status)) {
      const result = await this.markDonationSuccessful({
        organizationId,
        donation,
        providerOrderId: status.gatewayOrderId,
        providerPaymentId: status.gatewayPaymentId || status.gatewayOrderId,
        signatureVerified: true,
        eventSource: 'RECONCILIATION',
        actor,
      });
      await adminService.logAudit(
        actor,
        'PAYMENT_RECONCILED_SUCCESS',
        'Donation',
        donationId,
        `Reconciled donation ${donation.donationCode} -> SUCCESSFUL`
      );
      return { reconciledStatus: 'SUCCESSFUL', providerStatus: status, ...result };
    }

    if (
      (status.status === 'FAILED' || status.status === 'CANCELLED') &&
      !SETTLED_DONATION_STATUSES.includes(donation.status)
    ) {
      const nextStatus: DonationStatus = status.status === 'CANCELLED' ? 'CANCELLED' : 'FAILED';
      const updated = await fundraisingRepository.updateDonation(donationId, organizationId, {
        $set: { status: nextStatus, paymentStatus: status.rawStatus },
      });
      await adminService.logAudit(
        actor,
        'PAYMENT_RECONCILED_FAILED',
        'Donation',
        donationId,
        `Reconciled donation ${donation.donationCode} -> ${nextStatus}`
      );
      return { reconciledStatus: nextStatus, providerStatus: status, donation: updated, receipt: null };
    }

    return { reconciledStatus: donation.status, providerStatus: status, donation, receipt: null };
  }

  // ======================== IDEMPOTENT SETTLEMENT ENGINE ========================

  private async markDonationSuccessful(params: {
    organizationId: string;
    donation: IDonationDocument;
    providerOrderId?: string;
    providerPaymentId: string;
    signatureVerified: boolean;
    eventSource: 'CHECKOUT_VERIFY' | 'WEBHOOK' | 'MANUAL_VERIFICATION' | 'RECONCILIATION';
    actor?: AdminActor;
  }) {
    const { organizationId, donation, providerOrderId, providerPaymentId, signatureVerified, eventSource, actor } =
      params;

    // Out-of-order & duplicate protection: if already settled, never re-settle or duplicate emails/receipts
    if (SETTLED_DONATION_STATUSES.includes(donation.status)) {
      const existingReceipt = await fundraisingRepository.findActiveReceiptByDonation(
        organizationId,
        donation._id.toString()
      );
      return { donation, receipt: existingReceipt };
    }

    assertValidDonationTransition(donation.status, 'SUCCESSFUL');

    const now = new Date();
    const updated = await fundraisingRepository.updateDonation(
      donation._id.toString(),
      organizationId,
      {
        $set: {
          status: 'SUCCESSFUL',
          paymentStatus: 'CAPTURED',
          paymentReference: providerPaymentId,
          verifiedBy: actor ? new mongoose.Types.ObjectId(actor.id) : undefined,
          verifiedAt: now,
        },
      }
    );
    const settledDonation = updated || donation;

    // Record immutable transaction ledger entry (duplicate-safe against unique partial index)
    try {
      await fundraisingRepository.createPaymentTransaction({
        organizationId: new mongoose.Types.ObjectId(organizationId),
        donationId: donation._id as mongoose.Types.ObjectId,
        provider: donation.paymentProvider,
        providerOrderId: providerOrderId || donation.providerOrderId,
        providerPaymentId,
        amountMinor: donation.amountMinor,
        currency: donation.currency,
        status: 'CAPTURED',
        signatureVerified,
        eventSource,
        recordedBy: actor ? new mongoose.Types.ObjectId(actor.id) : undefined,
      });
    } catch (err: unknown) {
      // Ignore MongoDB duplicate key (11000) if webhook + checkout verify race on identical paymentId
      const code = (err as { code?: number })?.code;
      if (code !== 11000) throw err;
    }

    // Recalculate real donor CRM metrics
    const donorIdStr =
      typeof donation.donorId === 'object' && '_id' in donation.donorId
        ? (donation.donorId as { _id: mongoose.Types.ObjectId })._id.toString()
        : (donation.donorId as mongoose.Types.ObjectId).toString();
    await donorService.recalculateDonorMetrics(organizationId, donorIdStr);

    // Check campaign goal achievement
    if (donation.campaignId) {
      const cid =
        typeof donation.campaignId === 'object' && '_id' in donation.campaignId
          ? (donation.campaignId as { _id: mongoose.Types.ObjectId })._id.toString()
          : (donation.campaignId as mongoose.Types.ObjectId).toString();
      await this.evaluateCampaignGoalReached(organizationId, cid);
    }

    // Issue official receipt idempotently
    const org = await organizationRepository.findById(organizationId);
    let receipt = await fundraisingRepository.findActiveReceiptByDonation(
      organizationId,
      donation._id.toString()
    );
    if (!receipt && org?.settings?.autoSendReceipts !== false) {
      receipt = await this.issueReceipt(organizationId, donation._id.toString(), actor);
    }

    // Send confirmation email strictly ONCE (`confirmationEmailSentAt` guard)
    if (!settledDonation.confirmationEmailSentAt) {
      const donorDoc = await fundraisingRepository.findDonorById(donorIdStr, organizationId);
      if (donorDoc?.communicationPreferences?.emailReceipts !== false) {
        const tpl = renderDonationSuccessEmail({
          donorName: donation.donorSnapshot.name,
          donationCode: donation.donationCode,
          amountMinor: donation.amountMinor,
          currency: donation.currency,
          purpose: donation.purpose,
          paymentReference: providerPaymentId,
          organizationName: org?.name || 'HopeHorizon Foundation',
        });
        await emailProvider.sendEmail({
          to: donation.donorSnapshot.email,
          subject: tpl.subject,
          htmlContent: tpl.html,
          textContent: tpl.text,
        });
        await fundraisingRepository.updateDonation(donation._id.toString(), organizationId, {
          $set: { confirmationEmailSentAt: new Date() },
        });
      }
    }

    return { donation: settledDonation, receipt };
  }

  private async evaluateCampaignGoalReached(organizationId: string, campaignId: string) {
    const campaign = await fundraisingRepository.findCampaignById(campaignId, organizationId);
    if (!campaign || campaign.status !== 'ACTIVE') return;

    const totals = await fundraisingRepository.getCampaignVerifiedTotals(organizationId, [campaignId]);
    const stats = totals.get(campaignId);
    if (!stats || stats.netRaisedMinor < campaign.targetAmountMinor) return;

    await fundraisingRepository.updateCampaign(campaignId, organizationId, {
      $set: {
        status: 'GOAL_REACHED',
        ...(campaign.goalReachedEmailSentAt ? {} : { goalReachedEmailSentAt: new Date() }),
      },
    });

    if (!campaign.goalReachedEmailSentAt) {
      const org = await organizationRepository.findById(organizationId);
      if (org?.contactEmail && org.notificationSettings?.emailNotifications !== false) {
        const tpl = renderCampaignGoalReachedEmail({
          recipientName: org.name,
          campaignTitle: campaign.title,
          raisedAmountMinor: stats.netRaisedMinor,
          targetAmountMinor: campaign.targetAmountMinor,
          currency: campaign.currency,
        });
        await emailProvider.sendEmail({
          to: org.contactEmail,
          subject: tpl.subject,
          htmlContent: tpl.html,
          textContent: tpl.text,
        });
      }
    }
  }

  // ======================== WEBHOOK PROCESSORS (RAZORPAY & STRIPE) ========================

  async processRazorpayWebhook(
    rawBody: string,
    signatureHeader: string,
    eventIdHeader?: string
  ) {
    const signatureValid = razorpayPaymentProvider.verifyWebhookSignature(rawBody, signatureHeader);
    if (!signatureValid) {
      throw new AuthorizationError('Invalid Razorpay webhook signature');
    }

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      throw new ValidationError('Malformed Razorpay webhook JSON payload');
    }

    const eventType = String(payload.event || 'unknown');
    const payloadHash = crypto.createHash('sha256').update(rawBody).digest('hex');
    const providerEventId =
      eventIdHeader?.trim() || String(payload.id || `rzp_${payloadHash.slice(0, 24)}`);

    // Deduplication check
    const existingEvent = await fundraisingRepository.findWebhookEvent('RAZORPAY', providerEventId);
    if (existingEvent) {
      return {
        handled: true,
        duplicate: true,
        outOfOrder: false,
        providerEventId,
        eventType,
      };
    }

    const webhookRecord = await fundraisingRepository.createWebhookEvent({
      provider: 'RAZORPAY',
      providerEventId,
      eventType,
      signatureValid: true,
      processingStatus: 'RECEIVED',
      outOfOrder: false,
      payloadHash,
    });

    try {
      const payloadObj = (payload.payload || {}) as Record<string, Record<string, Record<string, unknown>>>;
      const paymentEntity = payloadObj.payment?.entity || {};
      const orderEntity = payloadObj.order?.entity || {};
      const orderId = String(paymentEntity.order_id || orderEntity.id || '');
      const paymentId = String(paymentEntity.id || '');

      const donation = orderId
        ? await fundraisingRepository.findDonationByProviderOrderId(orderId)
        : paymentId
        ? await fundraisingRepository.findDonationByPaymentReference(paymentId)
        : null;

      if (!donation) {
        await fundraisingRepository.updateWebhookEvent(webhookRecord._id.toString(), {
          $set: { processingStatus: 'PROCESSED', processedAt: new Date() },
        });
        return { handled: true, duplicate: false, outOfOrder: false, providerEventId, eventType, matched: false };
      }

      const orgId = donation.organizationId.toString();

      // Out-of-order guard: NEVER downgrade a settled donation on a late `payment.failed` event
      if (eventType === 'payment.failed') {
        if (SETTLED_DONATION_STATUSES.includes(donation.status)) {
          await fundraisingRepository.updateWebhookEvent(webhookRecord._id.toString(), {
            $set: {
              organizationId: donation.organizationId,
              donationId: donation._id,
              processingStatus: 'IGNORED_OUT_OF_ORDER',
              outOfOrder: true,
              processedAt: new Date(),
            },
          });
          return { handled: true, duplicate: false, outOfOrder: true, providerEventId, eventType };
        }

        await fundraisingRepository.updateDonation(donation._id.toString(), orgId, {
          $set: { status: 'FAILED', paymentStatus: 'FAILED' },
        });
        await fundraisingRepository.createPaymentTransaction({
          organizationId: donation.organizationId,
          donationId: donation._id as mongoose.Types.ObjectId,
          provider: 'RAZORPAY',
          providerOrderId: orderId || donation.providerOrderId,
          providerPaymentId: paymentId || undefined,
          amountMinor: donation.amountMinor,
          currency: donation.currency,
          status: 'FAILED',
          signatureVerified: true,
          eventSource: 'WEBHOOK',
          failureReason: String(paymentEntity.error_description || 'Payment failed at gateway'),
        });
      } else if (eventType === 'payment.captured' || eventType === 'order.paid') {
        await this.markDonationSuccessful({
          organizationId: orgId,
          donation,
          providerOrderId: orderId || donation.providerOrderId,
          providerPaymentId: paymentId || orderId,
          signatureVerified: true,
          eventSource: 'WEBHOOK',
        });
      }

      await fundraisingRepository.updateWebhookEvent(webhookRecord._id.toString(), {
        $set: {
          organizationId: donation.organizationId,
          donationId: donation._id,
          processingStatus: 'PROCESSED',
          processedAt: new Date(),
        },
      });

      return { handled: true, duplicate: false, outOfOrder: false, providerEventId, eventType, matched: true };
    } catch (err: unknown) {
      await fundraisingRepository.updateWebhookEvent(webhookRecord._id.toString(), {
        $set: {
          processingStatus: 'FAILED',
          errorMessage: err instanceof Error ? err.message : 'Webhook processing failed',
        },
      });
      throw err;
    }
  }

  async processStripeWebhook(rawBody: string, signatureHeader: string) {
    const signatureValid = stripePaymentProvider.verifyWebhookSignature(rawBody, signatureHeader);
    if (!signatureValid) {
      throw new AuthorizationError('Invalid Stripe webhook signature');
    }

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      throw new ValidationError('Malformed Stripe webhook JSON payload');
    }

    const eventType = String(payload.type || 'unknown');
    const payloadHash = crypto.createHash('sha256').update(rawBody).digest('hex');
    const providerEventId = String(payload.id || `evt_${payloadHash.slice(0, 24)}`);

    const existingEvent = await fundraisingRepository.findWebhookEvent('STRIPE', providerEventId);
    if (existingEvent) {
      return {
        handled: true,
        duplicate: true,
        outOfOrder: false,
        providerEventId,
        eventType,
      };
    }

    const webhookRecord = await fundraisingRepository.createWebhookEvent({
      provider: 'STRIPE',
      providerEventId,
      eventType,
      signatureValid: true,
      processingStatus: 'RECEIVED',
      outOfOrder: false,
      payloadHash,
    });

    try {
      const dataObj = ((payload.data as Record<string, unknown>)?.object || {}) as Record<string, unknown>;
      const sessionOrIntentId = String(dataObj.id || '');
      const paymentIntentId = String(dataObj.payment_intent || dataObj.id || '');

      const donation =
        (await fundraisingRepository.findDonationByProviderOrderId(sessionOrIntentId)) ||
        (paymentIntentId
          ? await fundraisingRepository.findDonationByPaymentReference(paymentIntentId)
          : null);

      if (!donation) {
        await fundraisingRepository.updateWebhookEvent(webhookRecord._id.toString(), {
          $set: { processingStatus: 'PROCESSED', processedAt: new Date() },
        });
        return { handled: true, duplicate: false, outOfOrder: false, providerEventId, eventType, matched: false };
      }

      const orgId = donation.organizationId.toString();

      if (eventType === 'payment_intent.payment_failed' || eventType === 'checkout.session.expired') {
        if (SETTLED_DONATION_STATUSES.includes(donation.status)) {
          await fundraisingRepository.updateWebhookEvent(webhookRecord._id.toString(), {
            $set: {
              organizationId: donation.organizationId,
              donationId: donation._id,
              processingStatus: 'IGNORED_OUT_OF_ORDER',
              outOfOrder: true,
              processedAt: new Date(),
            },
          });
          return { handled: true, duplicate: false, outOfOrder: true, providerEventId, eventType };
        }

        const nextStatus: DonationStatus =
          eventType === 'checkout.session.expired' ? 'CANCELLED' : 'FAILED';
        await fundraisingRepository.updateDonation(donation._id.toString(), orgId, {
          $set: { status: nextStatus, paymentStatus: eventType },
        });
      } else if (
        eventType === 'checkout.session.completed' ||
        eventType === 'payment_intent.succeeded'
      ) {
        await this.markDonationSuccessful({
          organizationId: orgId,
          donation,
          providerOrderId: sessionOrIntentId,
          providerPaymentId: paymentIntentId,
          signatureVerified: true,
          eventSource: 'WEBHOOK',
        });
      }

      await fundraisingRepository.updateWebhookEvent(webhookRecord._id.toString(), {
        $set: {
          organizationId: donation.organizationId,
          donationId: donation._id,
          processingStatus: 'PROCESSED',
          processedAt: new Date(),
        },
      });

      return { handled: true, duplicate: false, outOfOrder: false, providerEventId, eventType, matched: true };
    } catch (err: unknown) {
      await fundraisingRepository.updateWebhookEvent(webhookRecord._id.toString(), {
        $set: {
          processingStatus: 'FAILED',
          errorMessage: err instanceof Error ? err.message : 'Stripe webhook failed',
        },
      });
      throw err;
    }
  }

  // ======================== OFFICIAL DONATION RECEIPTS ========================

  async issueReceipt(organizationId: string, donationId: string, actor?: AdminActor) {
    const donation = await fundraisingRepository.findDonationById(donationId, organizationId);
    if (!donation) throw new NotFoundError('Donation not found in this organization');

    if (!['SUCCESSFUL', 'PARTIALLY_REFUNDED'].includes(donation.status)) {
      throw new ValidationError(
        `Official receipts can only be issued for verified SUCCESSFUL donations (current status: ${donation.status})`
      );
    }

    // Prevent duplicate active receipts
    const existingActive = await fundraisingRepository.findActiveReceiptByDonation(
      organizationId,
      donationId
    );
    if (existingActive) {
      return existingActive;
    }

    const org = await organizationRepository.findById(organizationId);
    const donationDate = donation.verifiedAt || donation.createdAt || new Date();
    const taxEval = evaluateTaxReceiptEligibility(org, donationDate);

    const receiptNumber = generateReceiptNumber();
    const receipt = await fundraisingRepository.createReceipt({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      donationId: donation._id as mongoose.Types.ObjectId,
      receiptNumber,
      organizationSnapshot: {
        name: org?.name || 'HopeHorizon Foundation',
        legalName: org?.legalName,
        address: org?.headquartersAddress || org?.identity?.registeredAddress,
        panNumber: org?.statutory?.panNumber,
        registrationNumber: org?.identity?.registrationNumber,
        contactEmail: org?.contactEmail,
      },
      donorSnapshot: {
        name: donation.donorSnapshot.name,
        email: donation.donorSnapshot.email,
        address: donation.donorSnapshot.address,
        panNumber: donation.donorSnapshot.panNumber,
      },
      amountMinor: donation.amountMinor,
      currency: donation.currency,
      donationDate,
      paymentProvider: donation.paymentProvider,
      paymentReference: donation.paymentReference || donation.providerOrderId || donation.donationCode,
      purpose: donation.purpose,
      taxBenefitEligible: taxEval.eligible,
      taxEligibilityReason: taxEval.reason,
      verifiedStatutorySnapshot: taxEval.verifiedStatutorySnapshot,
      status: 'ISSUED',
      issuedBy: actor ? new mongoose.Types.ObjectId(actor.id) : undefined,
      issuedAt: new Date(),
    });

    await fundraisingRepository.updateDonation(donationId, organizationId, {
      $set: { receiptStatus: 'ISSUED' },
    });

    if (actor) {
      await adminService.logAudit(
        actor,
        'RECEIPT_ISSUED',
        'DonationReceipt',
        receipt._id.toString(),
        `Issued receipt ${receipt.receiptNumber} for donation ${donation.donationCode}`,
        { taxBenefitEligible: taxEval.eligible }
      );
    }

    // Send receipt email once
    if (!donation.receiptEmailSentAt) {
      const tpl = renderDonationReceiptEmail({
        donorName: receipt.donorSnapshot.name,
        receiptNumber: receipt.receiptNumber,
        donationCode: donation.donationCode,
        amountMinor: receipt.amountMinor,
        currency: receipt.currency,
        purpose: receipt.purpose,
        donationDate: donationDate.toISOString().slice(0, 10),
        paymentReference: receipt.paymentReference,
        taxBenefitEligible: receipt.taxBenefitEligible,
        taxEligibilityReason: receipt.taxEligibilityReason,
        section80GNumber: receipt.verifiedStatutorySnapshot?.section80GNumber,
        organizationName: receipt.organizationSnapshot.name,
      });
      await emailProvider.sendEmail({
        to: receipt.donorSnapshot.email,
        subject: tpl.subject,
        htmlContent: tpl.html,
        textContent: tpl.text,
      });
      await fundraisingRepository.updateDonation(donationId, organizationId, {
        $set: { receiptEmailSentAt: new Date() },
      });
    }

    return receipt;
  }

  async cancelReceipt(
    organizationId: string,
    receiptId: string,
    reason: string,
    reissue: boolean,
    actor: AdminActor
  ) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'receipts.cancel')) {
      throw new AuthorizationError('Missing receipts.cancel permission');
    }

    const receipt = await fundraisingRepository.findReceiptById(receiptId, organizationId);
    if (!receipt) throw new NotFoundError('Donation receipt not found in this organization');
    if (receipt.status === 'CANCELLED') {
      throw new ValidationError('Receipt is already cancelled');
    }

    const cancelled = await fundraisingRepository.updateReceipt(receiptId, organizationId, {
      $set: {
        status: 'CANCELLED',
        cancelledReason: reason.trim(),
        cancelledBy: new mongoose.Types.ObjectId(actor.id),
        cancelledAt: new Date(),
      },
    });

    await fundraisingRepository.updateDonation(receipt.donationId.toString(), organizationId, {
      $set: { receiptStatus: 'CANCELLED' },
    });

    await adminService.logAudit(
      actor,
      'RECEIPT_CANCELLED',
      'DonationReceipt',
      receiptId,
      `Cancelled receipt ${receipt.receiptNumber}`,
      { reason: reason.trim(), reissue }
    );

    let reissuedReceipt = null;
    if (reissue) {
      reissuedReceipt = await this.issueReceipt(organizationId, receipt.donationId.toString(), actor);
      await fundraisingRepository.updateReceipt(receiptId, organizationId, {
        $set: { supersededByReceiptId: reissuedReceipt._id },
      });
    }

    return { cancelledReceipt: cancelled, reissuedReceipt };
  }

  // ======================== TWO-STAGE REFUND WORKFLOW ========================

  async requestRefund(organizationId: string, input: RequestRefundInput, actor: AdminActor) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'refunds.request')) {
      throw new AuthorizationError('Missing refunds.request permission');
    }

    // Idempotency protection
    const duplicate = await fundraisingRepository.findRefundByIdempotencyKey(
      organizationId,
      input.idempotencyKey
    );
    if (duplicate) {
      return { idempotentReplay: true, refund: duplicate };
    }

    const donation = await fundraisingRepository.findDonationById(input.donationId, organizationId);
    if (!donation) throw new NotFoundError('Donation not found in this organization');

    if (!['SUCCESSFUL', 'PARTIALLY_REFUNDED'].includes(donation.status)) {
      throw new ValidationError(
        `Refunds can only be requested for SUCCESSFUL or PARTIALLY_REFUNDED donations (current: ${donation.status})`
      );
    }

    // Enforce remaining refundable cap including in-flight refunds
    const existingRefunds = await fundraisingRepository.findRefundsByDonation(
      organizationId,
      input.donationId
    );
    const inFlightMinor = sumMinorUnits(
      existingRefunds
        .filter((r) => ['REQUESTED', 'PENDING_APPROVAL', 'APPROVED', 'PROCESSING'].includes(r.status))
        .map((r) => r.amountMinor)
    );
    const remainingRefundableMinor = subtractMinorUnits(
      donation.amountMinor,
      sumMinorUnits([donation.refundedAmountMinor, inFlightMinor])
    );

    if (input.amountMinor > remainingRefundableMinor) {
      throw new ValidationError(
        `Refund amount (${input.amountMinor}) exceeds remaining refundable balance (${remainingRefundableMinor} minor units)`
      );
    }

    const isPartial = input.amountMinor < subtractMinorUnits(donation.amountMinor, donation.refundedAmountMinor);

    const refund = await fundraisingRepository.createRefund({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      donationId: donation._id as mongoose.Types.ObjectId,
      idempotencyKey: input.idempotencyKey,
      requestedBy: new mongoose.Types.ObjectId(actor.id),
      amountMinor: input.amountMinor,
      currency: donation.currency,
      isPartial,
      reason: input.reason.trim(),
      provider: donation.paymentProvider,
      status: 'PENDING_APPROVAL',
      history: [
        {
          status: 'PENDING_APPROVAL',
          actorId: new mongoose.Types.ObjectId(actor.id),
          actorName: actor.name,
          actorRole: actor.role,
          notes: input.reason.trim(),
          timestamp: new Date(),
        },
      ],
    });

    await fundraisingRepository.updateDonation(input.donationId, organizationId, {
      $set: {
        refundStatus:
          donation.refundedAmountMinor > 0 ? 'PARTIALLY_REFUNDED' : 'REQUESTED',
      },
    });

    await adminService.logAudit(
      actor,
      'REFUND_REQUESTED',
      'Refund',
      refund._id.toString(),
      `Requested refund of ${input.amountMinor} ${donation.currency} minor units for ${donation.donationCode}`,
      { donationId: input.donationId, amountMinor: input.amountMinor, isPartial }
    );

    const org = await organizationRepository.findById(organizationId);
    if (org?.contactEmail && org.notificationSettings?.emailNotifications !== false) {
      const tpl = renderRefundRequestedEmail({
        recipientName: org.name,
        donationCode: donation.donationCode,
        amountMinor: input.amountMinor,
        currency: donation.currency,
        reason: input.reason.trim(),
      });
      await emailProvider.sendEmail({
        to: org.contactEmail,
        subject: tpl.subject,
        htmlContent: tpl.html,
        textContent: tpl.text,
      });
    }

    return { idempotentReplay: false, refund };
  }

  async decideRefund(
    organizationId: string,
    refundId: string,
    input: ApproveRefundInput,
    actor: AdminActor
  ) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'refunds.approve')) {
      throw new AuthorizationError('Missing refunds.approve permission');
    }

    const refund = await fundraisingRepository.findRefundById(refundId, organizationId);
    if (!refund) throw new NotFoundError('Refund request not found in this organization');

    if (!['REQUESTED', 'PENDING_APPROVAL'].includes(refund.status)) {
      throw new ValidationError(`Refund request has already been decided (${refund.status})`);
    }

    // Strict separation of duties: requester CANNOT approve their own refund!
    const requesterId =
      typeof refund.requestedBy === 'object' && '_id' in refund.requestedBy
        ? (refund.requestedBy as { _id: mongoose.Types.ObjectId })._id.toString()
        : (refund.requestedBy as mongoose.Types.ObjectId).toString();

    if (requesterId === actor.id) {
      throw new AuthorizationError('Refund requesters cannot approve or reject their own refund request');
    }

    if (input.decision === 'REJECT') {
      if (!input.rejectionReason?.trim()) {
        throw new ValidationError('Rejection reason is required when rejecting a refund');
      }
      const rejected = await fundraisingRepository.updateRefund(refundId, organizationId, {
        $set: {
          status: 'REJECTED',
          approvedBy: new mongoose.Types.ObjectId(actor.id),
          approvedAt: new Date(),
          rejectionReason: input.rejectionReason.trim(),
        },
        $push: {
          history: {
            status: 'REJECTED',
            actorId: new mongoose.Types.ObjectId(actor.id),
            actorName: actor.name,
            actorRole: actor.role,
            notes: input.rejectionReason.trim(),
            timestamp: new Date(),
          },
        },
      });

      await adminService.logAudit(
        actor,
        'REFUND_REJECTED',
        'Refund',
        refundId,
        `Rejected refund request ${refundId}`,
        { reason: input.rejectionReason.trim() }
      );
      return rejected;
    }

    // APPROVE
    const approved = await fundraisingRepository.updateRefund(refundId, organizationId, {
      $set: {
        status: 'APPROVED',
        approvedBy: new mongoose.Types.ObjectId(actor.id),
        approvedAt: new Date(),
      },
      $push: {
        history: {
          status: 'APPROVED',
          actorId: new mongoose.Types.ObjectId(actor.id),
          actorName: actor.name,
          actorRole: actor.role,
          notes: input.comments || 'Approved for financial refund processing',
          timestamp: new Date(),
        },
      },
    });

    await adminService.logAudit(
      actor,
      'REFUND_APPROVED',
      'Refund',
      refundId,
      `Approved refund of ${refund.amountMinor} ${refund.currency} minor units`
    );

    const donationIdStr =
      typeof refund.donationId === 'object' && '_id' in refund.donationId
        ? (refund.donationId as { _id: mongoose.Types.ObjectId })._id.toString()
        : (refund.donationId as mongoose.Types.ObjectId).toString();
    const donation = await fundraisingRepository.findDonationById(donationIdStr, organizationId);

    if (donation) {
      const tpl = renderRefundApprovedEmail({
        recipientName: donation.donorSnapshot.name,
        donationCode: donation.donationCode,
        amountMinor: refund.amountMinor,
        currency: refund.currency,
        approvedBy: actor.name,
      });
      await emailProvider.sendEmail({
        to: donation.donorSnapshot.email,
        subject: tpl.subject,
        htmlContent: tpl.html,
        textContent: tpl.text,
      });
    }

    if (
      input.processImmediately &&
      (actor.role === 'SUPER_ADMIN' || checkRolePermission(actor.role, 'refunds.process'))
    ) {
      return this.processApprovedRefund(organizationId, refundId, actor);
    }

    return approved;
  }

  async processApprovedRefund(organizationId: string, refundId: string, actor: AdminActor) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'refunds.process')) {
      throw new AuthorizationError('Missing refunds.process permission');
    }

    const refund = await fundraisingRepository.findRefundById(refundId, organizationId);
    if (!refund) throw new NotFoundError('Refund not found in this organization');

    if (refund.status !== 'APPROVED') {
      throw new ValidationError(
        `Only APPROVED refunds can be processed (current status: ${refund.status})`
      );
    }

    const donationIdStr =
      typeof refund.donationId === 'object' && '_id' in refund.donationId
        ? (refund.donationId as { _id: mongoose.Types.ObjectId })._id.toString()
        : (refund.donationId as mongoose.Types.ObjectId).toString();
    const donation = await fundraisingRepository.findDonationById(donationIdStr, organizationId);
    if (!donation) throw new NotFoundError('Associated donation not found');

    // Final atomic cap verification
    const remainingMinor = subtractMinorUnits(donation.amountMinor, donation.refundedAmountMinor);
    if (refund.amountMinor > remainingMinor) {
      throw new ValidationError(
        `Refund amount (${refund.amountMinor}) exceeds remaining refundable balance (${remainingMinor})`
      );
    }

    const gateway = getPaymentGateway(donation.paymentProvider);
    const isManual = donation.paymentProvider === 'UPI' || donation.paymentProvider === 'BANK_TRANSFER';

    let providerRefundId: string | undefined;
    let finalRefundStatus: 'SUCCESSFUL' | 'PROCESSING' | 'FAILED' = 'SUCCESSFUL';
    let failureReason: string | undefined;

    if (!isManual && gateway.isConfigured() && donation.paymentReference) {
      const gwRes = await gateway.initiateRefund({
        gatewayPaymentId: donation.paymentReference,
        amountMinor: refund.amountMinor,
        currency: refund.currency,
        idempotencyKey: refund.idempotencyKey,
        reason: refund.reason,
      });
      providerRefundId = gwRes.providerRefundId;
      finalRefundStatus = gwRes.status;
      failureReason = gwRes.failureReason;
    } else if (isManual) {
      const gwRes = await gateway.initiateRefund({
        gatewayPaymentId: donation.paymentReference || donation.donationCode,
        amountMinor: refund.amountMinor,
        currency: refund.currency,
        idempotencyKey: refund.idempotencyKey,
        reason: refund.reason,
      });
      providerRefundId = gwRes.providerRefundId;
      finalRefundStatus = 'SUCCESSFUL';
    } else {
      throw new ValidationError(
        `Cannot execute live refund via ${donation.paymentProvider}: payment gateway credentials are not configured.`
      );
    }

    const updatedRefund = await fundraisingRepository.updateRefund(refundId, organizationId, {
      $set: {
        status: finalRefundStatus,
        providerRefundId,
        failureReason,
        processedBy: new mongoose.Types.ObjectId(actor.id),
        processedAt: new Date(),
      },
      $push: {
        history: {
          status: finalRefundStatus,
          actorId: new mongoose.Types.ObjectId(actor.id),
          actorName: actor.name,
          actorRole: actor.role,
          notes: providerRefundId ? `Provider Refund ID: ${providerRefundId}` : failureReason,
          timestamp: new Date(),
        },
      },
    });

    if (finalRefundStatus === 'SUCCESSFUL') {
      const newRefundedTotal = sumMinorUnits([donation.refundedAmountMinor, refund.amountMinor]);
      const fullyRefunded = newRefundedTotal >= donation.amountMinor;
      const nextDonationStatus: DonationStatus = fullyRefunded ? 'REFUNDED' : 'PARTIALLY_REFUNDED';

      await fundraisingRepository.updateDonation(donationIdStr, organizationId, {
        $set: {
          refundedAmountMinor: newRefundedTotal,
          status: nextDonationStatus,
          refundStatus: fullyRefunded ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        },
      });

      await fundraisingRepository.createPaymentTransaction({
        organizationId: new mongoose.Types.ObjectId(organizationId),
        donationId: donation._id as mongoose.Types.ObjectId,
        provider: donation.paymentProvider,
        providerOrderId: donation.providerOrderId,
        providerPaymentId: providerRefundId,
        amountMinor: refund.amountMinor,
        currency: refund.currency,
        status: 'REFUNDED',
        signatureVerified: true,
        eventSource: 'REFUND',
        recordedBy: new mongoose.Types.ObjectId(actor.id),
      });

      const donorIdStr =
        typeof donation.donorId === 'object' && '_id' in donation.donorId
          ? (donation.donorId as { _id: mongoose.Types.ObjectId })._id.toString()
          : (donation.donorId as mongoose.Types.ObjectId).toString();
      await donorService.recalculateDonorMetrics(organizationId, donorIdStr);

      const tpl = renderRefundProcessedEmail({
        donorName: donation.donorSnapshot.name,
        donationCode: donation.donationCode,
        amountMinor: refund.amountMinor,
        currency: refund.currency,
        providerRefundId,
      });
      await emailProvider.sendEmail({
        to: donation.donorSnapshot.email,
        subject: tpl.subject,
        htmlContent: tpl.html,
        textContent: tpl.text,
      });
    }

    await adminService.logAudit(
      actor,
      'REFUND_PROCESSED',
      'Refund',
      refundId,
      `Processed refund ${refundId} (${finalRefundStatus})`,
      { providerRefundId, amountMinor: refund.amountMinor }
    );

    return updatedRefund;
  }

  // ======================== RECURRING DONATIONS ========================

  async createRecurringDonation(
    organizationId: string,
    input: CreateRecurringDonationInput,
    actor?: AdminActor
  ) {
    const gateway = getPaymentGateway(input.provider);
    if (!gateway.isConfigured() || !gateway.createSubscription) {
      throw new ValidationError(
        `Recurring donations via ${input.provider} require configured provider credentials. No simulated recurring charges are permitted.`
      );
    }

    const donor = await donorService.findOrCreateDonorForDonation(organizationId, input.donor);
    const subRes = await gateway.createSubscription({
      planInterval: input.planInterval,
      amountMinor: input.amountMinor,
      currency: input.currency,
      customer: {
        name: donor.name,
        email: donor.email,
        contact: donor.phone,
      },
      notes: {
        organizationId,
        purpose: input.purpose,
      },
    });

    const record = await fundraisingRepository.createRecurringDonation({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      donorId: donor._id as mongoose.Types.ObjectId,
      campaignId:
        input.campaignId && mongoose.Types.ObjectId.isValid(input.campaignId)
          ? new mongoose.Types.ObjectId(input.campaignId)
          : undefined,
      provider: input.provider,
      providerSubscriptionId: subRes.providerSubscriptionId,
      providerMandateId: subRes.providerMandateId,
      planInterval: input.planInterval,
      amountMinor: input.amountMinor,
      currency: input.currency,
      status: subRes.status,
      isAnonymous: input.isAnonymous ?? false,
      purpose: input.purpose,
      createdBy: actor ? new mongoose.Types.ObjectId(actor.id) : undefined,
    });

    const org = await organizationRepository.findById(organizationId);
    const tpl = renderRecurringConfirmationEmail({
      donorName: donor.name,
      planInterval: input.planInterval,
      amountMinor: input.amountMinor,
      currency: input.currency,
      provider: input.provider,
      organizationName: org?.name || 'HopeHorizon Foundation',
    });
    await emailProvider.sendEmail({
      to: donor.email,
      subject: tpl.subject,
      htmlContent: tpl.html,
      textContent: tpl.text,
    });

    if (actor) {
      await adminService.logAudit(
        actor,
        'RECURRING_DONATION_CREATE',
        'RecurringDonation',
        record._id.toString(),
        `Created ${input.planInterval} recurring mandate via ${input.provider}`
      );
    }

    return { recurringDonation: record, checkoutUrl: subRes.checkoutUrl };
  }

  async updateRecurringDonation(
    organizationId: string,
    id: string,
    input: UpdateRecurringDonationInput,
    actor: AdminActor
  ) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'donations.manage')) {
      throw new AuthorizationError('Missing donations.manage permission');
    }

    const recurring = await fundraisingRepository.findRecurringById(id, organizationId);
    if (!recurring) throw new NotFoundError('Recurring donation plan not found in this organization');

    if (recurring.status === 'CANCELLED' || recurring.status === 'COMPLETED') {
      throw new ValidationError(`Recurring donation is already ${recurring.status}`);
    }

    const $set: Record<string, unknown> = {};
    if (input.action === 'PAUSE') {
      $set.status = 'PAUSED';
      $set.pausedAt = new Date();
    } else if (input.action === 'RESUME') {
      if (recurring.status !== 'PAUSED') {
        throw new ValidationError('Only PAUSED recurring donations can be resumed');
      }
      $set.status = 'ACTIVE';
      $set.pausedAt = null;
    } else if (input.action === 'CANCEL') {
      const gateway = getPaymentGateway(recurring.provider);
      if (recurring.providerSubscriptionId && gateway.isConfigured() && gateway.cancelSubscription) {
        await gateway.cancelSubscription(recurring.providerSubscriptionId).catch(() => null);
      }
      $set.status = 'CANCELLED';
      $set.cancelledAt = new Date();
      $set.cancellationReason = input.reason || 'Cancelled by authorized administrator';
    }

    const updated = await fundraisingRepository.updateRecurringDonation(id, organizationId, { $set });
    const donorIdStr =
      typeof recurring.donorId === 'object' && '_id' in recurring.donorId
        ? (recurring.donorId as { _id: mongoose.Types.ObjectId })._id.toString()
        : (recurring.donorId as mongoose.Types.ObjectId).toString();
    await donorService.recalculateDonorMetrics(organizationId, donorIdStr);

    await adminService.logAudit(
      actor,
      `RECURRING_DONATION_${input.action}`,
      'RecurringDonation',
      id,
      `${input.action} recurring donation plan ${id}`
    );

    return updated;
  }

  async recordRecurringCycleFailure(
    organizationId: string,
    recurringId: string,
    reason: string
  ) {
    const recurring = await fundraisingRepository.findRecurringById(recurringId, organizationId);
    if (!recurring) return null;

    const updated = await fundraisingRepository.updateRecurringDonation(recurringId, organizationId, {
      $set: { status: 'FAILED' },
      $inc: { failedCycles: 1 },
    });

    const donor =
      typeof recurring.donorId === 'object' && 'email' in recurring.donorId
        ? (recurring.donorId as unknown as { name: string; email: string })
        : null;
    if (donor?.email) {
      const tpl = renderRecurringFailureEmail({
        donorName: donor.name,
        planInterval: recurring.planInterval,
        amountMinor: recurring.amountMinor,
        currency: recurring.currency,
        reason,
      });
      await emailProvider.sendEmail({
        to: donor.email,
        subject: tpl.subject,
        htmlContent: tpl.html,
        textContent: tpl.text,
      });
    }
    return updated;
  }

  // ======================== LISTING & DETAIL QUERIES ========================

  async listDonations(
    organizationId: string,
    filter: DonationFilterOptions = {},
    pagination: { page?: number; limit?: number } = {}
  ) {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(100, Math.max(1, pagination.limit || 20));
    const [donations, total] = await Promise.all([
      fundraisingRepository.findDonations(organizationId, filter, { page, limit }),
      fundraisingRepository.countDonations(organizationId, filter),
    ]);
    return {
      donations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getDonationDetail(organizationId: string, id: string) {
    const donation = await fundraisingRepository.findDonationById(id, organizationId);
    if (!donation) throw new NotFoundError('Donation not found in this organization');

    const [transactions, attempts, receipts, refunds] = await Promise.all([
      fundraisingRepository.findTransactionsByDonation(organizationId, id),
      fundraisingRepository.findAttemptsByDonation(organizationId, id),
      fundraisingRepository.findReceipts(organizationId, { donationId: id }, { page: 1, limit: 10 }),
      fundraisingRepository.findRefundsByDonation(organizationId, id),
    ]);

    return {
      donation,
      transactions,
      attempts,
      receipts,
      refunds,
    };
  }

  async getPaymentMonitoringOverview(organizationId: string) {
    const [transactions, webhooks, pendingDonations] = await Promise.all([
      fundraisingRepository.findRecentTransactions(organizationId, 40),
      fundraisingRepository.findRecentWebhookEvents(organizationId, 30),
      fundraisingRepository.findDonations(
        organizationId,
        { status: 'PENDING' },
        { page: 1, limit: 30 }
      ),
    ]);

    return {
      providers: getPaymentProviderStatuses(),
      recentTransactions: transactions,
      recentWebhooks: webhooks,
      pendingManualAndGateway: pendingDonations,
    };
  }

  // ======================== FUNDRAISING ANALYTICS ========================

  async getFundraisingAnalytics(organizationId: string) {
    await connectToDatabase();
    const orgObjId = new mongoose.Types.ObjectId(organizationId);

    const [
      statusBuckets,
      monthlyAgg,
      dailyAgg,
      yearlyAgg,
      methodAgg,
      campaignAgg,
      donorStats,
      activeCampaignsCount,
      recurringStats,
    ] = await Promise.all([
      Donation.aggregate([
        { $match: { organizationId: orgObjId } },
        {
          $group: {
            _id: '$status',
            amountMinor: { $sum: '$amountMinor' },
            refundedAmountMinor: { $sum: '$refundedAmountMinor' },
            count: { $sum: 1 },
          },
        },
      ]),
      // Monthly verified net trends (last 12 months)
      Donation.aggregate([
        {
          $match: {
            organizationId: orgObjId,
            status: { $in: ['SUCCESSFUL', 'PARTIALLY_REFUNDED', 'REFUNDED'] },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            grossMinor: { $sum: '$amountMinor' },
            refundedMinor: { $sum: '$refundedAmountMinor' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 12 },
      ]),
      // Daily trends (last 14 days)
      Donation.aggregate([
        {
          $match: {
            organizationId: orgObjId,
            status: { $in: ['SUCCESSFUL', 'PARTIALLY_REFUNDED', 'REFUNDED'] },
            createdAt: { $gte: new Date(Date.now() - 14 * 86400000) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            grossMinor: { $sum: '$amountMinor' },
            refundedMinor: { $sum: '$refundedAmountMinor' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // Yearly trends
      Donation.aggregate([
        {
          $match: {
            organizationId: orgObjId,
            status: { $in: ['SUCCESSFUL', 'PARTIALLY_REFUNDED', 'REFUNDED'] },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y', date: '$createdAt' } },
            grossMinor: { $sum: '$amountMinor' },
            refundedMinor: { $sum: '$refundedAmountMinor' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // Payment method distribution (verified only)
      Donation.aggregate([
        {
          $match: {
            organizationId: orgObjId,
            status: { $in: ['SUCCESSFUL', 'PARTIALLY_REFUNDED'] },
          },
        },
        {
          $group: {
            _id: '$paymentProvider',
            grossMinor: { $sum: '$amountMinor' },
            refundedMinor: { $sum: '$refundedAmountMinor' },
            count: { $sum: 1 },
          },
        },
        { $sort: { grossMinor: -1 } },
      ]),
      // Campaign-wise fundraising breakdown
      Donation.aggregate([
        {
          $match: {
            organizationId: orgObjId,
            campaignId: { $exists: true, $ne: null },
            status: { $in: ['SUCCESSFUL', 'PARTIALLY_REFUNDED'] },
          },
        },
        {
          $group: {
            _id: '$campaignId',
            grossMinor: { $sum: '$amountMinor' },
            refundedMinor: { $sum: '$refundedAmountMinor' },
            donationCount: { $sum: 1 },
            uniqueDonors: { $addToSet: '$donorId' },
          },
        },
        { $sort: { grossMinor: -1 } },
        { $limit: 12 },
      ]),
      // Donor retention & first-time vs repeat
      Donor.aggregate([
        { $match: { organizationId: orgObjId } },
        {
          $group: {
            _id: null,
            totalDonors: { $sum: 1 },
            donorsWithVerifiedDonations: {
              $sum: { $cond: [{ $gte: ['$donationCount', 1] }, 1, 0] },
            },
            firstTimeDonors: {
              $sum: { $cond: [{ $eq: ['$donationCount', 1] }, 1, 0] },
            },
            repeatDonors: {
              $sum: { $cond: [{ $gte: ['$donationCount', 2] }, 1, 0] },
            },
            majorDonors: {
              $sum: { $cond: [{ $gte: ['$lifetimeAmountMinor', 5000000] }, 1, 0] },
            },
          },
        },
      ]),
      Campaign.countDocuments({
        organizationId: orgObjId,
        status: 'ACTIVE',
        isDeleted: { $ne: true },
      }),
      RecurringDonation.aggregate([
        { $match: { organizationId: orgObjId, status: 'ACTIVE' } },
        {
          $group: {
            _id: null,
            activeCount: { $sum: 1 },
            committedAmountMinor: { $sum: '$amountMinor' },
          },
        },
      ]),
    ]);

    const syntheticRecords = statusBuckets.map((b) => ({
      status: b._id as DonationStatus,
      amountMinor: Math.trunc(b.amountMinor || 0),
      refundedAmountMinor: Math.trunc(b.refundedAmountMinor || 0),
    }));
    const totals = computeFinancialTotalsFromRecords(syntheticRecords);
    const totalSuccessfulCount = statusBuckets
      .filter((b) => ['SUCCESSFUL', 'PARTIALLY_REFUNDED', 'REFUNDED'].includes(String(b._id)))
      .reduce((acc, b) => acc + Math.trunc(b.count || 0), 0);
    const totalPendingCount = statusBuckets
      .filter((b) => ['PENDING', 'INITIATED'].includes(String(b._id)))
      .reduce((acc, b) => acc + Math.trunc(b.count || 0), 0);
    const totalFailedCount = statusBuckets
      .filter((b) => ['FAILED', 'CANCELLED'].includes(String(b._id)))
      .reduce((acc, b) => acc + Math.trunc(b.count || 0), 0);

    // Enrich campaign breakdown with titles & targets
    const campaignIds = campaignAgg.map((c) => c._id);
    const campaignDocs =
      campaignIds.length > 0
        ? await Campaign.find({ _id: { $in: campaignIds }, organizationId: orgObjId }).select(
            'title code targetAmountMinor status currency'
          )
        : [];
    const campaignById = new Map(campaignDocs.map((c) => [c._id.toString(), c]));

    const dStats = donorStats[0] || {
      totalDonors: 0,
      donorsWithVerifiedDonations: 0,
      firstTimeDonors: 0,
      repeatDonors: 0,
      majorDonors: 0,
    };
    const retentionRate = calculateMinorPercentage(
      dStats.repeatDonors || 0,
      dStats.donorsWithVerifiedDonations || 0
    );

    const recStats = recurringStats[0] || { activeCount: 0, committedAmountMinor: 0 };

    return {
      currency: 'INR',
      overview: {
        grossSuccessfulMinor: totals.grossSuccessfulMinor,
        pendingAmountMinor: totals.pendingAmountMinor,
        failedAmountMinor: totals.failedAmountMinor,
        refundedAmountMinor: totals.refundedAmountMinor,
        netDonationsMinor: totals.netDonationsMinor,
        successfulDonationCount: totalSuccessfulCount,
        pendingDonationCount: totalPendingCount,
        failedDonationCount: totalFailedCount,
        averageDonationMinor:
          totalSuccessfulCount > 0 ? Math.round(totals.grossSuccessfulMinor / totalSuccessfulCount) : 0,
        activeCampaignsCount,
        activeRecurringCount: Math.trunc(recStats.activeCount || 0),
        activeRecurringCommittedMinor: Math.trunc(recStats.committedAmountMinor || 0),
      },
      donorInsights: {
        totalDonors: Math.trunc(dStats.totalDonors || 0),
        donorsWithVerifiedDonations: Math.trunc(dStats.donorsWithVerifiedDonations || 0),
        firstTimeDonors: Math.trunc(dStats.firstTimeDonors || 0),
        repeatDonors: Math.trunc(dStats.repeatDonors || 0),
        majorDonors: Math.trunc(dStats.majorDonors || 0),
        retentionPercentage: retentionRate,
      },
      trends: {
        monthly: monthlyAgg.map((m) => {
          const gross = Math.trunc(m.grossMinor || 0);
          const refunded = Math.trunc(m.refundedMinor || 0);
          return {
            period: String(m._id),
            grossMinor: gross,
            refundedMinor: refunded,
            netMinor: Math.max(0, gross - refunded),
            count: Math.trunc(m.count || 0),
          };
        }),
        daily: dailyAgg.map((d) => {
          const gross = Math.trunc(d.grossMinor || 0);
          const refunded = Math.trunc(d.refundedMinor || 0);
          return {
            period: String(d._id),
            grossMinor: gross,
            refundedMinor: refunded,
            netMinor: Math.max(0, gross - refunded),
            count: Math.trunc(d.count || 0),
          };
        }),
        yearly: yearlyAgg.map((y) => {
          const gross = Math.trunc(y.grossMinor || 0);
          const refunded = Math.trunc(y.refundedMinor || 0);
          return {
            period: String(y._id),
            grossMinor: gross,
            refundedMinor: refunded,
            netMinor: Math.max(0, gross - refunded),
            count: Math.trunc(y.count || 0),
          };
        }),
      },
      paymentMethods: methodAgg.map((pm) => {
        const gross = Math.trunc(pm.grossMinor || 0);
        const refunded = Math.trunc(pm.refundedMinor || 0);
        return {
          provider: String(pm._id) as PaymentProviderType,
          grossMinor: gross,
          netMinor: Math.max(0, gross - refunded),
          count: Math.trunc(pm.count || 0),
        };
      }),
      campaignBreakdown: campaignAgg.map((cb) => {
        const doc = campaignById.get(String(cb._id));
        const gross = Math.trunc(cb.grossMinor || 0);
        const refunded = Math.trunc(cb.refundedMinor || 0);
        const net = Math.max(0, gross - refunded);
        const target = Math.trunc(doc?.targetAmountMinor || 0);
        return {
          campaignId: String(cb._id),
          title: doc?.title || 'Campaign',
          code: doc?.code || '',
          status: doc?.status || 'ACTIVE',
          targetAmountMinor: target,
          netRaisedMinor: net,
          progressPercentage: Math.min(100, calculateMinorPercentage(net, target)),
          donationCount: Math.trunc(cb.donationCount || 0),
          donorCount: Array.isArray(cb.uniqueDonors) ? cb.uniqueDonors.length : 0,
        };
      }),
      providers: getPaymentProviderStatuses(),
    };
  }
}

export const donationPaymentService = new DonationPaymentService();
