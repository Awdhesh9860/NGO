import {
  CreateOrderParams,
  GatewayConfigStatus,
  IEnterprisePaymentGateway,
  OrderStatusResult,
  PaymentOrderResult,
  RefundGatewayParams,
  RefundGatewayResult,
  VerifyPaymentParams,
} from './payment.adapter';
import { ValidationError } from '@/lib/error-handler';

/**
 * Manual Verifiable Payment Provider for UPI & Bank Transfer (NEFT/RTGS/IMPS).
 * SECURITY INVARIANT:
 * - Creating a UPI or Bank Transfer order NEVER marks a donation SUCCESSFUL.
 * - Donor submission of a UTR / UPI reference / proof URL ALWAYS leaves the donation PENDING.
 * - Only authorized NGO finance/admin staff with `donations.verify` can verify or reject it.
 */
export class ManualPaymentProvider implements IEnterprisePaymentGateway {
  readonly providerName: 'UPI' | 'BANK_TRANSFER';

  constructor(providerName: 'UPI' | 'BANK_TRANSFER') {
    this.providerName = providerName;
  }

  isConfigured(): boolean {
    return true;
  }

  getStatus(): GatewayConfigStatus {
    return {
      provider: this.providerName,
      configured: true,
      mode: 'MANUAL',
      supportsOnlineCheckout: false,
      supportsRecurring: false,
      supportsAutomatedRefunds: false,
      note:
        this.providerName === 'UPI'
          ? 'Manual UPI verification workflow. Donations remain PENDING until finance verifies the UTR reference.'
          : 'Manual Bank Transfer (NEFT/RTGS/IMPS) workflow. Donations remain PENDING until finance reconciles bank credit.',
    };
  }

  async createOrder(params: CreateOrderParams): Promise<PaymentOrderResult> {
    if (!Number.isInteger(params.amount) || params.amount <= 0) {
      throw new ValidationError('Order amount must be a positive integer in minor currency units');
    }

    const prefix = this.providerName === 'UPI' ? 'UPI' : 'BANK';
    const gatewayOrderId = `${prefix}-${params.receiptId}`;

    const paymentInstructions: Record<string, string> =
      this.providerName === 'UPI'
        ? {
            method: 'UPI',
            upiId: process.env.NGO_UPI_ID || 'Contact NGO finance for verified UPI VPA',
            referenceCode: gatewayOrderId,
            notice:
              'Submitting your UTR/UPI transaction reference puts your donation in PENDING verification until finance confirms bank settlement.',
          }
        : {
            method: 'BANK_TRANSFER',
            accountName: process.env.NGO_BANK_ACCOUNT_NAME || 'HopeHorizon Foundation',
            accountNumber: process.env.NGO_BANK_ACCOUNT_NUMBER || 'Configured in Organization Settings',
            ifscCode: process.env.NGO_BANK_IFSC || 'Configured in Organization Settings',
            referenceCode: gatewayOrderId,
            notice:
              'Include the reference code in transfer remarks. Bank transfers remain PENDING until verified by an authorized accountant.',
          };

    return {
      gatewayOrderId,
      amount: params.amount,
      currency: params.currency.toUpperCase(),
      manualVerificationRequired: true,
      paymentInstructions,
      mode: 'MANUAL',
      notes: params.notes,
    };
  }

  /**
   * Manual UPI/Bank transfers can NEVER be auto-verified by donor checkout submission.
   */
  async verifyPayment(params: VerifyPaymentParams): Promise<boolean> {
    void params;
    return false;
  }

  verifyWebhookSignature(rawBody: string, signatureHeader: string): boolean {
    void rawBody;
    void signatureHeader;
    return false;
  }

  async fetchPaymentDetails(paymentId: string): Promise<Record<string, unknown>> {
    return {
      provider: this.providerName,
      paymentReference: paymentId,
      verificationMode: 'MANUAL_STAFF_REQUIRED',
    };
  }

  async fetchOrderStatus(gatewayOrderId: string): Promise<OrderStatusResult> {
    return {
      gatewayOrderId,
      status: 'PENDING',
      rawStatus: 'pending_manual_verification',
    };
  }

  async initiateRefund(params: RefundGatewayParams): Promise<RefundGatewayResult> {
    return {
      providerRefundId: `MANUAL-REF-${params.idempotencyKey.slice(0, 16).toUpperCase()}`,
      status: 'PROCESSING',
      rawStatus: 'manual_bank_payout_required',
    };
  }
}

export const upiPaymentProvider = new ManualPaymentProvider('UPI');
export const bankTransferPaymentProvider = new ManualPaymentProvider('BANK_TRANSFER');
