import crypto from 'crypto';
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

const STRIPE_API_BASE = 'https://api.stripe.com/v1';

/**
 * Pure Stripe `Stripe-Signature` header verification (`t=<unix>,v1=<hex_sig>`).
 * Verifies timestamp tolerance (default 5 minutes) and HMAC-SHA256 using `crypto.timingSafeEqual`.
 */
export function verifyStripeWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  webhookSecret: string,
  toleranceSeconds = 300,
  nowUnixSeconds = Math.floor(Date.now() / 1000)
): boolean {
  if (!rawBody || !signatureHeader || !webhookSecret) return false;

  const parts = signatureHeader.split(',').map((p) => p.trim());
  let timestamp: number | null = null;
  const v1Signatures: string[] = [];

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 't' && value) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) timestamp = parsed;
    } else if (key === 'v1' && value) {
      v1Signatures.push(value);
    }
  }

  if (timestamp === null || v1Signatures.length === 0) return false;
  if (Math.abs(nowUnixSeconds - timestamp) > toleranceSeconds) return false;

  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = crypto
    .createHmac('sha256', webhookSecret)
    .update(signedPayload, 'utf8')
    .digest('hex');

  const expectedBuf = Buffer.from(expected, 'utf8');

  return v1Signatures.some((sig) => {
    const receivedBuf = Buffer.from(sig, 'utf8');
    if (expectedBuf.length !== receivedBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, receivedBuf);
  });
}

export class StripePaymentProvider implements IEnterprisePaymentGateway {
  readonly providerName = 'STRIPE' as const;

  private getSecretKey(): string {
    return (process.env.STRIPE_SECRET_KEY || '').trim();
  }

  private getPublishableKey(): string {
    return (process.env.STRIPE_PUBLISHABLE_KEY || '').trim();
  }

  private getWebhookSecret(): string {
    return (process.env.STRIPE_WEBHOOK_SECRET || '').trim();
  }

  isConfigured(): boolean {
    return Boolean(this.getSecretKey());
  }

  getStatus(): GatewayConfigStatus {
    const secret = this.getSecretKey();
    const configured = this.isConfigured();
    const mode = !configured
      ? 'UNCONFIGURED'
      : secret.startsWith('sk_live_')
      ? 'LIVE'
      : 'TEST';

    return {
      provider: 'STRIPE',
      configured,
      mode,
      supportsOnlineCheckout: configured,
      supportsRecurring: configured,
      supportsAutomatedRefunds: configured,
      note: configured
        ? `Stripe ${mode === 'LIVE' ? 'live' : 'test/sandbox'} credentials detected.`
        : 'Stripe credentials (STRIPE_SECRET_KEY) are not configured in environment.',
    };
  }

  private async stripeRequest(
    path: string,
    method: 'GET' | 'POST' | 'DELETE',
    bodyParams?: Record<string, string>,
    idempotencyKey?: string
  ): Promise<Record<string, unknown>> {
    const secretKey = this.getSecretKey();
    if (!secretKey) {
      throw new ValidationError(
        'Stripe payment gateway is not configured. Set STRIPE_SECRET_KEY in environment.'
      );
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${secretKey}`,
    };
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    let body: string | undefined;
    if (bodyParams && method === 'POST') {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      body = new URLSearchParams(bodyParams).toString();
    }

    const res = await fetch(`${STRIPE_API_BASE}${path}`, {
      method,
      headers,
      body,
    });
    const json = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
      const errObj = json.error as Record<string, unknown> | undefined;
      throw new ValidationError(
        `Stripe API error: ${String(errObj?.message || res.statusText || 'Unknown error')}`
      );
    }
    return json;
  }

  async createOrder(params: CreateOrderParams): Promise<PaymentOrderResult> {
    if (!Number.isInteger(params.amount) || params.amount <= 0) {
      throw new ValidationError('Order amount must be a positive integer in minor currency units');
    }

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
    const form: Record<string, string> = {
      mode: 'payment',
      'payment_method_types[0]': 'card',
      'line_items[0][price_data][currency]': params.currency.toLowerCase(),
      'line_items[0][price_data][unit_amount]': String(params.amount),
      'line_items[0][price_data][product_data][name]': params.notes?.purpose || 'Charitable Donation',
      'line_items[0][quantity]': '1',
      customer_email: params.customer.email,
      client_reference_id: params.receiptId,
      success_url: params.successUrl || `${appUrl}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: params.cancelUrl || `${appUrl}/donate/failed?cancelled=true`,
    };

    if (params.notes) {
      for (const [k, v] of Object.entries(params.notes)) {
        form[`metadata[${k}]`] = v;
      }
    }

    const session = await this.stripeRequest(
      '/checkout/sessions',
      'POST',
      form,
      params.idempotencyKey
    );

    return {
      gatewayOrderId: String(session.id),
      amount: params.amount,
      currency: params.currency.toUpperCase(),
      keyId: this.getPublishableKey() || undefined,
      checkoutUrl: session.url ? String(session.url) : undefined,
      mode: this.getStatus().mode,
      notes: params.notes,
    };
  }

