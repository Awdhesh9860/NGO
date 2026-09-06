import { HTTP_STATUS } from './api-response';

/**
 * Base Application Error class for predictable enterprise error handling.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, unknown> | Array<unknown>;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: string = 'INTERNAL_ERROR',
    details?: Record<string, unknown> | Array<unknown>
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: Record<string, unknown> | Array<unknown>) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication credentials invalid or missing') {
    super(message, HTTP_STATUS.UNAUTHORIZED, 'UNAUTHENTICATED');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'You do not have clearance to perform this action') {
    super(message, HTTP_STATUS.FORBIDDEN, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} was not found`, HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'A resource with this identifier already exists') {
    super(message, HTTP_STATUS.CONFLICT, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded. Please retry later.') {
    super(message, HTTP_STATUS.TOO_MANY_REQUESTS, 'RATE_LIMIT_EXCEEDED');
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'DATABASE_ERROR');
  }
}
