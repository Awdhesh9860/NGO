import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as loginPost } from '@/app/api/v1/auth/login/route';
import { POST as twoFactorLoginPost } from '@/app/api/v1/auth/two-factor/login/route';
import { GET as sessionGet } from '@/app/api/v1/auth/session/route';
import { POST as financeIncomePost } from '@/app/api/v1/finance/income/route';
import { POST as razorpayWebhookPost } from '@/app/api/v1/webhooks/razorpay/route';
import { POST as stripeWebhookPost } from '@/app/api/v1/webhooks/stripe/route';
import { GET as publicCertificateGet } from '@/app/api/v1/public/certificates/[code]/route';
import { volunteerService } from '@/server/services/volunteer.service';
import { signAuthToken } from '@/server/auth/jwt';
import { resetRateLimitStore } from '@/server/security/rate-limit';

describe('QA Phase 2 — API Route Handler Contracts, Zod Validation, Rate Limits & Webhooks', () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('POST /api/v1/auth/login validates payload with Zod (422) and enforces AUTH_LOGIN rate limit (429)', async () => {
    const badReq = new NextRequest('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '198.51.100.1' },
      body: JSON.stringify({ email: 'not-an-email', password: '' }),
    });
    const badRes = await loginPost(badReq);
    expect(badRes.status).toBe(422);
    const badBody = await badRes.json();
    expect(badBody.success).toBe(false);
    expect(badBody.error.code).toBe('VALIDATION_ERROR');

    // Burst 9 more invalid attempts (total 10 allowed) then verify 11th returns 429
    for (let i = 0; i < 9; i += 1) {
      const r = await loginPost(
        new NextRequest('http://localhost:3000/api/v1/auth/login', {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-forwarded-for': '198.51.100.1' },
          body: JSON.stringify({ email: 'bad', password: '' }),
        })
      );
      expect(r.status).toBe(422);
    }

    const throttled = await loginPost(
      new NextRequest('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-forwarded-for': '198.51.100.1' },
        body: JSON.stringify({ email: 'bad', password: '' }),
      })
    );
    expect(throttled.status).toBe(429);
    expect(Number(throttled.headers.get('Retry-After'))).toBeGreaterThan(0);
  });

  it('POST /api/v1/auth/two-factor/login enforces Zod schema (422) and rejects non-pre-2fa JWTs (401)', async () => {
    const invalidSchemaRes = await twoFactorLoginPost(
      new NextRequest('http://localhost:3000/api/v1/auth/two-factor/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-forwarded-for': '198.51.100.2' },
        body: JSON.stringify({ tempToken: 'short', code: '12' }),
      })
    );
    expect(invalidSchemaRes.status).toBe(422);

    // Regular session token (not 'pre-2fa-temp') must be rejected
    const wrongScopeToken = await signAuthToken({
      userId: '507f1f77bcf86cd799439011',
      sessionId: 'regular-session-id',
      email: 'user@qa.test',
      role: 'ADMIN',
      organizationId: '507f1f77bcf86cd799439012',
    });

    const wrongScopeRes = await twoFactorLoginPost(
      new NextRequest('http://localhost:3000/api/v1/auth/two-factor/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-forwarded-for': '198.51.100.2' },
        body: JSON.stringify({ tempToken: wrongScopeToken, code: '123456' }),
      })
    );
    expect(wrongScopeRes.status).toBe(401);
  });

  it('GET /api/v1/auth/session returns clean unauthenticated envelope without leaking errors', async () => {
    const res = await sessionGet(new NextRequest('http://localhost:3000/api/v1/auth/session'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.authenticated).toBe(false);
    expect(body.data.user).toBeNull();
    expect(body.data.permissions).toEqual([]);
  });

  it('POST /api/v1/finance/income rejects unauthenticated requests with HTTP 401', async () => {
    const res = await financeIncomePost(
      new NextRequest('http://localhost:3000/api/v1/finance/income', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sourceType: 'INVALID', sourceId: '' }),
      })
    );
    expect(res.status).toBe(401);
  });

  it('Razorpay & Stripe webhooks reject missing or tampered HMAC signatures', async () => {
    const rzpRes = await razorpayWebhookPost(
      new NextRequest('http://localhost:3000/api/v1/webhooks/razorpay', {
        method: 'POST',
        headers: { 'x-razorpay-signature': 'invalid-hmac-signature' },
        body: JSON.stringify({ event: 'payment.captured', payload: {} }),
      })
    );
    expect(rzpRes.status).toBeGreaterThanOrEqual(400);
    expect((await rzpRes.json()).success).toBe(false);

    const stripeRes = await stripeWebhookPost(
      new NextRequest('http://localhost:3000/api/v1/webhooks/stripe', {
        method: 'POST',
        headers: { 'stripe-signature': 't=12345,v1=invalid-hmac' },
        body: JSON.stringify({ id: 'evt_test', type: 'payment_intent.succeeded' }),
      })
    );
    expect(stripeRes.status).toBeGreaterThanOrEqual(400);
    expect((await stripeRes.json()).success).toBe(false);
  });

  it('GET /api/v1/public/certificates/[code] returns 404 when missing and PII-safe snapshot when verified', async () => {
    vi.spyOn(volunteerService, 'verifyCertificatePublic')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        certificateNumber: 'HH-VOL-2026-0001',
        verificationCode: 'CERT-QA-VALID',
        recipientName: 'Asha Volunteer',
        category: 'PARTICIPATION',
        title: 'Community Education Fellowship',
        verifiedHoursSnapshot: 42,
        issuedAt: new Date('2026-10-01T00:00:00Z'),
        status: 'ISSUED',
      } as never);

    const notFoundRes = await publicCertificateGet(
      new NextRequest('http://localhost:3000/api/v1/public/certificates/UNKNOWN'),
      { params: Promise.resolve({ code: 'UNKNOWN' }) }
    );
    expect(notFoundRes.status).toBe(404);

    const okRes = await publicCertificateGet(
      new NextRequest('http://localhost:3000/api/v1/public/certificates/CERT-QA-VALID'),
      { params: Promise.resolve({ code: 'CERT-QA-VALID' }) }
    );
    expect(okRes.status).toBe(200);
    const json = await okRes.json();
    expect(json.success).toBe(true);
    expect(json.data.verifiedHoursSnapshot).toBe(42);
    expect(json.data.email).toBeUndefined();
    expect(json.data.phone).toBeUndefined();
  });
});
