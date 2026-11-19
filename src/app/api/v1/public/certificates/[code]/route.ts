import { NextRequest, NextResponse } from 'next/server';
import { volunteerService } from '@/server/services/volunteer.service';
import { NotFoundError } from '@/lib/error-handler';
import { successResponse, HTTP_STATUS } from '@/lib/api-response';
import { handleRouteError } from '@/server/errors';

/**
 * Public volunteer certificate verification endpoint.
 * Strictly exposes verification snapshot ONLY — zero private volunteer contact data.
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    const cert = await volunteerService.verifyCertificatePublic(code);
    if (!cert) {
      throw new NotFoundError('No verified certificate found matching this code');
    }

    return NextResponse.json(successResponse(cert), { status: HTTP_STATUS.OK });
  } catch (error) {
    return handleRouteError(error);
  }
}
