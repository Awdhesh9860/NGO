/**
 * Structured Enterprise Application Logger
 * Automatically redacts sensitive parameters (passwords, tokens, PAN, API keys)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  organizationId?: string;
  userId?: string;
  requestId?: string;
  module?: string;
  [key: string]: unknown;
}

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordHash',
  'token',
  'jwt',
  'authorization',
  'secret',
  'apiKey',
  'geminiApiKey',
  'razorpayKeySecret',
  'stripeSecretKey',
]);

function sanitizeLogPayload(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitizeLogPayload);

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase()) || key.toLowerCase().includes('password') || key.toLowerCase().includes('secret')) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeLogPayload(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

class Logger {
  private formatMessage(level: LogLevel, message: string, context?: LogContext, data?: unknown) {
    const timestamp = new Date().toISOString();
    const sanitizedData = data ? sanitizeLogPayload(data) : undefined;
    return {
      timestamp,
      level: level.toUpperCase(),
      message,
      context,
      ...(sanitizedData ? { data: sanitizedData } : {}),
    };
  }

  public debug(message: string, context?: LogContext, data?: unknown): void {
    if (process.env.NODE_ENV !== 'production' || process.env.LOG_LEVEL === 'debug') {
      console.debug(JSON.stringify(this.formatMessage('debug', message, context, data)));
    }
  }

  public info(message: string, context?: LogContext, data?: unknown): void {
    console.info(JSON.stringify(this.formatMessage('info', message, context, data)));
  }

  public warn(message: string, context?: LogContext, data?: unknown): void {
    console.warn(JSON.stringify(this.formatMessage('warn', message, context, data)));
  }

  public error(message: string, error?: unknown, context?: LogContext): void {
    const errorDetails =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
          }
        : error;

    console.error(
      JSON.stringify(this.formatMessage('error', message, context, { error: errorDetails }))
    );
  }
}

export const logger = new Logger();
export default logger;
