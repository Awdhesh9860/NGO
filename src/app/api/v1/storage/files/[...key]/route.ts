import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedContext } from '@/server/authorization/guards';
import {
  storageProvider,
  verifySignedDownloadParams,
  resolveSafeStoragePath,
} from '@/integrations/storage/local.provider';
import { AuthenticationError, AuthorizationError, NotFoundError } from '@/lib/error-handler';
import { handleRouteError } from '@/server/errors';

/**
 * Serves persisted private documents from the managed local storage vault.
 * Requires EITHER:
 *  1) A valid, unexpired HMAC-SHA256 signed URL (`?expires=<unix>&sig=<hex>`), OR
 *  2) An active authenticated session whose tenant matches the document's folder scope.
 *
 * Always enforces path traversal containment, `Content-Disposition: attachment`,
 * `X-Content-Type-Options: nosniff`, and `Cache-Control: private, no-store`.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key: segments } = await context.params;
    const rawKey = (segments || []).map((s) => decodeURIComponent(s)).join('/');

    // Validate key structure and traversal safety upfront
    resolveSafeStoragePath(rawKey);

    const sp = req.nextUrl.searchParams;
    const expires = sp.get('expires');
    const sig = sp.get('sig');

    const hasValidSignedUrl = verifySignedDownloadParams(rawKey, expires, sig);

    if (!hasValidSignedUrl) {
      // Fallback: require authenticated session matching tenant folder ownership
      const authContext = await getAuthenticatedContext(req);
      if (!authContext) {
        throw new AuthenticationError(
          'A valid signed download URL or active authenticated session is required to access this file.'
        );
      }

      const orgId = authContext.user.organizationId.toString();
      const isSuperAdmin = authContext.user.role === 'SUPER_ADMIN';
      if (!isSuperAdmin && !rawKey.includes(orgId)) {
        throw new AuthorizationError('You do not have permission to download this organization document.');
      }
    }

    const stored = await storageProvider.readFile(rawKey);
    if (!stored) {
      throw new NotFoundError('Requested document file');
    }

    const safeDownloadName = stored.metadata.fileName.replace(/["\r\n]/g, '_');

    return new NextResponse(new Uint8Array(stored.buffer), {
      status: 200,
      headers: {
        'Content-Type': stored.metadata.mimeType || 'application/octet-stream',
        'Content-Length': String(stored.buffer.byteLength),
        'Content-Disposition': `attachment; filename="${safeDownloadName}"`,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, no-store, max-age=0',
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
