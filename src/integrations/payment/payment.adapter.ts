/**
 * Payment Gateway Integration Adapter Boundary
 * Prepares extensible contract for Razorpay, Stripe, and Bank Transfer gateways.
 */

export interface CreateOrderParams {
  amount: number;
  currency: string;
  receiptId: string;
  notes?: Record<string, string>;
  customer: {
    name: string;
    email: string;
    contact?: string;
  };
}

export interface PaymentOrderResult {
  gatewayOrderId: string;
  amount: number;
  currency: string;
  keyId?: string;
  notes?: Record<string, string>;
}

export interface VerifyPaymentParams {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  gatewaySignature: string;
}

export interface IPaymentGateway {
  createOrder(params: CreateOrderParams): Promise<PaymentOrderResult>;
  verifyPayment(params: VerifyPaymentParams): Promise<boolean>;
  fetchPaymentDetails(paymentId: string): Promise<Record<string, unknown>>;
}
