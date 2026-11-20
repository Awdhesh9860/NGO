/**
 * Server Error Hierarchy & API Error Handling Helper
 */
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError, RateLimitError } from '../../lib/error-handler';
import { errorResponse, HTTP_STATUS } from '../../lib/api-response';
import { logger } from '../logging';

export * from '../../lib/error-handler';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function handleRouteError(error: unknown): NextResponse {
  if (error instanceof RateLimitError) {
    const headers: HeadersInit = {};
    if (error.retryAfterSeconds && error.retryAfterSeconds > 0) {
      headers['Retry-After'] = String(error.retryAfterSeconds);
    }
    return NextResponse.json(
      errorResponse(error.message, error.code, error.details),
      { status: error.statusCode, headers }
    );
  }

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

  // Malformed JSON request payload
  if (error instanceof SyntaxError && error.message.toLowerCase().includes('json')) {
    return NextResponse.json(
      errorResponse('Malformed JSON request body', 'INVALID_JSON'),
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }

  // Normalize common Mongoose / MongoDB errors cleanly without exposing internals
  if (isRecord(error)) {
    if (error.name === 'CastError') {
      return NextResponse.json(
        errorResponse('Invalid resource identifier format', 'INVALID_IDENTIFIER'),
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        errorResponse('A conflicting record with this unique identifier already exists', 'CONFLICT'),
        { status: HTTP_STATUS.CONFLICT }
      );
    }

    if (error.name === 'ValidationError') {
      return NextResponse.json(
        errorResponse('Database schema validation failed', 'VALIDATION_ERROR'),
        { status: HTTP_STATUS.UNPROCESSABLE_ENTITY }
      );
    }
  }

  const correlationId = crypto.randomUUID();
  const rawMessage = error instanceof Error ? error.message : 'An unexpected internal error occurred';

  logger.error('Unhandled API route error', {
    correlationId,
    errorName: error instanceof Error ? error.name : typeof error,
    message: rawMessage,
  });

  // Never leak raw internal error details (DB URIs, stack info, paths) in production
  const safeMessage =
    process.env.NODE_ENV === 'production'
      ? `An unexpected internal error occurred (Ref: ${correlationId})`
      : rawMessage;

  return NextResponse.json(
    errorResponse(safeMessage, 'INTERNAL_SERVER_ERROR', { correlationId }),
    { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
  );
}
