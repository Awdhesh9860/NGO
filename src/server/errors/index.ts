/**
 * Server Error Hierarchy & API Error Handling Helper
 */
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from '../../lib/error-handler';
import { errorResponse, HTTP_STATUS } from '../../lib/api-response';

export * from '../../lib/error-handler';

export function handleRouteError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      errorResponse(error.message, error.code, error.details),
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    const formattedIssues = error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    return NextResponse.json(
      errorResponse('Validation failed', 'VALIDATION_ERROR', formattedIssues),
      { status: HTTP_STATUS.UNPROCESSABLE_ENTITY }
    );
  }

  const message = error instanceof Error ? error.message : 'An unexpected internal error occurred';
  return NextResponse.json(
    errorResponse(message, 'INTERNAL_SERVER_ERROR'),
    { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
  );
}
