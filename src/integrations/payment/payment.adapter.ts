/**
 * Payment Gateway Integration Adapter Boundary
 * Extensible contract for Razorpay, Stripe, UPI, and Bank Transfer workflows.
 * All amounts passed to and returned from gateways use integer minor currency units
 * (e.g., INR paise: ₹100.00 = 10000; USD cents: $25.00 = 2500).
 */

export type PaymentGatewayName = 'RAZORPAY' | 'STRIPE' | 'UPI' | 'BANK_TRANSFER';

export interface CreateOrderParams {
  /** Amount in integer minor currency units (e.g., paise / cents). */
  amount: number;
  currency: string;
  receiptId: string;
  idempotencyKey?: string;
  successUrl?: string;
  cancelUrl?: string;
  notes?: Record<string, string>;
  customer: {
    name: string;
    email: string;
    contact?: string;
  };
}

export interface PaymentOrderResult {
  gatewayOrderId: string;
  /** Amount in integer minor currency units. */
  amount: number;
  currency: string;
  keyId?: string;
  checkoutUrl?: string;
  clientSecret?: string;
  manualVerificationRequired?: boolean;
  paymentInstructions?: Record<string, string>;
  mode?: 'LIVE' | 'TEST' | 'MANUAL' | 'UNCONFIGURED';
  notes?: Record<string, string>;
}

export interface VerifyPaymentParams {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  gatewaySignature: string;
}

export interface RefundGatewayParams {
  gatewayPaymentId: string;
  /** Refund amount in integer minor currency units. */
  amountMinor: number;
  currency: string;
  idempotencyKey: string;
  reason?: string;
  notes?: Record<string, string>;
}

export interface RefundGatewayResult {
  providerRefundId: string;
  status: 'PROCESSING' | 'SUCCESSFUL' | 'FAILED';
  rawStatus: string;
  failureReason?: string;
}

export interface OrderStatusResult {
  gatewayOrderId: string;
  gatewayPaymentId?: string;
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'CANCELLED' | 'UNKNOWN';
  amountMinor?: number;
  currency?: string;
  rawStatus: string;
}

export interface CreateSubscriptionParams {
  planInterval: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  amountMinor: number;
  currency: string;
  customer: {
    name: string;
    email: string;
    contact?: string;
  };
  notes?: Record<string, string>;
}

export interface SubscriptionGatewayResult {
  providerSubscriptionId: string;
  providerMandateId?: string;
  checkoutUrl?: string;
  status: 'CREATED' | 'ACTIVE';
}

export interface GatewayConfigStatus {
  provider: PaymentGatewayName;
  configured: boolean;
  mode: 'LIVE' | 'TEST' | 'MANUAL' | 'UNCONFIGURED';
  supportsOnlineCheckout: boolean;
  supportsRecurring: boolean;
  supportsAutomatedRefunds: boolean;
  note: string;
}

export interface IPaymentGateway {
  createOrder(params: CreateOrderParams): Promise<PaymentOrderResult>;
  verifyPayment(params: VerifyPaymentParams): Promise<boolean>;
  fetchPaymentDetails(paymentId: string): Promise<Record<string, unknown>>;
}

export interface IEnterprisePaymentGateway extends IPaymentGateway {
  readonly providerName: PaymentGatewayName;
  getStatus(): GatewayConfigStatus;
  isConfigured(): boolean;
  verifyWebhookSignature(rawBody: string, signatureHeader: string): boolean;
  initiateRefund(params: RefundGatewayParams): Promise<RefundGatewayResult>;
  fetchOrderStatus(gatewayOrderId: string): Promise<OrderStatusResult>;
  createSubscription?(params: CreateSubscriptionParams): Promise<SubscriptionGatewayResult>;
  cancelSubscription?(providerSubscriptionId: string): Promise<{ cancelled: boolean; rawStatus: string }>;
}
