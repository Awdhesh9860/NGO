import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import nextConfig, { SECURITY_HEADERS } from '@/../next.config';
import {
  resolveRequiredSecret,
  getJwtSecret,
  getFinancialEncryptionSecret,
  getStorageSigningSecret,
} from '@/config/environment';
import { enforceRateLimit, resetRateLimitStore } from '@/server/security/rate-limit';
import { handleRouteError, RateLimitError } from '@/server/errors';
import { proxy, isCsrfOriginAllowed } from '@/proxy';
import { serializeJsonLd } from '@/components/common/JsonLd';
import { connectToDatabase, resetDatabaseConnectionCache } from '@/lib/mongodb';
import { AUTH_COOKIE_NAME } from '@/server/security/cookies';

describe('QA Phase 2 — Security Hardening & Core Infrastructure Controls', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    resetRateLimitStore();
    resetDatabaseConnectionCache();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  describe('1. Fail-Closed Production Secrets (QA-BUG-003)', () => {
    it('throws in production when JWT_SECRET, FINANCIAL_ENCRYPTION_KEY, or STORAGE_SIGNING_SECRET are missing', () => {
      process.env = { ...originalEnv, NODE_ENV: 'production' };
      delete process.env.JWT_SECRET;
      delete process.env.FINANCIAL_ENCRYPTION_KEY;
      delete process.env.STORAGE_SIGNING_SECRET;

      expect(() => getJwtSecret()).toThrow(/SECURITY CONFIG ERROR/);
      expect(() => getFinancialEncryptionSecret()).toThrow(/SECURITY CONFIG ERROR/);
      expect(() => getStorageSigningSecret()).toThrow(/SECURITY CONFIG ERROR/);
    });

    it('throws in production when a secret is shorter than 32 characters', () => {
      process.env = {
        ...originalEnv,
        NODE_ENV: 'production',
        JWT_SECRET: 'short-weak-secret',
      };

      expect(() => getJwtSecret()).toThrow(/at least 32 characters/);
    });

    it('accepts strong >= 32-character secrets in production', () => {
      const strongKey = 'prod-strong-secret-key-minimum-length-32-characters-ok';
      process.env = {
        ...originalEnv,
        NODE_ENV: 'production',
        JWT_SECRET: strongKey,
        FINANCIAL_ENCRYPTION_KEY: `${strongKey}-fin`,
        STORAGE_SIGNING_SECRET: `${strongKey}-storage`,
      };

      expect(getJwtSecret()).toBe(strongKey);
      expect(getFinancialEncryptionSecret()).toBe(`${strongKey}-fin`);
      expect(getStorageSigningSecret()).toBe(`${strongKey}-storage`);
    });

    it('falls back cleanly to dev defaults in non-production environments', () => {
      process.env = { ...originalEnv, NODE_ENV: 'test' };
      delete process.env.JWT_SECRET;

      const resolved = resolveRequiredSecret(['JWT_SECRET'], 'dev-fallback-secret-value', 'Test Secret');
      expect(resolved).toBe('dev-fallback-secret-value');
    });
  });

  describe('2. HTTP Security Headers in next.config.ts (QA-BUG-005)', () => {
    it('disables X-Powered-By and configures OWASP security headers globally', async () => {
      expect(nextConfig.poweredByHeader).toBe(false);
      expect(typeof nextConfig.headers).toBe('function');

      const headerGroups = await nextConfig.headers!();
      expect(headerGroups.length).toBeGreaterThan(0);
      expect(headerGroups[0].source).toBe('/(.*)');

      const map = new Map(SECURITY_HEADERS.map((h) => [h.key, h.value]));
      expect(map.get('X-Frame-Options')).toBe('DENY');
      expect(map.get('X-Content-Type-Options')).toBe('nosniff');
      expect(map.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(map.get('Strict-Transport-Security')).toContain('max-age=63072000');
      expect(map.get('Permissions-Policy')).toContain('camera=()');
      expect(map.get('Content-Security-Policy')).toContain("frame-ancestors 'none'");
      expect(map.get('Content-Security-Policy')).toContain("object-src 'none'");
    });
  });

  describe('3. Next.js 16 Proxy — CSRF Origin & Admin Route Protection (QA-BUG-001 & QA-BUG-005)', () => {
    it('blocks cross-origin state-changing API requests with HTTP 403', async () => {
      const req = new NextRequest('https://app.hopehorizon.org/api/v1/auth/login', {
        method: 'POST',
        headers: {
          host: 'app.hopehorizon.org',
          origin: 'https://malicious-attacker.example',
        },
      });

      expect(isCsrfOriginAllowed(req)).toBe(false);
      const res = proxy(req);
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('CSRF_ORIGIN_MISMATCH');
    });

    it('allows same-origin API mutations, Bearer requests, and external payment webhooks', () => {
      const sameOriginReq = new NextRequest('https://app.hopehorizon.org/api/v1/auth/login', {
        method: 'POST',
        headers: { host: 'app.hopehorizon.org', origin: 'https://app.hopehorizon.org' },
      });
      expect(isCsrfOriginAllowed(sameOriginReq)).toBe(true);

      const webhookReq = new NextRequest('https://app.hopehorizon.org/api/v1/webhooks/razorpay', {
        method: 'POST',
        headers: { host: 'app.hopehorizon.org', origin: 'https://api.razorpay.com' },
      });
      expect(isCsrfOriginAllowed(webhookReq)).toBe(true);

      const bearerReq = new NextRequest('https://app.hopehorizon.org/api/v1/finance/journals', {
        method: 'POST',
        headers: {
          host: 'app.hopehorizon.org',
          origin: 'https://cli.external.example',
          authorization: 'Bearer sample-jwt',
        },
      });
      expect(isCsrfOriginAllowed(bearerReq)).toBe(true);
    });

    it('redirects unauthenticated /dashboard/admin/* browser requests to /login with redirect query', () => {
      process.env = {
        ...originalEnv,
        NODE_ENV: 'production',
        NEXT_PUBLIC_ENABLE_DEMO_PERSONAS: 'false',
      };

      const unauthReq = new NextRequest('https://app.hopehorizon.org/dashboard/admin/finance');
      const res = proxy(unauthReq);
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe(
        'https://app.hopehorizon.org/login?redirect=%2Fdashboard%2Fadmin%2Ffinance'
      );

      const authedReq = new NextRequest('https://app.hopehorizon.org/dashboard/admin/finance', {
        headers: { cookie: `${AUTH_COOKIE_NAME}=signed.jwt.token` },
      });
      const authedRes = proxy(authedReq);
      expect(authedRes.status).toBe(200);
    });
  });

  describe('4. Sliding-Window API Rate Limiter (QA-BUG-005)', () => {
    it('permits requests up to threshold, blocks overflow with HTTP 429 + Retry-After, and isolates IPs', async () => {
      const policy = { bucket: 'test:burst', maxRequests: 3, windowSeconds: 60 };
      const reqIpA = new NextRequest('http://localhost:3000/api/v1/auth/login', {
        headers: { 'x-forwarded-for': '203.0.113.10' },
      });
      const reqIpB = new NextRequest('http://localhost:3000/api/v1/auth/login', {
        headers: { 'x-forwarded-for': '203.0.113.20' },
      });

      expect((await enforceRateLimit(reqIpA, policy)).remaining).toBe(2);
      expect((await enforceRateLimit(reqIpA, policy)).remaining).toBe(1);
      expect((await enforceRateLimit(reqIpA, policy)).remaining).toBe(0);

      let caught: unknown;
      try {
        await enforceRateLimit(reqIpA, policy);
      } catch (err) {
        caught = err;
      }

      expect(caught).toBeInstanceOf(RateLimitError);
      const httpRes = handleRouteError(caught);
      expect(httpRes.status).toBe(429);
      expect(Number(httpRes.headers.get('Retry-After'))).toBeGreaterThan(0);

      // Independent IP B must still be allowed
      const ipBDecision = await enforceRateLimit(reqIpB, policy);
      expect(ipBDecision.allowed).toBe(true);
    });
  });

  describe('5. Production Error Sanitization & Mongoose Error Normalization (QA-BUG-009)', () => {
    it('never leaks raw internal error messages in production HTTP 500 responses', async () => {
      process.env = { ...originalEnv, NODE_ENV: 'production' };
      const sensitiveErr = new Error('MongoServerError: mongodb+srv://admin:SuperSecret@cluster0.net failed');

      const res = handleRouteError(sensitiveErr);
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(json.error.message).not.toContain('SuperSecret');
      expect(json.error.message).not.toContain('mongodb+srv');
      expect(json.error.details.correlationId).toBeTruthy();
    });

    it('normalizes CastError -> 400, Duplicate Key 11000 -> 409, and malformed JSON -> 400', async () => {
      const castRes = handleRouteError({ name: 'CastError', message: 'Cast to ObjectId failed' });
      expect(castRes.status).toBe(400);
      expect((await castRes.json()).error.code).toBe('INVALID_IDENTIFIER');

      const dupRes = handleRouteError({ code: 11000, message: 'E11000 duplicate key error' });
      expect(dupRes.status).toBe(409);
      expect((await dupRes.json()).error.code).toBe('CONFLICT');

      const jsonRes = handleRouteError(new SyntaxError('Unexpected token in JSON at position 2'));
      expect(jsonRes.status).toBe(400);
      expect((await jsonRes.json()).error.code).toBe('INVALID_JSON');
    });
  });

  describe('6. JSON-LD Script-Breakout XSS Escaping (QA-BUG-011)', () => {
    it('escapes <, >, and & inside serialized JSON-LD payloads', () => {
      const payload = {
        '@context': 'https://schema.org',
        name: 'Hope & Care </script><script>alert("xss")</script>',
      };
      const serialized = serializeJsonLd(payload);
      expect(serialized).not.toContain('</script>');
      expect(serialized).not.toContain('<script>');
      expect(serialized).toContain('\\u003c/script\\u003e');
      expect(serialized).toContain('\\u0026');
    });
  });

  describe('7. MongoDB Singleton Rejected-Promise Recovery (QA-BUG-008)', () => {
    it('clears cached connection promise on failure so subsequent calls can recover', async () => {
      process.env = { ...originalEnv, MONGODB_URI: 'mongodb://127.0.0.1:27017/qa_recovery_test' };

      const connectSpy = vi
        .spyOn(mongoose, 'connect')
        .mockRejectedValueOnce(new Error('Transient network timeout'))
        .mockResolvedValueOnce(mongoose);

      await expect(connectToDatabase()).rejects.toThrow('Transient network timeout');

      // Second call must retry instead of returning the permanently rejected cached promise
      const conn = await connectToDatabase();
      expect(conn).toBe(mongoose);
      expect(connectSpy).toHaveBeenCalledTimes(2);
    });
  });
});
