import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/server/security/cookies';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Validates same-origin CSRF protection for cookie-authenticated API mutations.
 * External payment webhooks (`/api/v1/webhooks/*`) use cryptographic HMAC verification
 * instead of browser Origin matching.
 */
export function isCsrfOriginAllowed(req: NextRequest): boolean {
  if (!MUTATING_METHODS.has(req.method.toUpperCase())) return true;
  if (req.nextUrl.pathname.startsWith('/api/v1/webhooks/')) return true;

  // Non-cookie Authorization Bearer requests are immune to ambient cookie CSRF
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) return true;

  const origin = req.headers.get('origin');
  // Non-browser / same-origin clients that omit Origin are permitted (browser CORS/fetch sends Origin on cross-site)
  if (!origin) return true;

  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  if (!host) return true;

  try {
    const originUrl = new URL(origin);
    return originUrl.host.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}

export function proxy(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;

  // 1. CSRF same-origin enforcement on state-changing API requests
  if (pathname.startsWith('/api/v1/') && !isCsrfOriginAllowed(req)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CSRF_ORIGIN_MISMATCH',
          message: 'Cross-origin state-changing request rejected by CSRF protection.',
        },
        meta: { timestamp: new Date().toISOString() },
      },
      { status: 403 }
    );
  }

  // 2. Server-side session cookie gate for /dashboard/admin/* routes
  //    In non-production sandboxes ONLY, NEXT_PUBLIC_ENABLE_DEMO_PERSONAS=true allows evaluating UI roles without cookies.
  const allowDemoPersonas =
    process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_ENABLE_DEMO_PERSONAS === 'true';

  if (pathname.startsWith('/dashboard/admin') && !allowDemoPersonas) {
    const hasSessionCookie = Boolean(req.cookies.get(AUTH_COOKIE_NAME)?.value);
    if (!hasSessionCookie) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/v1/:path*', '/dashboard/admin/:path*'],
};
