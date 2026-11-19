import { ApiResponse } from '@/lib/api-response';
import {
  ApproveRefundInput,
  CreatePaymentOrderInput,
  CreateRecurringDonationInput,
  ManualDonationVerificationInput,
  RequestRefundInput,
  UpdateRecurringDonationInput,
  VerifyPaymentInput,
} from '../schemas/donation.schema';
import { GatewayConfigStatus } from '@/integrations/payment/payment.adapter';

export interface DonationRecordItem {
  _id: string;
  donationCode: string;
  idempotencyKey: string;
  amountMinor: number;
  refundedAmountMinor: number;
  currency: string;
  donationType: 'ONE_TIME' | 'RECURRING';
  paymentProvider: 'RAZORPAY' | 'STRIPE' | 'UPI' | 'BANK_TRANSFER';
  providerOrderId?: string;
  paymentReference?: string;
  manualProofUrl?: string;
  paymentStatus: string;
  status: string;
  isAnonymous: boolean;
  donorId?: { _id: string; name: string; email: string } | string;
  campaignId?: { _id: string; title: string; slug: string; code: string } | string;
  donorSnapshot: {
    name: string;
    email: string;
    phone?: string;
    panNumber?: string;
    address?: string;
  };
  purpose: string;
  receiptStatus: 'NOT_ISSUED' | 'ISSUED' | 'CANCELLED';
  refundStatus: 'NONE' | 'REQUESTED' | 'PARTIALLY_REFUNDED' | 'REFUNDED';
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface ReceiptRecordItem {
  _id: string;
  donationId: string;
  receiptNumber: string;
  organizationSnapshot: {
    name: string;
    legalName?: string;
    address?: string;
    panNumber?: string;
    registrationNumber?: string;
    contactEmail?: string;
  };
  donorSnapshot: {
    name: string;
    email: string;
    address?: string;
    panNumber?: string;
  };
  amountMinor: number;
  currency: string;
  donationDate: string;
  paymentProvider: string;
  paymentReference: string;
  purpose: string;
  taxBenefitEligible: boolean;
  taxEligibilityReason: string;
  verifiedStatutorySnapshot?: {
    section80GNumber?: string;
    section80GValidFrom?: string;
    section80GValidTo?: string;
    section12ANumber?: string;
    taxExemptionPercentage?: number;
  };
  status: 'ISSUED' | 'CANCELLED';
  issuedAt: string;
  cancelledReason?: string;
  cancelledAt?: string;
}

export interface RefundRecordItem {
  _id: string;
  donationId:
    | {
        _id: string;
        donationCode: string;
        amountMinor: number;
        refundedAmountMinor: number;
        currency: string;
        paymentProvider: string;
        status: string;
      }
    | string;
  idempotencyKey: string;
  requestedBy?: { _id: string; name: string; email: string; role: string } | string;
  approvedBy?: { _id: string; name: string; email: string; role: string } | string;
  amountMinor: number;
  currency: string;
  isPartial: boolean;
  reason: string;
  provider: string;
  providerRefundId?: string;
  status: string;
  rejectionReason?: string;
  failureReason?: string;
  history: Array<{
    status: string;
    actorName: string;
    actorRole: string;
    notes?: string;
    timestamp: string;
  }>;
  createdAt: string;
  processedAt?: string;
}

export interface RecurringDonationItem {
  _id: string;
  donorId?: { _id: string; name: string; email: string } | string;
  campaignId?: { _id: string; title: string; slug: string } | string;
  provider: 'RAZORPAY' | 'STRIPE';
  providerSubscriptionId?: string;
  planInterval: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  amountMinor: number;
  currency: string;
  status: string;
  nextPaymentAt?: string | null;
  completedCycles: number;
  failedCycles: number;
  purpose: string;
  createdAt: string;
}

export interface FundraisingAnalyticsData {
  currency: string;
  overview: {
    grossSuccessfulMinor: number;
    pendingAmountMinor: number;
    failedAmountMinor: number;
    refundedAmountMinor: number;
    netDonationsMinor: number;
    successfulDonationCount: number;
    pendingDonationCount: number;
    failedDonationCount: number;
    averageDonationMinor: number;
    activeCampaignsCount: number;
    activeRecurringCount: number;
    activeRecurringCommittedMinor: number;
  };
  donorInsights: {
    totalDonors: number;
    donorsWithVerifiedDonations: number;
    firstTimeDonors: number;
    repeatDonors: number;
    majorDonors: number;
    retentionPercentage: number;
  };
  trends: {
    monthly: Array<{ period: string; grossMinor: number; refundedMinor: number; netMinor: number; count: number }>;
    daily: Array<{ period: string; grossMinor: number; refundedMinor: number; netMinor: number; count: number }>;
    yearly: Array<{ period: string; grossMinor: number; refundedMinor: number; netMinor: number; count: number }>;
  };
  paymentMethods: Array<{
    provider: string;
    grossMinor: number;
    netMinor: number;
    count: number;
  }>;
  campaignBreakdown: Array<{
    campaignId: string;
    title: string;
    code: string;
    status: string;
    targetAmountMinor: number;
    netRaisedMinor: number;
    progressPercentage: number;
    donationCount: number;
    donorCount: number;
  }>;
  providers: GatewayConfigStatus[];
}

export interface PaymentMonitoringOverview {
  providers: GatewayConfigStatus[];
  recentTransactions: Array<{
    _id: string;
    donationId?: { _id: string; donationCode: string; status: string } | string;
    provider: string;
    providerOrderId?: string;
    providerPaymentId?: string;
    amountMinor: number;
    currency: string;
    status: string;
    signatureVerified: boolean;
    eventSource: string;
    failureReason?: string;
    createdAt: string;
  }>;
  recentWebhooks: Array<{
    _id: string;
    provider: string;
    providerEventId: string;
    eventType: string;
    signatureValid: boolean;
    processingStatus: string;
    outOfOrder: boolean;
    createdAt: string;
  }>;
  pendingManualAndGateway: DonationRecordItem[];
}

export class DonationApiService {
  private async fetchJson<T>(url: string, init?: RequestInit): Promise<ApiResponse<T>> {
    const res = await fetch(url, {
      ...init,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    });
    return await res.json();
  }