  /**
   * Stripe payment verification checks the authoritative Checkout Session or PaymentIntent directly with Stripe API.
   */
  async verifyPayment(params: VerifyPaymentParams): Promise<boolean> {
    if (!this.isConfigured()) return false;
    const status = await this.fetchOrderStatus(params.gatewayOrderId);
    return status.status === 'SUCCESSFUL';
  }

  verifyWebhookSignature(rawBody: string, signatureHeader: string): boolean {
    const secret = this.getWebhookSecret();
    if (!secret) return false;
    return verifyStripeWebhookSignature(rawBody, signatureHeader, secret);
  }

  async fetchPaymentDetails(paymentId: string): Promise<Record<string, unknown>> {
    return this.stripeRequest(`/payment_intents/${encodeURIComponent(paymentId)}`, 'GET');
  }

  async fetchOrderStatus(gatewayOrderId: string): Promise<OrderStatusResult> {
    const isSession = gatewayOrderId.startsWith('cs_');
    const path = isSession
      ? `/checkout/sessions/${encodeURIComponent(gatewayOrderId)}`
      : `/payment_intents/${encodeURIComponent(gatewayOrderId)}`;

    const data = await this.stripeRequest(path, 'GET');

    if (isSession) {
      const paid = data.payment_status === 'paid';
      const expired = data.status === 'expired';
      return {
        gatewayOrderId,
        gatewayPaymentId: data.payment_intent ? String(data.payment_intent) : undefined,
        status: paid ? 'SUCCESSFUL' : expired ? 'CANCELLED' : 'PENDING',
        amountMinor: Number(data.amount_total || 0),
        currency: String(data.currency || 'inr').toUpperCase(),
        rawStatus: String(data.payment_status || data.status || 'unpaid'),
      };
    }

    const piStatus = String(data.status || 'processing');
    return {
      gatewayOrderId,
      gatewayPaymentId: String(data.id),
      status:
        piStatus === 'succeeded'
          ? 'SUCCESSFUL'
          : piStatus === 'canceled'
          ? 'CANCELLED'
          : piStatus === 'requires_payment_method'
          ? 'FAILED'
          : 'PENDING',
      amountMinor: Number(data.amount || 0),
      currency: String(data.currency || 'inr').toUpperCase(),
      rawStatus: piStatus,
    };
  }

  async initiateRefund(params: RefundGatewayParams): Promise<RefundGatewayResult> {
    if (!Number.isInteger(params.amountMinor) || params.amountMinor <= 0) {
      throw new ValidationError('Refund amount must be a positive integer in minor units');
    }

    const form: Record<string, string> = {
      payment_intent: params.gatewayPaymentId,
      amount: String(params.amountMinor),
      reason: 'requested_by_customer',
    };

    const refund = await this.stripeRequest('/refunds', 'POST', form, params.idempotencyKey);
    const rawStatus = String(refund.status || 'pending');
    return {
      providerRefundId: String(refund.id),
      status:
        rawStatus === 'succeeded'
          ? 'SUCCESSFUL'
          : rawStatus === 'failed' || rawStatus === 'canceled'
          ? 'FAILED'
          : 'PROCESSING',
      rawStatus,
      failureReason: refund.failure_reason ? String(refund.failure_reason) : undefined,
    };
  }

  async createSubscription(params: CreateSubscriptionParams): Promise<SubscriptionGatewayResult> {
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
    const intervalMap: Record<CreateSubscriptionParams['planInterval'], { interval: string; count: string }> = {
      MONTHLY: { interval: 'month', count: '1' },
      QUARTERLY: { interval: 'month', count: '3' },
      YEARLY: { interval: 'year', count: '1' },
    };
    const { interval, count } = intervalMap[params.planInterval];

    const form: Record<string, string> = {
      mode: 'subscription',
      'payment_method_types[0]': 'card',
      'line_items[0][price_data][currency]': params.currency.toLowerCase(),
      'line_items[0][price_data][unit_amount]': String(params.amountMinor),
      'line_items[0][price_data][recurring][interval]': interval,
      'line_items[0][price_data][recurring][interval_count]': count,
      'line_items[0][price_data][product_data][name]': `Recurring NGO Donation (${params.planInterval})`,
      'line_items[0][quantity]': '1',
      customer_email: params.customer.email,
      success_url: `${appUrl}/donate/success?recurring=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/donate/failed?recurring=true&cancelled=true`,
    };

    const session = await this.stripeRequest('/checkout/sessions', 'POST', form);
    return {
      providerSubscriptionId: String(session.subscription || session.id),
      checkoutUrl: session.url ? String(session.url) : undefined,
      status: 'CREATED',
    };
  }

  async cancelSubscription(providerSubscriptionId: string): Promise<{ cancelled: boolean; rawStatus: string }> {
    const cancelled = await this.stripeRequest(
      `/subscriptions/${encodeURIComponent(providerSubscriptionId)}`,
      'DELETE'
    );
    return {
      cancelled: String(cancelled.status || '') === 'canceled',
      rawStatus: String(cancelled.status || 'unknown'),
    };
  }
}

export const stripePaymentProvider = new StripePaymentProvider();
