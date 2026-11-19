import { NextRequest, NextResponse } from 'next/server';
import { donationPaymentService } from '@/server/services/donation-payment.service';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

/**
 * Razorpay Webhook Endpoint
 * Verifies raw request body HMAC-SHA256 (`X-Razorpay-Signature`) before processing.
 * Enforces idempotency lock (`PaymentWebhookEvent`) and out-of-order state protection.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';
    const eventIdHeader = req.headers.get('x-razorpay-event-id') || undefined;

    const result = await donationPaymentService.processRazorpayWebhook(
      rawBody,
      signature,
      eventIdHeader
    );

    return NextResponse.json(successResponse(result), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}
