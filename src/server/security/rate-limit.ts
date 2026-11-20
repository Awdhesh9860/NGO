import { NextRequest } from 'next/server';
import { RateLimitError } from '@/lib/error-handler';

export interface RateLimitPolicy {
  /** Maximum requests allowed within the window */
  maxRequests: number;
  /** Sliding/fixed window size in seconds */
  windowSeconds: number;
  /** Logical bucket namespace (e.g. 'auth:login') */
  bucket: string;
}

export interface RateLimitDecision {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
  resetAtUnix: number;
}

export interface IRateLimitStore {
  consume(key: string, maxRequests: number, windowSeconds: number): Promise<RateLimitDecision>;
  reset(): void;
}

interface CounterRecord {
  count: number;
  resetAtMs: number;
}

/**
 * Bounded in-memory sliding-window store suitable for single-instance/dev/test deployments.
 * Swap with a Redis-backed `IRateLimitStore` implementation in multi-region production clusters.
 */
class InMemoryRateLimitStore implements IRateLimitStore {
  private readonly store = new Map<string, CounterRecord>();
  private readonly maxEntries = 10_000;

  async consume(key: string, maxRequests: number, windowSeconds: number): Promise<RateLimitDecision> {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;

    // Periodic pruning when map grows large
    if (this.store.size >= this.maxEntries) {
      for (const [entryKey, record] of this.store.entries()) {
        if (record.resetAtMs <= now) {
          this.store.delete(entryKey);
        }
      }
      // If still at capacity, evict oldest inserted entry
      if (this.store.size >= this.maxEntries) {
        const firstKey = this.store.keys().next().value;
        if (firstKey) this.store.delete(firstKey);
      }
    }

    const existing = this.store.get(key);
    if (!existing || existing.resetAtMs <= now) {
      const resetAtMs = now + windowMs;
      this.store.set(key, { count: 1, resetAtMs });
      return {
        allowed: true,
        limit: maxRequests,
        remaining: Math.max(0, maxRequests - 1),
        retryAfterSeconds: 0,
        resetAtUnix: Math.ceil(resetAtMs / 1000),
      };
    }

    existing.count += 1;
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAtMs - now) / 1000));
    const allowed = existing.count <= maxRequests;

    return {
      allowed,
      limit: maxRequests,
      remaining: Math.max(0, maxRequests - existing.count),
      retryAfterSeconds: allowed ? 0 : retryAfterSeconds,
      resetAtUnix: Math.ceil(existing.resetAtMs / 1000),
    };
  }

  reset(): void {
    this.store.clear();
  }
}

export const RATE_LIMIT_POLICIES = {
  AUTH_LOGIN: { bucket: 'auth:login', maxRequests: 10, windowSeconds: 15 * 60 },
  AUTH_REGISTER: { bucket: 'auth:register', maxRequests: 5, windowSeconds: 15 * 60 },
  AUTH_OTP_RESET: { bucket: 'auth:otp-reset', maxRequests: 6, windowSeconds: 15 * 60 },
  AUTH_2FA: { bucket: 'auth:2fa', maxRequests: 8, windowSeconds: 10 * 60 },
  PAYMENT_ORDER: { bucket: 'payments:order', maxRequests: 20, windowSeconds: 5 * 60 },
  PAYMENT_VERIFY: { bucket: 'payments:verify', maxRequests: 25, windowSeconds: 5 * 60 },
  PUBLIC_FORM: { bucket: 'public:form', maxRequests: 10, windowSeconds: 10 * 60 },
  PUBLIC_VERIFY: { bucket: 'public:verify', maxRequests: 30, windowSeconds: 5 * 60 },
} as const satisfies Record<string, RateLimitPolicy>;

export type RateLimitPolicyKey = keyof typeof RATE_LIMIT_POLICIES;

let activeStore: IRateLimitStore = new InMemoryRateLimitStore();

export function setRateLimitStore(store: IRateLimitStore): void {
  activeStore = store;
}

export function resetRateLimitStore(): void {
  activeStore.reset();
}

export function extractClientIdentifier(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }
  const realIp = req.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  const cfIp = req.headers.get('cf-connecting-ip')?.trim();
  if (cfIp) return cfIp;
  return '127.0.0.1';
}

/**
 * Enforces an API rate limit policy and throws `RateLimitError` (HTTP 429) on overflow.
 * Never disabled in production.
 */
export async function enforceRateLimit(
  req: NextRequest,
  policyOrKey: RateLimitPolicyKey | RateLimitPolicy,
  extraDiscriminator?: string
): Promise<RateLimitDecision> {
  const policy: RateLimitPolicy =
    typeof policyOrKey === 'string' ? RATE_LIMIT_POLICIES[policyOrKey] : policyOrKey;

  if (process.env.NODE_ENV !== 'production' && process.env.DISABLE_RATE_LIMIT === 'true') {
    return {
      allowed: true,
      limit: policy.maxRequests,
      remaining: policy.maxRequests,
      retryAfterSeconds: 0,
      resetAtUnix: Math.ceil(Date.now() / 1000) + policy.windowSeconds,
    };
  }

  const clientId = extractClientIdentifier(req);
  const compositeKey = extraDiscriminator
    ? `${policy.bucket}:${clientId}:${extraDiscriminator.toLowerCase().trim()}`
    : `${policy.bucket}:${clientId}`;

  const decision = await activeStore.consume(compositeKey, policy.maxRequests, policy.windowSeconds);

  if (!decision.allowed) {
    throw new RateLimitError(
      `Too many requests. Please wait ${decision.retryAfterSeconds} seconds before retrying.`,
      decision.retryAfterSeconds,
      {
        bucket: policy.bucket,
        limit: decision.limit,
        retryAfterSeconds: decision.retryAfterSeconds,
      }
    );
  }

  return decision;
}
