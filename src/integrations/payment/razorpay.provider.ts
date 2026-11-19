import crypto from 'crypto';
import Razorpay from 'razorpay';
import {
  CreateOrderParams,
  CreateSubscriptionParams,
  GatewayConfigStatus,
  IEnterprisePaymentGateway,
  OrderStatusResult,
  PaymentOrderResult,
  RefundGatewayParams,
  RefundGatewayResult,
  SubscriptionGatewayResult,
  VerifyPaymentParams,
} from './payment.adapter';
import { ValidationError } from '@/lib/error-handler';

/**
 * Timing-safe HMAC-SHA256 verification for Razorpay Checkout payment callback.
 * Spec: hmac_sha256(order_id + "|" + payment_id, key_secret)
 */
export function verifyRazorpayCheckoutSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  keySecret: string
): boolean {
  if (!orderId || !paymentId || !signature || !keySecret) return false;
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const expectedBuf = Buffer.from(expected, 'utf8');
  const receivedBuf = Buffer.from(signature.trim(), 'utf8');
  if (expectedBuf.length !== receivedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}

/**
 * Timing-safe HMAC-SHA256 verification for Razorpay Webhooks (`X-Razorpay-Signature`).
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  webhookSecret: string
): boolean {
  if (!rawBody || !signatureHeader || !webhookSecret) return false;
  const expected = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody, 'utf8')
    .digest('hex');

  const expectedBuf = Buffer.from(expected, 'utf8');
  const receivedBuf = Buffer.from(signatureHeader.trim(), 'utf8');
  if (expectedBuf.length !== receivedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}

export class RazorpayPaymentProvider implements IEnterprisePaymentGateway {
  readonly providerName = 'RAZORPAY' as const;

  private getKeyId(): string {
    return (process.env.RAZORPAY_KEY_ID || '').trim();
  }

  private getKeySecret(): string {
    return (process.env.RAZORPAY_KEY_SECRET || '').trim();
  }

  private getWebhookSecret(): string {
    return (process.env.RAZORPAY_WEBHOOK_SECRET || this.getKeySecret()).trim();
  }

  isConfigured(): boolean {
    return Boolean(this.getKeyId() && this.getKeySecret());
  }

  getStatus(): GatewayConfigStatus {
    const keyId = this.getKeyId();
    const configured = this.isConfigured();
    const mode = !configured
      ? 'UNCONFIGURED'
      : keyId.startsWith('rzp_live_')
      ? 'LIVE'
      : 'TEST';

    return {
      provider: 'RAZORPAY',
      configured,
      mode,
      supportsOnlineCheckout: configured,
      supportsRecurring: configured,
      supportsAutomatedRefunds: configured,
      note: configured
        ? `Razorpay ${mode === 'LIVE' ? 'live' : 'test/sandbox'} credentials detected.`
        : 'Razorpay credentials (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are not configured in environment.',
    };
  }

  private getClient(): Razorpay {
    if (!this.isConfigured()) {
      throw new ValidationError(
        'Razorpay payment gateway is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.'
      );
    }
    return new Razorpay({
      key_id: this.getKeyId(),
      key_secret: this.getKeySecret(),
    });
  }

  async createOrder(params: CreateOrderParams): Promise<PaymentOrderResult> {
    if (!Number.isInteger(params.amount) || params.amount <= 0) {
      throw new ValidationError('Order amount must be a positive integer in minor currency units');
    }

    const client = this.getClient();
    const order = await client.orders.create({
      amount: params.amount,
      currency: params.currency.toUpperCase(),
      receipt: params.receiptId.slice(0, 40),
      notes: {
        ...(params.notes || {}),
        customerEmail: params.customer.email,
        customerName: params.customer.name,
      },
    });

    return {
      gatewayOrderId: String(order.id),
      amount: Number(order.amount),
      currency: String(order.currency).toUpperCase(),
      keyId: this.getKeyId(),
      mode: this.getStatus().mode,
      notes: params.notes,
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<boolean> {
    const secret = this.getKeySecret();
    if (!secret) return false;
    return verifyRazorpayCheckoutSignature(
      params.gatewayOrderId,
      params.gatewayPaymentId,
      params.gatewaySignature,
      secret
    );
  }

  verifyWebhookSignature(rawBody: string, signatureHeader: string): boolean {
    const secret = this.getWebhookSecret();
    if (!secret) return false;
    return verifyRazorpayWebhookSignature(rawBody, signatureHeader, secret);
  }

  async fetchPaymentDetails(paymentId: string): Promise<Record<string, unknown>> {
    const client = this.getClient();
    const payment = await client.payments.fetch(paymentId);
    return payment as unknown as Record<string, unknown>;
  }

  async fetchOrderStatus(gatewayOrderId: string): Promise<OrderStatusResult> {
    const client = this.getClient();
    const order = (await client.orders.fetch(gatewayOrderId)) as unknown as Record<string, unknown>;
    const payments = (await client.orders.fetchPayments(gatewayOrderId)) as unknown as {
      items?: Array<Record<string, unknown>>;
    };
    const captured = payments?.items?.find((p) => p.status === 'captured');
    const failed = payments?.items?.find((p) => p.status === 'failed');

    if (captured) {
      return {
        gatewayOrderId,
        gatewayPaymentId: String(captured.id),
        status: 'SUCCESSFUL',
        amountMinor: Number(captured.amount || order.amount || 0),
        currency: String(captured.currency || order.currency || 'INR').toUpperCase(),
        rawStatus: 'captured',
      };
    }

    if (failed && order.status !== 'paid') {
      return {
        gatewayOrderId,
        gatewayPaymentId: String(failed.id),
        status: 'FAILED',
        amountMinor: Number(order.amount || 0),
        currency: String(order.currency || 'INR').toUpperCase(),
        rawStatus: 'failed',
      };
    }

    return {
      gatewayOrderId,
      status: order.status === 'paid' ? 'SUCCESSFUL' : 'PENDING',
      amountMinor: Number(order.amount || 0),
      currency: String(order.currency || 'INR').toUpperCase(),
      rawStatus: String(order.status || 'created'),
    };
  }

  async initiateRefund(params: RefundGatewayParams): Promise<RefundGatewayResult> {
    if (!Number.isInteger(params.amountMinor) || params.amountMinor <= 0) {
      throw new ValidationError('Refund amount must be a positive integer in minor units');
    }
    const client = this.getClient();
    const refund = (await client.payments.refund(params.gatewayPaymentId, {
      amount: params.amountMinor,
      receipt: params.idempotencyKey.slice(0, 40),
      notes: {
        ...(params.notes || {}),
        reason: params.reason || 'Authorized NGO refund',
      },
    })) as unknown as Record<string, unknown>;

    const rawStatus = String(refund.status || 'processed');
    return {
      providerRefundId: String(refund.id),
      status:
        rawStatus === 'processed'
          ? 'SUCCESSFUL'
          : rawStatus === 'failed'
          ? 'FAILED'
          : 'PROCESSING',
      rawStatus,
    };
  }

  async createSubscription(params: CreateSubscriptionParams): Promise<SubscriptionGatewayResult> {
    const client = this.getClient();
    const periodMap: Record<CreateSubscriptionParams['planInterval'], { period: 'monthly' | 'yearly'; interval: number }> = {
      MONTHLY: { period: 'monthly', interval: 1 },
      QUARTERLY: { period: 'monthly', interval: 3 },
      YEARLY: { period: 'yearly', interval: 1 },
    };
    const { period, interval } = periodMap[params.planInterval];

    const plan = (await client.plans.create({
      period,
      interval,
      item: {
        name: `NGO Recurring Support (${params.planInterval})`,
        amount: params.amountMinor,
        currency: params.currency.toUpperCase(),
      },
    })) as unknown as Record<string, unknown>;

    const subscription = (await client.subscriptions.create({
      plan_id: String(plan.id),
      total_count: params.planInterval === 'YEARLY' ? 10 : 60,
      customer_notify: 1,
      notes: {
        ...(params.notes || {}),
        donorEmail: params.customer.email,
      },
    })) as unknown as Record<string, unknown>;

    return {
      providerSubscriptionId: String(subscription.id),
      checkoutUrl: subscription.short_url ? String(subscription.short_url) : undefined,
      status: 'CREATED',
    };
  }

  async cancelSubscription(providerSubscriptionId: string): Promise<{ cancelled: boolean; rawStatus: string }> {
    const client = this.getClient();
    const cancelled = (await client.subscriptions.cancel(providerSubscriptionId, false)) as unknown as Record<
      string,
      unknown
    >;
    return {
      cancelled: String(cancelled.status || '') === 'cancelled',
      rawStatus: String(cancelled.status || 'unknown'),
    };
  }
}

export const razorpayPaymentProvider = new RazorpayPaymentProvider();
