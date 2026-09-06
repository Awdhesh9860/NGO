/**
 * Standardized API Response and Error Contract for Enterprise NGO Services
 */

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  meta?: {
    timestamp: string;
    requestId?: string;
    organizationId?: string;
    pagination?: PaginationMeta;
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown> | Array<unknown>;
  };
}

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Creates a standard successful API response.
 */
export function successResponse<T>(
  data: T,
  pagination?: PaginationMeta,
  organizationId?: string
): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      organizationId,
      pagination,
    },
  };
}

/**
 * Creates a standard error API response.
 */
export function errorResponse(
  message: string,
  code: string = 'BAD_REQUEST',
  details?: Record<string, unknown> | Array<unknown>
): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}
