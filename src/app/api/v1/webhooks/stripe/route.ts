import { NextRequest, NextResponse } from 'next/server';
import { donationPaymentService } from '@/server/services/donation-payment.service';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

/**
 * Stripe Webhook Endpoint
 * Verifies raw request body `Stripe-Signature` (`t=...,v1=...`) timestamp & HMAC-SHA256.
 * Enforces idempotency lock (`PaymentWebhookEvent`) and out-of-order state protection.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature') || '';

    const result = await donationPaymentService.processStripeWebhook(rawBody, signature);
    return NextResponse.json(successResponse(result), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}