  async listDonations(params: {
    page?: number;
    limit?: number;
    status?: string;
    paymentProvider?: string;
    campaignId?: string;
    search?: string;
  } = {}): Promise<ApiResponse<DonationRecordItem[]>> {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.status) q.set('status', params.status);
    if (params.paymentProvider) q.set('paymentProvider', params.paymentProvider);
    if (params.campaignId) q.set('campaignId', params.campaignId);
    if (params.search) q.set('search', params.search);
    return this.fetchJson<DonationRecordItem[]>(`/api/v1/donations?${q.toString()}`);
  }

  async getDonationDetail(id: string): Promise<
    ApiResponse<{
      donation: DonationRecordItem;
      transactions: PaymentMonitoringOverview['recentTransactions'];
      attempts: Array<{ _id: string; attemptNumber: number; status: string; provider: string; createdAt: string }>;
      receipts: ReceiptRecordItem[];
      refunds: RefundRecordItem[];
    }>
  > {
    return this.fetchJson(`/api/v1/donations/${id}`);
  }

  async verifyManualDonation(
    id: string,
    data: ManualDonationVerificationInput
  ): Promise<ApiResponse<{ donation: DonationRecordItem; receipt: ReceiptRecordItem | null }>> {
    return this.fetchJson(`/api/v1/donations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async createPaymentOrder(data: CreatePaymentOrderInput): Promise<
    ApiResponse<{
      idempotentReplay: boolean;
      donation: {
        id: string;
        donationCode: string;
        amountMinor: number;
        currency: string;
        status: string;
        paymentProvider: string;
        providerOrderId?: string;
        purpose: string;
      };
      paymentOrder: {
        gatewayOrderId: string;
        amount: number;
        currency: string;
        keyId?: string;
        checkoutUrl?: string;
        manualVerificationRequired?: boolean;
        paymentInstructions?: Record<string, string>;
        mode?: string;
      };
    }>
  > {
    return this.fetchJson('/api/v1/payments/create-order', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyPayment(data: VerifyPaymentInput): Promise<ApiResponse<unknown>> {
    return this.fetchJson('/api/v1/payments/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPublicProviderStatuses(): Promise<ApiResponse<{ providers: GatewayConfigStatus[] }>> {
    return this.fetchJson('/api/v1/payments/status?scope=providers');
  }

  async getPaymentMonitoring(): Promise<ApiResponse<PaymentMonitoringOverview>> {
    return this.fetchJson<PaymentMonitoringOverview>('/api/v1/payments/status');
  }

  async reconcilePayment(donationId: string): Promise<ApiResponse<unknown>> {
    return this.fetchJson('/api/v1/payments/reconcile', {
      method: 'POST',
      body: JSON.stringify({ donationId }),
    });
  }

  async listReceipts(status?: string): Promise<ApiResponse<ReceiptRecordItem[]>> {
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.fetchJson<ReceiptRecordItem[]>(`/api/v1/receipts${q}`);
  }

  async issueReceipt(donationId: string): Promise<ApiResponse<ReceiptRecordItem>> {
    return this.fetchJson<ReceiptRecordItem>(`/api/v1/donations/${donationId}/receipt`, {
      method: 'POST',
    });
  }

  async cancelReceipt(
    receiptId: string,
    reason: string,
    reissue = false
  ): Promise<ApiResponse<unknown>> {
    return this.fetchJson('/api/v1/receipts', {
      method: 'PATCH',
      body: JSON.stringify({ receiptId, reason, reissue }),
    });
  }

  async listRefunds(status?: string): Promise<ApiResponse<RefundRecordItem[]>> {
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.fetchJson<RefundRecordItem[]>(`/api/v1/refunds${q}`);
  }

  async requestRefund(data: RequestRefundInput): Promise<ApiResponse<unknown>> {
    return this.fetchJson('/api/v1/refunds', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async decideRefund(id: string, data: ApproveRefundInput): Promise<ApiResponse<RefundRecordItem>> {
    return this.fetchJson<RefundRecordItem>(`/api/v1/refunds/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async processRefund(id: string): Promise<ApiResponse<RefundRecordItem>> {
    return this.fetchJson<RefundRecordItem>(`/api/v1/refunds/${id}`, {
      method: 'POST',
    });
  }

  async listRecurring(status?: string): Promise<ApiResponse<RecurringDonationItem[]>> {
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.fetchJson<RecurringDonationItem[]>(`/api/v1/recurring-donations${q}`);
  }

  async createRecurring(data: CreateRecurringDonationInput): Promise<ApiResponse<unknown>> {
    return this.fetchJson('/api/v1/recurring-donations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRecurring(
    id: string,
    data: UpdateRecurringDonationInput
  ): Promise<ApiResponse<RecurringDonationItem>> {
    return this.fetchJson<RecurringDonationItem>(`/api/v1/recurring-donations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getFundraisingAnalytics(): Promise<ApiResponse<FundraisingAnalyticsData>> {
    return this.fetchJson<FundraisingAnalyticsData>('/api/v1/fundraising/analytics');
  }
}

export const donationApiService = new DonationApiService();
